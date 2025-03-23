
import { useState, useEffect } from "react";
import { Database, PlusCircle, Edit, Trash2, CheckCircle2, XCircle, BookOpen, Users } from "lucide-react";
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

// Define schema for stream form
const streamFormSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(2, "Code must be at least 2 characters"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  years: z.coerce.number().min(1, "At least 1 year").max(6, "Maximum 6 years"),
});

// Define schema for division form
const divisionFormSchema = z.object({
  id: z.string().optional(),
  streamId: z.string(),
  name: z.string().min(1, "Division name is required"),
  strength: z.coerce.number().min(1, "At least 1 student required"),
  year: z.coerce.number().min(1, "Year is required")
});

type Stream = z.infer<typeof streamFormSchema>;
type Division = z.infer<typeof divisionFormSchema>;

const StreamsManager = () => {
  const { toast } = useToast();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isStreamDialogOpen, setIsStreamDialogOpen] = useState(false);
  const [isDivisionDialogOpen, setIsDivisionDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(1);

  // Stream form
  const streamForm = useForm<Stream>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      code: "",
      name: "",
      years: 4,
    },
  });

  // Division form
  const divisionForm = useForm<Division>({
    resolver: zodResolver(divisionFormSchema),
    defaultValues: {
      streamId: "",
      name: "",
      strength: 60,
      year: 1
    },
  });

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedStreams = localStorage.getItem('streams');
      const storedDivisions = localStorage.getItem('divisions');
      
      if (storedStreams) setStreams(JSON.parse(storedStreams));
      if (storedDivisions) setDivisions(JSON.parse(storedDivisions));
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (streams.length > 0) {
      localStorage.setItem('streams', JSON.stringify(streams));
    }
  }, [streams]);

  useEffect(() => {
    if (divisions.length > 0) {
      localStorage.setItem('divisions', JSON.stringify(divisions));
    }
  }, [divisions]);

  // Handle stream form submission
  const onStreamSubmit = (data: Stream) => {
    if (isEditing && data.id) {
      // Update existing stream
      setStreams(prev => prev.map(stream => stream.id === data.id ? data : stream));
      toast({
        title: "Stream Updated",
        description: `${data.name} has been updated successfully.`
      });
    } else {
      // Add new stream
      const newStream = {
        ...data,
        id: crypto.randomUUID(),
      };
      setStreams(prev => [...prev, newStream]);
      toast({
        title: "Stream Added",
        description: `${data.name} has been added successfully.`
      });
    }
    
    streamForm.reset();
    setIsStreamDialogOpen(false);
    setIsEditing(false);
  };

  // Handle division form submission
  const onDivisionSubmit = (data: Division) => {
    if (isEditing && data.id) {
      // Update existing division
      setDivisions(prev => prev.map(division => division.id === data.id ? data : division));
      toast({
        title: "Division Updated",
        description: `Division ${data.name} has been updated successfully.`
      });
    } else {
      // Add new division
      const newDivision = {
        ...data,
        id: crypto.randomUUID(),
      };
      setDivisions(prev => [...prev, newDivision]);
      toast({
        title: "Division Added",
        description: `Division ${data.name} has been added successfully.`
      });
    }
    
    divisionForm.reset();
    setIsDivisionDialogOpen(false);
    setIsEditing(false);
  };

  // Delete a stream
  const deleteStream = (id: string) => {
    // Check if there are divisions associated with this stream
    const associatedDivisions = divisions.filter(div => div.streamId === id);
    
    if (associatedDivisions.length > 0) {
      toast({
        title: "Cannot Delete Stream",
        description: "This stream has divisions associated with it. Delete the divisions first.",
        variant: "destructive"
      });
      return;
    }
    
    setStreams(prev => prev.filter(stream => stream.id !== id));
    toast({
      title: "Stream Deleted",
      description: "The stream has been deleted successfully."
    });
  };

  // Delete a division
  const deleteDivision = (id: string) => {
    setDivisions(prev => prev.filter(division => division.id !== id));
    toast({
      title: "Division Deleted",
      description: "The division has been deleted successfully."
    });
  };

  // Edit a stream
  const editStream = (stream: Stream) => {
    streamForm.reset(stream);
    setIsEditing(true);
    setIsStreamDialogOpen(true);
  };

  // Edit a division
  const editDivision = (division: Division) => {
    divisionForm.reset(division);
    setIsEditing(true);
    setIsDivisionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Streams & Divisions"
        description="Manage your institution's academic structure"
        icon={<Database className="h-6 w-6" />}
      />

      <Tabs defaultValue="streams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="divisions">Divisions</TabsTrigger>
        </TabsList>

        <TabsContent value="streams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Academic Streams</h2>
            <Button onClick={() => {
              streamForm.reset({
                code: "",
                name: "",
                years: 4
              });
              setIsEditing(false);
              setIsStreamDialogOpen(true);
            }} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Stream
            </Button>
          </div>

          {streams.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No Streams Added</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Start by adding your first academic stream
                </p>
                <Button onClick={() => {
                  streamForm.reset();
                  setIsEditing(false);
                  setIsStreamDialogOpen(true);
                }} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Stream
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {streams.map((stream) => (
                <Card key={stream.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{stream.name}</h3>
                      <div className="text-sm text-muted-foreground mt-1">
                        Code: {stream.code} • Years: {stream.years}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => editStream(stream)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteStream(stream.id!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="divisions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Divisions</h2>
            <Button 
              onClick={() => {
                divisionForm.reset({
                  streamId: streams.length > 0 ? streams[0].id : "",
                  name: "",
                  strength: 60,
                  year: 1
                });
                setIsEditing(false);
                setIsDivisionDialogOpen(true);
              }} 
              className="gap-2"
              disabled={streams.length === 0}
            >
              <PlusCircle className="h-4 w-4" />
              Add Division
            </Button>
          </div>

          {streams.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No Streams Available</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  You need to add academic streams before adding divisions
                </p>
                <Button onClick={() => {
                  streamForm.reset();
                  setIsEditing(false);
                  setIsStreamDialogOpen(true);
                }} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Stream
                </Button>
              </CardContent>
            </Card>
          ) : divisions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No Divisions Added</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Start by adding your first division
                </p>
                <Button onClick={() => {
                  divisionForm.reset({
                    streamId: streams[0].id,
                    name: "",
                    strength: 60,
                    year: 1
                  });
                  setIsEditing(false);
                  setIsDivisionDialogOpen(true);
                }} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Division
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <Label className="flex items-center mr-2">Filter by Year:</Label>
                {Array.from({ length: Math.max(...streams.map(s => s.years)) }, (_, i) => (
                  <Button 
                    key={i} 
                    variant={selectedYear === i + 1 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setSelectedYear(i + 1)}
                  >
                    Year {i + 1}
                  </Button>
                ))}
              </div>
            
              <div className="grid gap-4">
                {divisions
                  .filter(division => division.year === selectedYear)
                  .map((division) => {
                    const stream = streams.find(s => s.id === division.streamId);
                    return (
                      <Card key={division.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Division {division.name}</h3>
                            <div className="text-sm text-muted-foreground mt-1">
                              {stream?.name} • Year {division.year} • {division.strength} students
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => editDivision(division)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteDivision(division.id!)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog for adding/editing streams */}
      <Dialog open={isStreamDialogOpen} onOpenChange={setIsStreamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Stream" : "Add New Stream"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modify the stream details below" : "Enter the details for the new academic stream"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...streamForm}>
            <form onSubmit={streamForm.handleSubmit(onStreamSubmit)} className="space-y-4">
              <FormField
                control={streamForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., CSE, ECE, MECH" {...field} />
                    </FormControl>
                    <FormDescription>
                      A short code to identify the stream (e.g., CSE for Computer Science)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={streamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Computer Science Engineering" {...field} />
                    </FormControl>
                    <FormDescription>
                      The full name of the academic stream
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={streamForm.control}
                name="years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Years</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={6} {...field} />
                    </FormControl>
                    <FormDescription>
                      The duration of this academic program in years
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  streamForm.reset();
                  setIsStreamDialogOpen(false);
                  setIsEditing(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Save Changes" : "Add Stream"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for adding/editing divisions */}
      <Dialog open={isDivisionDialogOpen} onOpenChange={setIsDivisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Division" : "Add New Division"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modify the division details below" : "Enter the details for the new division"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...divisionForm}>
            <form onSubmit={divisionForm.handleSubmit(onDivisionSubmit)} className="space-y-4">
              <FormField
                control={divisionForm.control}
                name="streamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        {streams.map(stream => (
                          <option key={stream.id} value={stream.id}>
                            {stream.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      Select the academic stream for this division
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={divisionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A, B, C" {...field} />
                    </FormControl>
                    <FormDescription>
                      A name to identify the division (e.g., A, B, C)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={divisionForm.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={6} {...field} />
                    </FormControl>
                    <FormDescription>
                      The year this division belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={divisionForm.control}
                name="strength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Strength</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormDescription>
                      The number of students in this division
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  divisionForm.reset();
                  setIsDivisionDialogOpen(false);
                  setIsEditing(false);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? "Save Changes" : "Add Division"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreamsManager;
