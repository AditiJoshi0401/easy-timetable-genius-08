
import { useState, useEffect, useRef } from "react";
import { Calendar, LayoutGrid, Users, BookOpen, Building, Filter, Download, Book, User, FileText, FileJson, FileSpreadsheet } from "lucide-react";
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
import TimetableDisplay from "@/components/timetable/TimetableDisplay";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

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
  const [exportFormat, setExportFormat] = useState<"json" | "excel">("excel");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const timetableRef = useRef<HTMLDivElement>(null);

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });

  const { data: allDivisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: fetchDivisions
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase.from('teachers').select('*');
        if (error) throw error;
        setTeachers(data || []);
      } catch (error: any) {
        console.error('Error fetching teachers:', error.message);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data, error } = await supabase.from('rooms').select('*');
        if (error) throw error;
        setRooms(data || []);
      } catch (error: any) {
        console.error('Error fetching rooms:', error.message);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    if (streams && streams.length > 0) {
      setNoStreamsDataExists(false);
    } else {
      setNoStreamsDataExists(true);
    }
  }, [streams]);

  useEffect(() => {
    const loadRecentTimetables = async () => {
      try {
        const { data, error } = await supabase
          .from('timetables')
          .select('*, streams(*), divisions(*)')
          .order('updated_at', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedTimetables = await Promise.all(data.map(async (timetable) => {
            // Get stream, year, and division info
            const streamInfo = timetable.streams;
            const divisionInfo = timetable.divisions;
            
            // Find the year from the division if it exists
            let yearValue = "";
            if (divisionInfo) {
              yearValue = divisionInfo.year.toString();
            } else if (timetable.id.includes('_')) {
              // Fallback to parsing from ID
              yearValue = timetable.id.split('_')[1];
            }
            
            return {
              id: timetable.id,
              stream: streamInfo?.id || timetable.id.split('_')[0],
              year: yearValue,
              division: divisionInfo?.id || timetable.id.split('_')[2],
              streamName: streamInfo?.name || "Unknown Stream",
              yearName: `Year ${yearValue}`,
              divisionName: divisionInfo?.name || "Unknown Division",
              data: timetable.data,
              lastModified: new Date(timetable.updated_at || timetable.created_at).toLocaleDateString()
            };
          }));
          
          setRecentTimetables(formattedTimetables);
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

  // Convert timetable data to Excel format
  const exportAsExcel = () => {
    if (!selectedTimetable || !selectedTimetable.data) {
      toast({
        title: "Nothing to Export",
        description: "There is no timetable data to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      // Get all periods from the timetable
      const periods = Array.from(
        new Set(
          Object.values(selectedTimetable.data)
            .flatMap((dayData: any) => Object.keys(dayData))
        )
      ).sort((a, b) => {
        // Extract the starting hour from the time slot (e.g., "9:30" from "9:30 - 10:30")
        const getStartHour = (timeSlot: string) => {
          const match = timeSlot.match(/^(\d+):(\d+)/);
          if (!match) return 0;
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          
          // Convert to 24-hour format for proper sorting
          if (timeSlot.includes("PM") && hours < 12) {
            hours += 12;
          }
          return hours * 60 + minutes;
        };
        
        return getStartHour(a) - getStartHour(b);
      });
      
      // Create header row
      const header = ["Period/Day", ...days];
      
      // Create data rows
      const rows = periods.map(period => {
        const row: any[] = [period];
        
        days.forEach(day => {
          const slot = selectedTimetable.data[day]?.[period];
          
          if (slot) {
            let cellContent = "";
            
            // Add subject
            const subjectName = typeof slot.subject === 'string' 
              ? slot.subject 
              : slot.subject?.name || 'Unknown Subject';
            cellContent = subjectName;
            
            // Add teacher if available
            if (slot.teacher) {
              const teacherName = typeof slot.teacher === 'string'
                ? slot.teacher
                : slot.teacher?.name || 'Unknown Teacher';
              cellContent += `\n${teacherName}`;
            }
            
            // Add room if available
            if (slot.room) {
              const roomNumber = typeof slot.room === 'string'
                ? slot.room
                : slot.room?.number || 'Unknown Room';
              cellContent += `\nRoom: ${roomNumber}`;
            }
            
            // Add type if available
            if (slot.type) {
              cellContent += `\nType: ${slot.type}`;
            }
            
            row.push(cellContent);
          } else {
            row.push("-");
          }
        });
        
        return row;
      });
      
      // Combine header and data
      const worksheetData = [header, ...rows];
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Set column widths
      const columnWidths = [{ wch: 20 }]; // Width for first column (Period)
      for (let i = 0; i < days.length; i++) {
        columnWidths.push({ wch: 25 }); // Width for day columns
      }
      ws['!cols'] = columnWidths;
      
      // Add title at the top
      XLSX.utils.sheet_add_aoa(ws, [
        [`Timetable: ${getStreamName(selectedTimetable.stream)} ${getYearName(selectedTimetable.year)} ${getDivisionName(selectedTimetable.division)}`],
        [`Generated on: ${new Date().toLocaleString()}`],
        [`View: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View`]
      ], { origin: "A1" });
      
      // Merge cells for the title
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push(
        { s: { r: 0, c: 0 }, e: { r: 0, c: days.length } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: days.length } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: days.length } }
      );
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Timetable");
      
      // Generate file name
      const fileName = `timetable_${getStreamName(selectedTimetable.stream)}_${getYearName(selectedTimetable.year)}_${getDivisionName(selectedTimetable.division)}.xlsx`;
      
      // Write and download the file
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Excel Exported Successfully",
        description: `Your timetable has been exported as ${fileName}`
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the timetable as Excel.",
        variant: "destructive"
      });
    }
  };

  const exportAsJson = () => {
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
      title: "JSON Exported",
      description: "Your timetable has been exported successfully as JSON."
    });
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleExportConfirm = () => {
    if (exportFormat === "json") {
      exportAsJson();
    } else {
      exportAsExcel();
    }
    setExportDialogOpen(false);
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
                      <SelectItem value="no-streams-available" disabled>
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
                      <SelectItem value="no-years-available" disabled>
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
                      <SelectItem value="no-divisions-available" disabled>
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
                        {timetable.streamName} {timetable.yearName} {timetable.divisionName}
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
                  <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Export Timetable</DialogTitle>
                        <DialogDescription>
                          Choose your preferred export format
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <RadioGroup value={exportFormat} onValueChange={(value) => setExportFormat(value as "json" | "excel")} className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="json" id="json" />
                            <Label htmlFor="json" className="flex items-center cursor-pointer">
                              <FileJson className="h-5 w-5 mr-2 text-blue-500" />
                              <div>
                                <span className="font-medium">JSON Format</span>
                                <p className="text-sm text-muted-foreground">Raw data format that can be imported later</p>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="excel" id="excel" />
                            <Label htmlFor="excel" className="flex items-center cursor-pointer">
                              <FileSpreadsheet className="h-5 w-5 mr-2 text-green-500" />
                              <div>
                                <span className="font-medium">Excel Format</span>
                                <p className="text-sm text-muted-foreground">Editable spreadsheet with formatted timetable</p>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleExportConfirm}>Export</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedTimetable ? (
                <div>
                  <Tabs value={viewMode} onValueChange={setViewMode}>
                    <TabsList className="mb-4 grid w-full grid-cols-3">
                      <TabsTrigger value="division">Division</TabsTrigger>
                      <TabsTrigger value="teacher">Teacher</TabsTrigger>
                      <TabsTrigger value="room">Room</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="division">
                      <div className="py-4" ref={timetableRef}>
                        <TimetableDisplay 
                          timetableData={selectedTimetable.data} 
                          viewType="division"
                          showTeachers={true} 
                          showRooms={true}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="teacher">
                      <div className="mb-4">
                        <Label>Select Teacher</Label>
                        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="py-4" ref={timetableRef}>
                        {selectedTeacher ? (
                          <TimetableDisplay 
                            timetableData={selectedTimetable.data}
                            viewType="teacher"
                            filterId={selectedTeacher}
                            showTeachers={false}
                            showRooms={true}
                          />
                        ) : (
                          <div className="text-center py-6">
                            <User className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                              Select a teacher to view their timetable
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="room">
                      <div className="mb-4">
                        <Label>Select Room</Label>
                        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a room" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms.map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.number} ({room.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="py-4" ref={timetableRef}>
                        {selectedRoom ? (
                          <TimetableDisplay 
                            timetableData={selectedTimetable.data}
                            viewType="room"
                            filterId={selectedRoom}
                            showTeachers={true}
                            showRooms={false}
                          />
                        ) : (
                          <div className="text-center py-6">
                            <Building className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                              Select a room to view its schedule
                            </p>
                          </div>
                        )}
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
