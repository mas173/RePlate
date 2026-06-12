import { create } from 'zustand';

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  fullName: string | null;
  role: 'donor' | 'ngo' | null;
  isActive: boolean;
  avatarUrl: string | null;
  phone: string | null;
  organization: string | null;
  city: string | null;
}

interface AuthState {
  profile: UserProfile | null;
  role: 'donor' | 'ngo' | null;
  isProfileLoaded: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setRole: (role: 'donor' | 'ngo' | null) => void;
  setIsProfileLoaded: (isLoaded: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  role: null,
  isProfileLoaded: false,
  setProfile: (profile) => set({ profile, role: profile?.role || null, isProfileLoaded: !!profile }),
  setRole: (role) => set({ role }),
  setIsProfileLoaded: (isProfileLoaded) => set({ isProfileLoaded }),
  reset: () => set({ profile: null, role: null, isProfileLoaded: false }),
}));
