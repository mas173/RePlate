import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';

// Pages
import LandingPage from './pages/LandingPage';
import DonorDashboard from './pages/DonorDashboard';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';
import FoodUploadPage from './pages/FoodUploadPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout Components
// import DashboardLayout from './components/layout/DashboardLayout';
// import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-200">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/sign-in/*"
          element={
            <div className="min-h-screen flex items-center justify-center gradient-hero">
              <SignIn routing="path" path="/sign-in" />
            </div>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <div className="min-h-screen flex items-center justify-center gradient-hero">
              <SignUp routing="path" path="/sign-up" />
            </div>
          }
        />

        {/* Protected Routes - Donor */}
        <Route path="/dashboard" element={<DonorDashboard />} />
        <Route path="/donate" element={<FoodUploadPage />} />

        {/* Protected Routes - NGO */}
        <Route path="/ngo/dashboard" element={<NGODashboard />} />

        {/* Protected Routes - Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Protected Routes - Shared */}
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<ProfileSettingsPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
