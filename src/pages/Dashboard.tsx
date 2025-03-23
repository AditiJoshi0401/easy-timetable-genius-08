
import { useState, useEffect } from "react";
import { LayoutDashboard, Edit, BookOpen, Users, Building, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeading } from "@/components/ui/section-heading";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { SetupProgressCard } from "@/components/dashboard/SetupProgressCard";
import { RecentTimetablesCard } from "@/components/dashboard/RecentTimetablesCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { FeatureCardsSection } from "@/components/dashboard/FeatureCardsSection";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [subjectCount, setSubjectCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [streamCount, setStreamCount] = useState(0);
  const [divisionCount, setDivisionCount] = useState(0);
  const [timetableCount, setTimetableCount] = useState(0);
  const [recentTimetables, setRecentTimetables] = useState<any[]>([]);

  useEffect(() => {
    // Load counts from localStorage
    try {
      const subjects = localStorage.getItem('subjects');
      const teachers = localStorage.getItem('teachers');
      const rooms = localStorage.getItem('rooms');
      const streams = localStorage.getItem('streams');
      const divisions = localStorage.getItem('divisions');
      const recentTimetablesData = localStorage.getItem('recentTimetables');
      
      if (subjects) setSubjectCount(JSON.parse(subjects).length);
      if (teachers) setTeacherCount(JSON.parse(teachers).length);
      if (rooms) setRoomCount(JSON.parse(rooms).length);
      if (streams) setStreamCount(JSON.parse(streams).length);
      if (divisions) setDivisionCount(JSON.parse(divisions).length);
      
      if (recentTimetablesData) {
        const parsedTimetables = JSON.parse(recentTimetablesData);
        setRecentTimetables(parsedTimetables);
        setTimetableCount(parsedTimetables.length);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Calculate setup progress
  const calculateSetupProgress = () => {
    let progress = 0;
    if (subjectCount > 0) progress += 20;
    if (teacherCount > 0) progress += 20;
    if (roomCount > 0) progress += 20;
    if (streamCount > 0) progress += 20;
    if (divisionCount > 0) progress += 20;
    return progress;
  };

  // Get current date string
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Dashboard"
        description="Welcome to your timetable management dashboard"
        icon={<LayoutDashboard className="h-6 w-6" />}
      />

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <OverviewCard
          subjectCount={subjectCount}
          teacherCount={teacherCount}
          roomCount={roomCount}
          streamCount={streamCount}
          divisionCount={divisionCount}
          timetableCount={timetableCount}
          currentDate={getCurrentDate()}
        />

        <SetupProgressCard
          subjectCount={subjectCount}
          teacherCount={teacherCount}
          roomCount={roomCount}
          streamCount={streamCount}
          divisionCount={divisionCount}
          setupProgress={calculateSetupProgress()}
        />
      </div>

      {/* Data Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Subjects</span>
              </div>
              <span className="text-2xl font-bold">{subjectCount}</span>
            </CardTitle>
            <CardDescription>Manage your course subjects</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {subjectCount > 0 
                ? `You have ${subjectCount} subjects added to your system.` 
                : "No subjects added yet. Start by adding your first subject."}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/data-input')}
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage Subjects
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Teachers</span>
              </div>
              <span className="text-2xl font-bold">{teacherCount}</span>
            </CardTitle>
            <CardDescription>Manage your faculty members</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {teacherCount > 0 
                ? `You have ${teacherCount} teachers registered in the system.` 
                : "No teachers added yet. Start by adding your faculty."}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/data-input?tab=teachers')}
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage Teachers
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <span>Rooms</span>
              </div>
              <span className="text-2xl font-bold">{roomCount}</span>
            </CardTitle>
            <CardDescription>Manage your classrooms and labs</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {roomCount > 0 
                ? `You have ${roomCount} rooms configured for scheduling.` 
                : "No rooms added yet. Start by adding your facilities."}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/data-input?tab=rooms')}
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage Rooms
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Academic Streams</span>
              </div>
              <span className="text-2xl font-bold">{streamCount}</span>
            </CardTitle>
            <CardDescription>Manage your academic programs</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {streamCount > 0 
                ? `You have ${streamCount} academic streams configured.` 
                : "No streams added yet. Configure your academic programs."}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/streams-manager')}
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage Streams
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Divisions</span>
              </div>
              <span className="text-2xl font-bold">{divisionCount}</span>
            </CardTitle>
            <CardDescription>Manage your class divisions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {divisionCount > 0 
                ? `You have ${divisionCount} class divisions configured.` 
                : "No divisions added yet. Set up your class structure."}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/streams-manager?tab=divisions')}
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage Divisions
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Timetables</span>
              </div>
              <span className="text-2xl font-bold">{timetableCount}</span>
            </CardTitle>
            <CardDescription>View all your created timetables</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {timetableCount > 0 
                ? `You have created ${timetableCount} timetables so far.` 
                : "No timetables created yet. Start building your first schedule."}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/view-timetables')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Timetables
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTimetablesCard recentTimetables={recentTimetables} />
        <QuickActionsCard />
      </div>

      <FeatureCardsSection />
    </div>
  );
};

export default Dashboard;
