
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
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Progress } from "@/components/ui/progress";
import { FeatureCard } from "@/components/ui/feature-card";

const Dashboard = () => {
  const [subjectCount, setSubjectCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [timetableCount, setTimetableCount] = useState(0);
  const [recentTimetables, setRecentTimetables] = useState<any[]>([]);

  useEffect(() => {
    // Load counts from localStorage
    try {
      const subjects = localStorage.getItem('subjects');
      const teachers = localStorage.getItem('teachers');
      const rooms = localStorage.getItem('rooms');
      const recentTimetablesData = localStorage.getItem('recentTimetables');
      
      if (subjects) setSubjectCount(JSON.parse(subjects).length);
      if (teachers) setTeacherCount(JSON.parse(teachers).length);
      if (rooms) setRoomCount(JSON.parse(rooms).length);
      
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
    if (subjectCount > 0) progress += 33;
    if (teacherCount > 0) progress += 33;
    if (roomCount > 0) progress += 34;
    return progress;
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Dashboard"
        description="Welcome to your timetable management dashboard"
        icon={<LayoutDashboard className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Subjects</CardTitle>
            <CardDescription>Total subjects added</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjectCount}</div>
          </CardContent>
          <CardFooter>
            <Link to="/data">
              <Button variant="ghost" size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Subjects
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Teachers</CardTitle>
            <CardDescription>Total teachers added</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherCount}</div>
          </CardContent>
          <CardFooter>
            <Link to="/data">
              <Button variant="ghost" size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Teachers
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rooms</CardTitle>
            <CardDescription>Total rooms added</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomCount}</div>
          </CardContent>
          <CardFooter>
            <Link to="/data">
              <Button variant="ghost" size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Rooms
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Timetables</CardTitle>
            <CardDescription>Created timetables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timetableCount}</div>
          </CardContent>
          <CardFooter>
            <Link to="/editor">
              <Button variant="ghost" size="sm" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Timetables</CardTitle>
            <CardDescription>
              Your recently created or modified timetables
            </CardDescription>
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
                      <Link to="/view">
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <Link to="/editor">
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
                <Link to="/editor" className="mt-4 inline-block">
                  <Button>Create New Timetable</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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
                    {subjectCount > 0 ? `${subjectCount} subjects added` : 'No subjects added yet'}
                  </div>
                </div>
                {subjectCount === 0 && (
                  <Link to="/data">
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
                    {teacherCount > 0 ? `${teacherCount} teachers added` : 'No teachers added yet'}
                  </div>
                </div>
                {teacherCount === 0 && (
                  <Link to="/data">
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
                    {roomCount > 0 ? `${roomCount} rooms added` : 'No rooms added yet'}
                  </div>
                </div>
                {roomCount === 0 && (
                  <Link to="/data">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FeatureCard
          title="Create Timetables"
          description="Design new timetables for different streams and divisions"
          icon={<Calendar className="h-8 w-8" />}
          link="/editor"
        />
        <FeatureCard
          title="View & Export"
          description="View, filter and export created timetables"
          icon={<Presentation className="h-8 w-8" />}
          link="/view"
        />
        <FeatureCard
          title="Data Management"
          description="Manage subjects, teachers, and rooms"
          icon={<ListFilter className="h-8 w-8" />}
          link="/data"
        />
        <FeatureCard
          title="App Settings"
          description="Configure application behavior and preferences"
          icon={<BarChart3 className="h-8 w-8" />}
          link="/settings"
        />
      </div>
    </div>
  );
};

export default Dashboard;
