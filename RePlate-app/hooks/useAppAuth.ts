import { useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '../store/authStore';
import { authAPI, setApiTokenGetter, userAPI } from '../services/api';

export function useAppAuth() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const { profile, role, isProfileLoaded, setProfile, setRole, reset } = useAuthStore();

  useEffect(() => {
    setApiTokenGetter(getToken);
  }, [getToken]);

  const syncProfile = useCallback(async () => {
    if (!isSignedIn) {
      reset();
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      // Sync user with backend (creates profile on first sign-in)
      await authAPI.syncUser(token);

      // Fetch profile from backend
      const profileData = await userAPI.getProfile(token);
      setProfile({
        id: profileData.id,
        clerkId: profileData.clerk_id,
        email: profileData.email,
        fullName: profileData.first_name 
          ? `${profileData.first_name} ${profileData.last_name || ''}`.trim()
          : null,
        role: profileData.role,
        isActive: profileData.is_active !== false,
        avatarUrl: profileData.avatar_url,
        phone: profileData.phone,
        organization: profileData.organization_name,
        city: profileData.city,
      });
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  }, [isSignedIn, getToken, setProfile, reset]);

  const updateRole = useCallback(async (newRole: 'donor' | 'ngo') => {
    try {
      const token = await getToken();
      if (!token) return;
      await authAPI.updateRole(token, newRole);
      setRole(newRole);
      await syncProfile();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  }, [getToken, setRole, syncProfile]);

  useEffect(() => {
    if (isLoaded && isSignedIn && !isProfileLoaded) {
      syncProfile();
    }
    if (isLoaded && !isSignedIn) {
      if (profile !== null || role !== null || isProfileLoaded !== false) {
        reset();
      }
    }
  }, [isLoaded, isSignedIn, isProfileLoaded, syncProfile, reset, profile, role]);

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
    updateRole,
  };
}
