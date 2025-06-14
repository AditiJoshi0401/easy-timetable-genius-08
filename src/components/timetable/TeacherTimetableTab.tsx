
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TimetableDisplay from "@/components/timetable/TimetableDisplay";
import { RoleType, getAllRoleTypes, getRoleDisplayName, getTeacherLectureCount } from "@/models/Role";
import { supabase } from "@/integrations/supabase/client";
import { checkForDuplicates } from "@/utils/dataValidation";

interface Teacher {
  id: string;
  name: string;
  email: string;
  ista: boolean;
  roles?: string[];
  specialization: string;
  subjects: any[];
  cabin?: string;
  lectures?: number;
  tutorials?: number;
  practical?: number;
  credits?: number;
}

interface TeacherTimetableTabProps {
  teachers: Teacher[];
  selectedTimetable: any;
  onApplyFilters: () => Promise<void>;
}

const TeacherTimetableTab: React.FC<TeacherTimetableTabProps> = ({
  teachers,
  selectedTimetable,
  onApplyFilters
}) => {
  const [streams, setStreams] = useState<any[]>([]);
  const [streamForFilter, setStreamForFilter] = useState("");
  const [semesterForFilter, setSemesterForFilter] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType | "">("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeacherData, setFilteredTeacherData] = useState<any>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const { data, error } = await supabase.from('streams').select('*');
        if (error) throw error;
        setStreams(data || []);
      } catch (error: any) {
        console.error('Error fetching streams:', error.message);
      }
    };

    fetchStreams();
  }, []);

  useEffect(() => {
    let filtered = teachers || [];
    
    if (streamForFilter) {
      filtered = filtered.filter(teacher => 
        teacher.subjects?.some((s: any) => 
          typeof s === 'object' && s.stream === streamForFilter
        )
      );
    }
    
    if (semesterForFilter) {
      filtered = filtered.filter(teacher => 
        teacher.subjects?.some((s: any) => 
          typeof s === 'object' && s.semester === semesterForFilter
        )
      );
    }
    
    if (selectedRole) {
      filtered = filtered.filter(teacher => {
        if (selectedRole === 'TA') {
          return teacher.ista || (teacher.roles && teacher.roles.includes('Teaching Assistant'));
        } else if (teacher.roles && teacher.roles.length > 0) {
          return teacher.roles.some(role => role === selectedRole);
        } else {
          return selectedRole === 'Teacher' && !teacher.ista;
        }
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const uniqueTeachers = checkForDuplicates(filtered, 'name', 'email');
    setFilteredTeachers(uniqueTeachers || []);
  }, [teachers, streamForFilter, semesterForFilter, selectedRole, searchTerm]);

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

  const renderTeacherOption = (teacher: Teacher) => {
    let displayRole = '';
    if (teacher.roles && teacher.roles.length > 0) {
      displayRole = teacher.roles.join(', ');
    } else {
      displayRole = teacher.ista ? 'Teaching Assistant' : 'Teacher';
    }
    
    // Get lecture count for this teacher
    const lectureCount = getTeacherLectureCount(teacher.id);
    
    return (
      <SelectItem key={teacher.id} value={teacher.id}>
        <div className="flex flex-col items-start">
          <span>{teacher.name} {displayRole ? `(${displayRole})` : ''}</span>
          <span className="text-xs text-muted-foreground">
            Lectures assigned: {lectureCount}
            {teacher.lectures && ` | Max: ${teacher.lectures}`}
          </span>
        </div>
      </SelectItem>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Stream (Optional)</Label>
            <Select value={streamForFilter} onValueChange={setStreamForFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Streams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Streams</SelectItem>
                {streams.map(stream => (
                  <SelectItem key={stream.id} value={stream.id}>
                    {stream.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Semester (Optional)</Label>
            <Select value={semesterForFilter} onValueChange={setSemesterForFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Semesters</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <SelectItem key={s} value={s.toString()}>
                    Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Role (Optional)</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole as any}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                {getAllRoleTypes().map(role => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayName(role)}
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
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Teacher</Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map(renderTeacherOption)
                ) : (
                  <SelectItem value="no-teachers-available" disabled>
                    No teachers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          className="w-full"
          disabled={!selectedTeacher || !selectedTimetable}
          onClick={handleViewTeacherTimetable}
        >
          View Teacher Timetable
        </Button>
        
        {selectedTeacher && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Teacher Lecture Summary</h4>
            <p className="text-sm text-muted-foreground">
              Total lectures assigned: {getTeacherLectureCount(selectedTeacher)}
            </p>
          </div>
        )}
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
