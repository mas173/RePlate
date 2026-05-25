import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppAuth } from '@/hooks/useAppAuth';
import { authAPI } from '@/services/api';
import { Heart, Building2, ArrowRight } from 'lucide-react';
import mainLogo from '@/assets/images/mainLogo.png';

export default function OnboardingPage() {
  const { getAuthToken, user } = useAppAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError('');

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await authAPI.updateRole(token, selectedRole);

      // Force Clerk session reload to update publicMetadata client-side
      if (user) {
        await user.reload();
      }

      // Redirect based on selected role
      if (selectedRole === 'donor') {
        navigate('/dashboard');
      } else {
        navigate('/available');
      }
    } catch (err) {
      console.error('Failed to set role during onboarding:', err);
      setError(err.message || 'Failed to update account role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F9FAFB] dark:bg-[#0F172A] px-4 py-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-3xl" />

      <div className="w-full max-w-[650px] relative z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-10 text-center animate-fade-in">
          <img src={mainLogo} alt="RePlate" className="w-16 h-16 object-contain mb-4 animate-pulse" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Welcome to <span className="text-gradient">RePlate</span>
          </h1>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-md">
            To get started, please tell us how you would like to participate in the food saving movement.
          </p>
        </div>

        {/* Options container */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl p-8 backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donor Option */}
            <button
              onClick={() => setSelectedRole('donor')}
              disabled={loading}
              className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedRole === 'donor'
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 ring-4 ring-primary-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div className={`p-4 rounded-full mb-4 transition-colors ${
                selectedRole === 'donor'
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Become a Donor</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                I am a business, restaurant, farm, or individual with surplus food to share with the community.
              </p>
            </button>

            {/* NGO Option */}
            <button
              onClick={() => setSelectedRole('ngo')}
              disabled={loading}
              className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 ${
                selectedRole === 'ngo'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 ring-4 ring-teal-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div className={`p-4 rounded-full mb-4 transition-colors ${
                selectedRole === 'ngo'
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Join as NGO / Shelter</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                I represent a verified non-profit organization or food shelter looking to claim and distribute surplus food.
              </p>
            </button>
          </div>

          {/* Continue button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleRoleSelection}
              disabled={!selectedRole || loading}
              className={`btn-primary w-full md:w-auto px-8 py-3 text-base flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
