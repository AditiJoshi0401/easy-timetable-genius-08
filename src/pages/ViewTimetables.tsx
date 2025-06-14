import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Calendar, User, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { fetchStreams, fetchDivisions, fetchSubjects, fetchTeachers, fetchRooms, 
         fetchTimetable, Stream, Division, Subject, Teacher, Room } from '@/services/supabaseService';
import { useQuery } from '@tanstack/react-query';
import DivisionTimetableTab from '@/components/timetable/DivisionTimetableTab';
import TeacherTimetableTab from '@/components/timetable/TeacherTimetableTab';
import RoomTimetableTab from '@/components/timetable/RoomTimetableTab';

const ViewTimetables = () => {
  const timetableRef = useRef<HTMLDivElement>(null);
  
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
    const streamCode = streams?.find(s => s.id === selectedStream)?.code || "";
    const divisionName = divisions?.find(d => d.id === selectedDivision)?.name || "";
    return `${streamCode}-SEM${selectedSemester}-${divisionName}`;
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

  // Handle applying filters for teacher timetable
  const handleApplyTeacherFilters = async () => {
    if (!selectedTeacher) {
      setSelectedTeacherTimetable(null);
      return;
    }

    try {
      const timetableKey = `${selectedTeacher}`;
      const timetable = await fetchTimetable(timetableKey);
      setSelectedTeacherTimetable(timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setSelectedTeacherTimetable(null);
    }
  };

  // Handle applying filters for room timetable
  const handleApplyRoomFilters = async () => {
    if (!selectedRoom) {
      setSelectedRoomTimetable(null);
      return;
    }

    try {
      const timetableKey = `${selectedRoom}`;
      const timetable = await fetchTimetable(timetableKey);
      setSelectedRoomTimetable(timetable);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setSelectedRoomTimetable(null);
    }
  };

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
                teachers={teachers}
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
                rooms={rooms}
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
