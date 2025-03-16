
import { useState } from "react";
import { LayoutGrid, Filter, Download, Book, User } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FeatureCard } from "@/components/ui/feature-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ViewTimetables = () => {
  const [stream, setStream] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");
  const [selectedTimetable, setSelectedTimetable] = useState<any>(null);
  const [viewMode, setViewMode] = useState("division");

  // Mock data for recent timetables
  const recentTimetables = [
    { id: "tt1", name: "CS Year 2 Division A Timetable", stream: "CS", year: "2", division: "A", lastModified: "05/10/2023" },
    { id: "tt2", name: "IT Year 3 Division B Timetable", stream: "IT", year: "3", division: "B", lastModified: "04/28/2023" },
    { id: "tt3", name: "CS Year 1 Division C Timetable", stream: "CS", year: "1", division: "C", lastModified: "04/25/2023" },
  ];

  // Handler to load timetable
  const handleLoadTimetable = (timetable: any) => {
    setSelectedTimetable(timetable);
    setStream(timetable.stream);
    setYear(timetable.year);
    setDivision(timetable.division);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="View Timetables"
        description="Browse and export your created timetables"
        icon={<LayoutGrid className="h-6 w-6" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Select criteria to filter timetables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Stream</Label>
                <Select value={stream} onValueChange={setStream}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CS">Computer Science</SelectItem>
                    <SelectItem value="IT">Information Technology</SelectItem>
                    <SelectItem value="EC">Electronics</SelectItem>
                    <SelectItem value="ME">Mechanical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Division</Label>
                <Select value={division} onValueChange={setDivision}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Division A</SelectItem>
                    <SelectItem value="B">Division B</SelectItem>
                    <SelectItem value="C">Division C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full mt-2" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Timetables</CardTitle>
              <CardDescription>
                Quick access to recently edited timetables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTimetables.map((timetable) => (
                  <div
                    key={timetable.id}
                    className="p-3 border rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleLoadTimetable(timetable)}
                  >
                    <div className="font-medium text-sm">{timetable.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last modified: {timetable.lastModified}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedTimetable ? selectedTimetable.name : "Timetable Viewer"}
                  </CardTitle>
                  <CardDescription>
                    {selectedTimetable
                      ? `Viewing ${selectedTimetable.stream} Year ${selectedTimetable.year} Division ${selectedTimetable.division}`
                      : "Select a timetable to view"}
                  </CardDescription>
                </div>
                {selectedTimetable && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedTimetable ? (
                <div>
                  <Tabs value={viewMode} onValueChange={setViewMode}>
                    <TabsList className="mb-4 grid w-full grid-cols-4">
                      <TabsTrigger value="division">Division</TabsTrigger>
                      <TabsTrigger value="teacher">Teacher</TabsTrigger>
                      <TabsTrigger value="room">Room</TabsTrigger>
                      <TabsTrigger value="lab">Lab</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="division">
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Division timetable view for {selectedTimetable.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          (This is a placeholder - timetable data would be loaded and displayed here)
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="teacher">
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Teacher-specific timetable view
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          (This is a placeholder - teacher-specific views would be shown here)
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="room">
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Room availability view
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          (This is a placeholder - room schedules would be shown here)
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="lab">
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Lab availability view
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          (This is a placeholder - lab schedules would be shown here)
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FeatureCard
                    title="Division Timetables"
                    description="View full timetables for each class division"
                    icon={<Book className="h-8 w-8" />}
                  />
                  <FeatureCard
                    title="Teacher Schedules"
                    description="Check individual teacher timetables"
                    icon={<User className="h-8 w-8" />}
                  />
                  <FeatureCard
                    title="Room Availability"
                    description="View room usage and availability"
                    icon={<LayoutGrid className="h-8 w-8" />}
                  />
                  <FeatureCard
                    title="Export Options"
                    description="Export timetables in various formats"
                    icon={<Download className="h-8 w-8" />}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewTimetables;
