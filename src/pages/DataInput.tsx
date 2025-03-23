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
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState<Subject>({
    id: "",
    name: "",
    code: "",
    credits: 3,
    stream: "BTECH_CSE",
    year: "1"
  });
  const [subjectNameError, setSubjectNameError] = useState("");
  const [subjectCodeError, setSubjectCodeError] = useState("");
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newTeacher, setNewTeacher] = useState<Teacher>({
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
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState<Room>({
    id: "",
    number: "",
    capacity: 30,
    type: "classroom"
  });
  const [roomNumberError, setRoomNumberError] = useState("");

  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateSubjects, setDuplicateSubjects] = useState<{
    stream: string;
    year: string;
    subjects: Subject[];
  }[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedSubjects = localStorage.getItem('subjects');
        const storedTeachers = localStorage.getItem('teachers');
        const storedRooms = localStorage.getItem('rooms');
        
        if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
        if (storedTeachers) setTeachers(JSON.parse(storedTeachers));
        if (storedRooms) setRooms(JSON.parse(storedRooms));
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading your saved data.",
          variant: "destructive"
        });
      }
    };
    
    loadData();
  }, [toast]);

  useEffect(() => {
    try {
      localStorage.setItem('subjects', JSON.stringify(subjects));
      localStorage.setItem('teachers', JSON.stringify(teachers));
      localStorage.setItem('rooms', JSON.stringify(rooms));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
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

    const subjectId = crypto.randomUUID();
    const updatedSubjects = [...subjects, { ...newSubject, id: subjectId }];
    setSubjects(updatedSubjects);
    
    setNewSubject({
      id: "",
      name: "",
      code: "",
      credits: 3,
      stream: "BTECH_CSE",
      year: "1"
    });
    
    toast({
      title: "Subject Added",
      description: `${newSubject.name} has been added successfully.`
    });
  };

  const handleDeleteSubject = (id: string) => {
    const assignedTeachers = teachers.filter(teacher => teacher.subjects.includes(id));
    
    if (assignedTeachers.length > 0) {
      toast({
        title: "Cannot Delete Subject",
        description: "This subject is assigned to one or more teachers.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedSubjects = subjects.filter(subject => subject.id !== id);
    setSubjects(updatedSubjects);
    
    toast({
      title: "Subject Deleted",
      description: "The subject has been removed successfully."
    });
  };

  const checkForDuplicateAssignments = () => {
    const subjectsByStreamAndYear: Record<string, Subject[]> = {};
    
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

    const teacherId = crypto.randomUUID();
    const teacherToAdd = { 
      ...newTeacher, 
      id: teacherId 
    };
    
    const updatedTeachers = [...teachers, teacherToAdd];
    setTeachers(updatedTeachers);
    
    setNewTeacher({
      id: "",
      name: "",
      email: "",
      specialization: "",
      subjects: [],
      isTA: false
    });
    
    toast({
      title: "Teacher Added",
      description: `${teacherToAdd.name} has been added successfully.`
    });
  };

  const handleDeleteTeacher = (id: string) => {
    const updatedTeachers = teachers.filter(teacher => teacher.id !== id);
    setTeachers(updatedTeachers);
    
    toast({
      title: "Teacher Deleted",
      description: "The teacher has been removed successfully."
    });
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

  const handleRemoveSubjectFromTeacher = (subjectId: string) => {
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

    const roomId = crypto.randomUUID();
    const updatedRooms = [...rooms, { ...newRoom, id: roomId }];
    setRooms(updatedRooms);
    
    setNewRoom({
      id: "",
      number: "",
      capacity: 30,
      type: "classroom"
    });
    
    toast({
      title: "Room Added",
      description: `Room ${newRoom.number} has been added successfully.`
    });
  };

  const handleDeleteRoom = (id: string) => {
    const updatedRooms = rooms.filter(room => room.id !== id);
    setRooms(updatedRooms);
    
    toast({
      title: "Room Deleted",
      description: "The room has been removed successfully."
    });
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
                  <Label htmlFor="subject-year">Year</Label>
                  <Select
                    value={newSubject.year}
                    onValueChange={(value) => setNewSubject({ ...newSubject, year: value })}
                  >
                    <SelectTrigger id="subject-year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Year</SelectItem>
                      <SelectItem value="2">Second Year</SelectItem>
                      <SelectItem value="3">Third Year</SelectItem>
                      <SelectItem value="4">Fourth Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleAddSubject} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Subject
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subject List</CardTitle>
              <CardDescription>
                View and manage all subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.length > 0 ? (
                <div className="space-y-4">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {subject.code} • {subject.credits} Credits • {subject.stream.replace('_', ' ')} Year {subject.year}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-muted-foreground hover:text-destructive"
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
                
                <div className="space-y-2">
                  <Label htmlFor="teacher-specialization">Specialization</Label>
                  <Input
                    id="teacher-specialization"
                    value={newTeacher.specialization}
                    onChange={(e) => setNewTeacher({ ...newTeacher, specialization: e.target.value })}
                    placeholder="e.g. Algorithms"
                  />
                </div>
                
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
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Assigned Subjects</Label>
                  <div className="flex gap-2">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
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
              <Button onClick={handleAddTeacher} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Teacher
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Teacher List</CardTitle>
              <CardDescription>
                View and manage all teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teachers.length > 0 ? (
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {teacher.isTA && (
                              <Badge variant="outline" className="mr-2 bg-primary/10">
                                TA
                              </Badge>
                            )}
                            {teacher.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {teacher.email} • {teacher.specialization}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-2">
                        <div className="text-xs font-medium mb-1">Assigned Subjects:</div>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.length > 0 ? (
                            teacher.subjects.map((subjectId) => {
                              const subject = subjects.find(s => s.id === subjectId);
                              return subject ? (
                                <Badge key={subjectId} variant="secondary" className="text-xs">
                                  {subject.name}
                                </Badge>
                              ) : null;
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No teachers added yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Room</CardTitle>
              <CardDescription>
                Enter the details of the new room or lab
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room-number">Room Number</Label>
                  <Input
                    id="room-number"
                    value={newRoom.number}
                    onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                    placeholder="e.g. A101"
                  />
                  {roomNumberError && (
                    <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{roomNumberError}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room-capacity">Capacity</Label>
                  <Input
                    id="room-capacity"
                    type="number"
                    min="1"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                    placeholder="e.g. 30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="room-type">Type</Label>
                  <Select
                    value={newRoom.type}
                    onValueChange={(value: "classroom" | "lab") => setNewRoom({ ...newRoom, type: value })}
                  >
                    <SelectTrigger id="room-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleAddRoom} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Add Room
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Room List</CardTitle>
              <CardDescription>
                View and manage all rooms and labs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{room.number}</div>
                          <div className="text-sm text-muted-foreground">
                            {room.type.charAt(0).toUpperCase() + room.type.slice(1)} • Capacity: {room.capacity}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRoom(room.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No rooms added yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Data Import/Export</CardTitle>
          <CardDescription>
            Save or load your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="gap-2">
              <SaveIcon className="h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" className="gap-2">
              <DatabaseIcon className="h-4 w-4" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <DuplicateWarningDialog
        open={showDuplicateWarning}
        onClose={() => setShowDuplicateWarning(false)}
        onConfirm={addSubjectToTeacherConfirmed}
        duplicates={duplicateSubjects}
      />
    </div>
  );
};

export default DataInput;
