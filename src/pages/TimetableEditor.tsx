import { useState, useEffect } from "react";
import { Calendar, LayoutGrid, Users, BookOpen, Building, Plus, Clock, Trash2, Save, Check, AlertCircle } from "lucide-react";
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

const TimetableEditor = () => {
  const { toast } = useToast();
  const [stream, setStream] = useState("");
  const [year, setYear] = useState("");
  const [division, setDivision] = useState("");
  const [showTimetable, setShowTimetable] = useState(false);
  const [timetableData, setTimetableData] = useState<any>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
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

  useEffect(() => {
    try {
      const storedSubjects = localStorage.getItem('subjects');
      const storedTeachers = localStorage.getItem('teachers');
      const storedRooms = localStorage.getItem('rooms');
      
      if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
      if (storedTeachers) setTeachers(JSON.parse(storedTeachers));
      if (storedRooms) setRooms(JSON.parse(storedRooms));
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    const subjectTeacherMap: Record<string, string[]> = {};
    teachers.forEach(teacher => {
      teacher.subjects.forEach((subjectId: string) => {
        if (!subjectTeacherMap[subjectId]) {
          subjectTeacherMap[subjectId] = [];
        }
        subjectTeacherMap[subjectId].push(teacher.id);
      });
    });
    setAssignedTeachers(subjectTeacherMap);
  }, [teachers]);

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
    
    setTimetableData(initializeTimetable());
    setShowTimetable(true);
    
    toast({
      title: "Timetable Ready",
      description: `Created timetable for ${stream} ${year} ${division}. Start adding subjects!`,
    });
  };

  const saveTimetable = () => {
    try {
      const timetableKey = `timetable_${stream}_${year}_${division}`;
      const timetableMetadata = {
        id: timetableKey,
        name: `${stream} ${year} ${division} Timetable`,
        stream: stream,
        year: year,
        division: division,
        lastModified: new Date().toLocaleDateString()
      };
      
      localStorage.setItem(timetableKey, JSON.stringify(timetableData));
      
      const storedRecentTimetables = localStorage.getItem('recentTimetables');
      let recentTimetables = storedRecentTimetables ? JSON.parse(storedRecentTimetables) : [];
      
      const existingIndex = recentTimetables.findIndex((t: any) => t.id === timetableKey);
      if (existingIndex >= 0) {
        recentTimetables[existingIndex] = timetableMetadata;
      } else {
        recentTimetables = [timetableMetadata, ...recentTimetables].slice(0, 5);
      }
      
      localStorage.setItem('recentTimetables', JSON.stringify(recentTimetables));
      
      setIsEditing(false);
      
      toast({
        title: "Timetable Saved",
        description: "Your timetable has been saved successfully."
      });
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
        description: `Added ${subject.name} lab to ${day} starting at ${time}`
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
        description: `Added ${subject.name} to ${day} ${time}`
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
    return subject.stream === stream && subject.year === year;
  });

  const getTeachersForSubject = (subjectId: string) => {
    return teachers.filter(teacher => teacher.subjects.includes(subjectId));
  };

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
                    <SelectItem value="BTECH_CSE">BTech CSE</SelectItem>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="MTECH_CSE">MTech CSE</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="MCA">MCA</SelectItem>
                    <SelectItem value="BTECH_BIOENGG">BTech Bioengg</SelectItem>
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
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={handleGenerateTimetable} className="gap-2">
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
                {stream} Year {year} Division {division} Timetable
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isEditing ? 'Editing mode' : 'View mode'} • Drag subjects to add them to the timetable
              </p>
            </div>
            <div className="flex gap-2">
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
                          {filteredSubjects.length > 0 ? (
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
                                No subjects available for the selected stream and year.
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="teachers" className="mt-4">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {teachers.length > 0 ? (
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
                              <p className="text-sm text-muted-foreground">
                                No teachers available. Please add teachers in Data Management.
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="rooms" className="mt-4">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                          {rooms.length > 0 ? (
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
        </div>
      )}
      
      <Dialog open={slotDetailsOpen} onOpenChange={setSlotDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class Details</DialogTitle>
            <DialogDescription>
              {selectedSlot && `Adding to ${selectedSlot.day} at ${selectedSlot.time}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select 
                value={slotDetails.subject} 
                onValueChange={(value) => {
                  const subjectTeachers = assignedTeachers[value] || [];
                  const defaultTeacher = subjectTeachers.length > 0 ? subjectTeachers[0] : "";
                  
                  setSlotDetails({
                    ...slotDetails, 
                    subject: value,
                    teacher: defaultTeacher
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={slotDetails.teacher} onValueChange={(value) => setSlotDetails({...slotDetails, teacher: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {slotDetails.subject && assignedTeachers[slotDetails.subject] && assignedTeachers[slotDetails.subject].length > 0 ? (
                    <>
                      <SelectItem value="" disabled>Assigned Teachers</SelectItem>
                      {assignedTeachers[slotDetails.subject].map((teacherId: string) => {
                        const teacher = teachers.find(t => t.id === teacherId);
                        return teacher ? (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.isTA ? "TA " : ""}{teacher.name}
                          </SelectItem>
                        ) : null;
                      })}
                      <SelectItem value="" disabled>Other Teachers</SelectItem>
                    </>
                  ) : null}
                  
                  {teachers
                    .filter(teacher => !slotDetails.subject || !assignedTeachers[slotDetails.subject] || !assignedTeachers[slotDetails.subject].includes(teacher.id))
                    .map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.isTA ? "TA " : ""}{teacher.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={slotDetails.type} onValueChange={(value) => setSlotDetails({...slotDetails, type: value, room: ""})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="lab">Lab (2 hours)</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Room</Label>
              <Select value={slotDetails.room} onValueChange={(value) => setSlotDetails({...slotDetails, room: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSlot && getAvailableRooms(selectedSlot.day, selectedSlot.time, slotDetails.type).map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.number} ({room.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSlot && getAvailableRooms(selectedSlot.day, selectedSlot.time, slotDetails.type).length === 0 && (
                <p className="text-xs text-destructive mt-1">
                  No suitable {slotDetails.type === "lab" ? "labs" : "classrooms"} available for this time slot
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotDetailsOpen(false)}>Cancel</Button>
            <Button onClick={addSubjectToTimetable}>Add to Timetable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetableEditor;
