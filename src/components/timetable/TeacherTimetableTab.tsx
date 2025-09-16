
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
  onApplyFilters: () => Promise<void>;
}

const TeacherTimetableTab: React.FC<TeacherTimetableTabProps> = ({
  selectedTimetable,
  onApplyFilters
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherSpecializations, setTeacherSpecializations] = useState<string[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [filteredTeacherData, setFilteredTeacherData] = useState<any>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase.from('teachers').select('*');
        if (error) throw error;
        setTeachers(data as Teacher[] || []);
      } catch (error: any) {
        console.error('Error fetching teachers:', error.message);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    if (teachers && teachers.length > 0) {
      const specializations = [...new Set(teachers.map(teacher => teacher.specialization))];
      setTeacherSpecializations(specializations);
    }
  }, [teachers]);

  useEffect(() => {
    let filtered = teachers || [];
    
    // Filter by specialization if selected
    if (selectedSpecialization) {
      filtered = filtered.filter(teacher => 
        teacher.specialization === selectedSpecialization
      );
    }
    
    // Filter by search term if provided
    if (searchTerm) {
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const uniqueTeachers = checkForDuplicates(filtered, 'email');
    setFilteredTeachers(uniqueTeachers || []);
  }, [teachers, selectedSpecialization, searchTerm]);

  const handleViewTeacherTimetable = () => {
    if (!selectedTeacher || !selectedTimetable) return;
    
    // Filter the timetable data for the selected teacher
    const teacherData = { ...selectedTimetable.data };
    
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
      ...selectedTimetable,
      data: teacherData
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Specialization</Label>
            <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
              <SelectTrigger>
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specializations</SelectItem>
                {teacherSpecializations.map((specialization, idx) => (
                  <SelectItem key={idx} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Search by Name</Label>
            <Input 
              placeholder="Search teachers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label>Teachers</Label>
          <div className="mt-2 border rounded-md p-3 space-y-2 max-h-64 overflow-y-auto">
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map(teacher => (
                <div key={teacher.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`teacher-${teacher.id}`}
                    name="selectedTeacher"
                    value={teacher.id}
                    checked={selectedTeacher === teacher.id}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="form-radio text-primary"
                  />
                  <Label htmlFor={`teacher-${teacher.id}`} className="text-sm font-normal cursor-pointer flex-1">
                    <div className="font-medium">{teacher.name}</div>
                    <div className="text-muted-foreground text-xs">{teacher.specialization}</div>
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No teachers available</p>
            )}
          </div>
        </div>
        
        <Button 
          className="w-full"
          disabled={!selectedTeacher || !selectedTimetable}
          onClick={handleViewTeacherTimetable}
        >
          View Teacher Schedule
        </Button>
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
