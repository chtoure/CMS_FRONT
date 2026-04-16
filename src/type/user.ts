// src/types/auth.ts

import type { Role } from "./role";


// Interfaces related to user authentication and profile

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  role_id?: number;
  role: Role | null ;
  isLoggedIn: boolean;
  initials?: string;
  archive: boolean;
}




export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role | null ;
  isLoggedIn: boolean;
  initials?: string;
  archive: boolean;
  status: string;
  isActiveAt: Date | null;
  archivedAt: Date | null;
  isPendingAt: Date | null;
}

export interface userFilter {
  archive: string,
  page?: number
  limit?: number,
  search?: string
}

export interface AuthResponse {
  message: string;
  user: UserProfile;
}


// New interfaces for update profile

export interface UpdateProfileData {
  full_name?: string;
  email?: string;
  password?: string;
  role?: string | null;
}

// export interface UpdateProfileResponse {
//   message: string;
//   user: UserProfile;
// }



// New interfaces for addUser

export interface AddUserData {
  full_name: string;
  email: string;
  role?: string | null;
}

// export interface AddUserResponse {
//   message: string;
//   user: UserProfile;
// }



// Interface for change password
export interface ChangePasswordData {
  newPassword: string;
}

// export interface ChangePasswordResponse {
//   message: string;
//   user: UserProfile;
// }


// Interface
export interface VerifyCode {
  message: string;
}
