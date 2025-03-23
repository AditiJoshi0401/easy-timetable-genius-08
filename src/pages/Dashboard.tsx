
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  Building, 
  PlusCircle, 
  ListFilter,
  Presentation,
  BarChart3,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Progress } from "@/components/ui/progress";
import { FeatureCard } from "@/components/ui/feature-card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
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
        <Card className="md:w-2/3">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Overview</CardTitle>
              <Badge variant="outline">{getCurrentDate()}</Badge>
            </div>
            <CardDescription>
              Summary of your timetable application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-bold text-primary">{subjectCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Subjects</div>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-bold text-primary">{teacherCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Teachers</div>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-bold text-primary">{roomCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Rooms</div>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-bold text-primary">{streamCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Streams</div>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-bold text-primary">{divisionCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Divisions</div>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-bold text-primary">{timetableCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Timetables</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle>Setup Progress</CardTitle>
            <CardDescription>
              Complete these steps to start creating timetables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{calculateSetupProgress()}%</span>
              </div>
              <Progress value={calculateSetupProgress()} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${subjectCount > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Add Subjects</div>
                  <div className="text-xs text-muted-foreground">
                    {subjectCount > 0 ? <div className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> {subjectCount} subjects added</div> : 'No subjects added yet'}
                  </div>
                </div>
                {subjectCount === 0 && (
                  <Link to="/data-input">
                    <Button variant="ghost" size="sm">
                      Add
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${teacherCount > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Add Teachers</div>
                  <div className="text-xs text-muted-foreground">
                    {teacherCount > 0 ? <div className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> {teacherCount} teachers added</div> : 'No teachers added yet'}
                  </div>
                </div>
                {teacherCount === 0 && (
                  <Link to="/data-input">
                    <Button variant="ghost" size="sm">
                      Add
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${roomCount > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  <Building className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Add Rooms</div>
                  <div className="text-xs text-muted-foreground">
                    {roomCount > 0 ? <div className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> {roomCount} rooms added</div> : 'No rooms added yet'}
                  </div>
                </div>
                {roomCount === 0 && (
                  <Link to="/data-input">
                    <Button variant="ghost" size="sm">
                      Add
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${streamCount > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Add Streams</div>
                  <div className="text-xs text-muted-foreground">
                    {streamCount > 0 ? <div className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> {streamCount} streams added</div> : 'No streams added yet'}
                  </div>
                </div>
                {streamCount === 0 && (
                  <Link to="/streams-manager">
                    <Button variant="ghost" size="sm">
                      Add
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Timetables</CardTitle>
              <CardDescription>
                Your recently created or modified timetables
              </CardDescription>
            </div>
            <Link to="/timetable-editor">
              <Button variant="outline" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Timetable
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTimetables.length > 0 ? (
              <div className="space-y-4">
                {recentTimetables.map((timetable) => (
                  <div key={timetable.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{timetable.name}</div>
                        <div className="text-sm text-muted-foreground">Last modified: {timetable.lastModified}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to="/view-timetables">
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Link to="/timetable-editor">
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No timetables yet</h3>
                <p className="text-muted-foreground mt-1">
                  Start by creating your first timetable
                </p>
                <Link to="/timetable-editor" className="mt-4 inline-block">
                  <Button>Create New Timetable</Button>
                </Link>
              </div>
            )}
          </CardContent>
          {recentTimetables.length > 0 && (
            <CardFooter className="flex justify-center">
              <Link to="/view-timetables">
                <Button variant="link" className="gap-1">
                  View all timetables
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Link to="/timetable-editor">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Create New Timetable
                </Button>
              </Link>
              
              <Link to="/data-input">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Manage Data
                </Button>
              </Link>
              
              <Link to="/streams-manager">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Configure Streams
                </Button>
              </Link>
              
              <Link to="/view-timetables">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Presentation className="h-4 w-4 text-primary" />
                  View Timetables
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard
          title="Create Timetables"
          description="Design new timetables for different streams and divisions"
          icon={<Calendar className="h-8 w-8" />}
          link="/timetable-editor"
        />
        <FeatureCard
          title="View & Export"
          description="View, filter and export created timetables"
          icon={<Presentation className="h-8 w-8" />}
          link="/view-timetables"
        />
        <FeatureCard
          title="Data Management"
          description="Manage subjects, teachers, and rooms"
          icon={<ListFilter className="h-8 w-8" />}
          link="/data-input"
        />
        <FeatureCard
          title="Streams & Divisions"
          description="Configure academic structure"
          icon={<BookOpen className="h-8 w-8" />}
          link="/streams-manager"
        />
      </div>
    </div>
  );
};

export default Dashboard;
