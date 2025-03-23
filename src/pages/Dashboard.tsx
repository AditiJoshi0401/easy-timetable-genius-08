
import { useState, useEffect } from "react";
import { LayoutDashboard, Edit, BookOpen, Users, Building, Calendar, Database, Grid3X3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const navigate = useNavigate();
  const [subjectCount, setSubjectCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [streamCount, setStreamCount] = useState(0);
  const [divisionCount, setDivisionCount] = useState(0);
  const [timetableCount, setTimetableCount] = useState(0);
  const [recentTimetables, setRecentTimetables] = useState<any[]>([]);
  const [setupProgress, setSetupProgress] = useState(0);

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
      
      // Calculate setup progress
      let progress = 0;
      if (subjects && JSON.parse(subjects).length > 0) progress += 20;
      if (teachers && JSON.parse(teachers).length > 0) progress += 20;
      if (rooms && JSON.parse(rooms).length > 0) progress += 20;
      if (streams && JSON.parse(streams).length > 0) progress += 20;
      if (divisions && JSON.parse(divisions).length > 0) progress += 20;
      
      setSetupProgress(progress);
      
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

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

      {/* Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Today is {getCurrentDate()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Subjects</div>
              <div className="text-2xl font-bold">{subjectCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Teachers</div>
              <div className="text-2xl font-bold">{teacherCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Rooms</div>
              <div className="text-2xl font-bold">{roomCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Streams</div>
              <div className="text-2xl font-bold">{streamCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Divisions</div>
              <div className="text-2xl font-bold">{divisionCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-sm">Timetables</div>
              <div className="text-2xl font-bold">{timetableCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Progress Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>
            Complete these steps to create your first timetable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Setup Completion</span>
              <span className="font-medium">{setupProgress}%</span>
            </div>
            <Progress value={setupProgress} className="h-2" />
          </div>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className={`h-4 w-4 ${subjectCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={subjectCount > 0 ? 'text-foreground' : 'text-muted-foreground'}>Add Subjects</span>
              </div>
              {subjectCount > 0 ? (
                <div className="text-sm text-muted-foreground">{subjectCount} Added</div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => navigate('/data-input')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Users className={`h-4 w-4 ${teacherCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={teacherCount > 0 ? 'text-foreground' : 'text-muted-foreground'}>Add Teachers</span>
              </div>
              {teacherCount > 0 ? (
                <div className="text-sm text-muted-foreground">{teacherCount} Added</div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => navigate('/data-input?tab=teachers')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Building className={`h-4 w-4 ${roomCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={roomCount > 0 ? 'text-foreground' : 'text-muted-foreground'}>Add Rooms</span>
              </div>
              {roomCount > 0 ? (
                <div className="text-sm text-muted-foreground">{roomCount} Added</div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => navigate('/data-input?tab=rooms')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Database className={`h-4 w-4 ${streamCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={streamCount > 0 ? 'text-foreground' : 'text-muted-foreground'}>Add Streams</span>
              </div>
              {streamCount > 0 ? (
                <div className="text-sm text-muted-foreground">{streamCount} Added</div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => navigate('/streams-manager')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Grid3X3 className={`h-4 w-4 ${divisionCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={divisionCount > 0 ? 'text-foreground' : 'text-muted-foreground'}>Add Divisions</span>
              </div>
              {divisionCount > 0 ? (
                <div className="text-sm text-muted-foreground">{divisionCount} Added</div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => navigate('/streams-manager?tab=divisions')}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" 
            onClick={() => navigate('/timetable-editor')}
            disabled={setupProgress < 100}>
            {setupProgress < 100 ? 'Complete Setup to Create Timetable' : 'Create New Timetable'}
          </Button>
        </CardFooter>
      </Card>

      {/* Data Management Cards */}
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
                <Database className="h-5 w-5 text-primary" />
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
                <Grid3X3 className="h-5 w-5 text-primary" />
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
          <CardFooter className="flex gap-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/view-timetables')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              View Timetables
            </Button>
            <Button 
              className="w-full"
              onClick={() => navigate('/timetable-editor')}
              disabled={setupProgress < 100}
            >
              <Edit className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Timetables Section */}
      {recentTimetables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Timetables</CardTitle>
            <CardDescription>
              Your most recently created timetables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTimetables.slice(0, 3).map((timetable, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{timetable.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Created on {new Date(timetable.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/view-timetable/${timetable.id}`)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/view-timetables')}>
              View All Timetables
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you might want to perform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start" onClick={() => navigate('/timetable-editor')}>
              <Calendar className="mr-2 h-4 w-4" />
              Create New Timetable
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/data-input')}>
              <Database className="mr-2 h-4 w-4" />
              Manage Academic Data
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/view-timetables')}>
              <Grid3X3 className="mr-2 h-4 w-4" />
              View All Timetables
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/streams-manager')}>
              <Users className="mr-2 h-4 w-4" />
              Manage Streams & Divisions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
