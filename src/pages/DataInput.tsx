import { useState, useEffect } from "react";
import { Calendar, LayoutGrid, Users, BookOpen, Building, Trash2, Save, Check, AlertCircle, Download, Upload, Clock } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchSubjects, fetchTeachers, fetchRooms, fetchStreams, fetchDivisions,
  addSubject, updateSubject, deleteSubject,
  addTeacher, updateTeacher, deleteTeacher,
  addRoom, updateRoom, deleteRoom,
  exportSubjectsData, importSubjectsData,
  exportTeachersData, importTeachersData,
  exportRoomsData, importRoomsData,
  Subject, Teacher, Room, Stream, Division
} from "@/services/supabaseService";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";

const DataInput = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "subjects";
  const [tab, setTab] = useState(initialTab);

  // Subjects state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    streams: [] as string[],
    semester: "",  // Changed from year to semester
    lectures: 0,
    tutorials: 0,
    practicals: 0,
    credits: 0
  });

  // Teachers state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    specialization: "",
    roles: [] as string[],
    subjects: [] as string[],
    maxLectures: 10,
    maxLabs: 5,
    maxTutorials: 8,
    isTA: false
  });
  const [teacherWarning, setTeacherWarning] = useState<string>("");

  // Rooms state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    number: "",
    type: "classroom" as "classroom" | "lab",
    capacity: 0
  });

  // Available semesters for selected stream
  const [availableSemesters, setAvailableSemesters] = useState<number[]>([]);

  // Streams and divisions for selects
  const { data: streams = [] } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: fetchDivisions
  });

  // Fetch roles from database
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Fetch subjects
  const { data: subjectsData, refetch: refetchSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  // Fetch teachers
  const { data: teachersData, refetch: refetchTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers
  });

  // Fetch rooms
  const { data: roomsData, refetch: refetchRooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  });

  useEffect(() => {
    if (subjectsData) setSubjects(subjectsData);
  }, [subjectsData]);

  useEffect(() => {
    if (teachersData) setTeachers(teachersData);
  }, [teachersData]);

  useEffect(() => {
    if (roomsData) setRooms(roomsData);
  }, [roomsData]);

  // Update available semesters when streams are selected
  useEffect(() => {
    if (subjectForm.streams.length > 0) {
      const selectedStreams = streams.filter(s => subjectForm.streams.includes(s.code));
      if (selectedStreams.length > 0) {
        const maxSemesters = Math.max(...selectedStreams.map(s => s.semesters));
        const semesters = Array.from({ length: maxSemesters }, (_, i) => i + 1);
        setAvailableSemesters(semesters);
      }
    } else {
      setAvailableSemesters([]);
      setSubjectForm(prev => ({ ...prev, semester: "" }));
    }
  }, [subjectForm.streams, streams]);

  // Check for teacher warning when subjects change
  useEffect(() => {
    if (teacherForm.subjects.length > 1) {
      const subjectDetails = teacherForm.subjects.map(subjId => 
        subjects.find(s => s.id === subjId)
      ).filter(Boolean);

      const streamsSemesters: string[] = [];
      subjectDetails.forEach(subj => {
        if (subj?.streams) {
          subj.streams.forEach(stream => {
            streamsSemesters.push(`${stream}-${subj.semester}`);
          });
        }
      });
      const uniqueStreamsSemesters = new Set(streamsSemesters);

      if (streamsSemesters.length !== uniqueStreamsSemesters.size) {
        setTeacherWarning("Warning: This teacher is assigned to multiple subjects from the same stream and semester.");
      } else {
        setTeacherWarning("");
      }
    } else {
      setTeacherWarning("");
    }
  }, [teacherForm.subjects, subjects]);

  // Subject handlers
  const handleSubjectFormChange = (field: string, value: any) => {
    setSubjectForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setSubjectForm({
      name: subject.name,
      code: subject.code,
      streams: subject.streams || [],
      semester: subject.semester.toString(),  // Changed from year to semester
      lectures: subject.lectures,
      tutorials: subject.tutorials,
      practicals: subject.practicals,
      credits: subject.credits
    });
  };

  const clearSubjectForm = () => {
    setSelectedSubject(null);
    setSubjectForm({
      name: "",
      code: "",
      streams: [] as string[],
      semester: "",  // Changed from year to semester
      lectures: 0,
      tutorials: 0,
      practicals: 0,
      credits: 0
    });
  };

  const saveSubject = async () => {
    if (!subjectForm.name || !subjectForm.code || subjectForm.streams.length === 0 || !subjectForm.semester) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the subject.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (selectedSubject) {
        await updateSubject(selectedSubject.id, {
          name: subjectForm.name,
          code: subjectForm.code,
          streams: subjectForm.streams,
          semester: subjectForm.semester,  // Changed from year to semester
          lectures: subjectForm.lectures,
          tutorials: subjectForm.tutorials,
          practicals: subjectForm.practicals,
          credits: subjectForm.credits
        });
        toast({
          title: "Subject Updated",
          description: "Subject details updated successfully."
        });
      } else {
        await addSubject({
          name: subjectForm.name,
          code: subjectForm.code,
          streams: subjectForm.streams,
          semester: subjectForm.semester,  // Changed from year to semester
          lectures: subjectForm.lectures,
          tutorials: subjectForm.tutorials,
          practicals: subjectForm.practicals,
          credits: subjectForm.credits
        });
        toast({
          title: "Subject Added",
          description: "New subject added successfully."
        });
      }
      clearSubjectForm();
      refetchSubjects();
    } catch (error) {
      console.error("Error saving subject:", error);
      toast({
        title: "Error",
        description: "Failed to save subject.",
        variant: "destructive"
      });
    }
  };

  const deleteSelectedSubject = async () => {
    if (!selectedSubject) return;
    try {
      await deleteSubject(selectedSubject.id);
      toast({
        title: "Subject Deleted",
        description: "Subject deleted successfully."
      });
      clearSubjectForm();
      refetchSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast({
        title: "Error",
        description: "Failed to delete subject.",
        variant: "destructive"
      });
    }
  };

  // Teacher handlers
  const handleTeacherFormChange = (field: string, value: any) => {
    setTeacherForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTeacherForm({
      name: teacher.name,
      email: teacher.email,
      specialization: teacher.specialization,
      roles: teacher.roles || [],
      subjects: teacher.subjects || [],
      maxLectures: teacher.maxLectures || 10,
      maxLabs: teacher.maxLabs || 5,
      maxTutorials: teacher.maxTutorials || 8,
      isTA: teacher.isTA || false
    });
  };

  const clearTeacherForm = () => {
    setSelectedTeacher(null);
    setTeacherForm({
      name: "",
      email: "",
      specialization: "",
      roles: [],
      subjects: [],
      maxLectures: 10,
      maxLabs: 5,
      maxTutorials: 8,
      isTA: false
    });
    setTeacherWarning("");
  };

  const handleRoleToggle = (roleName: string) => {
    setTeacherForm(prev => {
      let newRoles;
      let isTA = prev.isTA;
      if (prev.roles.includes(roleName)) {
        newRoles = prev.roles.filter(r => r !== roleName);
        if (roleName === "TA") {
          isTA = false;
        }
      } else {
        newRoles = [...prev.roles, roleName];
        if (roleName === "TA") {
          isTA = true;
        }
      }
      return {
        ...prev,
        roles: newRoles,
        isTA
      };
    });
  };

  const handleSubjectToggle = (subjectId: string) => {
    setTeacherForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(s => s !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const saveTeacher = async () => {
    if (!teacherForm.name || !teacherForm.email || !teacherForm.specialization) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the teacher.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (selectedTeacher) {
        await updateTeacher(selectedTeacher.id, {
          name: teacherForm.name,
          email: teacherForm.email,
          specialization: teacherForm.specialization,
          roles: teacherForm.roles,
          subjects: teacherForm.subjects,
          isTA: teacherForm.isTA,
          maxLectures: teacherForm.maxLectures,
          maxLabs: teacherForm.maxLabs,
          maxTutorials: teacherForm.maxTutorials
        });
        toast({
          title: "Teacher Updated",
          description: "Teacher details updated successfully."
        });
      } else {
        await addTeacher({
          name: teacherForm.name,
          email: teacherForm.email,
          specialization: teacherForm.specialization,
          roles: teacherForm.roles,
          subjects: teacherForm.subjects,
          isTA: teacherForm.isTA,
          maxLectures: teacherForm.maxLectures,
          maxLabs: teacherForm.maxLabs,
          maxTutorials: teacherForm.maxTutorials
        });
        toast({
          title: "Teacher Added",
          description: "New teacher added successfully."
        });
      }
      clearTeacherForm();
      refetchTeachers();
    } catch (error) {
      console.error("Error saving teacher:", error);
      toast({
        title: "Error",
        description: "Failed to save teacher.",
        variant: "destructive"
      });
    }
  };

  const deleteSelectedTeacher = async () => {
    if (!selectedTeacher) return;
    try {
      await deleteTeacher(selectedTeacher.id);
      toast({
        title: "Teacher Deleted",
        description: "Teacher deleted successfully."
      });
      clearTeacherForm();
      refetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast({
        title: "Error",
        description: "Failed to delete teacher.",
        variant: "destructive"
      });
    }
  };

  // Room handlers
  const handleRoomFormChange = (field: string, value: any) => {
    setRoomForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setRoomForm({
      number: room.number,
      type: room.type as "classroom" | "lab",
      capacity: room.capacity
    });
  };

  const clearRoomForm = () => {
    setSelectedRoom(null);
    setRoomForm({
      number: "",
      type: "classroom",
      capacity: 0
    });
  };

  const saveRoom = async () => {
    if (!roomForm.number || !roomForm.type || roomForm.capacity <= 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the room.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (selectedRoom) {
        await updateRoom(selectedRoom.id, {
          number: roomForm.number,
          type: roomForm.type,
          capacity: roomForm.capacity
        });
        toast({
          title: "Room Updated",
          description: "Room details updated successfully."
        });
      } else {
        await addRoom({
          number: roomForm.number,
          type: roomForm.type,
          capacity: roomForm.capacity
        });
        toast({
          title: "Room Added",
          description: "New room added successfully."
        });
      }
      clearRoomForm();
      refetchRooms();
    } catch (error) {
      console.error("Error saving room:", error);
      toast({
        title: "Error",
        description: "Failed to save room.",
        variant: "destructive"
      });
    }
  };

  const deleteSelectedRoom = async () => {
    if (!selectedRoom) return;
    try {
      await deleteRoom(selectedRoom.id);
      toast({
        title: "Room Deleted",
        description: "Room deleted successfully."
      });
      clearRoomForm();
      refetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error",
        description: "Failed to delete room.",
        variant: "destructive"
      });
    }
  };

  // Export and import handlers
  const exportSubjects = () => {
    exportSubjectsData(subjects);
    toast({
      title: "Exported",
      description: "Subjects exported successfully."
    });
  };

  const importSubjects = () => {
    importSubjectsData().then(() => {
      refetchSubjects();
      toast({
        title: "Imported",
        description: "Subjects imported successfully."
      });
    }).catch(() => {
      toast({
        title: "Import Failed",
        description: "Failed to import subjects.",
        variant: "destructive"
      });
    });
  };

  const exportTeachers = () => {
    exportTeachersData(teachers);
    toast({
      title: "Exported",
      description: "Teachers exported successfully."
    });
  };

  const importTeachers = () => {
    importTeachersData().then(() => {
      refetchTeachers();
      toast({
        title: "Imported",
        description: "Teachers imported successfully."
      });
    }).catch(() => {
      toast({
        title: "Import Failed",
        description: "Failed to import teachers.",
        variant: "destructive"
      });
    });
  };

  const exportRooms = () => {
    exportRoomsData(rooms);
    toast({
      title: "Exported",
      description: "Rooms exported successfully."
    });
  };

  const importRooms = () => {
    importRoomsData().then(() => {
      refetchRooms();
      toast({
        title: "Imported",
        description: "Rooms imported successfully."
      });
    }).catch(() => {
      toast({
        title: "Import Failed",
        description: "Failed to import rooms.",
        variant: "destructive"
      });
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Data Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage academic data including subjects, teachers, and rooms</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">Academic Semester 2024-25</span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Rooms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Subject Management
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportSubjects} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={importSubjects} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Add, edit, and manage academic subjects with their credit structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stream</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Semester</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">L</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">T</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {subjects.map(subject => (
                        <tr 
                          key={subject.id} 
                          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            selectedSubject?.id === subject.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                          onClick={() => handleSubjectSelect(subject)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{subject.name}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{subject.code}</td>
                           <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                             {subject.streams.map(streamCode => 
                               streams.find(s => s.code === streamCode)?.name || streamCode
                             ).join(', ')}
                           </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{subject.semester}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{subject.lectures}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{subject.tutorials}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-gray-600 dark:text-gray-400">{subject.practicals}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-center font-medium text-gray-900 dark:text-gray-100">{subject.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="subject-code">Subject Code *</Label>
                  <Input 
                    id="subject-code"
                    value={subjectForm.code} 
                    onChange={e => handleSubjectFormChange("code", e.target.value)}
                    placeholder="e.g., CS101"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="subject-name">Subject Name *</Label>
                  <Input 
                    id="subject-name"
                    value={subjectForm.name} 
                    onChange={e => handleSubjectFormChange("name", e.target.value)}
                    placeholder="Enter subject name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="subject-streams">Streams *</Label>
                  <Select 
                    value={subjectForm.streams.length === 1 ? subjectForm.streams[0] : ""} 
                    onValueChange={value => {
                      const currentStreams = [...subjectForm.streams];
                      if (currentStreams.includes(value)) {
                        // Remove if already selected
                        handleSubjectFormChange("streams", currentStreams.filter(s => s !== value));
                      } else {
                        // Add to selection
                        handleSubjectFormChange("streams", [...currentStreams, value]);
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={subjectForm.streams.length > 0 ? `${subjectForm.streams.length} selected` : "Select Streams"} />
                    </SelectTrigger>
                    <SelectContent>
                      {streams.map(stream => (
                        <SelectItem key={stream.id} value={stream.code}>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={subjectForm.streams.includes(stream.code)}
                              readOnly
                            />
                            {stream.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {subjectForm.streams.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Selected: {subjectForm.streams.map(streamCode => 
                        streams.find(s => s.code === streamCode)?.name || streamCode
                      ).join(', ')}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="subject-semester">Semester *</Label>
                  <Select 
                    value={subjectForm.semester} 
                    onValueChange={value => handleSubjectFormChange("semester", value)}
                    disabled={subjectForm.streams.length === 0}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={subjectForm.streams.length > 0 ? "Select Semester" : "Select Streams First"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map(semester => (
                        <SelectItem key={semester} value={semester.toString()}>{semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lectures">Lectures</Label>
                  <Input 
                    id="lectures"
                    type="number" 
                    min={0} 
                    value={subjectForm.lectures} 
                    onChange={e => handleSubjectFormChange("lectures", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tutorials">Tutorials</Label>
                  <Input 
                    id="tutorials"
                    type="number" 
                    min={0} 
                    value={subjectForm.tutorials} 
                    onChange={e => handleSubjectFormChange("tutorials", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="practicals">Practicals</Label>
                  <Input 
                    id="practicals"
                    type="number" 
                    min={0} 
                    value={subjectForm.practicals} 
                    onChange={e => handleSubjectFormChange("practicals", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="credits">Credits</Label>
                  <Input 
                    id="credits"
                    type="number" 
                    min={0} 
                    value={subjectForm.credits} 
                    onChange={e => handleSubjectFormChange("credits", parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={saveSubject} className="gap-2">
                  <Save className="h-4 w-4" />
                  {selectedSubject ? "Update Subject" : "Add Subject"}
                </Button>
                {selectedSubject && (
                  <Button variant="destructive" onClick={deleteSelectedSubject} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Subject
                  </Button>
                )}
                <Button variant="outline" onClick={clearSubjectForm}>
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Teacher Management
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportTeachers} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={importTeachers} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage teaching staff and their subject assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[300px] sm:max-h-[400px] overflow-auto">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specialization</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roles</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subjects</th>
                          <th className="px-2 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Load</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {teachers.map(teacher => (
                          <tr 
                            key={teacher.id} 
                            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                              selectedTeacher?.id === teacher.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                            }`}
                            onClick={() => handleTeacherSelect(teacher)}
                          >
                            <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900 dark:text-gray-100">{teacher.name}</div>
                            </td>
                            <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-sm">{teacher.email}</td>
                            <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-sm">{teacher.specialization}</td>
                            <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {teacher.roles && teacher.roles.length > 0 
                                  ? teacher.roles.map(roleName => (
                                      <span key={roleName} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {roleName}
                                      </span>
                                    ))
                                  : <span className="text-gray-500 text-xs">No roles</span>
                                }
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-4 text-gray-600 dark:text-gray-400 text-sm">
                              <div className="max-w-xs truncate">
                                {teacher.subjects?.map(subjId => subjects.find(s => s.id === subjId)?.name).filter(Boolean).join(", ") || "No subjects assigned"}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-4 text-center text-gray-600 dark:text-gray-400 text-xs">
                              <div className="space-y-1">
                                <div>L: {teacher.maxLectures || 10}</div>
                                <div>T: {teacher.maxTutorials || 8}</div>
                                <div>P: {teacher.maxLabs || 5}</div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="teacher-name">Name *</Label>
                  <Input 
                    id="teacher-name"
                    value={teacherForm.name} 
                    onChange={e => handleTeacherFormChange("name", e.target.value)}
                    placeholder="Enter teacher name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="teacher-email">Email *</Label>
                  <Input 
                    id="teacher-email"
                    type="email" 
                    value={teacherForm.email} 
                    onChange={e => handleTeacherFormChange("email", e.target.value)}
                    placeholder="teacher@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="teacher-specialization">Specialization *</Label>
                  <Input 
                    id="teacher-specialization"
                    value={teacherForm.specialization} 
                    onChange={e => handleTeacherFormChange("specialization", e.target.value)}
                    placeholder="e.g., Computer Science"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Roles</Label>
                  <div className="mt-1 border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto">
                    {roles.length === 0 ? (
                      <p className="text-sm text-gray-500">No roles available</p>
                    ) : (
                      roles.map(role => (
                        <div key={role.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={teacherForm.roles.includes(role.name)}
                            onCheckedChange={() => handleRoleToggle(role.name)}
                          />
                          <Label htmlFor={`role-${role.id}`} className="text-sm font-normal">
                            {role.name}
                            {role.description && (
                              <span className="text-gray-500 ml-2">({role.description})</span>
                            )}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max-lectures">Max Lectures per Week</Label>
                  <Input 
                    id="max-lectures"
                    type="number" 
                    min={0} 
                    max={50}
                    value={teacherForm.maxLectures} 
                    onChange={e => handleTeacherFormChange("maxLectures", parseInt(e.target.value) || 0)}
                    placeholder="e.g., 10"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-labs">Max Labs per Week</Label>
                  <Input 
                    id="max-labs"
                    type="number" 
                    min={0} 
                    max={30}
                    value={teacherForm.maxLabs} 
                    onChange={e => handleTeacherFormChange("maxLabs", parseInt(e.target.value) || 0)}
                    placeholder="e.g., 5"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-tutorials">Max Tutorials per Week</Label>
                  <Input 
                    id="max-tutorials"
                    type="number" 
                    min={0} 
                    max={30}
                    value={teacherForm.maxTutorials} 
                    onChange={e => handleTeacherFormChange("maxTutorials", parseInt(e.target.value) || 0)}
                    placeholder="e.g., 8"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Assigned Subjects</Label>
                  <div className="mt-2 border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                    {subjects.length === 0 ? (
                      <p className="text-sm text-gray-500">No subjects available</p>
                    ) : (
                      subjects.map(subject => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subject-${subject.id}`}
                            checked={teacherForm.subjects.includes(subject.id)}
                            onCheckedChange={() => handleSubjectToggle(subject.id)}
                          />
                          <Label htmlFor={`subject-${subject.id}`} className="text-sm font-normal">
                            {subject.name} ({subject.code}) - {subject.streams.map(streamCode => 
                              streams.find(s => s.code === streamCode)?.name || streamCode
                            ).join(', ')} Semester {subject.semester}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                  {teacherWarning && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-700">{teacherWarning}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={saveTeacher} className="gap-2">
                  <Save className="h-4 w-4" />
                  {selectedTeacher ? "Update Teacher" : "Add Teacher"}
                </Button>
                {selectedTeacher && (
                  <Button variant="destructive" onClick={deleteSelectedTeacher} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Teacher
                  </Button>
                )}
                <Button variant="outline" onClick={clearTeacherForm}>
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Room Management
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportRooms} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={importRooms} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage classroom and laboratory facilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room Number</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Capacity</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {rooms.map(room => (
                        <tr 
                          key={room.id} 
                          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            selectedRoom?.id === room.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                          onClick={() => handleRoomSelect(room)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{room.number}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              room.type === "lab" 
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}>
                              {room.type === "lab" ? "Laboratory" : "Classroom"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center font-medium text-gray-900 dark:text-gray-100">{room.capacity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="room-number">Room Number *</Label>
                  <Input 
                    id="room-number"
                    value={roomForm.number} 
                    onChange={e => handleRoomFormChange("number", e.target.value)}
                    placeholder="e.g., 101, Lab-A"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="room-type">Room Type *</Label>
                  <Select 
                    value={roomForm.type} 
                    onValueChange={(value: "classroom" | "lab") => handleRoomFormChange("type", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="lab">Laboratory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="room-capacity">Capacity *</Label>
                  <Input 
                    id="room-capacity"
                    type="number" 
                    min={1} 
                    value={roomForm.capacity} 
                    onChange={e => handleRoomFormChange("capacity", parseInt(e.target.value) || 0)}
                    placeholder="e.g., 60"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={saveRoom} className="gap-2">
                  <Save className="h-4 w-4" />
                  {selectedRoom ? "Update Room" : "Add Room"}
                </Button>
                {selectedRoom && (
                  <Button variant="destructive" onClick={deleteSelectedRoom} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Room
                  </Button>
                )}
                <Button variant="outline" onClick={clearRoomForm}>
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataInput;
