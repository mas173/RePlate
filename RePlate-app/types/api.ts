export type UserRole = 'donor' | 'ngo';

export interface BackendProfile {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole | null;
  is_active: boolean;
  avatar_url: string | null;
  phone: string | null;
  organization_name: string | null;
  city: string | null;
}

export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  organization_name?: string;
  city?: string;
  avatar_url?: string;
}

export interface ApiErrorResponse {
  error: string;
}
