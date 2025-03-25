import { useState, useEffect } from "react";
import { DatabaseIcon, BookIcon, UsersIcon, BuildingIcon, PlusIcon, TrashIcon, SaveIcon, AlertTriangle, AlertCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  fetchStreams, fetchSubjects, fetchTeachers, fetchRooms,
  addSubject, updateSubject, deleteSubject,
  addTeacher, updateTeacher, deleteTeacher,
  addRoom, updateRoom, deleteRoom
} from "@/services/supabaseService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  stream: string;
  year: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  subjects: string[];
  isTA: boolean;
}

interface Room {
  id: string;
  number: string;
  capacity: number;
  type: "classroom" | "lab";
}

interface DuplicateWarningDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  duplicates: {
    stream: string;
    year: string;
    subjects: Subject[];
  }[];
}

const DuplicateWarningDialog = ({ open, onClose, onConfirm, duplicates }: DuplicateWarningDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Duplicate Subject Assignment</span>
          </DialogTitle>
          <DialogDescription>
            This teacher is already assigned to multiple subjects in the same stream and year:
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {duplicates.map((duplicate, index) => (
            <div key={index} className="space-y-2">
              <p className="font-medium text-sm">
                {duplicate.stream.replace('_', ' ')} - Year {duplicate.year}:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {duplicate.subjects.map((subject) => (
                  <li key={subject.id}>{subject.name} ({subject.code})</li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Having the same teacher for multiple subjects in the same stream and year may cause scheduling conflicts. Continue only if this is intentional.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>I Understand, Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DataInput = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("subjects");
  const queryClient = useQueryClient();
  
  // Form state
  const [newSubject, setNewSubject] = useState({
    id: "",
    name: "",
    code: "",
    credits: 3,
    stream: "",
    year: "1"
  });
  const [subjectNameError, setSubjectNameError] = useState("");
  const [subjectCodeError, setSubjectCodeError] = useState("");
  
  const [newTeacher, setNewTeacher] = useState({
    id: "",
    name: "",
    email: "",
    specialization: "",
    subjects: [],
    isTA: false
  });
  const [selectedSubject, setSelectedSubject] = useState("");
  const [teacherNameError, setTeacherNameError] = useState("");
  const [teacherEmailError, setTeacherEmailError] = useState("");
  
  const [newRoom, setNewRoom] = useState({
    id: "",
    number: "",
    capacity: 30,
    type: "classroom"
  });
  const [roomNumberError, setRoomNumberError] = useState("");

  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateSubjects, setDuplicateSubjects] = useState([]);

  // Data queries
  const { data: streams = [], isLoading: isLoadingStreams } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers
  });

  const { data: rooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  });

  // Mutations
  const subjectMutation = useMutation({
    mutationFn: (newSubject) => addSubject(newSubject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Subject Added",
        description: `${newSubject.name} has been added successfully.`
      });
      setNewSubject({
        id: "",
        name: "",
        code: "",
        credits: 3,
        stream: "",
        year: "1"
      });
    },
    onError: (error) => {
      console.error('Error adding subject:', error);
      toast({
        title: "Error Adding Subject",
        description: "There was a problem adding the subject.",
        variant: "destructive"
      });
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Subject Deleted",
        description: "The subject has been removed successfully."
      });
    },
    onError: (error) => {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error Deleting Subject",
        description: "There was a problem deleting the subject.",
        variant: "destructive"
      });
    }
  });

  const teacherMutation = useMutation({
    mutationFn: (newTeacher) => addTeacher(newTeacher),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Added",
        description: `${newTeacher.name} has been added successfully.`
      });
      setNewTeacher({
        id: "",
        name: "",
        email: "",
        specialization: "",
        subjects: [],
        isTA: false
      });
    },
    onError: (error) => {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error Adding Teacher",
        description: "There was a problem adding the teacher.",
        variant: "destructive"
      });
    }
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: (id) => deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Deleted",
        description: "The teacher has been removed successfully."
      });
    },
    onError: (error) => {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error Deleting Teacher",
        description: "There was a problem deleting the teacher.",
        variant: "destructive"
      });
    }
  });

  const roomMutation = useMutation({
    mutationFn: (newRoom) => addRoom(newRoom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Room Added",
        description: `Room ${newRoom.number} has been added successfully.`
      });
      setNewRoom({
        id: "",
        number: "",
        capacity: 30,
        type: "classroom"
      });
    },
    onError: (error) => {
      console.error('Error adding room:', error);
      toast({
        title: "Error Adding Room",
        description: "There was a problem adding the room.",
        variant: "destructive"
      });
    }
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id) => deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Room Deleted",
        description: "The room has been removed successfully."
      });
    },
    onError: (error) => {
      console.error('Error deleting room:', error);
      toast({
        title: "Error Deleting Room",
        description: "There was a problem deleting the room.",
        variant: "destructive"
      });
    }
  });

  // Local storage sync (for backward compatibility)
  useEffect(() => {
    if (subjects.length > 0) {
      localStorage.setItem('subjects', JSON.stringify(subjects));
    }
    if (teachers.length > 0) {
      localStorage.setItem('teachers', JSON.stringify(teachers));
    }
    if (rooms.length > 0) {
      localStorage.setItem('rooms', JSON.stringify(rooms));
    }
  }, [subjects, teachers, rooms]);

  const checkDuplicateSubject = () => {
    setSubjectNameError("");
    setSubjectCodeError("");
    
    const nameExists = subjects.some(subject => 
      subject.name.toLowerCase() === newSubject.name.toLowerCase()
    );
    
    const codeExists = subjects.some(subject => 
      subject.code.toLowerCase() === newSubject.code.toLowerCase()
    );
    
    if (nameExists) {
      setSubjectNameError("A subject with this name already exists");
      toast({
        title: "Duplicate Subject Name",
        description: "A subject with this name already exists. Please use a different name.",
        variant: "destructive"
      });
    }
    
    if (codeExists) {
      setSubjectCodeError("A subject with this code already exists");
      toast({
        title: "Duplicate Subject Code",
        description: "A subject with this code already exists. Please use a different code.",
        variant: "destructive"
      });
    }
    
    return nameExists || codeExists;
  };

  const checkDuplicateTeacher = () => {
    setTeacherNameError("");
    setTeacherEmailError("");
    
    const nameExists = teachers.some(teacher => 
      teacher.name.toLowerCase() === newTeacher.name.toLowerCase()
    );
    
    const emailExists = teachers.some(teacher => 
      teacher.email.toLowerCase() === newTeacher.email.toLowerCase()
    );
    
    if (nameExists) {
      setTeacherNameError("A teacher with this name already exists");
      toast({
        title: "Duplicate Teacher Name",
        description: "A teacher with this name already exists. Please use a different name.",
        variant: "destructive"
      });
    }
    
    if (emailExists) {
      setTeacherEmailError("A teacher with this email already exists");
      toast({
        title: "Duplicate Teacher Email",
        description: "A teacher with this email already exists. Please use a different email.",
        variant: "destructive"
      });
    }
    
    return nameExists || emailExists;
  };

  const checkDuplicateRoom = () => {
    setRoomNumberError("");
    
    const numberExists = rooms.some(room => 
      room.number.toLowerCase() === newRoom.number.toLowerCase()
    );
    
    if (numberExists) {
      setRoomNumberError("A room with this number already exists");
      toast({
        title: "Duplicate Room Number",
        description: "A room with this number already exists. Please use a different number.",
        variant: "destructive"
      });
    }
    
    return numberExists;
  };

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.code) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the subject.",
        variant: "destructive"
      });
      return;
    }

    if (checkDuplicateSubject()) {
      return;
    }

    // Add to Supabase via mutation
    subjectMutation.mutate({
      name: newSubject.name,
      code: newSubject.code,
      credits: newSubject.credits,
      stream: newSubject.stream,
      year: newSubject.year
    });
  };

  const handleDeleteSubject = (id) => {
    const assignedTeachers = teachers.filter(teacher => teacher.subjects.includes(id));
    
    if (assignedTeachers.length > 0) {
      toast({
        title: "Cannot Delete Subject",
        description: "This subject is assigned to one or more teachers.",
        variant: "destructive"
      });
      return;
    }
    
    deleteSubjectMutation.mutate(id);
  };

  const checkForDuplicateAssignments = () => {
    const subjectsByStreamAndYear = {};
    
    for (const subjectId of newTeacher.subjects) {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject) {
        const key = `${subject.stream}_${subject.year}`;
        if (!subjectsByStreamAndYear[key]) {
          subjectsByStreamAndYear[key] = [];
        }
        subjectsByStreamAndYear[key].push(subject);
      }
    }
    
    if (selectedSubject) {
      const subject = subjects.find(s => s.id === selectedSubject);
      if (subject) {
        const key = `${subject.stream}_${subject.year}`;
        if (!subjectsByStreamAndYear[key]) {
          subjectsByStreamAndYear[key] = [];
        }
        if (!subjectsByStreamAndYear[key].some(s => s.id === subject.id)) {
          subjectsByStreamAndYear[key].push(subject);
        }
      }
    }
    
    const duplicates = Object.entries(subjectsByStreamAndYear)
      .filter(([_, subjectsInGroup]) => subjectsInGroup.length > 1)
      .map(([key, subjectsInGroup]) => {
        const [stream, year] = key.split('_');
        return { stream, year, subjects: subjectsInGroup };
      });
    
    return duplicates;
  };

  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the teacher.",
        variant: "destructive"
      });
      return;
    }

    if (checkDuplicateTeacher()) {
      return;
    }

    // Add to Supabase via mutation
    teacherMutation.mutate({
      name: newTeacher.name,
      email: newTeacher.email,
      specialization: newTeacher.specialization,
      subjects: newTeacher.subjects,
      isTA: newTeacher.isTA
    });
  };

  const handleDeleteTeacher = (id) => {
    deleteTeacherMutation.mutate(id);
  };

  const handleAddSubjectToTeacher = () => {
    if (!selectedSubject) return;
    
    if (newTeacher.subjects.includes(selectedSubject)) {
      toast({
        title: "Subject Already Assigned",
        description: "This subject is already assigned to the teacher.",
        variant: "destructive"
      });
      return;
    }
    
    const duplicates = checkForDuplicateAssignments();
    
    if (duplicates.length > 0) {
      setDuplicateSubjects(duplicates);
      setShowDuplicateWarning(true);
      return;
    }
    
    addSubjectToTeacherConfirmed();
  };

  const addSubjectToTeacherConfirmed = () => {
    const updatedSubjects = [...newTeacher.subjects, selectedSubject];
    setNewTeacher({
      ...newTeacher,
      subjects: updatedSubjects
    });
    
    setSelectedSubject("");
    setShowDuplicateWarning(false);
  };

  const handleRemoveSubjectFromTeacher = (subjectId) => {
    const updatedSubjects = newTeacher.subjects.filter(id => id !== subjectId);
    setNewTeacher({
      ...newTeacher,
      subjects: updatedSubjects
    });
  };

  const handleAddRoom = () => {
    if (!newRoom.number) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the room.",
        variant: "destructive"
      });
      return;
    }

    if (checkDuplicateRoom()) {
      return;
    }

    // Add to Supabase via mutation
    roomMutation.mutate({
      number: newRoom.number,
      capacity: newRoom.capacity,
      type: newRoom.type
    });
  };

  const handleDeleteRoom = (id) => {
    deleteRoomMutation.mutate(id);
  };

  // Handle data export/import
  const handleExportData = () => {
    try {
      const data = {
        subjects,
        teachers,
        rooms
      };
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'timetable_data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: "Your data has been exported successfully."
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was a problem exporting your data.",
        variant: "destructive"
      });
    }
  };

  const handleImportData = async (importedData) => {
    try {
      // Process subjects
      if (importedData.subjects && importedData.subjects.length > 0) {
        for (const subject of importedData.subjects) {
          const { id, ...subjectData } = subject;
          try {
            await addSubject(subjectData);
          } catch (error) {
            console.error("Error importing subject:", error);
          }
        }
      }
      
      // Process teachers
      if (importedData.teachers && importedData.teachers.length > 0) {
        for (const teacher of importedData.teachers) {
          const { id, ...teacherData } = teacher;
          try {
            await addTeacher(teacherData);
          } catch (error) {
            console.error("Error importing teacher:", error);
          }
        }
      }
      
      // Process rooms
      if (importedData.rooms && importedData.rooms.length > 0) {
        for (const room of importedData.rooms) {
          const { id, ...roomData } = room;
          try {
            await addRoom(roomData);
          } catch (error) {
            console.error("Error importing room:", error);
          }
        }
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['subjects'] });
      await queryClient.invalidateQueries({ queryKey: ['teachers'] });
      await queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      toast({
        title: "Data Imported",
        description: "Your data has been imported successfully."
      });
    } catch (error) {
      console.error("Import processing error:", error);
      toast({
        title: "Import Failed",
        description: "There was a problem processing the imported data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Data Management"
        description="Add and manage subjects, teachers, and rooms for timetable creation"
        icon={<DatabaseIcon className="h-6 w-6" />}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookIcon className="h-4 w-4" />
            <span>Subjects</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            <span>Teachers</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <BuildingIcon className="h-4 w-4" />
            <span>Rooms</span>
          </TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Subject</CardTitle>
              <CardDescription>
                Enter the details of the new subject
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Name */}
                <div className="space-y-2">
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                    placeholder="e.g. Data Structures"
                  />
                  {subjectNameError && (
                    <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{subjectNameError}</span>
                    </div>
                  )}
                </div>
                
                {/* Subject Code */}
                <div className="space-y-2">
                  <Label htmlFor="subject-code">Subject Code</Label>
                  <Input
                    id="subject-code"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    placeholder="e.g. CS201"
                  />
                  {subjectCodeError && (
                    <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{subjectCodeError}</span>
                    </div>
                  )}
                </div>
                
                {/* Credits */}
                <div className="space-y-2">
                  <Label htmlFor="subject-credits">Credits</Label>
                  <Select
                    value={newSubject.credits.toString()}
                    onValueChange={(value) => setNewSubject({ ...newSubject, credits: parseInt(value) })}
                  >
                    <SelectTrigger id="subject-credits">
                      <SelectValue placeholder="Select credits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Credit</SelectItem>
                      <SelectItem value="2">2 Credits</SelectItem>
                      <SelectItem value="3">3 Credits</SelectItem>
                      <SelectItem value="4">4 Credits</SelectItem>
                      <SelectItem value="5">5 Credits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Stream */}
                <div className="space-y-2">
                  <Label htmlFor="subject-stream">Stream</Label>
                  <Select
                    value={newSubject.stream}
                    onValueChange={(value) => setNewSubject({ ...newSubject, stream: value })}
                  >
                    <SelectTrigger id="subject-stream">
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingStreams ? (
                        <SelectItem value="" disabled>Loading streams...</SelectItem>
                      ) : streams.length > 0 ? (
                        streams.map((stream) => (
                          <SelectItem key={stream.id} value={stream.code}>
                            {stream.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No streams available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Year */}
                <div className="space-y-2">
                  <Label htmlFor="subject-year">Year</Label>
                  <Select
                    value={newSubject.year}
                    onValueChange={(value) => setNewSubject({ ...newSubject, year: value })}
                  >
                    <SelectTrigger id="subject-year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {streams.find(s => s.code === newSubject.stream)?.years ? 
                        Array.from({ length: streams.find(s => s.code === newSubject.stream)?.years || 4 }, (_, i) => i + 1).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year === 1 ? "First" : year === 2 ? "Second" : year === 3 ? "Third" : "Fourth"} Year
                          </SelectItem>
                        )) :
                        <>
                          <SelectItem value="1">First Year</SelectItem>
                          <SelectItem value="2">Second Year</SelectItem>
                          <SelectItem value="3">Third Year</SelectItem>
                          <SelectItem value="4">Fourth Year</SelectItem>
                        </>
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleAddSubject} 
                className="gap-2"
                disabled={subjectMutation.isPending}
              >
                {subjectMutation.isPending ? (
                  <>Adding...</>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    Add Subject
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Subject List */}
          <Card>
            <CardHeader>
              <CardTitle>Subject List</CardTitle>
              <CardDescription>
                View and manage all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSubjects ? (
                <div className="text-center py-6 text-muted-foreground">
                  Loading subjects...
                </div>
              ) : subjects.length > 0 ? (
                <div className="space-y-4">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {subject.code} • {subject.credits} Credits • {subject.stream?.replace('_', ' ') || 'No Stream'} Year {subject.year}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-muted-foreground hover:text-destructive"
                        disabled={deleteSubjectMutation.isPending}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No subjects added yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Teacher</CardTitle>
              <CardDescription>
                Enter the details of the new teacher
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teacher Name */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Name</Label>
                  <Input
                    id="teacher-name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    placeholder="e.g. Dr. John Smith"
                  />
                  {teacherNameError && (
                    <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{teacherNameError}</span>
                    </div>
                  )}
                </div>
                
                {/* Teacher Email */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    placeholder="e.g. john.smith@example.com"
                  />
                  {teacherEmailError && (
                    <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{teacherEmailError}</span>
                    </div>
                  )}
                </div>
                
                {/* Specialization */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-specialization">Specialization</Label>
                  <Input
                    id="teacher-specialization"
                    value={newTeacher.specialization}
                    onChange={(e) => setNewTeacher({ ...newTeacher, specialization: e.target.value })}
                    placeholder="e.g. Algorithms"
                  />
                </div>
                
                {/* TA Switch */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="teacher-ta">Teaching Assistant (TA)</Label>
                    <Switch 
                      id="teacher-ta" 
                      checked={newTeacher.isTA}
                      onCheckedChange={(checked) => setNewTeacher({ ...newTeacher, isTA: checked })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mark this teacher as a teaching assistant
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Subject Assignment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Assigned Subjects</Label>
                  <div className="flex gap-2">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingSubjects ? (
                          <SelectItem value="" disabled>Loading subjects...</SelectItem>
                        ) : subjects.length > 0 ? (
                          subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name} ({subject.code})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No subjects available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSubjectToTeacher}
                      disabled={!selectedSubject}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Subject Badges */}
                <div className="flex flex-wrap gap-2">
                  {newTeacher.subjects.length > 0 ? (
                    newTeacher.subjects.map((subjectId) => {
                      const subject = subjects.find(s => s.id === subjectId);
                      return subject ? (
                        <Badge key={subjectId} variant="outline" className="flex items-center gap-1 py-1">
                          {subject.name}
                          <button
                            onClick={() => handleRemoveSubjectFromTeacher(subjectId)}
                            className="ml-1 text-muted-foreground hover:text-destructive"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No subjects assigned yet
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleAddTeacher} 
                className="gap-2"
                disabled={teacherMutation.isPending}
              >
                {teacherMutation.isPending
