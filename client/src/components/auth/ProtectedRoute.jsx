import { Navigate } from 'react-router-dom';
import { useAppAuth } from '@/hooks/useAppAuth';

/**
 * Redirects unauthenticated users to /sign-in.
 * Shows nothing while Clerk is still loading.
 */
export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useAppAuth();

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
