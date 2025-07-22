// models/user.interface.ts
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone? : string;
  createdAt: Date;
  updatedAt: Date;
  roleIds: string[];
}

