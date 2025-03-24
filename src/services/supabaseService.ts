
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
  isTA: boolean;
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
  streamId: string;
  name: string;
  strength: number;
  year: number;
}

// Subjects
export const fetchSubjects = async () => {
  const { data, error } = await supabase.from('subjects').select('*');
  if (error) throw error;
  return data as Subject[];
};

export const addSubject = async (subject: Omit<Subject, 'id'>) => {
  const { data, error } = await supabase.from('subjects').insert(subject).select();
  if (error) throw error;
  return data[0] as Subject;
};

export const updateSubject = async (id: string, subject: Partial<Subject>) => {
  const { data, error } = await supabase.from('subjects').update(subject).eq('id', id).select();
  if (error) throw error;
  return data[0] as Subject;
};

export const deleteSubject = async (id: string) => {
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// Teachers
export const fetchTeachers = async () => {
  const { data, error } = await supabase.from('teachers').select('*');
  if (error) throw error;
  return data as Teacher[];
};

export const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
  const { data, error } = await supabase.from('teachers').insert(teacher).select();
  if (error) throw error;
  return data[0] as Teacher;
};

export const updateTeacher = async (id: string, teacher: Partial<Teacher>) => {
  const { data, error } = await supabase.from('teachers').update(teacher).eq('id', id).select();
  if (error) throw error;
  return data[0] as Teacher;
};

export const deleteTeacher = async (id: string) => {
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// Rooms
export const fetchRooms = async () => {
  const { data, error } = await supabase.from('rooms').select('*');
  if (error) throw error;
  return data as Room[];
};

export const addRoom = async (room: Omit<Room, 'id'>) => {
  const { data, error } = await supabase.from('rooms').insert(room).select();
  if (error) throw error;
  return data[0] as Room;
};

export const updateRoom = async (id: string, room: Partial<Room>) => {
  const { data, error } = await supabase.from('rooms').update(room).eq('id', id).select();
  if (error) throw error;
  return data[0] as Room;
};

export const deleteRoom = async (id: string) => {
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// Streams
export const fetchStreams = async () => {
  const { data, error } = await supabase.from('streams').select('*');
  if (error) throw error;
  return data as Stream[];
};

export const addStream = async (stream: Omit<Stream, 'id'>) => {
  const { data, error } = await supabase.from('streams').insert(stream).select();
  if (error) throw error;
  return data[0] as Stream;
};

export const updateStream = async (id: string, stream: Partial<Stream>) => {
  const { data, error } = await supabase.from('streams').update(stream).eq('id', id).select();
  if (error) throw error;
  return data[0] as Stream;
};

export const deleteStream = async (id: string) => {
  const { error } = await supabase.from('streams').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// Divisions
export const fetchDivisions = async () => {
  const { data, error } = await supabase.from('divisions').select('*');
  if (error) throw error;
  return data as Division[];
};

export const addDivision = async (division: Omit<Division, 'id'>) => {
  const { data, error } = await supabase.from('divisions').insert(division).select();
  if (error) throw error;
  return data[0] as Division;
};

export const updateDivision = async (id: string, division: Partial<Division>) => {
  const { data, error } = await supabase.from('divisions').update(division).eq('id', id).select();
  if (error) throw error;
  return data[0] as Division;
};

export const deleteDivision = async (id: string) => {
  const { error } = await supabase.from('divisions').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export default supabase;
