import { Routes, Route } from 'react-router-dom';

// Layout & Auth guards
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

// Pages
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import SSOCallback from './pages/SSOCallback';
import OnboardingPage from './pages/OnboardingPage';
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



export default function App() {
  return (
    <Routes>
      {/* ── Public ───────────────────────────────────── */}
      <Route path="/"            element={<LandingPage />} />
      <Route path="/sign-in/*"   element={<SignInPage />} />
      <Route path="/sign-up/*"   element={<SignUpPage />} />
      <Route path="/sso-callback" element={<SSOCallback />} />

      {/* ── Onboarding (protected but no Sidebar/Navbar layout) ─ */}
      <Route path="/onboarding"  element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

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
