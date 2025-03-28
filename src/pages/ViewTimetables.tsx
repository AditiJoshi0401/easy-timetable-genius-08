
import { useState, useEffect, useRef } from "react";
import { Calendar, LayoutGrid, Filter, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchStreams, fetchDivisions, fetchTimetable } from "@/services/supabaseService";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { checkForDuplicates, generateTimetableName } from "@/utils/dataValidation";
import { RoleType, getRoleDisplayName } from "@/models/Role";
import DivisionTimetableTab from "@/components/timetable/DivisionTimetableTab";
import TeacherTimetableTab from "@/components/timetable/TeacherTimetableTab";
import RoomTimetableTab from "@/components/timetable/RoomTimetableTab";

const ViewTimetables = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stream, setStream] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");
  const [selectedTimetable, setSelectedTimetable] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"division" | "teacher" | "room">("division");
  const [years, setYears] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [recentTimetables, setRecentTimetables] = useState<any[]>([]);
  const [noStreamsDataExists, setNoStreamsDataExists] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "excel">("excel");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
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

  // Effect for streams data check
  useEffect(() => {
    if (streams && streams.length > 0) {
      setNoStreamsDataExists(false);
    } else {
      setNoStreamsDataExists(true);
    }
  }, [streams]);

  // Load recent timetables
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

  // Update years when stream changes
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

  // Update divisions when stream and year change
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
      
      const periodSet = new Set();
      
      days.forEach(day => {
        if (selectedTimetable.data[day]) {
          Object.keys(selectedTimetable.data[day]).forEach(period => {
            periodSet.add(period);
          });
        }
      });
      
      let periods = [];
      
      const matchingPeriods = TIME_SLOT_ORDER.filter(period => periodSet.has(period));
      
      if (matchingPeriods.length > 0) {
        periods = [...TIME_SLOT_ORDER];
        
        Array.from(periodSet)
          .filter(period => !TIME_SLOT_ORDER.includes(period as string))
          .forEach(period => periods.push(period as string));
      } else {
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
                
              const teacherRole = typeof slot.teacher === 'object' && slot.teacher
                ? (slot.teacher.role 
                   ? getRoleDisplayName(slot.teacher.role as RoleType)
                   : (slot.teacher.ista ? 'Teaching Assistant' : 'Teacher'))
                : '';
                
              cellContent += `\n${teacherName} (${teacherRole})`;
            }
            
            if (slot.room) {
              const roomNumber = typeof slot.room === 'string'
                ? slot.room
                : slot.room?.number || 'Unknown Room';
                
              const roomType = typeof slot.room === 'object' && slot.room && slot.room.type
                ? slot.room.type
                : '';
                
              cellContent += `\nRoom: ${roomNumber}${roomType ? ` (${roomType})` : ''}`;
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
      
      const headerRow = 4;
      for (let i = 0; i <= days.length; i++) {
        if (!ws[XLSX.utils.encode_cell({ r: headerRow, c: i })]) {
          ws[XLSX.utils.encode_cell({ r: headerRow, c: i })] = { v: "", t: "s" };
        }
        if (!ws[XLSX.utils.encode_cell({ r: headerRow, c: i })].s) {
          ws[XLSX.utils.encode_cell({ r: headerRow, c: i })].s = {};
        }
        ws[XLSX.utils.encode_cell({ r: headerRow, c: i })].s.font = { bold: true };
      }
      
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
          {/* Filters Card */}
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
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "division" | "teacher" | "room")}>
                  <TabsList className="mb-4 grid w-full grid-cols-3">
                    <TabsTrigger value="division">Division</TabsTrigger>
                    <TabsTrigger value="teacher">Teacher</TabsTrigger>
                    <TabsTrigger value="room">Room</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="division">
                    <DivisionTimetableTab 
                      streams={streams}
                      years={years}
                      divisions={divisions}
                      stream={stream}
                      year={year}
                      division={division}
                      selectedTimetable={selectedTimetable}
                      setStream={setStream}
                      setYear={setYear}
                      setDivision={setDivision}
                      onApplyFilters={handleApplyFilters}
                      onManageStructure={handleNavigateToStreamsManager}
                      timetableRef={timetableRef}
                    />
                  </TabsContent>
                  
                  <TabsContent value="teacher">
                    <TeacherTimetableTab 
                      streams={streams}
                      selectedTimetable={selectedTimetable}
                    />
                  </TabsContent>
                  
                  <TabsContent value="room">
                    <RoomTimetableTab 
                      selectedTimetable={selectedTimetable}
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Calendar className="h-16 w-16 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="text-lg font-medium">No Timetable Selected</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                      Select a timetable from the recent list, or create a new timetable
                    </p>
                  </div>
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
