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
    stream: "",
    year: "",
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
    role: "",
    subjects: [] as string[]
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

  // Available years for selected stream
  const [availableYears, setAvailableYears] = useState<number[]>([]);

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
      // Fetch roles from the database
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

  // Update available years when stream is selected
  useEffect(() => {
    if (subjectForm.stream) {
      const selectedStream = streams.find(s => s.id === subjectForm.stream);
      if (selectedStream) {
        const years = Array.from({ length: selectedStream.years }, (_, i) => i + 1);
        setAvailableYears(years);
      }
    } else {
      setAvailableYears([]);
      setSubjectForm(prev => ({ ...prev, year: "" }));
    }
  }, [subjectForm.stream, streams]);

  // Check for teacher warning when subjects change
  useEffect(() => {
    if (teacherForm.subjects.length > 1) {
      const subjectDetails = teacherForm.subjects.map(subjId => 
        subjects.find(s => s.id === subjId)
      ).filter(Boolean);

      const streamsYears = subjectDetails.map(subj => `${subj?.stream}-${subj?.year}`);
      const uniqueStreamsYears = new Set(streamsYears);

      if (streamsYears.length !== uniqueStreamsYears.size) {
        setTeacherWarning("Warning: This teacher is assigned to multiple subjects from the same stream and year.");
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
      stream: subject.stream,
      year: subject.year.toString(),
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
      stream: "",
      year: "",
      lectures: 0,
      tutorials: 0,
      practicals: 0,
      credits: 0
    });
  };

  const saveSubject = async () => {
    if (!subjectForm.name || !subjectForm.code || !subjectForm.stream || !subjectForm.year) {
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
          stream: subjectForm.stream,
          year: subjectForm.year,
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
          stream: subjectForm.stream,
          year: subjectForm.year,
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
      role: teacher.role || "",
      subjects: teacher.subjects || []
    });
  };

  const clearTeacherForm = () => {
    setSelectedTeacher(null);
    setTeacherForm({
      name: "",
      email: "",
      specialization: "",
      role: "",
      subjects: []
    });
    setTeacherWarning("");
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
          role: teacherForm.role || null,
          subjects: teacherForm.subjects,
          isTA: false // Fixed property name
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
          role: teacherForm.role || null,
          subjects: teacherForm.subjects,
          isTA: false // Fixed property name
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
          <span className="text-sm text-gray-500">Academic Year 2024-25</span>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
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
                            {streams.find(s => s.id === subject.stream)?.name || subject.stream}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{subject.year}</td>
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
                  <Label htmlFor="subject-stream">Stream *</Label>
                  <Select 
                    value={subjectForm.stream} 
                    onValueChange={value => handleSubjectFormChange("stream", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {streams.map(stream => (
                        <SelectItem key={stream.id} value={stream.id}>{stream.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject-year">Year *</Label>
                  <Select 
                    value={subjectForm.year} 
                    onValueChange={value => handleSubjectFormChange("year", value)}
                    disabled={!subjectForm.stream}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={subjectForm.stream ? "Select Year" : "Select Stream First"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
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
                <div className="max-h-[400px] overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specialization</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subjects</th>
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
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{teacher.name}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{teacher.email}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{teacher.specialization}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {roles.find(r => r.id === teacher.role)?.name || teacher.role || "No Role"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                            <div className="max-w-xs truncate">
                              {teacher.subjects?.map(subjId => subjects.find(s => s.id === subjId)?.name).filter(Boolean).join(", ") || "No subjects assigned"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <Label htmlFor="teacher-role">Role</Label>
                  <Select 
                    value={teacherForm.role} 
                    onValueChange={value => handleTeacherFormChange("role", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Assigned Subjects</Label>
                  <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
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
                            {subject.name} ({subject.code}) - {streams.find(s => s.id === subject.stream)?.name} Year {subject.year}
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
