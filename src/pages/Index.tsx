
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Building, School, Calendar, BoxSelect, ArrowRight } from 'lucide-react';
import { fetchSubjects, fetchTeachers, fetchRooms, fetchStreams, fetchDivisions } from '@/services/supabaseService';

const Index = () => {
  const navigate = useNavigate();
  
  // Fetch data
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
  
  const { data: streams = [] } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });
  
  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: fetchDivisions
  });
  
  const teachingAssistants = teachers.filter(teacher => teacher.isTA);

  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Timetable Genius</h1>
        <p className="text-lg text-muted-foreground mt-2">
          All-in-one solution for managing your institution's timetables
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Subjects</span>
            </CardTitle>
            <CardDescription>
              Manage your curriculum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subjects.length}</div>
            <p className="text-sm text-muted-foreground">subjects in database</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/data-input')}>
              Manage Subjects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Teachers</span>
            </CardTitle>
            <CardDescription>
              Manage your faculty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teachers.length}</div>
            <p className="text-sm text-muted-foreground">
              including {teachingAssistants.length} teaching assistants
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/data-input?tab=teachers')}>
              Manage Teachers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <span>Rooms</span>
            </CardTitle>
            <CardDescription>
              Manage classrooms and labs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rooms.length}</div>
            <p className="text-sm text-muted-foreground">
              {rooms.filter(room => room.type === 'classroom').length} classrooms, {rooms.filter(room => room.type === 'lab').length} labs
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/data-input?tab=rooms')}>
              Manage Rooms
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <span>Streams</span>
            </CardTitle>
            <CardDescription>
              Manage academic streams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streams.length}</div>
            <p className="text-sm text-muted-foreground">academic programs</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/streams-manager')}>
              Manage Streams
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BoxSelect className="h-5 w-5 text-primary" />
              <span>Divisions</span>
            </CardTitle>
            <CardDescription>
              Manage class divisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{divisions.length}</div>
            <p className="text-sm text-muted-foreground">across all streams</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/streams-manager')}>
              Manage Divisions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Timetables</span>
            </CardTitle>
            <CardDescription>
              Create and manage timetables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Current Date:</p>
            <p className="font-medium">{currentDate}</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/timetable-editor')}>
              Create
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate('/view-timetables')}>
              View
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
