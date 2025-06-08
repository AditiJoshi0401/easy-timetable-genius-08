import { useState, useEffect } from "react";
import { Database, PlusCircle, Edit, Trash2, CheckCircle2, XCircle, BookOpen, Users, AlertCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchSubjects, fetchTeachers, fetchRooms, addSubject, updateSubject, deleteSubject, addTeacher, updateTeacher, deleteTeacher, addRoom, updateRoom, deleteRoom, Subject, Teacher, Room } from "@/services/supabaseService";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define schema for subject form
const subjectFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  credits: z.coerce.number().min(1, "At least 1 credit").max(10, "Maximum 10 credits"),
  lectures: z.coerce.number().min(0, "Lectures cannot be negative").max(10, "Maximum 10 lectures per week"),
  tutorials: z.coerce.number().min(0, "Tutorials cannot be negative").max(10, "Maximum 10 tutorials per week"),
  practicals: z.coerce.number().min(0, "Practicals cannot be negative").max(10, "Maximum 10 practicals per week"),
  stream: z.string().min(1, "Stream is required"),
  year: z.string().min(1, "Year is required")
});

// Define schema for teacher form
const teacherFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  specialization: z.string().min(3, "Specialization must be at least 3 characters"),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  isTA: z.boolean(),
  role: z.string().optional(),
  cabin: z.string().optional(),
});

// Define schema for room form
const roomFormSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(1, "Room number is required"),
  capacity: z.coerce.number().min(1, "At least 1 person capacity"),
  type: z.enum(["classroom", "lab"] as const, {
    required_error: "Please select a room type",
  }),
});

type FormSubject = z.infer<typeof subjectFormSchema>;
type FormTeacher = z.infer<typeof teacherFormSchema>;
type FormRoom = z.infer<typeof roomFormSchema>;

const DataInput = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [subjectNameError, setSubjectNameError] = useState("");
  const [subjectCodeError, setSubjectCodeError] = useState("");
  const [teacherNameError, setTeacherNameError] = useState("");
  const [teacherEmailError, setTeacherEmailError] = useState("");
  const [roomNumberError, setRoomNumberError] = useState("");

  // Subject form
  const subjectForm = useForm<FormSubject>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      code: "",
      credits: 3,
      lectures: 3,
      tutorials: 1,
      practicals: 0,
      stream: "",
      year: "1",
    },
  });

  // Teacher form
  const teacherForm = useForm<FormTeacher>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      email: "",
      specialization: "",
      subjects: [],
      isTA: false,
      role: "",
      cabin: "",
    },
  });

  // Room form
  const roomForm = useForm<FormRoom>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      number: "",
      capacity: 60,
      type: "classroom",
    },
  });

  // Fetch subjects
  const { 
    data: subjects = [], 
    isLoading: isLoadingSubjects,
    isError: isSubjectsError
  } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  // Fetch teachers
  const { 
    data: teachers = [], 
    isLoading: isLoadingTeachers,
    isError: isTeachersError
  } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers
  });

  // Fetch rooms
  const { 
    data: rooms = [], 
    isLoading: isLoadingRooms,
    isError: isRoomsError
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  });

  // Add subject mutation
  const addSubjectMutation = useMutation({
    mutationFn: (subject: Omit<Subject, 'id'>) => addSubject(subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Subject Added",
        description: "The subject has been added successfully."
      });
      subjectForm.reset();
      setIsSubjectDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error adding subject:', error);
      toast({
        title: "Error",
        description: "Failed to add subject. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update subject mutation
  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, subject }: { id: string, subject: Partial<Subject> }) => updateSubject(id, subject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Subject Updated",
        description: "The subject has been updated successfully."
      });
      subjectForm.reset();
      setIsSubjectDialogOpen(false);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating subject:', error);
      toast({
        title: "Error",
        description: "Failed to update subject. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete subject mutation
  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Subject Deleted",
        description: "The subject has been deleted successfully."
      });
    },
    onError: (error) => {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error",
        description: "Failed to delete subject. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Add teacher mutation
  const addTeacherMutation = useMutation({
    mutationFn: (teacher: Omit<Teacher, 'id'>) => addTeacher(teacher),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Added",
        description: "The teacher has been added successfully."
      });
      teacherForm.reset();
      setIsTeacherDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error",
        description: "Failed to add teacher. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update teacher mutation
  const updateTeacherMutation = useMutation({
    mutationFn: ({ id, teacher }: { id: string, teacher: Partial<Teacher> }) => updateTeacher(id, teacher),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Updated",
        description: "The teacher has been updated successfully."
      });
      teacherForm.reset();
      setIsTeacherDialogOpen(false);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating teacher:', error);
      toast({
        title: "Error",
        description: "Failed to update teacher. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete teacher mutation
  const deleteTeacherMutation = useMutation({
    mutationFn: (id: string) => deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Deleted",
        description: "The teacher has been deleted successfully."
      });
    },
    onError: (error) => {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error",
        description: "Failed to delete teacher. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Add room mutation
  const addRoomMutation = useMutation({
    mutationFn: (room: Omit<Room, 'id'>) => addRoom(room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Room Added",
        description: "The room has been added successfully."
      });
      roomForm.reset();
      setIsRoomDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error adding room:', error);
      toast({
        title: "Error",
        description: "Failed to add room. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update room mutation
  const updateRoomMutation = useMutation({
    mutationFn: ({ id, room }: { id: string, room: Partial<Room> }) => updateRoom(id, room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Room Updated",
        description: "The room has been updated successfully."
      });
      roomForm.reset();
      setIsRoomDialogOpen(false);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating room:', error);
      toast({
        title: "Error",
        description: "Failed to update room. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete room mutation
  const deleteRoomMutation = useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Room Deleted",
        description: "The room has been deleted successfully."
      });
    },
    onError: (error) => {
      console.error('Error deleting room:', error);
      toast({
        title: "Error",
        description: "Failed to delete room. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Check for duplicate subject name or code
  const checkDuplicateSubject = (data: FormSubject): boolean => {
    setSubjectNameError("");
    setSubjectCodeError("");
    
    const nameExists = subjects.some(subject => 
      subject.name.toLowerCase() === data.name.toLowerCase() && 
      (!data.id || subject.id !== data.id)
    );
    
    const codeExists = subjects.some(subject => 
      subject.code.toLowerCase() === data.code.toLowerCase() && 
      (!data.id || subject.id !== data.id)
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

  // Handle subject form submission
  const onSubjectSubmit = (data: FormSubject) => {
    // Check for duplicates
    if (checkDuplicateSubject(data)) {
      return;
    }
    
    if (isEditing && data.id) {
      // Update existing subject
      const subjectData: Partial<Subject> = {
        name: data.name,
        code: data.code,
        credits: data.credits,
        lectures: data.lectures,
        tutorials: data.tutorials,
        practicals: data.practicals,
        stream: data.stream,
        year: data.year
      };
      updateSubjectMutation.mutate({ id: data.id, subject: subjectData });
    } else {
      // Add new subject
      const newSubject: Omit<Subject, 'id'> = {
        name: data.name,
        code: data.code,
        credits: data.credits,
        lectures: data.lectures,
        tutorials: data.tutorials,
        practicals: data.practicals,
        stream: data.stream,
        year: data.year
      };
      addSubjectMutation.mutate(newSubject);
    }
  };

  // Edit subject
  const editSubject = (subject: Subject) => {
    subjectForm.reset(subject);
    setIsEditing(true);
    setIsSubjectDialogOpen(true);
  };

  // Delete subject
  const handleDeleteSubject = (id: string) => {
    deleteSubjectMutation.mutate(id);
  };

  // Check for duplicate teacher email or name
  const checkDuplicateTeacher = (data: FormTeacher): boolean => {
    setTeacherNameError("");
    setTeacherEmailError("");
    
    const nameExists = teachers.some(teacher => 
      teacher.name.toLowerCase() === data.name.toLowerCase() && 
      (!data.id || teacher.id !== data.id)
    );
    
    const emailExists = teachers.some(teacher => 
      teacher.email.toLowerCase() === data.email.toLowerCase() && 
      (!data.id || teacher.id !== data.id)
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

  // Handle teacher form submission
  const onTeacherSubmit = (data: FormTeacher) => {
    // Check for duplicates
    if (checkDuplicateTeacher(data)) {
      return;
    }
    
    if (isEditing && data.id) {
      // Update existing teacher
      const teacherData: Partial<Teacher> = {
        name: data.name,
        email: data.email,
        specialization: data.specialization,
        subjects: data.subjects,
        isTA: data.isTA,
        role: data.role,
        cabin: data.cabin
      };
      updateTeacherMutation.mutate({ id: data.id, teacher: teacherData });
    } else {
      // Add new teacher
      const newTeacher: Omit<Teacher, 'id'> = {
        name: data.name,
        email: data.email,
        specialization: data.specialization,
        subjects: data.subjects,
        isTA: data.isTA,
        role: data.role,
        cabin: data.cabin
      };
      addTeacherMutation.mutate(newTeacher);
    }
  };

  // Edit teacher
  const editTeacher = (teacher: Teacher) => {
    teacherForm.reset(teacher);
    setIsEditing(true);
    setIsTeacherDialogOpen(true);
  };

  // Delete teacher
  const handleDeleteTeacher = (id: string) => {
    deleteTeacherMutation.mutate(id);
  };

  // Check for duplicate room number
  const checkDuplicateRoom = (data: FormRoom): boolean => {
    setRoomNumberError("");
    
    const numberExists = rooms.some(room => 
      room.number.toLowerCase() === data.number.toLowerCase() && 
      (!data.id || room.id !== data.id)
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

  // Handle room form submission
  const onRoomSubmit = (data: FormRoom) => {
    // Check for duplicates
    if (checkDuplicateRoom(data)) {
      return;
    }
    
    if (isEditing && data.id) {
      // Update existing room
      const roomData: Partial<Room> = {
        number: data.number,
        capacity: data.capacity,
        type: data.type
      };
      updateRoomMutation.mutate({ id: data.id, room: roomData });
    } else {
      // Add new room
      const newRoom: Omit<Room, 'id'> = {
        number: data.number,
        capacity: data.capacity,
        type: data.type
      };
      addRoomMutation.mutate(newRoom);
    }
  };

  // Edit room
  const editRoom = (room: Room) => {
    roomForm.reset(room);
    setIsEditing(true);
    setIsRoomDialogOpen(true);
  };

  // Delete room
  const handleDeleteRoom = (id: string) => {
    deleteRoomMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Data Management"
        description="Manage your institution's core data"
        icon={<Database className="h-6 w-6" />}
      />

      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Academic Subjects</h2>
            <Button onClick={() => {
              subjectForm.reset({
                name: "",
                code: "",
                credits: 3,
                lectures: 3,
                tutorials: 1,
                practicals: 0,
                stream: "",
                year: "1"
              });
              setIsEditing(false);
              setIsSubjectDialogOpen(true);
            }} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Subject
            </Button>
          </div>

          {isLoadingSubjects ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p>Loading subjects...</p>
              </CardContent>
            </Card>
          ) : isSubjectsError ? (
            <Card>
              <CardContent className="py-10 text-center text-destructive">
                <p>Error loading subjects. Please try again.</p>
              </CardContent>
            </Card>
          ) : subjects.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No Subjects Added</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Start by adding your first academic subject
                </p>
                <Button onClick={() => {
                  subjectForm.reset();
                  setIsEditing(false);
                  setIsSubjectDialogOpen(true);
                }} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Subject
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {subjects.map((subject) => (
                <Card key={subject.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        Code: {subject.code} • Credits: {subject.credits} • Stream: {subject.stream} • Year: {subject.year}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        LTPC: L{subject.lectures || 0}-T{subject.tutorials || 0}-P{subject.practicals || 0}-C{subject.credits}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editSubject(subject)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSubject(subject.id!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Teachers</h2>
            <Button onClick={() => {
              teacherForm.reset({
                name: "",
                email: "",
                specialization: "",
                subjects: [],
                isTA: false,
                role: "",
                cabin: ""
              });
              setIsEditing(false);
              setIsTeacherDialogOpen(true);
            }} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Teacher
            </Button>
          </div>

          {isLoadingTeachers ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p>Loading teachers...</p>
              </CardContent>
            </Card>
          ) : isTeachersError ? (
            <Card>
              <CardContent className="py-10 text-center text-destructive">
                <p>Error loading teachers. Please try again.</p>
              </CardContent>
            </Card>
          ) : teachers.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No Teachers Added</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Start by adding your first teacher
                </p>
                <Button onClick={() => {
                  teacherForm.reset();
                  setIsEditing(false);
                  setIsTeacherDialogOpen(true);
                }} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Teacher
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {teachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{teacher.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        Email: {teacher.email} • Specialization: {teacher.specialization}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Role: {teacher.role || "N/A"} • TA: {teacher.isTA ? "Yes" : "No"} • Cabin: {teacher.cabin || "N/A"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editTeacher(teacher)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTeacher(teacher.id!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Rooms</h2>
            <Button onClick={() => {
              roomForm.reset({
                number: "",
                capacity: 60,
                type: "classroom"
              });
              setIsEditing(false);
              setIsRoomDialogOpen(true);
            }} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Room
            </Button>
          </div>

          {isLoadingRooms ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p>Loading rooms...</p>
              </CardContent>
            </Card>
          ) : isRoomsError ? (
            <Card>
              <CardContent className="py-10 text-center text-destructive">
                <p>Error loading rooms. Please try again.</p>
              </CardContent>
            </Card>
          ) : rooms.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No Rooms Added</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Start by adding your first room
                </p>
                <Button onClick={() => {
                  roomForm.reset();
                  setIsEditing(false);
                  setIsRoomDialogOpen(true);
                }} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Room {room.number}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        Capacity: {room.capacity} • Type: {room.type}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editRoom(room)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteRoom(room.id!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Subject Dialog */}
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Subject" : "Add New Subject"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modify the subject details below" : "Enter the details for the new academic subject"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...subjectForm}>
            <form onSubmit={subjectForm.handleSubmit(onSubjectSubmit)} className="space-y-4">
              <FormField
                control={subjectForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Data Structures and Algorithms" {...field} />
                    </FormControl>
                    <FormDescription>
                      The full name of the subject
                    </FormDescription>
                    {subjectNameError && (
                      <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{subjectNameError}</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={subjectForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CSE301" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique code to identify the subject
                    </FormDescription>
                    {subjectCodeError && (
                      <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{subjectCodeError}</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={subjectForm.control}
                  name="lectures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lectures (per week)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={10} {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of lecture hours per week
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={subjectForm.control}
                  name="tutorials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tutorials (per week)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={10} {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of tutorial hours per week
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={subjectForm.control}
                  name="practicals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Practicals (per week)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={10} {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of practical sessions (2 hours each)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={subjectForm.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={10} {...field} />
                      </FormControl>
                      <FormDescription>
                        Total credits for the subject
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={subjectForm.control}
                  name="stream"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stream</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CSE, ECE" {...field} />
                      </FormControl>
                      <FormDescription>
                        The academic stream this subject belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={subjectForm.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                        </select>
                      </FormControl>
                      <FormDescription>
                        The academic year this subject is taught in
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  subjectForm.reset();
                  setIsSubjectDialogOpen(false);
                  setIsEditing(false);
                  setSubjectNameError("");
                  setSubjectCodeError("");
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Save Changes" : "Add Subject"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Teacher Dialog */}
      <Dialog open={isTeacherDialogOpen} onOpenChange={setIsTeacherDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modify the teacher details below" : "Enter the details for the new teacher"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...teacherForm}>
            <form onSubmit={teacherForm.handleSubmit(onTeacherSubmit)} className="space-y-4">
              <FormField
                control={teacherForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      The full name of the teacher
                    </FormDescription>
                    {teacherNameError && (
                      <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{teacherNameError}</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., john@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      The email address of the teacher
                    </FormDescription>
                    {teacherEmailError && (
                      <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{teacherEmailError}</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science" {...field} />
                    </FormControl>
                    <FormDescription>
                      The teacher's area of expertise
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="subjects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subjects</FormLabel>
                    <FormControl>
                      <select
                        multiple
                        className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                          field.onChange(selectedOptions);
                        }}
                      >
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      Select subjects taught by the teacher
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="isTA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is Teaching Assistant (TA)?</FormLabel>
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Teacher, HOD, TA" {...field} />
                    </FormControl>
                    <FormDescription>
                      The role of the staff member (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={teacherForm.control}
                name="cabin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cabin</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Room 101" {...field} />
                    </FormControl>
                    <FormDescription>
                      The cabin or office room of the teacher (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  teacherForm.reset();
                  setIsTeacherDialogOpen(false);
                  setIsEditing(false);
                  setTeacherNameError("");
                  setTeacherEmailError("");
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Save Changes" : "Add Teacher"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Room Dialog */}
      <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Room" : "Add New Room"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modify the room details below" : "Enter the details for the new room"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...roomForm}>
            <form onSubmit={roomForm.handleSubmit(onRoomSubmit)} className="space-y-4">
              <FormField
                control={roomForm.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 101" {...field} />
                    </FormControl>
                    <FormDescription>
                      The room number or identifier
                    </FormDescription>
                    {roomNumberError && (
                      <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{roomNumberError}</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={roomForm.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum number of people the room can accommodate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={roomForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="classroom">Classroom</option>
                        <option value="lab">Lab</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Select the type of room
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  roomForm.reset();
                  setIsRoomDialogOpen(false);
                  setIsEditing(false);
                  setRoomNumberError("");
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Save Changes" : "Add Room"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataInput;
