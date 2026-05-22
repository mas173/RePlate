import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { StatsOverview, RecentDonations, QuickActions, ActivityFeed } from '@/components/dashboard';

/**
 * Donor Dashboard Page
 *
 * Shows:
 * - Welcome header with user greeting
 * - Overview stats (total donations, meals saved, impact)
 * - Recent donations list
 * - Quick actions panel
 * - Active donations status
 * - Quick actions (new donation, view analytics)
 * - Notifications preview
 * - Activity feed timeline
 *
 * @component
 * @requires role - 'donor'
 */
export default function DonorDashboard() {
  const { fullName } = useAppAuth();
  const firstName = fullName ? fullName.split(' ')[0] : 'there';

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Here's what's happening with your donations today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200/60 dark:border-primary-800/60">
            <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-medium text-primary-700 dark:text-primary-400">AI-Powered</span>
          </div>
        </div>
      </motion.div>

      {/* Stats overview */}
      <StatsOverview />

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent donations — takes 2 cols */}
        <div className="lg:col-span-2">
          <RecentDonations />
        </div>

        {/* Sidebar: Quick actions + Activity */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>

      {/* Activity feed */}
      <ActivityFeed />
    </div>
  );
}
