/**
 * Custom hook to get the current user's role and auth token
 * Wraps Clerk's useAuth and useUser hooks
 */

import { useAuth, useUser } from '@clerk/clerk-react';

export function useAppAuth() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  const role = user?.publicMetadata?.role || 'donor';
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const email = user?.primaryEmailAddress?.emailAddress || '';

  /**
   * Get a fresh session token for API calls
   */
  const getAuthToken = async () => {
    try {
      const token = await getToken();
      return token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  };

  return {
    isLoaded,
    isSignedIn,
    user,
    role,
    fullName,
    email,
    getAuthToken,
    isDonor: role === 'donor',
    isNGO: role === 'ngo',
    isAdmin: role === 'admin',
  };
}
