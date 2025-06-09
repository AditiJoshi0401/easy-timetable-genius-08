
import { useState, useEffect, useCallback } from "react";
import { Calendar, LayoutGrid, Users, BookOpen, Building, Trash2, Save, Check, AlertCircle, Download, Upload, Clock } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    isTA: false,
    subjects: [] as string[]
  });

  // Rooms state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    number: "",
    type: "classroom" as "classroom" | "lab",
    capacity: 0
  });

  // Streams and divisions for selects
  const { data: streams = [] } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: fetchDivisions
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
      isTA: teacher.isTA,
      subjects: teacher.subjects || []
    });
  };

  const clearTeacherForm = () => {
    setSelectedTeacher(null);
    setTeacherForm({
      name: "",
      email: "",
      specialization: "",
      isTA: false,
      subjects: []
    });
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
          isTA: teacherForm.isTA,
          subjects: teacherForm.subjects
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
          isTA: teacherForm.isTA,
          subjects: teacherForm.subjects
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
      type: room.type,
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
    <div className="space-y-6">
      <SectionHeading
        title="Data Management"
        description="Manage subjects, teachers, and rooms"
        icon={<BookOpen className="h-6 w-6" />}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Subjects</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportSubjects} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={importSubjects} className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

          <div className="overflow-auto max-h-[400px] border rounded-md">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2 border-b">Name</th>
                  <th className="p-2 border-b">Code</th>
                  <th className="p-2 border-b">Stream</th>
                  <th className="p-2 border-b">Year</th>
                  <th className="p-2 border-b">L</th>
                  <th className="p-2 border-b">T</th>
                  <th className="p-2 border-b">P</th>
                  <th className="p-2 border-b">Credits</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr 
                    key={subject.id} 
                    className={`cursor-pointer ${selectedSubject?.id === subject.id ? "bg-muted" : ""}`}
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <td className="p-2 border-b">{subject.name}</td>
                    <td className="p-2 border-b">{subject.code}</td>
                    <td className="p-2 border-b">{streams.find(s => s.id === subject.stream)?.name || subject.stream}</td>
                    <td className="p-2 border-b">{subject.year}</td>
                    <td className="p-2 border-b">{subject.lectures}</td>
                    <td className="p-2 border-b">{subject.tutorials}</td>
                    <td className="p-2 border-b">{subject.practicals}</td>
                    <td className="p-2 border-b">{subject.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Name</Label>
                <Input 
                  value={subjectForm.name} 
                  onChange={e => handleSubjectFormChange("name", e.target.value)} 
                />
              </div>
              <div>
                <Label>Code</Label>
                <Input 
                  value={subjectForm.code} 
                  onChange={e => handleSubjectFormChange("code", e.target.value)} 
                />
              </div>
              <div>
                <Label>Stream</Label>
                <Select 
                  value={subjectForm.stream} 
                  onValueChange={value => handleSubjectFormChange("stream", value)}
                >
                  <SelectTrigger>
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
                <Label>Year</Label>
                <Input 
                  type="number" 
                  min={1} 
                  value={subjectForm.year} 
                  onChange={e => handleSubjectFormChange("year", e.target.value)} 
                />
              </div>
              <div>
                <Label>Lectures</Label>
                <Input 
                  type="number" 
                  min={0} 
                  value={subjectForm.lectures} 
                  onChange={e => handleSubjectFormChange("lectures", parseInt(e.target.value) || 0)} 
                />
              </div>
              <div>
                <Label>Tutorials</Label>
                <Input 
                  type="number" 
                  min={0} 
                  value={subjectForm.tutorials} 
                  onChange={e => handleSubjectFormChange("tutorials", parseInt(e.target.value) || 0)} 
                />
              </div>
              <div>
                <Label>Practicals</Label>
                <Input 
                  type="number" 
                  min={0} 
                  value={subjectForm.practicals} 
                  onChange={e => handleSubjectFormChange("practicals", parseInt(e.target.value) || 0)} 
                />
              </div>
              <div>
                <Label>Credits</Label>
                <Input 
                  type="number" 
                  min={0} 
                  value={subjectForm.credits} 
                  onChange={e => handleSubjectFormChange("credits", parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveSubject}>
                {selectedSubject ? "Update Subject" : "Add Subject"}
              </Button>
              {selectedSubject && (
                <Button variant="destructive" onClick={deleteSelectedSubject}>
                  Delete Subject
                </Button>
              )}
              <Button variant="outline" onClick={clearSubjectForm}>
                Clear
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Teachers</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportTeachers} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={importTeachers} className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

          <div className="overflow-auto max-h-[400px] border rounded-md">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2 border-b">Name</th>
                  <th className="p-2 border-b">Email</th>
                  <th className="p-2 border-b">Specialization</th>
                  <th className="p-2 border-b">TA</th>
                  <th className="p-2 border-b">Subjects</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => (
                  <tr 
                    key={teacher.id} 
                    className={`cursor-pointer ${selectedTeacher?.id === teacher.id ? "bg-muted" : ""}`}
                    onClick={() => handleTeacherSelect(teacher)}
                  >
                    <td className="p-2 border-b">{teacher.name}</td>
                    <td className="p-2 border-b">{teacher.email}</td>
                    <td className="p-2 border-b">{teacher.specialization}</td>
                    <td className="p-2 border-b">{teacher.isTA ? "Yes" : "No"}</td>
                    <td className="p-2 border-b">
                      {teacher.subjects?.map(subjId => subjects.find(s => s.id === subjId)?.name).filter(Boolean).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Name</Label>
                <Input 
                  value={teacherForm.name} 
                  onChange={e => handleTeacherFormChange("name", e.target.value)} 
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={teacherForm.email} 
                  onChange={e => handleTeacherFormChange("email", e.target.value)} 
                />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input 
                  value={teacherForm.specialization} 
                  onChange={e => handleTeacherFormChange("specialization", e.target.value)} 
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input 
                  type="checkbox" 
                  checked={teacherForm.isTA} 
                  onChange={e => handleTeacherFormChange("isTA", e.target.checked)} 
                  id="isTA"
                />
                <Label htmlFor="isTA">Teaching Assistant</Label>
              </div>
              <div className="md:col-span-3">
                <Label>Subjects</Label>
                <Select 
                  value={teacherForm.subjects.join(",")} 
                  onValueChange={value => handleTeacherFormChange("subjects", value ? value.split(",") : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveTeacher}>
                {selectedTeacher ? "Update Teacher" : "Add Teacher"}
              </Button>
              {selectedTeacher && (
                <Button variant="destructive" onClick={deleteSelectedTeacher}>
                  Delete Teacher
                </Button>
              )}
              <Button variant="outline" onClick={clearTeacherForm}>
                Clear
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Rooms</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportRooms} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={importRooms} className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

          <div className="overflow-auto max-h-[400px] border rounded-md">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2 border-b">Number</th>
                  <th className="p-2 border-b">Type</th>
                  <th className="p-2 border-b">Capacity</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr 
                    key={room.id} 
                    className={`cursor-pointer ${selectedRoom?.id === room.id ? "bg-muted" : ""}`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <td className="p-2 border-b">{room.number}</td>
                    <td className="p-2 border-b">{room.type}</td>
                    <td className="p-2 border-b">{room.capacity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Number</Label>
                <Input 
                  value={roomForm.number} 
                  onChange={e => handleRoomFormChange("number", e.target.value)} 
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select 
                  value={roomForm.type} 
                  onValueChange={(value: "classroom" | "lab") => handleRoomFormChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capacity</Label>
                <Input 
                  type="number" 
                  min={1} 
                  value={roomForm.capacity} 
                  onChange={e => handleRoomFormChange("capacity", parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveRoom}>
                {selectedRoom ? "Update Room" : "Add Room"}
              </Button>
              {selectedRoom && (
                <Button variant="destructive" onClick={deleteSelectedRoom}>
                  Delete Room
                </Button>
              )}
              <Button variant="outline" onClick={clearRoomForm}>
                Clear
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataInput;
