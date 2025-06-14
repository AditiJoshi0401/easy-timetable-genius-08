import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Download, Save, RefreshCw, Clock } from 'lucide-react';
import { fetchStreams, fetchDivisions, fetchSubjects, fetchTeachers, fetchRooms, 
         fetchTimetable, addTimetable, updateTimetable, deleteTimetable,
         saveTimetableDraft, getTimetableDraft, removeTimetableDraft,
         isTeacherAvailable, isRoomAvailable, fetchAllTimetables,
         Stream, Division, Subject, Teacher, Room, Timetable } from '@/services/supabaseService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TimetableDisplay from '@/components/timetable/TimetableDisplay';
import { SectionHeading } from '@/components/ui/section-heading';

interface TimetableData {
  [day: string]: {
    [time: string]: {
      subject?: Subject;
      teacher?: Teacher;
      room?: Room;
    } | null;
  };
}

interface DraggedItem {
  type: 'subject' | 'teacher' | 'room';
  item: Subject | Teacher | Room;
}

interface ConflictWarning {
  day: string;
  time: string;
  message: string;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const TimetableEditor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timetableRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [selectedStream, setSelectedStream] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [timetableData, setTimetableData] = useState<TimetableData>({});
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [conflictWarnings, setConflictWarnings] = useState<ConflictWarning[]>([]);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);
  const [hasSavedChanges, setHasSavedChanges] = useState(true);
  const [lastSaved, setLastSaved] = useState<string>("");

  // Fetch queries
  const { data: streams } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: fetchDivisions
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  });

  // Mutations
  const addTimetableMutation = useMutation({
    mutationFn: (timetable: Omit<Timetable, 'created_at' | 'updated_at'>) => addTimetable(timetable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      toast({
        title: "Timetable Saved",
        description: "The timetable has been saved successfully."
      });
      setHasSavedChanges(true);
      setLastSaved(new Date().toLocaleTimeString());
    },
    onError: (error) => {
      console.error('Error adding timetable:', error);
      toast({
        title: "Error",
        description: "Failed to save timetable. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateTimetableMutation = useMutation({
    mutationFn: ({ compositeId, timetable }: { compositeId: string, timetable: Partial<Timetable> }) => updateTimetable(compositeId, timetable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      toast({
        title: "Timetable Updated",
        description: "The timetable has been updated successfully."
      });
      setHasSavedChanges(true);
      setLastSaved(new Date().toLocaleTimeString());
    },
    onError: (error) => {
      console.error('Error updating timetable:', error);
      toast({
        title: "Error",
        description: "Failed to update timetable. Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteTimetableMutation = useMutation({
    mutationFn: (compositeId: string) => deleteTimetable(compositeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      toast({
        title: "Timetable Deleted",
        description: "The timetable has been deleted successfully."
      });
      setTimetableData({});
      removeTimetableDraft(generateTimetableKey());
    },
    onError: (error) => {
      console.error('Error deleting timetable:', error);
      toast({
        title: "Error",
        description: "Failed to delete timetable. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Get filtered subjects based on selected stream and semester
  const filteredSubjects = subjects?.filter(subject => {
    const streamMatch = subject.stream === selectedStream;
    const semesterMatch = subject.semester === selectedSemester;
    return streamMatch && semesterMatch;
  }) || [];

  // Get filtered divisions based on selected stream and semester
  const filteredDivisions = divisions?.filter(division => {
    const streamMatch = division.streamId === selectedStream;
    const semesterMatch = division.semester.toString() === selectedSemester;
    return streamMatch && semesterMatch;
  }) || [];

  // Get available semesters for the selected stream
  const getAvailableSemesters = () => {
    const stream = streams?.find(s => s.id === selectedStream);
    if (!stream) return [];
    return Array.from({ length: stream.semesters }, (_, i) => i + 1);
  };

  // Generate composite key for timetable identification
  const generateTimetableKey = () => {
    if (!selectedStream || !selectedSemester || !selectedDivision) return "";
    const streamCode = streams?.find(s => s.id === selectedStream)?.code || "";
    const divisionName = divisions?.find(d => d.id === selectedDivision)?.name || "";
    return `${streamCode}-SEM${selectedSemester}-${divisionName}`;
  };

  // Load timetable data
  const loadTimetable = async (divisionId: string) => {
    if (!selectedStream || !selectedSemester || !divisionId) {
      console.warn("Missing stream, semester, or division to load timetable.");
      return;
    }

    setIsLoadingTimetable(true);
    const timetableKey = generateTimetableKey();

    try {
      // First, try to load the timetable from the database
      let timetable = await fetchTimetable(timetableKey);

      if (!timetable) {
        // If not found in the database, try to load the draft from localStorage
        const draft = getTimetableDraft(timetableKey);
        if (draft) {
          setTimetableData(draft.data);
          toast({
            title: "Draft Loaded",
            description: "Loaded timetable draft from local storage.",
          });
        } else {
          // If no timetable in DB and no draft in localStorage, initialize a new empty timetable
          setTimetableData({});
        }
      } else {
        // If timetable found in DB, load it
        setTimetableData(timetable.data);
      }
    } catch (error) {
      console.error("Error loading timetable:", error);
      toast({
        title: "Error Loading Timetable",
        description: "Failed to load timetable. Please try again.",
        variant: "destructive",
      });
      setTimetableData({});
    } finally {
      setIsLoadingTimetable(false);
      setHasSavedChanges(true);
    }
  };

  // Save timetable data
  const saveTimetable = async () => {
    if (!selectedStream || !selectedSemester || !selectedDivision) {
      toast({
        title: "Missing Information",
        description: "Please select stream, semester, and division to save.",
        variant: "destructive",
      });
      return;
    }

    const timetableKey = generateTimetableKey();
    const timetableDataToSave = timetableData || {};

    try {
      // Check if a timetable with the composite key already exists
      const existingTimetable = await fetchTimetable(timetableKey);

      if (existingTimetable) {
        // If it exists, update the existing timetable
        await updateTimetableMutation.mutateAsync({
          compositeId: timetableKey,
          timetable: { data: timetableDataToSave, division_id: selectedDivision },
        });
      } else {
        // If it doesn't exist, create a new timetable
        const newTimetable: Omit<Timetable, 'created_at' | 'updated_at'> = {
          id: timetableKey, // Using composite key as ID
          division_id: selectedDivision,
          data: timetableDataToSave,
        };
        await addTimetableMutation.mutateAsync(newTimetable);
      }

      setHasSavedChanges(true);
      setLastSaved(new Date().toLocaleTimeString());
      removeTimetableDraft(timetableKey);
    } catch (error) {
      console.error("Error saving timetable:", error);
      toast({
        title: "Error Saving Timetable",
        description: "Failed to save timetable. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete timetable data
  const deleteTimetableData = async () => {
    if (!selectedStream || !selectedSemester || !selectedDivision) {
      toast({
        title: "Missing Information",
        description: "Please select stream, semester, and division to delete.",
        variant: "destructive",
      });
      return;
    }

    const timetableKey = generateTimetableKey();

    try {
      await deleteTimetableMutation.mutateAsync(timetableKey);
      setTimetableData({});
      toast({
        title: "Timetable Deleted",
        description: "Timetable has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting timetable:", error);
      toast({
        title: "Error Deleting Timetable",
        description: "Failed to delete timetable. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset timetable data
  const resetTimetable = () => {
    setTimetableData({});
    setConflictWarnings([]);
    setHasSavedChanges(false);
    const timetableKey = generateTimetableKey();
    removeTimetableDraft(timetableKey);
  };

  // Auto-save draft to localStorage
  useEffect(() => {
    if (selectedStream && selectedSemester && selectedDivision && !hasSavedChanges) {
      const timetableKey = generateTimetableKey();
      saveTimetableDraft(timetableKey, timetableData);
    }
  }, [timetableData, selectedStream, selectedSemester, selectedDivision, hasSavedChanges]);

  // Drag and drop handlers
  const handleDragStart = (item: any, type: 'subject' | 'teacher' | 'room') => {
    setDraggedItem({ item, type });
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLTableCellElement>, day: string, time: string) => {
    e.preventDefault();

    if (!draggedItem) return;

    setTimetableData(prevData => {
      const newData = { ...prevData };
      if (!newData[day]) {
        newData[day] = {};
      }
      newData[day][time] = {
        ...newData[day][time],
        [draggedItem.type]: draggedItem.item,
      };
      return newData;
    });
    setHasSavedChanges(false);
  };

  // Clear slot data
  const clearSlot = (day: string, time: string) => {
    setTimetableData(prevData => {
      const newData = { ...prevData };
      if (newData[day] && newData[day][time]) {
        delete newData[day][time];
      }
      return newData;
    });
    setHasSavedChanges(false);
  };

  // Conflict checking
  useEffect(() => {
    const checkConflicts = async () => {
      if (!selectedStream || !selectedSemester || !selectedDivision || !timetableData) {
        return;
      }
  
      const timetableKey = generateTimetableKey();
      try {
        // Fetch all timetables for conflict checking
        const allTimetables = await fetchAllTimetables();
  
        // Filter out the current timetable from the list to avoid self-conflicts
        const existingTimetables = allTimetables.filter(tt => tt.name !== timetableKey);
  
        const newWarnings: ConflictWarning[] = [];
  
        for (const day of daysOfWeek) {
          for (const time of timeSlots) {
            const slotData = timetableData[day]?.[time];
  
            if (slotData) {
              if (slotData.teacher) {
                const teacherAvailable = isTeacherAvailable(slotData.teacher.id, day, time, existingTimetables);
                if (!teacherAvailable) {
                  newWarnings.push({
                    day,
                    time,
                    message: `Teacher ${slotData.teacher.name} is not available at this time.`,
                  });
                }
              }
  
              if (slotData.room) {
                const roomAvailable = isRoomAvailable(slotData.room.id, day, time, existingTimetables);
                if (!roomAvailable) {
                  newWarnings.push({
                    day,
                    time,
                    message: `Room ${slotData.room.number} is not available at this time.`,
                  });
                }
              }
            }
          }
        }
        setConflictWarnings(newWarnings);
      } catch (error) {
        console.error("Error checking conflicts:", error);
        toast({
          title: "Error Checking Conflicts",
          description: "Failed to check conflicts. Please try again.",
          variant: "destructive",
        });
      }
    };
  
    checkConflicts();
  }, [timetableData, selectedStream, selectedSemester, selectedDivision]);

  // Download timetable
  const downloadTimetable = () => {
    if (timetableRef.current) {
      const content = timetableRef.current.outerHTML;
      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = "timetable.html";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    } else {
      toast({
        title: "Error Downloading Timetable",
        description: "Timetable content not found.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Timetable Editor"
        description="Create and edit division timetables"
        icon={<Clock className="h-6 w-6" />}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Timetable Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Stream</Label>
              <Select 
                value={selectedStream} 
                onValueChange={(value) => {
                  setSelectedStream(value);
                  setSelectedSemester("");
                  setSelectedDivision("");
                  setTimetableData({});
                  setConflictWarnings([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Stream" />
                </SelectTrigger>
                <SelectContent>
                  {streams?.map(stream => (
                    <SelectItem key={stream.id} value={stream.id}>
                      {stream.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <Select 
                value={selectedSemester} 
                onValueChange={(value) => {
                  setSelectedSemester(value);
                  setSelectedDivision("");
                  setTimetableData({});
                  setConflictWarnings([]);
                }}
                disabled={!selectedStream}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSemesters().map(semester => (
                    <SelectItem key={semester} value={semester.toString()}>
                      Semester {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Division</Label>
              <Select 
                value={selectedDivision} 
                onValueChange={(value) => {
                  setSelectedDivision(value);
                  loadTimetable(value);
                }}
                disabled={!selectedSemester}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  {filteredDivisions.map(division => (
                    <SelectItem key={division.id} value={division.id}>
                      Division {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetTimetable}
                disabled={isLoadingTimetable || Object.keys(timetableData).length === 0}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Timetable
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={deleteTimetableData}
                disabled={isLoadingTimetable || Object.keys(timetableData).length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2 text-destructive" />
                Delete Timetable
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {hasSavedChanges ? `Last saved at ${lastSaved}` : "Unsaved Changes"}
              </span>
              <Button 
                size="sm" 
                onClick={saveTimetable}
                disabled={isLoadingTimetable || hasSavedChanges || !selectedDivision}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Timetable
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={downloadTimetable}
                disabled={isLoadingTimetable || Object.keys(timetableData).length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {conflictWarnings.length > 0 && (
            <div className="text-sm text-orange-500">
              {conflictWarnings.map((warning, index) => (
                <div key={index}>
                  Warning: {warning.message} (Day: {warning.day}, Time: {warning.time})
                </div>
              ))}
            </div>
          )}

          {selectedDivision && (
            <div className="py-4" ref={timetableRef}>
              {isLoadingTimetable ? (
                <div>Loading timetable...</div>
              ) : (
                <TimetableDisplay 
                  timetableData={timetableData} 
                  viewType="division"
                  showTeachers={true} 
                  showRooms={true}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredSubjects.map(subject => (
                <div
                  key={subject.id}
                  draggable
                  onDragStart={() => handleDragStart(subject, 'subject')}
                  className="bg-secondary rounded-md p-2 cursor-grab hover:bg-secondary/80 transition-colors"
                >
                  {subject.name} ({subject.code})
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teachers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {teachers?.map(teacher => (
                <div
                  key={teacher.id}
                  draggable
                  onDragStart={() => handleDragStart(teacher, 'teacher')}
                  className="bg-secondary rounded-md p-2 cursor-grab hover:bg-secondary/80 transition-colors"
                >
                  {teacher.name} ({teacher.specialization})
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rooms?.map(room => (
                <div
                  key={room.id}
                  draggable
                  onDragStart={() => handleDragStart(room, 'room')}
                  className="bg-secondary rounded-md p-2 cursor-grab hover:bg-secondary/80 transition-colors"
                >
                  {room.number} ({room.capacity})
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Timetable</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th></th>
                    {timeSlots.map(time => (
                      <th key={time} className="border p-2">
                        {time}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map(day => (
                    <tr key={day}>
                      <th className="border p-2">{day}</th>
                      {timeSlots.map(time => (
                        <td
                          key={`${day}-${time}`}
                          className="border p-2 relative h-24"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day, time)}
                        >
                          {timetableData[day]?.[time] && (
                            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
                              {timetableData[day][time]?.subject && (
                                <div className="text-sm font-medium">
                                  {timetableData[day][time].subject?.name}
                                </div>
                              )}
                              {timetableData[day][time]?.teacher && (
                                <div className="text-xs text-muted-foreground">
                                  {timetableData[day][time].teacher?.name}
                                </div>
                              )}
                              {timetableData[day][time]?.room && (
                                <div className="text-xs text-muted-foreground">
                                  {timetableData[day][time].room?.number}
                                </div>
                              )}
                              <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => clearSlot(day, time)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TimetableEditor;
