import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Calendar, User, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { fetchStreams, fetchDivisions, fetchSubjects, fetchTeachers, fetchRooms, 
         fetchTimetable, fetchAllTimetables, Stream, Division, Subject, Teacher, Room } from '@/services/supabaseService';
import { useQuery } from '@tanstack/react-query';
import DivisionTimetableTab from '@/components/timetable/DivisionTimetableTab';
import TeacherTimetableTab from '@/components/timetable/TeacherTimetableTab';
import RoomTimetableTab from '@/components/timetable/RoomTimetableTab';
import { exportTimetableToPDF, exportTimetableToExcel, exportTimetableToJSON, TimetableExportData } from '@/utils/timetableExport';
import { useToast } from '@/hooks/use-toast';

const ViewTimetables = () => {
  const timetableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Division timetable state
  const [selectedStream, setSelectedStream] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedTimetable, setSelectedTimetable] = useState<any>(null);
  
  // Teacher timetable state  
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedTeacherTimetable, setSelectedTeacherTimetable] = useState<any>(null);
  
  // Room timetable state
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [selectedRoomTimetable, setSelectedRoomTimetable] = useState<any>(null);

  // Fetch data
  const { data: streams = [] } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: fetchDivisions
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  });

  // Get filtered divisions based on selected stream and semester
  const filteredDivisions = divisions?.filter(division => {
    const streamMatch = division.streamId === selectedStream;
    const semesterMatch = division.semester.toString() === selectedSemester;
    return streamMatch && semesterMatch;
  }) || [];

  // Get available semesters for the selected stream
  const getAvailableSemesters = () => {
    const stream = streams?.find(s => s.id === selectedStream);
    if (!stream) return [];
    return Array.from({ length: stream.semesters }, (_, i) => i + 1);
  };

  // Generate timetable key for division timetables
  const generateTimetableKey = () => {
    if (!selectedStream || !selectedSemester || !selectedDivision) return "";
    return `${selectedStream}_${selectedSemester}_${selectedDivision}`;
  };

  // Handle applying filters for division timetable
  const handleApplyDivisionFilters = async () => {
    if (!selectedStream || !selectedSemester || !selectedDivision) {
      setSelectedTimetable(null);
      return;
    }

    try {
      const timetableKey = generateTimetableKey();
      const timetable = await fetchTimetable(timetableKey);
      setSelectedTimetable(timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setSelectedTimetable(null);
    }
  };

  // Handle applying filters for teacher timetable (accepts teacherId)
  const handleApplyTeacherFilters = async (teacherId?: string) => {
    const id = teacherId || selectedTeacher;
    if (!id) {
      setSelectedTeacherTimetable(null);
      return;
    }

    try {
      // First try direct lookup by teacher id (in case a timetable was saved under teacher id)
      const direct = await fetchTimetable(id);
      if (direct) {
        setSelectedTeacherTimetable(direct);
        return direct;
      }

      // If no direct timetable exists, search all stored timetables for any slot that references this teacher
      const allTimetables = await fetchAllTimetables();

      let found: any = null;
      for (const tt of allTimetables || []) {
        const data = tt.data || {};
        let contains = false;

        for (const day in data) {
          if (contains) break;
          const daySlots = data[day] || {};
          for (const time in daySlots) {
            const slot = daySlots[time];
            if (!slot || !slot.teacher) continue;
            if (typeof slot.teacher === 'string' && slot.teacher === id) {
              contains = true;
              break;
            }
            if (typeof slot.teacher === 'object' && slot.teacher.id === id) {
              contains = true;
              break;
            }
          }
        }

        if (contains) {
          found = tt;
          break;
        }
      }

      if (found) {
        setSelectedTeacherTimetable(found);
        return found;
      } else {
        setSelectedTeacherTimetable(null);
        // Inform the user the teacher timetable wasn't found in stored timetables
        // (this is expected if timetables haven't been generated/saved for divisions containing this teacher)
        // Use toast via window console as a fallback (parent has access to toast in this component though)
        console.warn(`No timetable found for teacher id ${id}`);
        return null;
      }
    } catch (error) {
      console.error('Error searching for teacher timetable:', error);
      setSelectedTeacherTimetable(null);
    }
  };

  // Handle applying filters for room timetable (accepts optional roomId)
  const handleApplyRoomFilters = async (roomId?: string) => {
    const id = roomId || selectedRoom;
    if (!id) {
      setSelectedRoomTimetable(null);
      return null;
    }

    try {
      // Try direct lookup first
      const direct = await fetchTimetable(id);
      if (direct) {
        setSelectedRoomTimetable(direct);
        setSelectedRoom(id);
        return direct;
      }

      // If not found directly, search all timetables for any slot that references this room
      const allTimetables = await fetchAllTimetables();

      let found: any = null;
      for (const tt of allTimetables || []) {
        const data = tt.data || {};
        let contains = false;

        for (const day in data) {
          if (contains) break;
          const daySlots = data[day] || {};
          for (const time in daySlots) {
            const slot = daySlots[time];
            if (!slot) continue;
            // slot.rooms may be an array of room objects or ids
            if (Array.isArray(slot.rooms)) {
              for (const r of slot.rooms) {
                if (!r) continue;
                if (typeof r === 'string' && r === id) { contains = true; break; }
                if (typeof r === 'object' && r.id === id) { contains = true; break; }
              }
            }
            // legacy single room field
            if (!contains && slot.room) {
              const r = slot.room;
              if (typeof r === 'string' && r === id) { contains = true; }
              if (typeof r === 'object' && r.id === id) { contains = true; }
            }
            if (contains) break;
          }
        }

        if (contains) {
          found = tt;
          break;
        }
      }

      if (found) {
        setSelectedRoomTimetable(found);
        setSelectedRoom(id);
        return found;
      } else {
        setSelectedRoomTimetable(null);
        console.warn(`No timetable found for room id ${id}`);
        return null;
      }
    } catch (error) {
      console.error('Error searching for room timetable:', error);
      setSelectedRoomTimetable(null);
      return null;
    }
  };

  // Export functionality
  const handleExportTimetable = (format: 'pdf' | 'excel' | 'json', timetable: any, type: 'division' | 'teacher' | 'room', entityName?: string) => {
    if (!timetable) {
      toast({
        title: "No Timetable",
        description: "Please select and view a timetable first.",
        variant: "destructive"
      });
      return;
    }

    const exportData: TimetableExportData = {
      name: timetable.name || `${type} Timetable`,
      data: timetable.data,
      type,
      entityName
    };

    try {
      switch (format) {
        case 'pdf':
          exportTimetableToPDF(exportData);
          break;
        case 'excel':
          exportTimetableToExcel(exportData);
          break;
        case 'json':
          exportTimetableToJSON(exportData);
          break;
      }
      
      toast({
        title: "Export Successful",
        description: `Timetable exported as ${format.toUpperCase()} successfully.`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export timetable. Please try again.",
        variant: "destructive"
      });
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-6">
      <SectionHeading
        title="View Timetables"
        description="View and download timetables for divisions, teachers, and rooms"
        icon={<Calendar className="h-6 w-6" />}
      />

      <Tabs defaultValue="division" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="division" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Division
          </TabsTrigger>
          <TabsTrigger value="teacher" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Teacher
          </TabsTrigger>
          <TabsTrigger value="room" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Room
          </TabsTrigger>
        </TabsList>

        <TabsContent value="division">
          <Card>
            <CardHeader>
              <CardTitle>Division Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <DivisionTimetableTab
                streams={streams}
                semesters={getAvailableSemesters().map(semester => ({ id: semester.toString(), name: `Semester ${semester}` }))}
                divisions={filteredDivisions.map(division => ({ id: division.id, name: division.name }))}
                stream={selectedStream}
                semester={selectedSemester}
                division={selectedDivision}
                selectedTimetable={selectedTimetable}
                setStream={setSelectedStream}
                setSemester={setSelectedSemester}
                setDivision={setSelectedDivision}
                onApplyFilters={handleApplyDivisionFilters}
                onManageStructure={() => {/* Navigate to structure management */}}
                timetableRef={timetableRef}
                onExportTimetable={handleExportTimetable}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <TeacherTimetableTab
                selectedTimetable={selectedTeacherTimetable}
                onApplyFilters={handleApplyTeacherFilters}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="room">
          <Card>
            <CardHeader>
              <CardTitle>Room Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <RoomTimetableTab
                selectedTimetable={selectedRoomTimetable}
                onApplyFilters={handleApplyRoomFilters}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewTimetables;
