import { supabase } from '@/integrations/supabase/client';

// Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  stream: string;  // Now stores stream code directly instead of UUID
  semester: string;  // Changed from year to semester
  lectures: number;
  tutorials: number;
  practicals: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  subjects: string[];
  isTA: boolean;  // Interface uses isTA, but database uses ista
  roles?: string[];  // Changed to array of role names instead of single role ID
  cabin?: string;
  maxLectures?: number;
  maxLabs?: number;
  maxTutorials?: number;
}

export interface Room {
  id: string;
  number: string;
  capacity: number;
  type: "classroom" | "lab";
}

export interface Stream {
  id: string;
  code: string;
  name: string;
  semesters: number;  // Changed from years to semesters
}

export interface Division {
  id: string;
  streamId: string;  // Interface uses camelCase, but database uses lowercase streamid
  name: string;
  strength: number;
  semester: number;  // Changed from year to semester
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Timetable {
  id: string;
  name: string;
  division_id?: string;
  data: any;
  created_at?: string;
  updated_at?: string;
  composite_id?: string; // Adding a field to store our composite key
}

// LocalStorage helpers for timetable drafts
export const saveTimetableDraft = (key: string, data: any): void => {
  try {
    localStorage.setItem(`timetable_draft_${key}`, JSON.stringify({
      data,
      lastUpdated: new Date().toISOString()
    }));
    console.log('Timetable draft saved to localStorage', key);
  } catch (error) {
    console.error('Error saving timetable draft to localStorage:', error);
  }
};

export const getTimetableDraft = (key: string): { data: any, lastUpdated: string } | null => {
  try {
    const saved = localStorage.getItem(`timetable_draft_${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error('Error getting timetable draft from localStorage:', error);
    return null;
  }
};

export const removeTimetableDraft = (key: string): void => {
  try {
    localStorage.removeItem(`timetable_draft_${key}`);
    console.log('Timetable draft removed from localStorage', key);
  } catch (error) {
    console.error('Error removing timetable draft from localStorage:', error);
  }
};

export const getAllTimetableDrafts = (): Record<string, { data: any, lastUpdated: string }> => {
  const drafts: Record<string, { data: any, lastUpdated: string }> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('timetable_draft_')) {
        const draftKey = key.replace('timetable_draft_', '');
        const draftData = localStorage.getItem(key);
        if (draftData) {
          drafts[draftKey] = JSON.parse(draftData);
        }
      }
    }
  } catch (error) {
    console.error('Error getting all timetable drafts from localStorage:', error);
  }
  
  return drafts;
};

// Export/Import functions for data management
export const exportSubjectsData = (subjects: Subject[]): void => {
  const dataStr = JSON.stringify(subjects, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'subjects.json';
  link.click();
  URL.revokeObjectURL(url);
};

export const importSubjectsData = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const subjects = JSON.parse(e.target?.result as string);
            // Handle import logic here
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsText(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    input.click();
  });
};

export const exportTeachersData = (teachers: Teacher[]): void => {
  const dataStr = JSON.stringify(teachers, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'teachers.json';
  link.click();
  URL.revokeObjectURL(url);
};

export const importTeachersData = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const teachers = JSON.parse(e.target?.result as string);
            // Handle import logic here
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsText(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    input.click();
  });
};

export const exportRoomsData = (rooms: Room[]): void => {
  const dataStr = JSON.stringify(rooms, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rooms.json';
  link.click();
  URL.revokeObjectURL(url);
};

export const importRoomsData = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const rooms = JSON.parse(e.target?.result as string);
            // Handle import logic here
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsText(file);
      } else {
        reject(new Error('No file selected'));
      }
    };
    input.click();
  });
};

// Helper to create a proper key-value mapping between composite ID and DB ID
const timetableIdCache: Record<string, string> = {};

// Conflict checking functions
export const isTeacherAvailable = (
  teacherId: string, 
  day: string, 
  time: string, 
  existingTimetables: Timetable[]
): boolean => {
  for (const timetable of existingTimetables) {
    const timetableData = timetable.data;
    if (!timetableData || !timetableData[day] || !timetableData[day][time]) continue;
    
    const slot = timetableData[day][time];
    if (slot && slot.teacher && slot.teacher.id === teacherId) {
      return false;
    }
  }
  return true;
};

export const isRoomAvailable = (
  roomId: string, 
  day: string, 
  time: string, 
  existingTimetables: Timetable[]
): boolean => {
  for (const timetable of existingTimetables) {
    const timetableData = timetable.data;
    if (!timetableData || !timetableData[day] || !timetableData[day][time]) continue;
    
    const slot = timetableData[day][time];
    if (slot && slot.room && slot.room.id === roomId) {
      return false;
    }
  }
  return true;
};

// Subjects
export const fetchSubjects = async (): Promise<Subject[]> => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*');
  if (error) throw error;
  return data as Subject[];
};

export const addSubject = async (subject: Omit<Subject, 'id'>): Promise<Subject> => {
  const { data, error } = await supabase
    .from('subjects')
    .insert([subject])
    .select();
  if (error) throw error;
  return data[0] as Subject;
};

export const updateSubject = async (id: string, subject: Partial<Subject>): Promise<Subject> => {
  const { data, error } = await supabase
    .from('subjects')
    .update(subject)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Subject;
};

export const deleteSubject = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Teachers
export const fetchTeachers = async (): Promise<Teacher[]> => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*');
  if (error) throw error;
  
  // Map ista to isTA and roles array to match our interface
  return data.map(teacher => ({
    ...teacher,
    isTA: teacher.ista,
    roles: teacher.roles || [],
    maxLectures: teacher.max_lectures,
    maxLabs: teacher.max_labs,
    maxTutorials: teacher.max_tutorials,
  })) as Teacher[];
};

export const addTeacher = async (teacher: Omit<Teacher, 'id'>): Promise<Teacher> => {
  // Convert isTA to ista and roles array for database
  const dbTeacher = {
    name: teacher.name,
    email: teacher.email,
    specialization: teacher.specialization,
    subjects: teacher.subjects,
    ista: teacher.isTA,
    roles: teacher.roles || [],
    cabin: teacher.cabin,
    max_lectures: teacher.maxLectures || 10,
    max_labs: teacher.maxLabs || 5,
    max_tutorials: teacher.maxTutorials || 8
  };
  
  const { data, error } = await supabase
    .from('teachers')
    .insert([dbTeacher])
    .select();
  if (error) throw error;
  
  // Map back to our interface
  return {
    ...data[0],
    isTA: data[0].ista,
    roles: data[0].roles || [],
    maxLectures: data[0].max_lectures,
    maxLabs: data[0].max_labs,
    maxTutorials: data[0].max_tutorials,
  } as Teacher;
};

export const updateTeacher = async (id: string, teacher: Partial<Teacher>): Promise<Teacher> => {
  // Convert isTA to ista and roles array for database if they exist
  const dbTeacher: any = { ...teacher };
  if ('isTA' in teacher) {
    dbTeacher.ista = teacher.isTA;
    delete dbTeacher.isTA;
  }
  if ('roles' in teacher) {
    dbTeacher.roles = teacher.roles || [];
  }
  if ('maxLectures' in teacher) {
    dbTeacher.max_lectures = teacher.maxLectures;
    delete dbTeacher.maxLectures;
  }
  if ('maxLabs' in teacher) {
    dbTeacher.max_labs = teacher.maxLabs;
    delete dbTeacher.maxLabs;
  }
  if ('maxTutorials' in teacher) {
    dbTeacher.max_tutorials = teacher.maxTutorials;
    delete dbTeacher.maxTutorials;
  }
  
  const { data, error } = await supabase
    .from('teachers')
    .update(dbTeacher)
    .eq('id', id)
    .select();
  if (error) throw error;
  
  // Map back to our interface
  return {
    ...data[0],
    isTA: data[0].ista,
    roles: data[0].roles || [],
    maxLectures: data[0].max_lectures,
    maxLabs: data[0].max_labs,
    maxTutorials: data[0].max_tutorials,
  } as Teacher;
};

export const deleteTeacher = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('teachers')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Roles
export const fetchRoles = async (): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Role[];
};

export const addRole = async (role: Omit<Role, 'id'>): Promise<Role> => {
  const { data, error } = await supabase
    .from('roles')
    .insert([role])
    .select();
  if (error) throw error;
  return data[0] as Role;
};

export const updateRole = async (id: string, role: Partial<Role>): Promise<Role> => {
  const { data, error } = await supabase
    .from('roles')
    .update(role)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Role;
};

export const deleteRole = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Rooms
export const fetchRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*');
  if (error) throw error;
  return data as Room[];
};

export const addRoom = async (room: Omit<Room, 'id'>): Promise<Room> => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([room])
    .select();
  if (error) throw error;
  return data[0] as Room;
};

export const updateRoom = async (id: string, room: Partial<Room>): Promise<Room> => {
  const { data, error } = await supabase
    .from('rooms')
    .update(room)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Room;
};

export const deleteRoom = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Streams
export const fetchStreams = async (): Promise<Stream[]> => {
  const { data, error } = await supabase
    .from('streams')
    .select('*');
  if (error) throw error;
  return data as Stream[];
};

export const addStream = async (stream: Omit<Stream, 'id'>): Promise<Stream> => {
  const { data, error } = await supabase
    .from('streams')
    .insert([stream])
    .select();
  if (error) throw error;
  return data[0] as Stream;
};

export const updateStream = async (id: string, stream: Partial<Stream>): Promise<Stream> => {
  const { data, error } = await supabase
    .from('streams')
    .update(stream)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Stream;
};

export const deleteStream = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('streams')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Divisions
export const fetchDivisions = async (): Promise<Division[]> => {
  const { data, error } = await supabase
    .from('divisions')
    .select('*');
  if (error) throw error;
  
  // Map streamid to streamId and semester to match our interface
  return data.map(division => ({
    ...division,
    streamId: division.streamid,
  })) as Division[];
};

export const addDivision = async (division: Omit<Division, 'id'>): Promise<Division> => {
  // Convert streamId to streamid for database
  const dbDivision = {
    name: division.name,
    streamid: division.streamId,
    strength: division.strength,
    semester: division.semester,
  };
  
  const { data, error } = await supabase
    .from('divisions')
    .insert([dbDivision])
    .select();
  if (error) throw error;
  
  // Map back to our interface
  return {
    ...data[0],
    streamId: data[0].streamid,
  } as Division;
};

export const updateDivision = async (id: string, division: Partial<Division>): Promise<Division> => {
  // Convert streamId to streamid for database if it exists
  const dbDivision: any = { ...division };
  if ('streamId' in division) {
    dbDivision.streamid = division.streamId;
    delete dbDivision.streamId;
  }
  
  const { data, error } = await supabase
    .from('divisions')
    .update(dbDivision)
    .eq('id', id)
    .select();
  if (error) throw error;
  
  // Map back to our interface
  return {
    ...data[0],
    streamId: data[0].streamid,
  } as Division;
};

export const deleteDivision = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('divisions')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Fetch all timetables for conflict checking
export const fetchAllTimetables = async (): Promise<Timetable[]> => {
  try {
    console.log("Fetching all timetables for conflict checking");
    
    const { data, error } = await supabase
      .from('timetables')
      .select('*');
    
    if (error) {
      console.error("Error fetching all timetables:", error);
      throw error;
    }
    
    return data as Timetable[];
  } catch (error) {
    console.error("Exception in fetchAllTimetables:", error);
    throw error;
  }
};

// Create a function to get timetable by composite ID
export const fetchTimetableByCompositeId = async (compositeId: string): Promise<Timetable | null> => {
  try {
    console.log("Fetching timetable with composite ID:", compositeId);
    
    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .eq('name', compositeId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching timetable by composite ID:", error);
      throw error;
    }
    
    console.log("Timetable fetch result:", data);
    return data as Timetable | null;
  } catch (error) {
    console.error("Exception in fetchTimetableByCompositeId:", error);
    throw error;
  }
};

// Modified fetch timetable function to use name field instead of ID
export const fetchTimetable = async (compositeId: string): Promise<Timetable | null> => {
  return fetchTimetableByCompositeId(compositeId);
};

export const addTimetable = async (timetable: Omit<Timetable, 'created_at' | 'updated_at'>): Promise<Timetable> => {
  try {
    console.log("Adding timetable:", timetable);
    
    // Ensure the composite ID is stored in the name field for querying
    const timetableToSave = {
      name: timetable.id, // Use the composite ID as the name for querying
      division_id: timetable.division_id,
      data: timetable.data
    };
    
    const { data, error } = await supabase
      .from('timetables')
      .insert([timetableToSave])
      .select();
    
    if (error) {
      console.error("Error adding timetable:", error);
      throw error;
    }
    
    console.log("Added timetable result:", data[0]);
    return {
      ...data[0],
      composite_id: timetable.id // Keep track of the composite ID
    } as Timetable;
  } catch (error) {
    console.error("Exception in addTimetable:", error);
    throw error;
  }
};

export const updateTimetable = async (compositeId: string, timetable: Partial<Timetable>): Promise<Timetable> => {
  try {
    console.log("Updating timetable with composite ID:", compositeId);
    
    // First find the timetable by composite ID (stored in name field)
    const existingTimetable = await fetchTimetableByCompositeId(compositeId);
    
    if (!existingTimetable) {
      throw new Error(`Timetable with composite ID ${compositeId} not found`);
    }
    
    const { data, error } = await supabase
      .from('timetables')
      .update({ 
        data: timetable.data, 
        division_id: timetable.division_id,
        updated_at: new Date().toISOString() 
      })
      .eq('id', existingTimetable.id)
      .select();
    
    if (error) {
      console.error("Error updating timetable:", error);
      throw error;
    }
    
    console.log("Updated timetable result:", data[0]);
    return {
      ...data[0],
      composite_id: compositeId
    } as Timetable;
  } catch (error) {
    console.error("Exception in updateTimetable:", error);
    throw error;
  }
};

export const deleteTimetable = async (compositeId: string): Promise<boolean> => {
  try {
    console.log("Deleting timetable with composite ID:", compositeId);
    
    // First find the timetable by composite ID (stored in name field)
    const existingTimetable = await fetchTimetableByCompositeId(compositeId);
    
    if (!existingTimetable) {
      throw new Error(`Timetable with composite ID ${compositeId} not found`);
    }
    
    const { error } = await supabase
      .from('timetables')
      .delete()
      .eq('id', existingTimetable.id);
    
    if (error) {
      console.error("Error deleting timetable:", error);
      throw error;
    }
    
    console.log("Timetable deleted successfully");
    return true;
  } catch (error) {
    console.error("Exception in deleteTimetable:", error);
    throw error;
  }
};
