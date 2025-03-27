
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TimetableDisplay from "@/components/timetable/TimetableDisplay";
import { RoleType, getAllRoleTypes, getRoleDisplayName } from "@/models/Role";
import { supabase } from "@/integrations/supabase/client";
import { checkForDuplicates } from "@/utils/dataValidation";

interface Teacher {
  id: string;
  name: string;
  email: string;
  ista: boolean;
  role?: RoleType;
  specialization: string;
  subjects: any[];
  cabin?: string;
}

interface TeacherTimetableTabProps {
  streams: any[];
  selectedTimetable: any;
}

const TeacherTimetableTab: React.FC<TeacherTimetableTabProps> = ({
  streams,
  selectedTimetable
}) => {
  const [streamForFilter, setStreamForFilter] = useState("");
  const [yearForFilter, setYearForFilter] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType | "">("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTeacherData, setFilteredTeacherData] = useState<any>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase.from('teachers').select('*');
        if (error) throw error;
        
        let filteredTeachers = data || [];
        
        if (streamForFilter) {
          filteredTeachers = filteredTeachers.filter(teacher => 
            teacher.subjects?.some((s: any) => 
              typeof s === 'object' && s.stream === streamForFilter
            )
          );
        }
        
        if (yearForFilter) {
          filteredTeachers = filteredTeachers.filter(teacher => 
            teacher.subjects?.some((s: any) => 
              typeof s === 'object' && s.year === yearForFilter
            )
          );
        }
        
        if (selectedRole) {
          filteredTeachers = filteredTeachers.filter(teacher => {
            if (selectedRole === 'TA') {
              return teacher.ista || (teacher.role as RoleType) === 'TA';
            } else if (teacher.role) {
              return (teacher.role as RoleType) === selectedRole;
            } else {
              return selectedRole === 'Teacher' && !teacher.ista;
            }
          });
        }
        
        if (searchTerm) {
          filteredTeachers = filteredTeachers.filter(teacher => 
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        const uniqueTeachers = checkForDuplicates(filteredTeachers, 'name', 'email');
        
        setTeachers(uniqueTeachers || []);
      } catch (error: any) {
        console.error('Error fetching teachers:', error.message);
      }
    };

    fetchTeachers();
  }, [streamForFilter, yearForFilter, selectedRole, searchTerm]);

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
    if (teacher.role) {
      displayRole = getRoleDisplayName(teacher.role as RoleType);
    } else {
      displayRole = teacher.ista ? 'Teaching Assistant' : 'Teacher';
    }
    
    return (
      <SelectItem key={teacher.id} value={teacher.id}>
        {teacher.name} {displayRole ? `(${displayRole})` : ''}
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
            <Label>Year (Optional)</Label>
            <Select value={yearForFilter} onValueChange={setYearForFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {[1, 2, 3, 4, 5].map(y => (
                  <SelectItem key={y} value={y.toString()}>
                    Year {y}
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
                {teachers.length > 0 ? (
                  teachers.map(renderTeacherOption)
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
