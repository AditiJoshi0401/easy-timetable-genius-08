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
  addRoom, updateRoom, deleteRoom,
  Subject, Teacher, Room, Stream
} from "@/services/supabaseService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DuplicateWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  subjectCode: string;
}

const DuplicateWarningDialog: React.FC<DuplicateWarningDialogProps> = ({ isOpen, onClose, subjectName, subjectCode }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Duplicate Subject Detected</DialogTitle>
          <DialogDescription>
            A subject with the same name or code already exists. Are you sure you want to add it?
          </DialogDescription>
        </DialogHeader>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Adding a duplicate subject may cause confusion and errors in timetable generation.
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={() => {
            // Handle the actual addition here, e.g., call a mutation
            // For now, just close the dialog
            onClose();
          }}>Add Anyway</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DataInput = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("subjects");
  const queryClient = useQueryClient();
  
  // Subject form state
  const [newSubject, setNewSubject] = useState<Omit<Subject, 'id'>>({
    name: "",
    code: "",
    credits: 0,
    stream: "",
    year: "",
    lectures: 0,
    tutorials: 0,
    practicals: 0
  });
  
  // Teacher form state
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    specialization: "",
    subjects: [],
    isTA: false,
    cabin: ""
  });

  // Room form state
  const [newRoom, setNewRoom] = useState({
    number: "",
    capacity: 0,
    type: "classroom"
  });

  // Duplicate warning dialog state
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);

  // Data queries
  const { data: streams, isLoading: isLoadingStreams } = useQuery({
    queryKey: ['streams'],
    queryFn: fetchStreams
  });

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: fetchSubjects
  });

  const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers
  });

  const { data: rooms, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms
  });

  // Subject mutations
  const subjectMutation = useMutation({
    mutationFn: (newSubjectData: Omit<Subject, 'id'>) => addSubject(newSubjectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Subject Added",
        description: `${newSubject.name} has been added successfully.`
      });
      setNewSubject({
        name: "",
        code: "",
        credits: 0,
        stream: "",
        year: "",
        lectures: 0,
        tutorials: 0,
        practicals: 0
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

  // Teacher mutations
  const teacherMutation = useMutation({
    mutationFn: (newTeacherData: Omit<Teacher, 'id'>) => addTeacher(newTeacherData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Added",
        description: `${newTeacher.name} has been added successfully.`
      });
      setNewTeacher({
        name: "",
        email: "",
        specialization: "",
        subjects: [],
        isTA: false,
        cabin: ""
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

  // Room mutations
  const roomMutation = useMutation({
    mutationFn: (newRoomData: Omit<Room, 'id'>) => addRoom(newRoomData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Room Added",
        description: `${newRoom.number} has been added successfully.`
      });
      setNewRoom({
        number: "",
        capacity: 0,
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

  // Local storage sync
  useEffect(() => {
    const storedTab = localStorage.getItem('activeTab');
    if (storedTab) {
      setActiveTab(storedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Validation functions
  const checkDuplicateSubject = () => {
    const duplicateName = subjects?.some(subject => subject.name === newSubject.name);
    const duplicateCode = subjects?.some(subject => subject.code === newSubject.code);

    if (duplicateName || duplicateCode) {
      setIsDuplicateDialogOpen(true);
      return true;
    }

    return false;
  };

  // Subject handlers
  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.code || !newSubject.stream || !newSubject.year) {
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
    subjectMutation.mutate(newSubject);
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id);
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast({
        title: "Subject Deleted",
        description: "The subject has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error Deleting Subject",
        description: "There was a problem deleting the subject.",
        variant: "destructive"
      });
    }
  };

  // Teacher handlers
  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.specialization) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the teacher.",
        variant: "destructive"
      });
      return;
    }

    // Add to Supabase via mutation
    teacherMutation.mutate(newTeacher);
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await deleteTeacher(id);
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Teacher Deleted",
        description: "The teacher has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error Deleting Teacher",
        description: "There was a problem deleting the teacher.",
        variant: "destructive"
      });
    }
  };

  // Room handlers
  const handleAddRoom = () => {
    if (!newRoom.number || !newRoom.capacity || !newRoom.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields for the room.",
        variant: "destructive"
      });
      return;
    }

    // Add to Supabase via mutation
    roomMutation.mutate(newRoom);
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteRoom(id);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: "Room Deleted",
        description: "The room has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: "Error Deleting Room",
        description: "There was a problem deleting the room.",
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
                Enter the details of the new subject including LTPC (Lectures, Tutorials, Practicals, Credits)
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
                </div>
                
                {/* Subject Code */}
                <div className="space-y-2">
                  <Label htmlFor="subject-code">Subject Code</Label>
                  <Input
                    id="subject-code"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    placeholder="e.g. CS101"
                  />
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
                            {stream.name} ({stream.code})
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
                      <SelectItem value="1">First Year</SelectItem>
                      <SelectItem value="2">Second Year</SelectItem>
                      <SelectItem value="3">Third Year</SelectItem>
                      <SelectItem value="4">Fourth Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />
              
              {/* LTPC Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">LTPC Structure</h4>
                  <Badge variant="outline" className="text-xs">
                    Lectures(1h=1) | Tutorials(1h=1) | Practicals(2h=1) | Credits
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Lectures */}
                  <div className="space-y-2">
                    <Label htmlFor="subject-lectures">Lectures/Week</Label>
                    <Input
                      id="subject-lectures"
                      type="number"
                      min="0"
                      value={newSubject.lectures}
                      onChange={(e) => setNewSubject({ ...newSubject, lectures: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">1 hour = 1 instance</p>
                  </div>
                  
                  {/* Tutorials */}
                  <div className="space-y-2">
                    <Label htmlFor="subject-tutorials">Tutorials/Week</Label>
                    <Input
                      id="subject-tutorials"
                      type="number"
                      min="0"
                      value={newSubject.tutorials}
                      onChange={(e) => setNewSubject({ ...newSubject, tutorials: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">1 hour = 1 instance</p>
                  </div>
                  
                  {/* Practicals */}
                  <div className="space-y-2">
                    <Label htmlFor="subject-practicals">Practicals/Week</Label>
                    <Input
                      id="subject-practicals"
                      type="number"
                      min="0"
                      value={newSubject.practicals}
                      onChange={(e) => setNewSubject({ ...newSubject, practicals: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">2 hours = 1 instance</p>
                  </div>
                  
                  {/* Credits */}
                  <div className="space-y-2">
                    <Label htmlFor="subject-credits">Credits</Label>
                    <Input
                      id="subject-credits"
                      type="number"
                      min="0"
                      value={newSubject.credits}
                      onChange={(e) => setNewSubject({ ...newSubject, credits: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">Total credits</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleAddSubject} disabled={subjectMutation.isPending}>
                <PlusIcon className="h-4 w-4 mr-2" />
                {subjectMutation.isPending ? "Adding..." : "Add Subject"}
              </Button>
            </CardFooter>
          </Card>

          {/* Current Subjects */}
          <Card>
            <CardHeader>
              <CardTitle>Current Subjects</CardTitle>
              <CardDescription>
                Manage existing subjects and their LTPC requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSubjects ? (
                <div className="flex justify-center py-8">
                  <div className="text-muted-foreground">Loading subjects...</div>
                </div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-8">
                  <BookIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No subjects found</h3>
                  <p className="text-sm text-muted-foreground">Add your first subject to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{subject.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Code: {subject.code}</span>
                          <span>Stream: {subject.stream}</span>
                          <span>Year: {subject.year}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <Badge variant="outline" className="text-xs">
                            L: {subject.lectures} | T: {subject.tutorials} | P: {subject.practicals} | C: {subject.credits}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
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
              <CardDescription>Enter the details of the new teacher.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teacher Name */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Teacher Name</Label>
                  <Input
                    id="teacher-name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </div>

                {/* Teacher Email */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Teacher Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                    placeholder="e.g. john.doe@example.com"
                  />
                </div>

                {/* Teacher Specialization */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-specialization">Specialization</Label>
                  <Input
                    id="teacher-specialization"
                    value={newTeacher.specialization}
                    onChange={(e) => setNewTeacher({ ...newTeacher, specialization: e.target.value })}
                    placeholder="e.g. Computer Science"
                  />
                </div>

                {/* Teacher Cabin */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-cabin">Cabin</Label>
                  <Input
                    id="teacher-cabin"
                    value={newTeacher.cabin}
                    onChange={(e) => setNewTeacher({ ...newTeacher, cabin: e.target.value })}
                    placeholder="e.g. A-101"
                  />
                </div>
              </div>

              {/* Is TA Switch */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="teacher-is-ta">Is TA</Label>
                <Switch
                  id="teacher-is-ta"
                  checked={newTeacher.isTA}
                  onCheckedChange={(checked) => setNewTeacher({ ...newTeacher, isTA: checked })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleAddTeacher} disabled={teacherMutation.isPending}>
                <PlusIcon className="h-4 w-4 mr-2" />
                {teacherMutation.isPending ? "Adding..." : "Add Teacher"}
              </Button>
            </CardFooter>
          </Card>

          {/* Current Teachers */}
          <Card>
            <CardHeader>
              <CardTitle>Current Teachers</CardTitle>
              <CardDescription>Manage existing teachers and their specializations.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTeachers ? (
                <div className="flex justify-center py-8">
                  <div className="text-muted-foreground">Loading teachers...</div>
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No teachers found</h3>
                  <p className="text-sm text-muted-foreground">Add your first teacher to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{teacher.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Email: {teacher.email}</span>
                          <span>Specialization: {teacher.specialization}</span>
                          {teacher.cabin && <span>Cabin: {teacher.cabin}</span>}
                          <span>Is TA: {teacher.isTA ? "Yes" : "No"}</span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Room</CardTitle>
              <CardDescription>Enter the details of the new room.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Room Number */}
                <div className="space-y-2">
                  <Label htmlFor="room-number">Room Number</Label>
                  <Input
                    id="room-number"
                    value={newRoom.number}
                    onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                    placeholder="e.g. 101"
                  />
                </div>

                {/* Room Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="room-capacity">Room Capacity</Label>
                  <Input
                    id="room-capacity"
                    type="number"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 30"
                  />
                </div>

                {/* Room Type */}
                <div className="space-y-2">
                  <Label htmlFor="room-type">Room Type</Label>
                  <Select
                    value={newRoom.type}
                    onValueChange={(value) => setNewRoom({ ...newRoom, type: value as "classroom" | "lab" })}
                  >
                    <SelectTrigger id="room-type">
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classroom">Classroom</SelectItem>
                      <SelectItem value="lab">Lab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleAddRoom} disabled={roomMutation.isPending}>
                <PlusIcon className="h-4 w-4 mr-2" />
                {roomMutation.isPending ? "Adding..." : "Add Room"}
              </Button>
            </CardFooter>
          </Card>

          {/* Current Rooms */}
          <Card>
            <CardHeader>
              <CardTitle>Current Rooms</CardTitle>
              <CardDescription>Manage existing rooms and their capacities.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRooms ? (
                <div className="flex justify-center py-8">
                  <div className="text-muted-foreground">Loading rooms...</div>
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-8">
                  <BuildingIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No rooms found</h3>
                  <p className="text-sm text-muted-foreground">Add your first room to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{room.number}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Capacity: {room.capacity}</span>
                          <span>Type: {room.type}</span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DuplicateWarningDialog
        isOpen={isDuplicateDialogOpen}
        onClose={() => setIsDuplicateDialogOpen(false)}
        subjectName={newSubject.name}
        subjectCode={newSubject.code}
      />
    </div>
  );
};

export default DataInput;
