import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Package, ClipboardCheck, BarChart3, TrendingUp, ShieldCheck,
  Heart, Leaf, Droplets, ArrowRight, RefreshCw, UserPlus, Clock,
  AlertTriangle, CheckCircle, Activity
} from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { adminAPI } from '@/services/api';
import toast from 'react-hot-toast';

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
};

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className="card p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function ActivityItem({ item }) {
  const iconMap = {
    donation: <Package className="w-4 h-4" />,
    claim: <ClipboardCheck className="w-4 h-4" />,
    user_joined: <UserPlus className="w-4 h-4" />,
  };
  const colorMap = {
    donation: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    claim: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    user_joined: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  };

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[item.type] || 'bg-slate-100 text-slate-500'}`}>
        {iconMap[item.type] || <Activity className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{item.title}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{item.subtitle}</p>
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
        {timeAgo(item.created_at)}
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const { fullName } = useAppAuth();
  const firstName = fullName ? fullName.split(' ')[0] : 'Admin';
  const { getAuthToken } = useAppAuth();

  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const [analyticsRes, activityRes] = await Promise.all([
        adminAPI.getAnalytics(token),
        adminAPI.getActivity(token),
      ]);
      setAnalytics(analyticsRes);
      setActivity(activityRes.activity || []);
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const a = analytics || {};
  const impact = a.platformImpact || {};
  const completionRate = a.totalClaims > 0
    ? Math.round((a.completedClaims / a.totalClaims) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, {firstName}. Here's your platform overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn-secondary p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Admin</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card h-[100px] animate-pulse bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={a.totalUsers || 0} sub={`${a.activeUsers || 0} active · ${a.inactiveUsers || 0} inactive`} color="bg-indigo-500" delay={0} />
          <StatCard icon={Package} label="Total Donations" value={a.totalDonations || 0} sub={`${a.activeDonations || 0} available`} color="bg-emerald-500" delay={0.05} />
          <StatCard icon={ClipboardCheck} label="Total Claims" value={a.totalClaims || 0} sub={`${completionRate}% completion rate`} color="bg-amber-500" delay={0.1} />
          <StatCard icon={Heart} label="Meals Saved" value={(impact.totalMealsSaved || 0).toLocaleString()} color="bg-rose-500" delay={0.15} />
          <StatCard icon={TrendingUp} label="Donors" value={a.totalDonors || 0} color="bg-sky-500" delay={0.2} />
          <StatCard icon={Users} label="NGOs" value={a.totalNGOs || 0} color="bg-teal-500" delay={0.25} />
          <StatCard icon={Leaf} label="CO₂ Reduced" value={`${(impact.totalCO2Reduced || 0).toFixed(1)} kg`} color="bg-green-600" delay={0.3} />
          <StatCard icon={Droplets} label="Water Saved" value={`${((impact.totalWaterSaved || 0) / 1000).toFixed(1)}k L`} color="bg-cyan-500" delay={0.35} />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 card bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-500" />
              Recent Platform Activity
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{activity.length} events</span>
          </div>
          {activity.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {activity.map((item, i) => (
                <ActivityItem key={`${item.type}-${item.id}-${i}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
              No recent activity to display.
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Donation Status Breakdown */}
          <div className="card bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 p-5">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4">Donation Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Available', value: a.activeDonations, icon: CheckCircle, color: 'text-emerald-500' },
                { label: 'Claimed', value: a.claimedDonations, icon: ClipboardCheck, color: 'text-amber-500' },
                { label: 'Delivered', value: a.deliveredDonations, icon: Heart, color: 'text-indigo-500' },
                { label: 'Expired', value: a.expiredDonations, icon: Clock, color: 'text-slate-400' },
                { label: 'Cancelled', value: a.cancelledDonations, icon: AlertTriangle, color: 'text-red-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className="text-slate-600 dark:text-slate-400">{label}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">{value || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 p-5">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Manage Users', sub: 'View and manage all platform users', to: '/admin/users', icon: Users },
                { label: 'All Donations', sub: 'Moderate and oversee food listings', to: '/admin/donations', icon: Package },
                { label: 'Platform Analytics', sub: 'Deep charts and growth metrics', to: '/admin/analytics', icon: BarChart3 },
              ].map(({ label, sub, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-800 dark:text-white block">{label}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{sub}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
