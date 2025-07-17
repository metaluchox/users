// models/user.interface.ts
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  roleIds: string[];
}

// models/profile.interface.ts
export interface Profile {
  uid: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// models/role.interface.ts
export interface Role {
  uid: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// models/user-with-details.interface.ts
export interface UserWithDetails extends User {
  profile?: Profile;
  roles: Role[];
}