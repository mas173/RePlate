import { useAuth, useUser } from '@clerk/clerk-react';

/**
 * Safe wrapper around Clerk hooks.
 * Returns sensible defaults when Clerk is not configured (no VITE_CLERK_PUBLISHABLE_KEY).
 */
export function useAppAuth() {
  let clerkAuth = { isLoaded: true, isSignedIn: false, getToken: async () => null };
  let clerkUser = { user: null };

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    clerkAuth = useAuth();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    clerkUser = useUser();
  } catch {
    // Clerk not configured — use defaults above
  }

  const { isLoaded, isSignedIn, getToken } = clerkAuth;
  const { user } = clerkUser;

  const role = user?.publicMetadata?.role || null;

  const getAuthToken = async () => {
    try { return await getToken(); }
    catch { return null; }
  };

  return {
    isLoaded,
    isSignedIn: isSignedIn ?? false,
    user,
    role,
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    avatar: user?.imageUrl || '',
    getAuthToken,
    isDonor: role === 'donor',
    isNGO:   role === 'ngo',
    isAdmin: role === 'admin',
  };
}
