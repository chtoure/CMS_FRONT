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
