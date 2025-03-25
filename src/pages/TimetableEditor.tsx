
import { useState, useEffect } from "react";
import { Calendar, LayoutGrid, Users, BookOpen, Building, Plus, Trash2, Save, Check, AlertCircle, Download, Upload } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { 
  fetchSubjects, fetchTeachers, fetchRooms, fetchStreams, fetchDivisions, 
  addTimetable, fetchTimetable, updateTimetable,
  Subject, Teacher, Room, Stream, Division
} from "@/services/supabaseService";
import { useQuery } from "@tanstack/react-query";

const TimetableEditor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stream, setStream] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");
  const [showTimetable, setShowTimetable] = useState(false);
  const [timetableData, setTimetableData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(true);
  const [draggingItem, setDraggingItem] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [slotDetailsOpen, setSlotDetailsOpen] = useState(false);
  const [slotDetails, setSlotDetails] = useState<any>({
    subject: "",
    teacher: "",
    room: "",
    type: "lecture"
  });
  const [assignedTeachers, setAssignedTeachers] = useState<any>({});
  const [years, setYears] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [noStreamsDataExists, setNoStreamsDataExists] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "9:30 - 10:30", 
    "10:30 - 11:30", 
    "11:30 - 12:30", 
    "12:30 - 1:30", 
    "1:30 - 2:30", 
    "2:30 - 3:30", 
    "3:30 - 4:30", 
    "4:30 - 5:30"
  ];

  // Fetch subjects from Supabase
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  // Fetch teachers from Supabase
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers
  });

  // Fetch rooms from Supabase
  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  });

  // Fetch streams from Supabase
  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams,
    meta: {
      onSuccess: (data) => {
        if (!data || data.length === 0) {
          setNoStreamsDataExists(true);
        } else {
          setNoStreamsDataExists(false);
        }
      },
      onError: () => {
        setNoStreamsDataExists(true);
      }
    }
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
    if (stream) {
      const selectedStreamData = streams.find(s => s.id === stream);
      if (selectedStreamData) {
        // Create years array from the stream's year count
        const yearCount = selectedStreamData.years;
        const yearsArray = Array.from({ length: yearCount }, (_, i) => ({
          id: (i + 1).toString(),
          name: `Year ${i + 1}`
        }));
        setYears(yearsArray);
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
    if (stream && year) {
      // Filter divisions based on stream and year
      const filteredDivisions = allDivisions.filter(d => 
        d.streamId === stream && d.year.toString() === year
      );
      setDivisions(filteredDivisions);
      setDivision("");
    } else {
      setDivisions([]);
    }
  }, [stream, year, allDivisions]);

  useEffect(() => {
    // Create a mapping of subjects to teachers who can teach them
    const subjectTeacherMap: Record<string, string[]> = {};
    
    teachers.forEach(teacher => {
      if (teacher.subjects && Array.isArray(teacher.subjects)) {
        teacher.subjects.forEach((subjectId: string) => {
          if (!subjectTeacherMap[subjectId]) {
            subjectTeacherMap[subjectId] = [];
          }
          subjectTeacherMap[subjectId].push(teacher.id);
        });
      }
    });
    
    setAssignedTeachers(subjectTeacherMap);
  }, [teachers]);

  const handleNavigateToStreamsManager = () => {
    navigate("/streams-manager");
  };

  const initializeTimetable = () => {
    const newTimetable: any = {};
    
    days.forEach(day => {
      newTimetable[day] = {};
      timeSlots.forEach(slot => {
        newTimetable[day][slot] = null;
      });
    });
    
    return newTimetable;
  };

  const handleGenerateTimetable = () => {
    if (!stream || !year || !division) {
      toast({
        title: "Missing Information",
        description: "Please select stream, year, and division.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if a timetable already exists for this division
    const timetableKey = `${stream}_${year}_${division}`;
    
    fetchTimetable(timetableKey)
      .then(existingTimetable => {
        if (existingTimetable) {
          setTimetableData(existingTimetable.data);
        } else {
          setTimetableData(initializeTimetable());
        }
        setShowTimetable(true);
        
        toast({
          title: "Timetable Ready",
          description: `Created timetable for ${getStreamName(stream)} ${getYearName(year)} ${getDivisionName(division)}. Start adding subjects!`,
        });
      })
      .catch(error => {
        console.error("Error fetching timetable:", error);
        setTimetableData(initializeTimetable());
        setShowTimetable(true);
        
        toast({
          title: "New Timetable Created",
          description: `Created a new timetable for ${getStreamName(stream)} ${getYearName(year)} ${getDivisionName(division)}. Start adding subjects!`,
        });
      });
  };

  const saveTimetable = async () => {
    try {
      if (!stream || !year || !division) {
        toast({
          title: "Missing Information",
          description: "Stream, year, and division information is missing.",
          variant: "destructive"
        });
        return;
      }

      const timetableKey = `${stream}_${year}_${division}`;
      const timetableMetadata = {
        id: timetableKey,
        name: `${getStreamName(stream)} ${getYearName(year)} ${getDivisionName(division)} Timetable`,
        division_id: division,
        data: timetableData,
      };
      
      // First try to fetch if timetable exists
      const existingTimetable = await fetchTimetable(timetableKey);
      
      if (existingTimetable) {
        // Update existing timetable
        await updateTimetable(timetableKey, { data: timetableData });
        toast({
          title: "Timetable Updated",
          description: "Your timetable has been updated successfully."
        });
      } else {
        // Add new timetable
        await addTimetable(timetableMetadata);
        toast({
          title: "Timetable Saved",
          description: "Your timetable has been saved successfully."
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast({
        title: "Error",
        description: "Failed to save timetable. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDragStart = (item: any, type: string) => {
    setDraggingItem({ ...item, itemType: type });
  };
  
  const handleDragEnd = () => {
    setDraggingItem(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    
    if (draggingItem && draggingItem.itemType === 'subject') {
      setSelectedSlot({ day, time });
      
      const subjectTeachers = assignedTeachers[draggingItem.id] || [];
      const defaultTeacher = subjectTeachers.length > 0 ? subjectTeachers[0] : "";
      
      setSlotDetails({
        subject: draggingItem.id,
        teacher: defaultTeacher,
        room: "",
        type: "lecture"
      });
      setSlotDetailsOpen(true);
    }
  };

  const isRoomAvailable = (roomId: string, day: string, startTime: string, type: string) => {
    if (type === "lab") {
      const startIndex = timeSlots.indexOf(startTime);
      if (startIndex === -1 || startIndex > timeSlots.length - 2) {
        return false;
      }
      
      for (let i = 0; i < 2; i++) {
        const timeSlot = timeSlots[startIndex + i];
        const slot = timetableData[day]?.[timeSlot];
        if (slot && slot.room.id === roomId) {
          return false;
        }
      }
      return true;
    } else {
      const slot = timetableData[day]?.[startTime];
      return !slot || slot.room.id !== roomId;
    }
  };

  const getAvailableRooms = (day: string, time: string, type: string) => {
    return rooms.filter(room => {
      if (type === "lab" && room.type !== "lab") return false;
      if (type === "lecture" && room.type !== "classroom") return false;
      
      return isRoomAvailable(room.id, day, time, type);
    });
  };

  const addSubjectToTimetable = () => {
    if (!selectedSlot || !slotDetails.subject || !slotDetails.teacher || !slotDetails.room) {
      toast({
        title: "Missing Information",
        description: "Please select subject, teacher, and room.",
        variant: "destructive"
      });
      return;
    }
    
    const { day, time } = selectedSlot;
    
    const subject = subjects.find(s => s.id === slotDetails.subject);
    const teacher = teachers.find(t => t.id === slotDetails.teacher);
    const room = rooms.find(r => r.id === slotDetails.room);
    
    const newTimetableData = { ...timetableData };
    
    if (slotDetails.type === "lab") {
      const startIndex = timeSlots.indexOf(time);
      if (startIndex === -1 || startIndex > timeSlots.length - 2) {
        toast({
          title: "Can't Add Lab",
          description: "Labs need 2 consecutive hours. There aren't enough time slots remaining in the day.",
          variant: "destructive"
        });
        return;
      }
      
      for (let i = 0; i < 2; i++) {
        const timeSlot = timeSlots[startIndex + i];
        newTimetableData[day][timeSlot] = {
          subject: subject,
          teacher: teacher,
          room: room,
          type: slotDetails.type,
          isPartOfLab: i > 0
        };
      }
      
      toast({
        title: "Lab Added",
        description: `Added ${subject?.name} lab to ${day} starting at ${time}`
      });
    } else {
      newTimetableData[day][time] = {
        subject: subject,
        teacher: teacher,
        room: room,
        type: slotDetails.type
      };
      
      toast({
        title: "Subject Added",
        description: `Added ${subject?.name} to ${day} ${time}`
      });
    }
    
    setTimetableData(newTimetableData);
    setSlotDetailsOpen(false);
  };

  const removeSubjectFromTimetable = (day: string, time: string) => {
    const newTimetableData = { ...timetableData };
    const currentSlot = newTimetableData[day][time];
    
    if (currentSlot && currentSlot.type === "lab") {
      const startIndex = timeSlots.indexOf(time);
      
      let labStartIndex = startIndex;
      while (labStartIndex > 0 && newTimetableData[day][timeSlots[labStartIndex - 1]]?.isPartOfLab) {
        labStartIndex--;
      }
      
      for (let i = 0; i < 2; i++) {
        if (labStartIndex + i < timeSlots.length) {
          newTimetableData[day][timeSlots[labStartIndex + i]] = null;
        }
      }
    } else if (currentSlot && currentSlot.isPartOfLab) {
      const index = timeSlots.indexOf(time);
      let labStartIndex = index;
      
      while (labStartIndex > 0 && newTimetableData[day][timeSlots[labStartIndex - 1]]?.isPartOfLab) {
        labStartIndex--;
      }
      
      for (let i = 0; i < 2; i++) {
        if (labStartIndex + i < timeSlots.length) {
          newTimetableData[day][timeSlots[labStartIndex + i]] = null;
        }
      }
    } else {
      newTimetableData[day][time] = null;
    }
    
    setTimetableData(newTimetableData);
    
    toast({
      title: "Subject Removed",
      description: `Removed subject from ${day} ${time}`
    });
  };

  const filteredSubjects = subjects.filter((subject) => {
    if (!stream || !year) return true;
    return subject.stream === streams.find(s => s.id === stream)?.code && subject.year === year;
  });

  const getTeachersForSubject = (subjectId: string) => {
    // Return teachers who can teach this subject
    return teachers.filter(teacher => 
      teacher.subjects && Array.isArray(teacher.subjects) && teacher.subjects.includes(subjectId)
    );
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

  // Export timetable data as JSON
  const exportTimetable = () => {
    if (!timetableData || Object.keys(timetableData).length === 0) {
      toast({
        title: "Nothing to Export",
        description: "There is no timetable data to export.",
        variant: "destructive"
      });
      return;
    }

    const exportData = {
      stream,
      year,
      division,
      streamName: getStreamName(stream),
      yearName: getYearName(year),
      divisionName: getDivisionName(division),
      timetableData
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `timetable_${getStreamName(stream)}_${getYearName(year)}_${getDivisionName(division)}.json`;
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Timetable Exported",
      description: "Your timetable has been exported successfully."
    });
  };

  // Import timetable data from JSON
  const handleImport = () => {
    setImportDialogOpen(true);
  };

  const processImport = () => {
    try {
      if (!importData) {
        toast({
          title: "No Data",
          description: "Please paste timetable JSON data.",
          variant: "destructive"
        });
        return;
      }

      const parsed = JSON.parse(importData);
      
      if (!parsed.timetableData || !parsed.stream || !parsed.year || !parsed.division) {
        toast({
          title: "Invalid Format",
          description: "The imported data is not in the correct format.",
          variant: "destructive"
        });
        return;
      }

      // Set the form values
      setStream(parsed.stream);
      setYear(parsed.year);
      setDivision(parsed.division);
      setTimetableData(parsed.timetableData);
      setShowTimetable(true);
      setImportDialogOpen(false);
      setImportData("");
      
      toast({
        title: "Timetable Imported",
        description: "Your timetable has been imported successfully."
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import the timetable. Please check the JSON format.",
        variant: "destructive"
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setImportData(result);
      }
    };
    reader.readAsText(file);
  };

  if (streamsLoading) {
    return (
      <div className="space-y-6">
        <SectionHeading
          title="Timetable Editor"
          description="Create and customize college timetables"
          icon={<Calendar className="h-6 w-6" />}
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
          title="Timetable Editor"
          description="Create and customize college timetables"
          icon={<Calendar className="h-6 w-6" />}
        />

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>No Streams and Divisions Found</CardTitle>
            <CardDescription>
              You need to set up streams and divisions before creating timetables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Before creating timetables, you need to set up your academic structure by defining
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
        title="Timetable Editor"
        description="Create and customize college timetables"
        icon={<Calendar className="h-6 w-6" />}
      />

      {!showTimetable ? (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Start New Timetable</CardTitle>
            <CardDescription>
              Select the stream, year, and division to create a new timetable
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
            
            <div className="flex justify-between mt-6">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleNavigateToStreamsManager}>
                  Manage Streams & Divisions
                </Button>
                <Button variant="outline" onClick={handleImport} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>
              <Button onClick={handleGenerateTimetable} className="gap-2" disabled={!stream || !year || !division}>
                <Plus className="h-4 w-4" /> 
                Create Timetable
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-medium">
                {getStreamName(stream)} {getYearName(year)} {getDivisionName(division)} Timetable
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditing ? 'Editing mode' : 'View mode'} • Drag subjects to add them to the timetable
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportTimetable} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              {isEditing ? (
                <Button onClick={saveTimetable} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Timetable
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                  <Check className="h-4 w-4" />
                  Edit Timetable
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 overflow-auto">
              <div className="bg-card rounded-lg border shadow-subtle overflow-hidden">
                <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b">
                  <div className="p-3 font-medium text-sm bg-muted/30 border-r">Time / Day</div>
                  {days.map((day) => (
                    <div key={day} className="p-3 font-medium text-sm border-r last:border-r-0 text-center">
                      {day}
                    </div>
                  ))}
                </div>
                
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-[100px_repeat(5,1fr)] border-b last:border-b-0">
                    <div className="p-3 text-xs font-medium bg-muted/30 border-r flex items-center">
                      {time}
                    </div>
                    {days.map((day) => {
                      const cellData = timetableData[day]?.[time];
                      
                      return (
                        <div
                          key={`${day}-${time}`}
                          className={`p-2 border-r last:border-r-0 min-h-[80px] ${
                            cellData ? (cellData.isPartOfLab ? 'timetable-cell-occupied bg-primary/20' : 'timetable-cell-occupied') : 'timetable-cell'
                          }`}
                          onDragOver={isEditing ? handleDragOver : undefined}
                          onDrop={isEditing ? (e) => handleDrop(e, day, time) : undefined}
                          onClick={isEditing && !cellData ? () => {
                            setSelectedSlot({ day, time });
                            setSlotDetails({
                              subject: "",
                              teacher: "",
                              room: "",
                              type: "lecture"
                            });
                            setSlotDetailsOpen(true);
                          } : undefined}
                        >
                          {cellData ? (
                            <div className="h-full flex flex-col">
                              {!cellData.isPartOfLab && (
                                <>
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs font-medium">
                                      {cellData.subject.name}
                                    </span>
                                    {isEditing && (
                                      <button 
                                        onClick={() => removeSubjectFromTimetable(day, time)}
                                        className="text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="mt-1 space-y-1">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      <span>{cellData.teacher.isTA ? "TA " : ""}{cellData.teacher.name}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Building className="h-3 w-3" />
                                      <span>{cellData.room.number}</span>
                                    </div>
                                    <div className="chip chip-primary text-[10px] py-0.5 px-1.5 mt-1">
                                      {cellData.type}
                                    </div>
                                  </div>
                                </>
                              )}
                              {cellData.isPartOfLab && (
                                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                  - Part of the lab above -
                                </div>
                              )}
                            </div>
                          ) : (
                            isEditing && (
                              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                {draggingItem ? "Drop here" : "Click to add"}
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {isEditing && (
              <div className="xl:col-span-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Drag & Drop</CardTitle>
                    <CardDescription>
                      Drag items to the timetable
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="subjects">
                      <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="subjects" className="text-xs">Subjects</TabsTrigger>
                        <TabsTrigger value="teachers" className="text-xs">Teachers</TabsTrigger>
                        <TabsTrigger value="rooms" className="text-xs">Rooms</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="subjects" className="mt-4">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {isLoadingSubjects ? (
                            <div className="flex justify-center py-4">
                              <p className="text-muted-foreground">Loading subjects...</p>
                            </div>
                          ) : filteredSubjects.length > 0 ? (
                            filteredSubjects.map((subject) => (
                              <div
                                key={subject.id}
                                className="p-2 border rounded-md cursor-grab hover:bg-muted/50 transition-colors"
                                draggable
                                onDragStart={() => handleDragStart(subject, 'subject')}
                                onDragEnd={handleDragEnd}
                              >
                                <div className="font-medium text-sm">{subject.name}</div>
                                <div className="text-xs text-muted-foreground">{subject.code}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-2">
                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {subjects.length === 0 ? 
                                  "No subjects available. Please add subjects in Data Management." :
                                  "No subjects available for the selected stream and year."}
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="teachers" className="mt-4">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {isLoadingTeachers ? (
                            <div className="flex justify-center py-4">
                              <p className="text-muted-foreground">Loading teachers...</p>
                            </div>
                          ) : teachers.length > 0 ? (
                            teachers.map((teacher) => (
                              <div
                                key={teacher.id}
                                className="p-2 border rounded-md cursor-grab hover:bg-muted/50 transition-colors"
                                draggable
                                onDragStart={() => handleDragStart(teacher, 'teacher')}
                                onDragEnd={handleDragEnd}
                              >
                                <div className="font-medium text-sm">{teacher.isTA ? "TA " : ""}{teacher.name}</div>
                                <div className="text-xs text-muted-foreground">{teacher.specialization}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-2">
                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                No teachers available. Please add teachers in Data Management.
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="rooms" className="mt-4">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {isLoadingRooms ? (
                            <div className="flex justify-center py-4">
                              <p className="text-muted-foreground">Loading rooms...</p>
                            </div>
                          ) : rooms.length > 0 ? (
                            rooms.map((room) => (
                              <div
                                key={room.id}
                                className="p-2 border rounded-md cursor-grab hover:bg-muted/50 transition-colors"
                                draggable
                                onDragStart={() => handleDragStart(room, 'room')}
                                onDragEnd={handleDragEnd}
                              >
                                <div className="font-medium text-sm">{room.number}</div>
                                <div className="text-xs text-muted-foreground">
                                  {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-2">
                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                No rooms available. Please add rooms in Data Management.
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          <Dialog open={slotDetailsOpen} onOpenChange={setSlotDetailsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subject to Timetable</DialogTitle>
                <DialogDescription>
                  {selectedSlot && `Adding to ${selectedSlot.day} at ${selectedSlot.time}`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select 
                    value={slotDetails.subject} 
                    onValueChange={value => setSlotDetails({ ...slotDetails, subject: value, teacher: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSubjects ? (
                        <SelectItem value="" disabled>Loading subjects...</SelectItem>
                      ) : filteredSubjects.length > 0 ? (
                        filteredSubjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          {subjects.length === 0 ? 
                            "No subjects available. Please add subjects in Data Management." :
                            "No subjects available for the selected stream and year."}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <Select 
                    value={slotDetails.teacher} 
                    onValueChange={value => setSlotDetails({ ...slotDetails, teacher: value })}
                    disabled={!slotDetails.subject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {!slotDetails.subject ? (
                        <SelectItem value="" disabled>
                          Select a subject first
                        </SelectItem>
                      ) : isLoadingTeachers ? (
                        <SelectItem value="" disabled>Loading teachers...</SelectItem>
                      ) : (
                        (() => {
                          const subjectTeachers = getTeachersForSubject(slotDetails.subject);
                          return subjectTeachers.length > 0 ? (
                            subjectTeachers.map(teacher => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.isTA ? "TA " : ""}{teacher.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No teachers assigned to this subject
                            </SelectItem>
                          );
                        })()
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Session Type</Label>
                  <Select 
                    value={slotDetails.type} 
                    onValueChange={value => setSlotDetails({ ...slotDetails, type: value, room: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="lab">Lab (2 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Select 
                    value={slotDetails.room} 
                    onValueChange={value => setSlotDetails({ ...slotDetails, room: value })}
                    disabled={!selectedSlot}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Room" />
                    </SelectTrigger>
                    <SelectContent>
                      {!selectedSlot ? (
                        <SelectItem value="" disabled>
                          No time slot selected
                        </SelectItem>
                      ) : isLoadingRooms ? (
                        <SelectItem value="" disabled>Loading rooms...</SelectItem>
                      ) : (
                        (() => {
                          const availableRooms = getAvailableRooms(selectedSlot.day, selectedSlot.time, slotDetails.type);
                          return availableRooms.length > 0 ? (
                            availableRooms.map(room => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.number} (Capacity: {room.capacity})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No available rooms for this time and type
                            </SelectItem>
                          );
                        })()
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSlotDetailsOpen(false)}>Cancel</Button>
                <Button 
                  onClick={addSubjectToTimetable}
                  disabled={!slotDetails.subject || !slotDetails.teacher || !slotDetails.room}
                >
                  Add to Timetable
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Timetable</DialogTitle>
                <DialogDescription>
                  Import an existing timetable from JSON file or paste JSON data
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Upload JSON File</Label>
                  <Input type="file" accept=".json" onChange={handleFileImport} />
                </div>
                
                <div className="space-y-2">
                  <Label>Or Paste JSON Data</Label>
                  <textarea 
                    className="w-full min-h-[150px] p-2 border rounded-md"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your timetable JSON data here..."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
                <Button onClick={processImport}>Import Timetable</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default TimetableEditor;
