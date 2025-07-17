// models/user.interface.ts
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  profileId: string;
  roleIds: string[];
}

// models/profile.interface.ts
export interface Profile {
  uid: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  birthDate?: Date;
  avatar?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// models/role.interface.ts
export interface Role {
  uid: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  uid: string;
  name: string;
  resource: string;
  action: string; // 'create', 'read', 'update', 'delete'
  description: string;
}

// models/user-with-details.interface.ts
export interface UserWithDetails extends User {
  profile: Profile;
  roles: Role[];
}