import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

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

// Custom storage wrapper for expo-secure-store to persist auth state securely
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {}
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {}
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      role: null,
      isProfileLoaded: false,
      setProfile: (profile) =>
        set({
          profile,
          role: profile?.role || null,
          isProfileLoaded: !!profile,
        }),
      setRole: (role) => set({ role }),
      setIsProfileLoaded: (isProfileLoaded) => set({ isProfileLoaded }),
      reset: () => set({ profile: null, role: null, isProfileLoaded: false }),
    }),
    {
      name: 'replate-auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
