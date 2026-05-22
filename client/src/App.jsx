import { Routes, Route, Navigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';

// Layout & Auth guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

// Pages
import LandingPage from './pages/LandingPage';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';
import FoodUploadPage from './pages/FoodUploadPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import NotFoundPage from './pages/NotFoundPage';

/**
 * Wraps a page with ProtectedRoute + DashboardLayout.
 * Optionally restricts to specific roles via RoleGuard.
 */
function DashboardRoute({ element, roles }) {
  const content = roles
    ? <RoleGuard roles={roles}>{element}</RoleGuard>
    : element;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {content}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

/**
 * Auth page wrapper — centered card on a subtle gradient background.
 */
function AuthPage({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] dark:bg-[#0F172A] relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-10 -top-20 -right-20 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-teal-400 rounded-full blur-3xl opacity-10 -bottom-20 -left-20 pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Public ───────────────────────────────────── */}
      <Route path="/"        element={<LandingPage />} />

      <Route path="/sign-in/*" element={
        <AuthPage><SignIn routing="path" path="/sign-in" afterSignInUrl="/dashboard" /></AuthPage>
      } />
      <Route path="/sign-up/*" element={
        <AuthPage><SignUp routing="path" path="/sign-up" afterSignUpUrl="/dashboard" /></AuthPage>
      } />

      {/* ── Donor routes ─────────────────────────────── */}
      <Route path="/dashboard"     element={<DashboardRoute element={<DonorDashboard />} />} />
      <Route path="/donate"        element={<DashboardRoute element={<FoodUploadPage />} roles={['donor']} />} />
      <Route path="/donations"     element={<DashboardRoute element={<DonorDashboard />} roles={['donor']} />} />

      {/* ── NGO routes ───────────────────────────────── */}
      <Route path="/available"     element={<DashboardRoute element={<NGODashboard />} roles={['ngo']} />} />
      <Route path="/claims"        element={<DashboardRoute element={<NGODashboard />} roles={['ngo']} />} />

      {/* ── Admin routes ─────────────────────────────── */}
      <Route path="/admin"           element={<DashboardRoute element={<AdminDashboard />} roles={['admin']} />} />
      <Route path="/admin/users"     element={<DashboardRoute element={<AdminDashboard />} roles={['admin']} />} />
      <Route path="/admin/donations" element={<DashboardRoute element={<AdminDashboard />} roles={['admin']} />} />
      <Route path="/admin/analytics" element={<DashboardRoute element={<AdminDashboard />} roles={['admin']} />} />

      {/* ── Shared (any authenticated role) ─────────── */}
      <Route path="/analytics"     element={<DashboardRoute element={<AnalyticsPage />} />} />
      <Route path="/notifications" element={<DashboardRoute element={<DonorDashboard />} />} />
      <Route path="/settings"      element={<DashboardRoute element={<ProfileSettingsPage />} />} />

      {/* ── Fallback ─────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
