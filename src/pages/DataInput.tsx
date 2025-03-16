
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, User, Building, BookOpen, Plus, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const DataInput = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("subjects");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [newSubjectOpen, setNewSubjectOpen] = useState(false);
  const [newTeacherOpen, setNewTeacherOpen] = useState(false);
  const [newRoomOpen, setNewRoomOpen] = useState(false);

  // Form states
  const [newSubject, setNewSubject] = useState({
    id: "",
    name: "",
    code: "",
    stream: "",
    year: "",
    semester: "",
    credits: "3",
    hasLab: false,
    hasTutorial: false
  });
  
  const [newTeacher, setNewTeacher] = useState({
    id: "",
    name: "",
    email: "",
    specialization: "",
    subjects: []
  });
  
  const [newRoom, setNewRoom] = useState({
    id: "",
    number: "",
    type: "classroom",
    capacity: "40",
    floor: "1",
    building: "Main"
  });

  const handleAddSubject = () => {
    const subjectId = `SUB${subjects.length + 1}`;
    const updatedSubject = { ...newSubject, id: subjectId };
    setSubjects([...subjects, updatedSubject]);
    saveToLocalStorage('subjects', [...subjects, updatedSubject]);
    
    toast({
      title: "Subject Added",
      description: `${updatedSubject.name} has been added successfully.`
    });
    
    // Reset form
    setNewSubject({
      id: "",
      name: "",
      code: "",
      stream: "",
      year: "",
      semester: "",
      credits: "3",
      hasLab: false,
      hasTutorial: false
    });
    setNewSubjectOpen(false);
  };

  const handleAddTeacher = () => {
    const teacherId = `TCH${teachers.length + 1}`;
    const updatedTeacher = { ...newTeacher, id: teacherId };
    setTeachers([...teachers, updatedTeacher]);
    saveToLocalStorage('teachers', [...teachers, updatedTeacher]);
    
    toast({
      title: "Teacher Added",
      description: `${updatedTeacher.name} has been added successfully.`
    });
    
    // Reset form
    setNewTeacher({
      id: "",
      name: "",
      email: "",
      specialization: "",
      subjects: []
    });
    setNewTeacherOpen(false);
  };

  const handleAddRoom = () => {
    const roomId = `RM${rooms.length + 1}`;
    const updatedRoom = { ...newRoom, id: roomId };
    setRooms([...rooms, updatedRoom]);
    saveToLocalStorage('rooms', [...rooms, updatedRoom]);
    
    toast({
      title: "Room Added",
      description: `${updatedRoom.number} has been added successfully.`
    });
    
    // Reset form
    setNewRoom({
      id: "",
      number: "",
      type: "classroom",
      capacity: "40",
      floor: "1",
      building: "Main"
    });
    setNewRoomOpen(false);
  };

  const saveToLocalStorage = (key: string, data: any[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
      toast({
        title: "Error",
        description: `Failed to save ${key} data.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Data Management"
        description="Add and manage subjects, teachers, and rooms"
        icon={<Database className="h-6 w-6" />}
      />

      <Tabs defaultValue="subjects" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Subjects</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Teachers</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Rooms</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="animate-slide-in">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-medium">Subjects</h3>
            <Dialog open={newSubjectOpen} onOpenChange={setNewSubjectOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new subject.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject-name">Subject Name</Label>
                      <Input 
                        id="subject-name" 
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                        placeholder="e.g. Data Structures" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject-code">Subject Code</Label>
                      <Input 
                        id="subject-code" 
                        value={newSubject.code}
                        onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                        placeholder="e.g. CS201" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject-stream">Stream</Label>
                      <Select 
                        value={newSubject.stream} 
                        onValueChange={(value) => setNewSubject({...newSubject, stream: value})}
                      >
                        <SelectTrigger id="subject-stream">
                          <SelectValue placeholder="Stream" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CS">Computer Science</SelectItem>
                          <SelectItem value="IT">Information Technology</SelectItem>
                          <SelectItem value="EC">Electronics</SelectItem>
                          <SelectItem value="ME">Mechanical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject-year">Year</Label>
                      <Select 
                        value={newSubject.year} 
                        onValueChange={(value) => setNewSubject({...newSubject, year: value})}
                      >
                        <SelectTrigger id="subject-year">
                          <SelectValue placeholder="Year" />
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
                      <Label htmlFor="subject-semester">Semester</Label>
                      <Select 
                        value={newSubject.semester} 
                        onValueChange={(value) => setNewSubject({...newSubject, semester: value})}
                      >
                        <SelectTrigger id="subject-semester">
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject-credits">Credits</Label>
                      <Select 
                        value={newSubject.credits} 
                        onValueChange={(value) => setNewSubject({...newSubject, credits: value})}
                      >
                        <SelectTrigger id="subject-credits">
                          <SelectValue placeholder="Credits" />
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
                    <div className="col-span-2 flex items-end space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has-lab"
                          checked={newSubject.hasLab}
                          onChange={(e) => setNewSubject({...newSubject, hasLab: e.target.checked})}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="has-lab">Has Lab</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has-tutorial"
                          checked={newSubject.hasTutorial}
                          onChange={(e) => setNewSubject({...newSubject, hasTutorial: e.target.checked})}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="has-tutorial">Has Tutorial</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewSubjectOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddSubject}>Save Subject</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <Card key={subject.id} className="hover-scale">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base font-medium">{subject.name}</CardTitle>
                        <CardDescription>{subject.code}</CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stream:</span>
                        <span>{subject.stream}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year:</span>
                        <span>{subject.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Semester:</span>
                        <span>{subject.semester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Credits:</span>
                        <span>{subject.credits}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex space-x-2">
                      {subject.hasLab && <span className="chip chip-primary">Lab</span>}
                      {subject.hasTutorial && <span className="chip chip-primary">Tutorial</span>}
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No subjects added yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
                  Add subjects to start building your timetable. Each subject can have lectures, labs, and tutorials.
                </p>
                <Button onClick={() => setNewSubjectOpen(true)} variant="outline">Add Your First Subject</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="animate-slide-in">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-medium">Teachers</h3>
            <Dialog open={newTeacherOpen} onOpenChange={setNewTeacherOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Teacher</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new teacher.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacher-name">Full Name</Label>
                      <Input 
                        id="teacher-name" 
                        value={newTeacher.name}
                        onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                        placeholder="e.g. Dr. Jane Smith" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher-email">Email</Label>
                      <Input 
                        id="teacher-email" 
                        type="email"
                        value={newTeacher.email}
                        onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                        placeholder="e.g. jane.smith@college.edu" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-specialization">Specialization</Label>
                    <Input 
                      id="teacher-specialization" 
                      value={newTeacher.specialization}
                      onChange={(e) => setNewTeacher({...newTeacher, specialization: e.target.value})}
                      placeholder="e.g. Machine Learning" 
                    />
                  </div>
                  {/* Subject selection would go here - simplified for now */}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewTeacherOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddTeacher}>Save Teacher</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <Card key={teacher.id} className="hover-scale">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base font-medium">{teacher.name}</CardTitle>
                        <CardDescription>{teacher.email}</CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Specialization:</span>
                        <span>{teacher.specialization}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No teachers added yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
                  Add teachers to assign them to subjects in your timetable.
                </p>
                <Button onClick={() => setNewTeacherOpen(true)} variant="outline">Add Your First Teacher</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="animate-slide-in">
          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-medium">Rooms</h3>
            <Dialog open={newRoomOpen} onOpenChange={setNewRoomOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Room
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Room</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new room or lab.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="room-number">Room Number</Label>
                      <Input 
                        id="room-number" 
                        value={newRoom.number}
                        onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                        placeholder="e.g. 101" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room-type">Type</Label>
                      <Select 
                        value={newRoom.type} 
                        onValueChange={(value) => setNewRoom({...newRoom, type: value})}
                      >
                        <SelectTrigger id="room-type">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classroom">Classroom</SelectItem>
                          <SelectItem value="lab">Laboratory</SelectItem>
                          <SelectItem value="lecture-hall">Lecture Hall</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="room-capacity">Capacity</Label>
                      <Input 
                        id="room-capacity" 
                        type="number"
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})}
                        placeholder="e.g. 40" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room-floor">Floor</Label>
                      <Input 
                        id="room-floor" 
                        value={newRoom.floor}
                        onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                        placeholder="e.g. 1" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="room-building">Building</Label>
                      <Input 
                        id="room-building" 
                        value={newRoom.building}
                        onChange={(e) => setNewRoom({...newRoom, building: e.target.value})}
                        placeholder="e.g. Main" 
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewRoomOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddRoom}>Save Room</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <Card key={room.id} className="hover-scale">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base font-medium">{room.number}</CardTitle>
                        <CardDescription>
                          {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                        </CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        <Building className="h-4 w-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span>{room.capacity} students</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>Floor {room.floor}, {room.building}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No rooms added yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
                  Add classrooms and labs to assign them in your timetable.
                </p>
                <Button onClick={() => setNewRoomOpen(true)} variant="outline">Add Your First Room</Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button 
          variant="outline" 
          className="gap-2 mr-2"
          onClick={() => {
            saveToLocalStorage('subjects', subjects);
            saveToLocalStorage('teachers', teachers);
            saveToLocalStorage('rooms', rooms);
            
            toast({
              title: "Data Saved",
              description: "All data has been saved successfully."
            });
          }}
        >
          <Save className="h-4 w-4" /> Save All Data
        </Button>
        <Button className="gap-2">
          Next: Create Timetable
        </Button>
      </div>
    </div>
  );
};

export default DataInput;
