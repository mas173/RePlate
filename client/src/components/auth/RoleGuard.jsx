import { Navigate } from 'react-router-dom';
import { useAppAuth } from '@/hooks/useAppAuth';

/**
 * Renders children only if user has one of the allowed roles.
 * Redirects to /dashboard otherwise.
 *
 * Usage:
 *   <RoleGuard roles={['admin']}>
 *     <AdminPage />
 *   </RoleGuard>
 */
export default function RoleGuard({ children, roles = [] }) {
  const { isLoaded, isSignedIn, role } = useAppAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  if (roles.length && !roles.includes(role)) return <Navigate to="/dashboard" replace />;

  return children;
}
