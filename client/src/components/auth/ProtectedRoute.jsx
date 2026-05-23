import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppAuth } from '@/hooks/useAppAuth';
import { authAPI } from '@/services/api';

/**
 * Redirects unauthenticated users to /sign-in.
 * Shows nothing while Clerk is still loading.
 * Also performs an automatic background sync to guarantee a Supabase profile exists.
 */
export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, getAuthToken } = useAppAuth();

  useEffect(() => {
    if (isSignedIn) {
      getAuthToken().then(token => {
        if (token) {
          authAPI.syncUser(token).catch(err => {
            console.error('Failed to auto-sync user with Supabase:', err);
          });
        }
      });
    }
  }, [isSignedIn, getAuthToken]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
