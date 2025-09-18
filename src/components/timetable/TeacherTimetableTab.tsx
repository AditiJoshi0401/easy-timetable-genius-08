
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TimetableDisplay from "@/components/timetable/TimetableDisplay";
import { supabase } from "@/integrations/supabase/client";
import { checkForDuplicates } from "@/utils/dataValidation";

interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  subjects: string[];
  cabin?: string;
  roles: string[];
  ista: boolean;
}

interface TeacherTimetableTabProps {
  selectedTimetable: any;
  onApplyFilters: (teacherId: string) => Promise<any | null>;
}

const TeacherTimetableTab: React.FC<TeacherTimetableTabProps> = ({
  selectedTimetable,
  onApplyFilters
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [filteredTeacherData, setFilteredTeacherData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersData, subjectsData] = await Promise.all([
          supabase.from('teachers').select('*'),
          supabase.from('subjects').select('*')
        ]);
        
        if (teachersData.error) throw teachersData.error;
        if (subjectsData.error) throw subjectsData.error;
        
        setTeachers(teachersData.data as Teacher[] || []);
        setSubjects(subjectsData.data || []);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (teachers && teachers.length > 0 && subjects && subjects.length > 0) {
      const allSubjectIds = [...new Set(teachers.flatMap(teacher => teacher.subjects || []))];
      const subjectNames = allSubjectIds.map(subjectId => {
        const subject = subjects.find((s: any) => s.id === subjectId);
        return subject ? `${subject.name} (${subject.code})` : subjectId;
      });
      setSubjectOptions(subjectNames);
    }
  }, [teachers, subjects]);

  useEffect(() => {
    let filtered = teachers || [];
    
    // Filter by subjects if selected
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter(teacher => 
        teacher.subjects.some(subjectId => {
          const subject = subjects.find((s: any) => s.id === subjectId);
          const subjectName = subject ? `${subject.name} (${subject.code})` : subjectId;
          return selectedSubjects.includes(subjectName);
        })
      );
    }
    
    const uniqueTeachers = checkForDuplicates(filtered, 'email');
    setFilteredTeachers(uniqueTeachers || []);
  }, [teachers, selectedSubjects, subjects]);

  const handleViewTeacherTimetable = (timetableParam?: any) => {
    const timetableToUse = timetableParam || selectedTimetable;
    if (!selectedTeacher || !timetableToUse) return;

    // Filter the timetable data for the selected teacher
    const teacherData = { ...timetableToUse.data };
    
    // Process each day in the timetable
    for (const day in teacherData) {
      // For each time slot in the day
      for (const timeSlot in teacherData[day]) {
        const slot = teacherData[day][timeSlot];
        
        // If the slot doesn't have the selected teacher, remove it
        if (!slot || 
            !slot.teacher || 
            (typeof slot.teacher === 'string' && slot.teacher !== selectedTeacher) ||
            (typeof slot.teacher === 'object' && slot.teacher.id !== selectedTeacher)) {
          delete teacherData[day][timeSlot];
        }
      }
    }
    
    setFilteredTeacherData({
      ...timetableToUse,
      data: teacherData
    });
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Subject Filters */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Filter by Subjects</Label>
              <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
              {subjectOptions.map((subject, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`subject-${idx}`}
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    className="form-checkbox text-primary"
                  />
                  <Label htmlFor={`subject-${idx}`} className="text-sm cursor-pointer">
                    {subject}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Filtered Teachers */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Label className="text-base font-semibold">
              Teachers {selectedSubjects.length > 0 && `(${filteredTeachers.length} found)`}
            </Label>
            <div className="mt-3 border rounded-md p-3 space-y-2 max-h-80 overflow-y-auto">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map(teacher => (
                  <div key={teacher.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md">
                    <input
                      type="radio"
                      id={`teacher-${teacher.id}`}
                      name="selectedTeacher"
                      value={teacher.id}
                      checked={selectedTeacher === teacher.id}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      className="form-radio text-primary"
                    />
                    <Label htmlFor={`teacher-${teacher.id}`} className="text-sm cursor-pointer flex-1">
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-muted-foreground text-xs">{teacher.specialization}</div>
                      <div className="text-muted-foreground text-xs">
                        Subjects: {teacher.subjects.map(subjectId => {
                          const subject = subjects.find((s: any) => s.id === subjectId);
                          return subject ? `${subject.name} (${subject.code})` : subjectId;
                        }).join(', ')}
                      </div>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {selectedSubjects.length > 0 ? 'No teachers found for selected subjects' : 'No teachers available'}
                </p>
              )}
            </div>
          </div>
          
          <Button
            className="w-full"
            disabled={!selectedTeacher}
            onClick={async () => {
              const fetched = await onApplyFilters(selectedTeacher);
              if (fetched) {
                handleViewTeacherTimetable(fetched);
              } else {
                handleViewTeacherTimetable();
              }
            }}
          >
            View Teacher Schedule
          </Button>
        </div>
      </div>

      {filteredTeacherData && (
        <div className="py-4">
          <TimetableDisplay 
            timetableData={filteredTeacherData.data} 
            viewType="teacher"
            showTeachers={false} 
            showRooms={true}
            showStreamInfo={true}
            teacherId={selectedTeacher}
          />
        </div>
      )}
    </div>
  );
};

export default TeacherTimetableTab;
