import { useUserProfile } from "./use-user-profile";

export type Permission =
  | 'view_dashboard'
  | 'manage_teachers'
  | 'manage_classes'
  | 'manage_students'
  | 'view_organization_data'
  | 'view_all_organizations'
  | 'manage_users'
  | 'manage_roles'
  | 'delete_class';

const rolePermissions: Record<string, Permission[]> = {
  teacher: [
    'view_dashboard',
    'manage_classes',
    'manage_students',
    'delete_class'
  ],
  admin: [
    'view_dashboard',
    'manage_teachers',
    'manage_classes',
    'manage_students',
    'view_organization_data',
    'delete_class'
  ],
  superadmin: [
    'view_dashboard',
    'manage_teachers',
    'manage_classes',
    'manage_students',
    'view_organization_data',
    'view_all_organizations',
    'manage_users',
    'manage_roles',
    'delete_class'
  ]
};

export function usePermissions() {
  const { userProfile } = useUserProfile();

  const hasPermission = (permission: Permission): boolean => {
    if (!userProfile?.role) return false;
    return rolePermissions[userProfile.role]?.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const userRole = userProfile?.role;

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole,
    isTeacher: userRole === 'teacher',
    isAdmin: userRole === 'admin',
    isSuperAdmin: userRole === 'superadmin'
  };
}
