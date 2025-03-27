
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
import { checkForDuplicates, generateTimetableName } from "@/utils/dataValidation";
import { RoleType } from "@/models/Role";

const ViewTimetables = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stream, setStream] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");
  const [selectedTimetable, setSelectedTimetable] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"division" | "teacher" | "room" | "subject">("division");
  const [years, setYears] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [recentTimetables, setRecentTimetables] = useState<any[]>([]);
  const [noStreamsDataExists, setNoStreamsDataExists] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "excel">("excel");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType | "">("");
  const [streamForFilter, setStreamForFilter] = useState("");
  const [yearForFilter, setYearForFilter] = useState("");
  const timetableRef = useRef<HTMLDivElement>(null);

  const TIME_SLOT_ORDER = [
    "9:30 - 10:30",
    "10:30 - 11:30",
    "11:30 - 12:30",
    "12:30 - 1:30",
    "1:30 - 2:30",
    "2:30 - 3:30",
    "3:30 - 4:30",
    "4:30 - 5:30"
  ];

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });

  const { data: allDivisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: fetchDivisions
  });

  // Fetch teachers with role filtering
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data, error } = await supabase.from('teachers').select('*');
        if (error) throw error;
        
        // Apply role filter if selected
        let filteredTeachers = data || [];
        
        // Filter by stream, year and role if selected
        if (streamForFilter) {
          filteredTeachers = filteredTeachers.filter(teacher => 
            teacher.subjects?.some((s: any) => 
              typeof s === 'object' && s.stream === streamForFilter
            )
          );
        }
        
        if (yearForFilter) {
          filteredTeachers = filteredTeachers.filter(teacher => 
            teacher.subjects?.some((s: any) => 
              typeof s === 'object' && s.year === yearForFilter
            )
          );
        }
        
        // Use 'ista' property to match with TA role, or look for explicitly set role property
        if (selectedRole) {
          filteredTeachers = filteredTeachers.filter(teacher => {
            // For backward compatibility, map 'ista' to 'TA' role
            const teacherRole = teacher.ista ? 'TA' : (teacher.role || 'Teacher');
            return teacherRole === selectedRole;
          });
        }
        
        const uniqueTeachers = checkForDuplicates(filteredTeachers, 'name', 'email');
        if (uniqueTeachers.length !== filteredTeachers.length) {
          console.log(`Filtered out ${filteredTeachers.length - uniqueTeachers.length} duplicate teachers`);
        }
        
        setTeachers(uniqueTeachers || []);
      } catch (error: any) {
        console.error('Error fetching teachers:', error.message);
      }
    };

    fetchTeachers();
  }, [streamForFilter, yearForFilter, selectedRole]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data, error } = await supabase.from('rooms').select('*');
        if (error) throw error;
        
        const uniqueRooms = checkForDuplicates(data || [], 'number');
        if (uniqueRooms.length !== (data || []).length) {
          console.log(`Filtered out ${(data || []).length - uniqueRooms.length} duplicate rooms`);
        }
        
        setRooms(uniqueRooms || []);
      } catch (error: any) {
        console.error('Error fetching rooms:', error.message);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase.from('subjects').select('*');
        if (error) throw error;
        
        // Filter by stream and year if selected
        let filteredSubjects = data || [];
        if (streamForFilter) {
          filteredSubjects = filteredSubjects.filter(subject => 
            subject.stream === streamForFilter
          );
        }
        
        if (yearForFilter) {
          filteredSubjects = filteredSubjects.filter(subject => 
            subject.year === yearForFilter
          );
        }
        
        const uniqueSubjects = checkForDuplicates(filteredSubjects, 'name', 'code');
        
        setSubjects(uniqueSubjects || []);
      } catch (error: any) {
        console.error('Error fetching subjects:', error.message);
      }
    };

    fetchSubjects();
  }, [streamForFilter, yearForFilter]);

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
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(3);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedTimetables = await Promise.all(data.map(async (timetable) => {
            let streamInfo = null;
            let divisionInfo = null;
            
            const parts = timetable.name.split('_');
            const streamId = parts[0] || '';
            const yearValue = parts.length > 1 ? parts[1] : '';
            const divisionId = parts.length > 2 ? parts[2] : '';
            
            if (streamId) {
              const { data: streamData } = await supabase
                .from('streams')
                .select('*')
                .eq('id', streamId)
                .maybeSingle();
                
              streamInfo = streamData;
            }
            
            if (divisionId) {
              const { data: divisionData } = await supabase
                .from('divisions')
                .select('*')
                .eq('id', divisionId)
                .maybeSingle();
                
              divisionInfo = divisionData;
            }
            
            let displayName = "Timetable";
            if (streamInfo && streamInfo.name) {
              displayName = generateTimetableName(
                streamInfo.name,
                yearValue,
                divisionInfo?.name
              );
            } else {
              displayName = `Timetable ${timetable.id.substring(0, 6)}`;
            }
            
            return {
              id: timetable.id,
              stream: streamId,
              year: yearValue,
              division: divisionId,
              streamName: streamInfo?.name || "Unknown Stream",
              yearName: `Year ${yearValue}`,
              divisionName: divisionInfo?.name || "Unknown Division",
              displayName: displayName,
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
      const wb = XLSX.utils.book_new();
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      // Ensure we include all time slots in the predefined order
      const periodSet = new Set();
      
      // First collect all periods that exist in the data
      days.forEach(day => {
        if (selectedTimetable.data[day]) {
          Object.keys(selectedTimetable.data[day]).forEach(period => {
            periodSet.add(period);
          });
        }
      });
      
      // Use all predefined time slots, or just the ones in the data if none match
      let periods = [];
      
      // If some of the existing periods match our time slot order, use that order
      const matchingPeriods = TIME_SLOT_ORDER.filter(period => periodSet.has(period));
      
      if (matchingPeriods.length > 0) {
        // Use our predefined order for known periods
        periods = [...TIME_SLOT_ORDER];
        
        // Add any additional periods that aren't in our predefined list
        Array.from(periodSet)
          .filter(period => !TIME_SLOT_ORDER.includes(period as string))
          .forEach(period => periods.push(period as string));
      } else {
        // If none match our predefined order, just use all periods found
        periods = Array.from(periodSet) as string[];
      }
      
      const header = ["Period/Day", ...days];
      
      const rows = periods.map(period => {
        const row: any[] = [period];
        
        days.forEach(day => {
          const slot = selectedTimetable.data[day]?.[period];
          
          if (slot) {
            let cellContent = "";
            
            const subjectName = typeof slot.subject === 'string' 
              ? slot.subject 
              : slot.subject?.name || 'Unknown Subject';
            cellContent = subjectName;
            
            if (slot.teacher) {
              const teacherName = typeof slot.teacher === 'string'
                ? slot.teacher
                : slot.teacher?.name || 'Unknown Teacher';
              cellContent += `\n${teacherName}`;
            }
            
            if (slot.room) {
              const roomNumber = typeof slot.room === 'string'
                ? slot.room
                : slot.room?.number || 'Unknown Room';
              cellContent += `\nRoom: ${roomNumber}`;
            }
            
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
      
      const worksheetData = [header, ...rows];
      
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      const columnWidths = [{ wch: 20 }];
      for (let i = 0; i < days.length; i++) {
        columnWidths.push({ wch: 25 });
      }
      ws['!cols'] = columnWidths;
      
      XLSX.utils.sheet_add_aoa(ws, [
        [`Timetable: ${getStreamName(selectedTimetable.stream)} ${getYearName(selectedTimetable.year)} ${getDivisionName(selectedTimetable.division)}`],
        [`Generated on: ${new Date().toLocaleString()}`],
        [`View: ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View`]
      ], { origin: "A1" });
      
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push(
        { s: { r: 0, c: 0 }, e: { r: 0, c: days.length } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: days.length } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: days.length } }
      );
      
      XLSX.utils.book_append_sheet(wb, ws, "Timetable");
      
      const fileName = `timetable_${getStreamName(selectedTimetable.stream)}_${getYearName(selectedTimetable.year)}_${getDivisionName(selectedTimetable.division)}.xlsx`;
      
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

  // Reset filter selectors when changing view mode
  useEffect(() => {
    setSelectedTeacher("");
    setSelectedRoom("");
    setSelectedSubject("");
  }, [viewMode]);

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

  // Updated teacher rendering to handle missing role property
  const renderTeacherOption = (teacher: any) => {
    // Determine display role - if ista is true, use 'TA', otherwise use 'role' if available or 'Teacher' as default
    const displayRole = teacher.ista ? 'TA' : (teacher.role || 'Teacher');
    return (
      <SelectItem key={teacher.id} value={teacher.id}>
        {teacher.name} {displayRole ? `(${displayRole})` : ''}
      </SelectItem>
    );
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
                        {timetable.displayName || `${timetable.streamName} ${timetable.yearName} ${timetable.divisionName}`}
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
                    {selectedTimetable ? generateTimetableName(
                      getStreamName(selectedTimetable.stream),
                      selectedTimetable.year,
                      getDivisionName(selectedTimetable.division)
                    ) : "Timetable Viewer"}
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
                  <Tabs value={viewMode} onValueChange={setViewMode as any}>
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
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Stream (Optional)</Label>
                            <Select value={streamForFilter} onValueChange={setStreamForFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="All Streams" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All Streams</SelectItem>
                                {streams.map(stream => (
                                  <SelectItem key={stream.id} value={stream.id}>
                                    {stream.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Year (Optional)</Label>
                            <Select value={yearForFilter} onValueChange={setYearForFilter}>
                              <SelectTrigger>
                                <SelectValue placeholder="All Years" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All Years</SelectItem>
                                {[1, 2, 3, 4, 5].map(y => (
                                  <SelectItem key={y} value={y.toString()}>
                                    Year {y}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Role (Optional)</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole as any}>
                              <SelectTrigger>
                                <SelectValue placeholder="All Roles" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All Roles</SelectItem>
                                <SelectItem value="Teacher">Teacher</SelectItem>
                                <SelectItem value="TA">Teaching Assistant</SelectItem>
                                <SelectItem value="HOD">Head of Department</SelectItem>
                                <SelectItem value="Director">Director</SelectItem>
                                <SelectItem value="Staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Select Teacher</Label>
                            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.length > 0 ? (
                                  teachers.map((teacher) => renderTeacherOption(teacher))
                                ) : (
                                  <SelectItem value="no-teachers" disabled>
                                    No teachers available with these filters
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      
                        <div className="py-4" ref={timetableRef}>
                          {selectedTeacher ? (
                            <TimetableDisplay 
                              timetableData={selectedTimetable.data}
                              viewType="teacher"
                              teacherId={selectedTeacher}
                              teachers={teachers}
                              showTeachers={false}
                              showRooms={true}
                            />
                          ) : (
                            <div className="text-center py-12 border rounded-md bg-muted/20">
                              <User className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">
                                Select a teacher to view their timetable
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="room">
                      <div className="space-y-4">
                        <div>
                          <Label>Select Room</Label>
                          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a room" />
                            </SelectTrigger>
                            <SelectContent>
                              {rooms.length > 0 ? (
                                rooms.map((room) => (
                                  <SelectItem key={room.id} value={room.id}>
                                    Room {room.number}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-rooms" disabled>
                                  No rooms available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="py-4" ref={timetableRef}>
                          {selectedRoom ? (
                            <TimetableDisplay 
                              timetableData={selectedTimetable.data}
                              viewType="room"
                              roomId={selectedRoom}
                              rooms={rooms}
                              showTeachers={true}
                              showRooms={false}
                            />
                          ) : (
                            <div className="text-center py-12 border rounded-md bg-muted/20">
                              <Building className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">
                                Select a room to view its timetable
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Timetable Selected</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Use the filters on the left to select and load a timetable, or click on a recent timetable.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/timetable-editor')}>
                    Create New Timetable
                  </Button>
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
