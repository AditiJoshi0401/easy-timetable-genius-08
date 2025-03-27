
export type RoleType = 'Teacher' | 'TA' | 'HOD' | 'Director' | 'Staff';

export interface Role {
  id: string;
  name: RoleType;
  description?: string;
}

export const DEFAULT_ROLES: Role[] = [
  { id: '1', name: 'Teacher', description: 'Regular teaching faculty' },
  { id: '2', name: 'TA', description: 'Teaching Assistant' },
  { id: '3', name: 'HOD', description: 'Head of Department' },
  { id: '4', name: 'Director', description: 'Program Director' },
  { id: '5', name: 'Staff', description: 'Administrative Staff' }
];

// Map role types to display names for UI
export const ROLE_DISPLAY_NAMES: Record<RoleType, string> = {
  'Teacher': 'Teacher',
  'TA': 'Teaching Assistant',
  'HOD': 'Head of Department',
  'Director': 'Program Director',
  'Staff': 'Administrative Staff'
};

// Helper function to get role display name
export const getRoleDisplayName = (roleType: RoleType | undefined | null): string => {
  if (!roleType) return 'Teacher';
  return ROLE_DISPLAY_NAMES[roleType] || 'Teacher';
};

// Helper function to get all role types as an array
export const getAllRoleTypes = (): RoleType[] => {
  return Object.keys(ROLE_DISPLAY_NAMES) as RoleType[];
};
