
import { useState, useEffect } from "react";
import { LayoutGrid, Filter, Download, Book, User, Calendar } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FeatureCard } from "@/components/ui/feature-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const ViewTimetables = () => {
  const navigate = useNavigate();
  const [stream, setStream] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");
  const [selectedTimetable, setSelectedTimetable] = useState<any>(null);
  const [viewMode, setViewMode] = useState("division");
  const [streams, setStreams] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [recentTimetables, setRecentTimetables] = useState<any[]>([]);
  const [noStreamsDataExists, setNoStreamsDataExists] = useState(false);

  useEffect(() => {
    try {
      // Load streams data
      const storedStreams = localStorage.getItem('streams');
      if (storedStreams) {
        const parsedStreams = JSON.parse(storedStreams);
        setStreams(parsedStreams);
        
        // Check if streams data exists
        if (!parsedStreams || parsedStreams.length === 0) {
          setNoStreamsDataExists(true);
        }
      } else {
        setNoStreamsDataExists(true);
      }

      // Load recent timetables
      const storedRecentTimetables = localStorage.getItem('recentTimetables');
      if (storedRecentTimetables) {
        setRecentTimetables(JSON.parse(storedRecentTimetables));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setNoStreamsDataExists(true);
    }
  }, []);

  useEffect(() => {
    // Filter years based on selected stream
    if (stream) {
      const selectedStreamData = streams.find(s => s.id === stream);
      if (selectedStreamData && selectedStreamData.years) {
        setYears(selectedStreamData.years);
        setYear("");
        setDivision("");
      } else {
        setYears([]);
      }
    } else {
      setYears([]);
    }
  }, [stream, streams]);

  useEffect(() => {
    // Filter divisions based on selected stream and year
    if (stream && year) {
      const selectedStreamData = streams.find(s => s.id === stream);
      if (selectedStreamData && selectedStreamData.years) {
        const selectedYear = selectedStreamData.years.find((y: any) => y.id === year);
        if (selectedYear && selectedYear.divisions) {
          setDivisions(selectedYear.divisions);
          setDivision("");
        } else {
          setDivisions([]);
        }
      }
    } else {
      setDivisions([]);
    }
  }, [stream, year, streams]);

  const handleNavigateToStreamsManager = () => {
    navigate("/streams-manager");
  };

  // Handler to load timetable
  const handleLoadTimetable = (timetable: any) => {
    setSelectedTimetable(timetable);
    setStream(timetable.stream);
    setYear(timetable.year);
    setDivision(timetable.division);
  };

  const getStreamName = (streamId: string) => {
    const stream = streams.find(s => s.id === streamId);
    return stream ? stream.name : streamId;
  };

  const getYearName = (yearId: string) => {
    if (!stream) return yearId;
    const streamData = streams.find(s => s.id === stream);
    if (!streamData) return yearId;
    
    const year = streamData.years.find((y: any) => y.id === yearId);
    return year ? year.name : yearId;
  };

  const getDivisionName = (divisionId: string) => {
    if (!stream || !year) return divisionId;
    const streamData = streams.find(s => s.id === stream);
    if (!streamData) return divisionId;
    
    const yearData = streamData.years.find((y: any) => y.id === year);
    if (!yearData) return divisionId;
    
    const division = yearData.divisions.find((d: any) => d.id === divisionId);
    return division ? division.name : divisionId;
  };

  const handleApplyFilters = () => {
    // Filter timetables based on selected criteria
    // For now, just show a toast message
    console.log("Applied filters:", { stream, year, division });
  };

  if (noStreamsDataExists) {
    return (
      <div className="space-y-6">
        <SectionHeading
          title="View Timetables"
          description="Browse and export your created timetables"
          icon={<LayoutGrid className="h-6 w-6" />}
        />

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>No Streams and Divisions Found</CardTitle>
            <CardDescription>
              You need to set up streams and divisions before viewing timetables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Before viewing timetables, you need to set up your academic structure by defining
              streams, years, and divisions.
            </p>
            <Button onClick={handleNavigateToStreamsManager}>
              Set Up Streams & Divisions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    {streams.length > 0 ? (
                      streams.map(stream => (
                        <SelectItem key={stream.id} value={stream.id}>
                          {stream.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No streams available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={year} onValueChange={setYear} disabled={!stream || years.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.length > 0 ? (
                      years.map((year: any) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        {stream ? "No years available for this stream" : "Select a stream first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Division</Label>
                <Select value={division} onValueChange={setDivision} disabled={!year || divisions.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.length > 0 ? (
                      divisions.map((division: any) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        {year ? "No divisions available for this year" : "Select a year first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between mt-2">
                <Button variant="outline" onClick={handleNavigateToStreamsManager} size="sm">
                  Manage Structure
                </Button>
                <Button onClick={handleApplyFilters} size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
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
                {recentTimetables.length > 0 ? (
                  recentTimetables.map((timetable) => (
                    <div
                      key={timetable.id}
                      className="p-3 border rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleLoadTimetable(timetable)}
                    >
                      <div className="font-medium text-sm">
                        {getStreamName(timetable.stream)} {getYearName(timetable.year)} {getDivisionName(timetable.division)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last modified: {timetable.lastModified}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No recent timetables found
                    </p>
                    <Button variant="link" size="sm" onClick={() => navigate('/timetable-editor')}>
                      Create your first timetable
                    </Button>
                  </div>
                )}
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
                    {selectedTimetable ? `${getStreamName(selectedTimetable.stream)} ${getYearName(selectedTimetable.year)} ${getDivisionName(selectedTimetable.division)}` : "Timetable Viewer"}
                  </CardTitle>
                  <CardDescription>
                    {selectedTimetable
                      ? `Viewing ${getStreamName(selectedTimetable.stream)} ${getYearName(selectedTimetable.year)} ${getDivisionName(selectedTimetable.division)}`
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
                          Division timetable view for {getStreamName(selectedTimetable.stream)} {getYearName(selectedTimetable.year)} {getDivisionName(selectedTimetable.division)}
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
