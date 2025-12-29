// src/types/auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  role: string | null;
}

export interface AuthResponse {
  message: string;
  user: UserProfile;
}


export interface UpdateProfileData {
  full_name?: string;
  email?: string;
  password?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: UserProfile;
}
