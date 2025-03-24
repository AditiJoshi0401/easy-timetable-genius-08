
import { useState, useEffect } from "react";
import { Calendar, LayoutGrid, Users, BookOpen, Building, Filter, Download, Book, User } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FeatureCard } from "@/components/ui/feature-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchStreams, fetchDivisions, fetchTimetable } from "@/services/supabaseService";
import { useToast } from "@/components/ui/use-toast";

const ViewTimetables = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stream, setStream] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");
  const [selectedTimetable, setSelectedTimetable] = useState<any>(null);
  const [viewMode, setViewMode] = useState("division");
  const [years, setYears] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [recentTimetables, setRecentTimetables] = useState<any[]>([]);
  const [noStreamsDataExists, setNoStreamsDataExists] = useState(false);

  // Fetch streams from Supabase
  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });

  // Fetch divisions from Supabase
  const { data: allDivisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: fetchDivisions
  });

  // Initialize noStreamsDataExists state based on streams data
  useEffect(() => {
    if (streams && streams.length > 0) {
      setNoStreamsDataExists(false);
    } else {
      setNoStreamsDataExists(true);
    }
  }, [streams]);

  useEffect(() => {
    // Load recent timetables (can be implemented with local storage or Supabase)
    const loadRecentTimetables = () => {
      try {
        const storedRecentTimetables = localStorage.getItem('recentTimetables');
        if (storedRecentTimetables) {
          setRecentTimetables(JSON.parse(storedRecentTimetables));
        }
      } catch (error) {
        console.error('Error loading recent timetables:', error);
      }
    };

    loadRecentTimetables();
  }, []);

  useEffect(() => {
    if (stream) {
      console.log("Selected stream:", stream);
      const selectedStreamData = streams.find(s => s.id === stream);
      if (selectedStreamData) {
        console.log("Stream data found:", selectedStreamData);
        // Create years array from the stream's year count
        const yearCount = selectedStreamData.years;
        const yearsArray = Array.from({ length: yearCount }, (_, i) => ({
          id: (i + 1).toString(),
          name: `Year ${i + 1}`
        }));
        console.log("Generated years array:", yearsArray);
        setYears(yearsArray);
        setYear("");
        setDivision("");
      } else {
        console.log("No stream data found for ID:", stream);
        setYears([]);
      }
    } else {
      setYears([]);
    }
  }, [stream, streams]);

  useEffect(() => {
    if (stream && year) {
      console.log("Filtering divisions for stream:", stream, "year:", year);
      // Filter divisions based on stream and year
      const filteredDivisions = allDivisions.filter(d => 
        d.streamId === stream && d.year.toString() === year
      );
      console.log("Filtered divisions:", filteredDivisions);
      setDivisions(filteredDivisions);
      setDivision("");
    } else {
      setDivisions([]);
    }
  }, [stream, year, allDivisions]);

  const handleNavigateToStreamsManager = () => {
    navigate("/streams-manager");
  };

  const handleLoadTimetable = async (timetableData?: any) => {
    try {
      if (timetableData) {
        // If timetable data is provided directly, use it
        setSelectedTimetable(timetableData);
        setStream(timetableData.stream);
        setYear(timetableData.year);
        setDivision(timetableData.division);
        return;
      }

      if (!stream || !year || !division) {
        toast({
          title: "Missing Information",
          description: "Please select stream, year, and division to load a timetable.",
          variant: "destructive"
        });
        return;
      }

      // Load timetable from database using the correct key format
      const timetableKey = `${stream}_${year}_${division}`;
      console.log("Trying to load timetable with key:", timetableKey);
      
      const timetable = await fetchTimetable(timetableKey);
      
      if (timetable) {
        console.log("Timetable loaded:", timetable);
        setSelectedTimetable({
          id: timetableKey,
          stream,
          year,
          division,
          data: timetable.data,
          lastModified: new Date(timetable.updated_at || timetable.created_at).toLocaleDateString()
        });
        
        toast({
          title: "Timetable Loaded",
          description: `Loaded timetable for ${getStreamName(stream)} ${getYearName(year)} ${getDivisionName(division)}`
        });
      } else {
        console.log("No timetable found for key:", timetableKey);
        toast({
          title: "Timetable Not Found",
          description: "No timetable exists for the selected criteria.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading timetable:", error);
      toast({
        title: "Error",
        description: "Failed to load timetable.",
        variant: "destructive"
      });
    }
  };

  const getStreamName = (streamId: string) => {
    const streamObj = streams.find(s => s.id === streamId);
    return streamObj ? streamObj.name : streamId;
  };

  const getYearName = (yearId: string) => {
    return `Year ${yearId}`;
  };

  const getDivisionName = (divisionId: string) => {
    const divisionObj = allDivisions.find(d => d.id === divisionId);
    return divisionObj ? divisionObj.name : divisionId;
  };

  const handleApplyFilters = () => {
    handleLoadTimetable();
  };

  const exportTimetable = () => {
    if (!selectedTimetable || !selectedTimetable.data) {
      toast({
        title: "Nothing to Export",
        description: "There is no timetable data to export.",
        variant: "destructive"
      });
      return;
    }

    const exportData = {
      stream: selectedTimetable.stream,
      year: selectedTimetable.year,
      division: selectedTimetable.division,
      streamName: getStreamName(selectedTimetable.stream),
      yearName: getYearName(selectedTimetable.year),
      divisionName: getDivisionName(selectedTimetable.division),
      timetableData: selectedTimetable.data
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `timetable_${getStreamName(selectedTimetable.stream)}_${getYearName(selectedTimetable.year)}_${getDivisionName(selectedTimetable.division)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Timetable Exported",
      description: "Your timetable has been exported successfully."
    });
  };

  if (streamsLoading) {
    return (
      <div className="space-y-6">
        <SectionHeading
          title="View Timetables"
          description="Browse and export your created timetables"
          icon={<LayoutGrid className="h-6 w-6" />}
        />
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
                      <SelectItem value="no-streams" disabled>
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
                      <SelectItem value="no-years" disabled>
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
                      <SelectItem value="no-divisions" disabled>
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
                  <Button variant="outline" size="sm" className="gap-2" onClick={exportTimetable}>
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
                        {selectedTimetable.data && Object.keys(selectedTimetable.data).length > 0 ? (
                          <p className="text-sm text-muted-foreground mt-2">
                            Timetable loaded successfully.
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">
                            This timetable is empty or contains no scheduled classes.
                          </p>
                        )}
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
