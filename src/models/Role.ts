
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
