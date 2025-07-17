// interfaces/user.interface.ts
export interface User {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profileId: string;
  roleIds: string[];
}

// interfaces/profile.interface.ts
export interface Profile {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: string[];
}

// interfaces/role.interface.ts
export interface Role {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: string[];
}

// interfaces/permission.interface.ts
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string; // 'create', 'read', 'update', 'delete'
  resource: string; // 'users', 'products', 'sales', etc.
}

// types/auth.types.ts
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type SystemModule = 'users' | 'products' | 'sales' | 'reports' | 'settings';

// interfaces/user-session.interface.ts
export interface UserSession {
  uid: string;
  email: string;
  fullName: string;
  avatar?: string;
  profile: Profile;
  roles: Role[];
  permissions: string[];
  isSuperAdmin: boolean;
}