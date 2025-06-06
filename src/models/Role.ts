
export type RoleType = string;

export interface Role {
  id: string;
  name: RoleType;
  description?: string;
  lectures?: number;
  tutorials?: number;
  practical?: number;
  credits?: number;
}

// Map role types to display names for UI
export const ROLE_DISPLAY_NAMES: Record<string, string> = {};

// Map to track lecture assignments per teacher
export const TEACHER_LECTURE_COUNT: Record<string, number> = {};

// Helper function to get role display name
export const getRoleDisplayName = (roleType: RoleType | undefined | null): string => {
  if (!roleType) return '';
  return ROLE_DISPLAY_NAMES[roleType] || roleType;
};

// Helper function to get all role types as an array
export const getAllRoleTypes = (): RoleType[] => {
  return Object.keys(ROLE_DISPLAY_NAMES);
};

// Add a new role to the display names
export const addRoleDisplayName = (role: Role): void => {
  if (!role.name) {
    console.error('Cannot add role with empty name');
    return;
  }
  ROLE_DISPLAY_NAMES[role.name] = role.description || role.name;
};

// Remove a role from the display names
export const removeRoleDisplayName = (roleName: string): void => {
  delete ROLE_DISPLAY_NAMES[roleName];
};

// Update the display name for a role
export const updateRoleDisplayName = (roleName: string, displayName: string): void => {
  ROLE_DISPLAY_NAMES[roleName] = displayName;
};

// Helper functions for teacher lecture count management
export const addLectureToTeacher = (teacherId: string, count: number = 1): void => {
  TEACHER_LECTURE_COUNT[teacherId] = (TEACHER_LECTURE_COUNT[teacherId] || 0) + count;
};

export const removeLectureFromTeacher = (teacherId: string, count: number = 1): void => {
  TEACHER_LECTURE_COUNT[teacherId] = Math.max(0, (TEACHER_LECTURE_COUNT[teacherId] || 0) - count);
};

export const getTeacherLectureCount = (teacherId: string): number => {
  return TEACHER_LECTURE_COUNT[teacherId] || 0;
};

export const resetTeacherLectureCount = (teacherId: string): void => {
  delete TEACHER_LECTURE_COUNT[teacherId];
};
