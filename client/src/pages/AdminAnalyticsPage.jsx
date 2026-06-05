import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Package, ClipboardCheck, Leaf, Droplets,
  TrendingUp, Calendar, RefreshCw, Sparkles, UserCheck, Shield
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useAppAuth } from '@/hooks/useAppAuth';
import { adminAPI, analyticsAPI } from '@/services/api';
import MetricCard from '@/components/analytics/MetricCard';
import DonationTrendChart from '@/components/analytics/DonationTrendChart';
import CategoryPieChart from '@/components/analytics/CategoryPieChart';
import LeaderboardTable from '@/components/analytics/LeaderboardTable';
import AdminHeatmap from '@/components/analytics/AdminHeatmap';
import toast from 'react-hot-toast';

const growthVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
};

export default function AdminAnalyticsPage() {
  const { getAuthToken } = useAppAuth();
  const [adminStats, setAdminStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState({ donors: [], ngos: [] });
  const [allDonations, setAllDonations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = await getAuthToken();
      if (!token) return;

      const [adminRes, trendsRes, categoriesRes, leaderboardRes, donationsRes, usersRes] = await Promise.allSettled([
        adminAPI.getAnalytics(token),
        analyticsAPI.getTrends(token),
        analyticsAPI.getCategories(token),
        analyticsAPI.getLeaderboard(token),
        adminAPI.getDonations(token),
        adminAPI.getUsers(token),
      ]);

      if (adminRes.status === 'fulfilled') {
        setAdminStats(adminRes.value);
      }
      if (trendsRes.status === 'fulfilled') {
        setTrendData(trendsRes.value.trends || []);
      }
      if (categoriesRes.status === 'fulfilled') {
        setCategoryData(categoriesRes.value.categories || []);
      }
      if (leaderboardRes.status === 'fulfilled') {
        setLeaderboardData(leaderboardRes.value);
      }
      if (donationsRes.status === 'fulfilled') {
        setAllDonations(donationsRes.value.donations || []);
      }
      if (usersRes.status === 'fulfilled') {
        setAllUsers(usersRes.value.users || []);
      }

      if (isRefresh) {
        toast.success('Analytics dashboards synchronized');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const a = adminStats || {};
  const impact = a.platformImpact || {};

  // Stub data for user growth in case of empty DB
  const growthChartData = a.userGrowth && a.userGrowth.length > 0
    ? a.userGrowth
    : [
        { month: 'Dec 25', donors: 2, ngos: 1, admins: 1 },
        { month: 'Jan 26', donors: 4, ngos: 2, admins: 1 },
        { month: 'Feb 26', donors: 7, ngos: 3, admins: 1 },
        { month: 'Mar 26', donors: 11, ngos: 5, admins: 1 },
        { month: 'Apr 26', donors: 15, ngos: 8, admins: 2 },
        { month: 'May 26', donors: 21, ngos: 12, admins: 2 },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            Platform Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Deep overview of platform metrics, growth, and collective environmental impact.
          </p>
        </div>
        <button
          onClick={() => fetchAllData(true)}
          disabled={loading || refreshing}
          className="btn-secondary py-2 px-3 border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Sync Analytics
        </button>
      </div>

      {/* User Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800/40 h-[120px] rounded-2xl border border-slate-200/30 dark:border-slate-700/20" />
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <MetricCard
            label="Total Platform Users"
            value={a.totalUsers || 0}
            icon={Users}
            gradient="from-purple-500 to-indigo-600"
            iconBg="bg-purple-50 dark:bg-purple-950/40"
            iconColor="text-purple-500 dark:text-purple-400"
          />
          <MetricCard
            label="Active Donors"
            value={a.totalDonors || 0}
            icon={UserCheck}
            gradient="from-emerald-500 to-green-600"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            iconColor="text-emerald-500 dark:text-emerald-400"
          />
          <MetricCard
            label="Active NGOs"
            value={a.totalNGOs || 0}
            icon={TrendingUp}
            gradient="from-teal-500 to-cyan-600"
            iconBg="bg-teal-50 dark:bg-teal-950/40"
            iconColor="text-teal-500 dark:text-teal-400"
          />
          <MetricCard
            label="System Administrators"
            value={a.totalAdmins || 0}
            icon={Shield}
            gradient="from-indigo-500 to-blue-600"
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            iconColor="text-indigo-500 dark:text-indigo-400"
          />
        </motion.div>
      )}

      {/* deep graphs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          variants={growthVariants}
          initial="hidden"
          animate="show"
          className="card p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col h-[400px]"
        >
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">User Registration Growth</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chronological breakdown of registered donors and NGOs.</p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700/40" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94A3B8" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '12px',
                    borderColor: 'rgba(71, 85, 105, 0.5)',
                    color: '#FFF',
                    fontSize: '11px',
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '15px' }} />
                <Line type="monotone" name="Donors" dataKey="donors" stroke="#10B981" strokeWidth={2.5} activeDot={{ r: 5 }} />
                <Line type="monotone" name="NGOs" dataKey="ngos" stroke="#14B8A6" strokeWidth={2.5} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Categories breakdown */}
        <CategoryPieChart data={categoryData} loading={loading} onRefresh={() => fetchAllData(true)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donation Trends */}
        <DonationTrendChart data={trendData} loading={loading} onRefresh={() => fetchAllData(true)} />

        {/* Environmental stats overview */}
        <div className="card p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col justify-between h-[400px]">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Environmental Dashboard</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Platform ecological savings aggregation.</p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 items-center">
            {[
              { label: 'CO₂ Reduced', value: `${(impact.totalCO2Reduced || 0).toFixed(1)} kg`, desc: 'Carbon offset saved', color: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5', icon: Leaf },
              { label: 'Water Conserved', value: `${((impact.totalWaterSaved || 0) / 1000).toFixed(1)}k L`, desc: 'Freshwater saved', color: 'border-blue-500/20 text-blue-500 bg-blue-500/5', icon: Droplets },
              { label: 'Total Meals Saved', value: (impact.totalMealsSaved || 0).toLocaleString(), desc: 'Direct food support', color: 'border-amber-500/20 text-amber-500 bg-amber-500/5', icon: Package },
              { label: 'Total Weight Saved', value: `${(impact.totalWeightSaved || 0).toFixed(1)} kg`, desc: 'Landed organic waste', color: 'border-rose-500/20 text-rose-500 bg-rose-500/5', icon: BarChart3 },
            ].map(({ label, value, desc, color, icon: Icon }) => (
              <div key={label} className={`p-4 rounded-xl border flex flex-col justify-between h-full ${color}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{label}</span>
                  <Icon className="w-4.5 h-4.5 opacity-80" />
                </div>
                <div className="mt-2">
                  <span className="text-xl font-extrabold block leading-tight">{loading ? '...' : value}</span>
                  <span className="text-[10px] opacity-75 mt-0.5 block">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Heatmap Analytics */}
      {!loading && (
        <AdminHeatmap donations={allDonations} users={allUsers} />
      )}

      {/* Leaderboard Table */}
      <LeaderboardTable donors={leaderboardData.donors} ngos={leaderboardData.ngos} loading={loading} />
    </div>
  );
}
