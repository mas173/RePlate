/**
 * Global auth store using Zustand
 * Tracks user profile, role, and loading state
 */

import { create } from 'zustand';

export type UserRole = 'donor' | 'ngo' | 'admin' | null;

interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  phone?: string;
  organization?: string;
  city?: string;
}

interface AuthState {
  profile: UserProfile | null;
  role: UserRole;
  isProfileLoaded: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setRole: (role: UserRole) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  role: null,
  isProfileLoaded: false,
  setProfile: (profile) =>
    set({
      profile,
      role: profile?.role ?? null,
      isProfileLoaded: true,
    }),
  setRole: (role) => set({ role }),
  reset: () =>
    set({
      profile: null,
      role: null,
      isProfileLoaded: false,
    }),
}));
