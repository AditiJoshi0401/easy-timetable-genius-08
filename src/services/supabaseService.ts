
import { supabase } from '@/integrations/supabase/client';

// Types
export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  stream: string;
  year: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  subjects: string[];
  isTA: boolean;  // Interface uses isTA, but database uses ista
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
  years: number;
}

export interface Division {
  id: string;
  streamId: string;  // Interface uses camelCase, but database uses lowercase streamid
  name: string;
  strength: number;
  year: number;
}

export interface Timetable {
  id: string;
  name: string;
  division_id?: string;
  data: any;
  created_at?: string;
  updated_at?: string;
}

// Subjects
export const fetchSubjects = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*');
  if (error) throw error;
  return data as Subject[];
};

export const addSubject = async (subject: Omit<Subject, 'id'>) => {
  const { data, error } = await supabase
    .from('subjects')
    .insert([subject])
    .select();
  if (error) throw error;
  return data[0] as Subject;
};

export const updateSubject = async (id: string, subject: Partial<Subject>) => {
  const { data, error } = await supabase
    .from('subjects')
    .update(subject)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Subject;
};

export const deleteSubject = async (id: string) => {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Teachers
export const fetchTeachers = async () => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*');
  if (error) throw error;
  
  // Map ista to isTA to match our interface
  return data.map(teacher => ({
    ...teacher,
    isTA: teacher.ista,
  })) as Teacher[];
};

export const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
  // Convert isTA to ista for database
  const dbTeacher = {
    name: teacher.name,
    email: teacher.email,
    specialization: teacher.specialization,
    subjects: teacher.subjects,
    ista: teacher.isTA,
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
  } as Teacher;
};

export const updateTeacher = async (id: string, teacher: Partial<Teacher>) => {
  // Convert isTA to ista for database if it exists
  const dbTeacher: any = { ...teacher };
  if ('isTA' in teacher) {
    dbTeacher.ista = teacher.isTA;
    delete dbTeacher.isTA;
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
  } as Teacher;
};

export const deleteTeacher = async (id: string) => {
  const { error } = await supabase
    .from('teachers')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Rooms
export const fetchRooms = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*');
  if (error) throw error;
  return data as Room[];
};

export const addRoom = async (room: Omit<Room, 'id'>) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([room])
    .select();
  if (error) throw error;
  return data[0] as Room;
};

export const updateRoom = async (id: string, room: Partial<Room>) => {
  const { data, error } = await supabase
    .from('rooms')
    .update(room)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Room;
};

export const deleteRoom = async (id: string) => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Streams
export const fetchStreams = async () => {
  const { data, error } = await supabase
    .from('streams')
    .select('*');
  if (error) throw error;
  return data as Stream[];
};

export const addStream = async (stream: Omit<Stream, 'id'>) => {
  const { data, error } = await supabase
    .from('streams')
    .insert([stream])
    .select();
  if (error) throw error;
  return data[0] as Stream;
};

export const updateStream = async (id: string, stream: Partial<Stream>) => {
  const { data, error } = await supabase
    .from('streams')
    .update(stream)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0] as Stream;
};

export const deleteStream = async (id: string) => {
  const { error } = await supabase
    .from('streams')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Divisions
export const fetchDivisions = async () => {
  const { data, error } = await supabase
    .from('divisions')
    .select('*');
  if (error) throw error;
  
  // Map streamid to streamId to match our interface
  return data.map(division => ({
    ...division,
    streamId: division.streamid,
  })) as Division[];
};

export const addDivision = async (division: Omit<Division, 'id'>) => {
  // Convert streamId to streamid for database
  const dbDivision = {
    name: division.name,
    streamid: division.streamId,
    strength: division.strength,
    year: division.year,
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

export const updateDivision = async (id: string, division: Partial<Division>) => {
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

export const deleteDivision = async (id: string) => {
  const { error } = await supabase
    .from('divisions')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// Timetables
export const fetchTimetable = async (id: string) => {
  const { data, error } = await supabase
    .from('timetables')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data as Timetable | null;
};

export const addTimetable = async (timetable: Omit<Timetable, 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('timetables')
    .insert([timetable])
    .select();
  
  if (error) throw error;
  return data[0] as Timetable;
};

export const updateTimetable = async (id: string, timetable: Partial<Timetable>) => {
  const { data, error } = await supabase
    .from('timetables')
    .update({ ...timetable, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0] as Timetable;
};

export const deleteTimetable = async (id: string) => {
  const { error } = await supabase
    .from('timetables')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

export default supabase;
