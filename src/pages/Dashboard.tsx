
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Database, LayoutGrid, Plus, Clock, Book, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { FeatureCard } from "@/components/ui/feature-card";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const { toast } = useToast();
  const [recentTimetables, setRecentTimetables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from localStorage
    const loadData = async () => {
      try {
        const storedTimetables = localStorage.getItem('recentTimetables');
        if (storedTimetables) {
          setRecentTimetables(JSON.parse(storedTimetables));
        }
      } catch (error) {
        console.error('Error loading timetables:', error);
      } finally {
        // Simulate loading delay for animation
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    loadData();
  }, []);

  const handleNewTimetable = () => {
    toast({
      title: "Create New Timetable",
      description: "Starting a new timetable creation process.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="animate-slide-down">
        <SectionHeading
          title="Welcome to Timetable Genius"
          description="AI-powered college timetable generator for effortless scheduling"
          action={
            <Link to="/editor">
              <Button className="gap-2" onClick={handleNewTimetable}>
                <Plus className="h-4 w-4" /> New Timetable
              </Button>
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/editor" className="block">
          <FeatureCard
            icon={<Calendar className="h-12 w-12" />}
            title="Timetable Editor"
            description="Create and modify timetables with an intuitive drag-and-drop interface"
          />
        </Link>
        
        <Link to="/data" className="block">
          <FeatureCard
            icon={<Database className="h-12 w-12" />}
            title="Data Management"
            description="Add and edit subjects, teachers, rooms, and constraints"
          />
        </Link>
        
        <Link to="/view" className="block">
          <FeatureCard
            icon={<LayoutGrid className="h-12 w-12" />}
            title="View Timetables"
            description="Browse created timetables and check for overlaps"
          />
        </Link>
      </div>

      <div className="animate-slide-in" style={{ animationDelay: "200ms" }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Recent Timetables</span>
            </CardTitle>
            <CardDescription>
              Your recently created or modified timetables
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-1/2 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTimetables.length > 0 ? (
              <div className="space-y-4">
                {recentTimetables.map((timetable, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                      <Book className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{timetable.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {timetable.stream} • {timetable.year} • {timetable.lastModified}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                  <Compass className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No timetables yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Create your first timetable to get started
                </p>
                <Link to="/editor">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Create Timetable
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-in" style={{ animationDelay: "400ms" }}>
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to create your first timetable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="text-sm font-medium">1. Add data</div>
                  <div className="text-sm text-muted-foreground">Step 1 of 3</div>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Add subjects, teachers, and rooms in the Data Management section
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="text-sm font-medium">2. Create timetable</div>
                  <div className="text-sm text-muted-foreground">Step 2 of 3</div>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Use the Timetable Editor to design your schedule
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="text-sm font-medium">3. Check conflicts</div>
                  <div className="text-sm text-muted-foreground">Step 3 of 3</div>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Verify there are no overlaps in teacher or room scheduling
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/data" className="w-full">
              <Button variant="outline" className="w-full">
                Start Now
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tips & Features</CardTitle>
            <CardDescription>
              Helpful tips to get the most out of Timetable Genius
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">1</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Drag & Drop</h4>
                  <p className="text-sm text-muted-foreground">
                    Easily assign subjects by dragging them to time slots
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">2</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Conflict Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically detects scheduling conflicts in real-time
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">3</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Color Coding</h4>
                  <p className="text-sm text-muted-foreground">
                    Assign colors to subjects for better visual organization
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-medium">4</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Export Options</h4>
                  <p className="text-sm text-muted-foreground">
                    Export timetables as PDF, CSV, or printable view
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
