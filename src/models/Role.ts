
export type RoleType = string;

export interface Role {
  id: string;
  name: RoleType;
  description?: string;
}

// Map role types to display names for UI
export const ROLE_DISPLAY_NAMES: Record<string, string> = {};

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
