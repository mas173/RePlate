/**
 * useAppAuth hook
 * Provides auth state: isSignedIn, role, token, and profile sync
 */

import { useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '@/store/authStore';
import { authAPI, userAPI } from '@/services/api';

export function useAppAuth() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const { profile, role, isProfileLoaded, setProfile, setRole, reset } =
    useAuthStore();

  const syncProfile = useCallback(async () => {
    if (!isSignedIn) {
      reset();
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      // Sync user with backend (creates profile if first time)
      await authAPI.syncUser(token);

      // Fetch profile from backend
      const profileData = await userAPI.getProfile(token);
      setProfile({
        id: profileData.id,
        clerkId: profileData.clerk_id,
        email: profileData.email,
        fullName: profileData.full_name,
        role: profileData.role,
        isActive: profileData.is_active,
        avatarUrl: profileData.avatar_url,
        phone: profileData.phone,
        organization: profileData.organization,
        city: profileData.city,
      });
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  }, [isSignedIn, getToken, setProfile, reset]);

  useEffect(() => {
    if (isLoaded && isSignedIn && !isProfileLoaded) {
      syncProfile();
    }
    if (isLoaded && !isSignedIn) {
      reset();
    }
  }, [isLoaded, isSignedIn, isProfileLoaded, syncProfile, reset]);

  return {
    isSignedIn: !!isSignedIn,
    isLoaded,
    isProfileLoaded,
    role,
    profile,
    user,
    getToken,
    syncProfile,
    setRole,
  };
}
