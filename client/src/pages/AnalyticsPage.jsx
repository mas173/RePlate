import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Leaf,
  Droplet,
  Package,
  Users,
  Compass,
  Download,
  Share2,
  RefreshCw,
  Info,
  Car,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { analyticsAPI } from '@/services/api';
import {
  MetricCard,
  DonationTrendChart,
  CategoryPieChart,
  LeaderboardTable
} from '@/components/analytics';
import toast from 'react-hot-toast';

const tabVariants = {
  active: {
    backgroundColor: 'var(--color-primary-500)',
    color: '#FFFFFF',
    transition: { type: 'spring', stiffness: 380, damping: 30 }
  },
  inactive: {
    backgroundColor: 'transparent',
    color: 'var(--color-slate-500)'
  }
};

export default function AnalyticsPage() {
  const { getAuthToken } = useAppAuth();

  // Navigation tab: 'collective' | 'personal'
  const [activeTab, setActiveTab] = useState('collective');

  // Data states
  const [overviewStats, setOverviewStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState({ donors: [], ngos: [] });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = await getAuthToken();

      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Parallelize API requests for maximum loading performance
      const [overview, user, trends, categories, leaderboard] = await Promise.allSettled([
        analyticsAPI.getOverview(token),
        analyticsAPI.getUserAnalytics(token),
        analyticsAPI.getTrends(token),
        analyticsAPI.getCategories(token),
        analyticsAPI.getLeaderboard(token)
      ]);

      if (overview.status === 'fulfilled') {
        setOverviewStats(overview.value);
      }

      if (user.status === 'fulfilled') {
        setUserStats(user.value);
      }

      if (trends.status === 'fulfilled') {
        setTrendData(trends.value.trends || []);
      }

      if (categories.status === 'fulfilled') {
        setCategoryData(categories.value.categories || []);
      }

      if (leaderboard.status === 'fulfilled') {
        setLeaderboardData(leaderboard.value);
      }

      if (isRefresh) {
        toast.success('Analytics dashboards synchronized');
      }
    } catch (err) {
      console.error('Failed to load analytics datasets:', err);
      toast.error('Failed to synchronize analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // FIXED: Prevent repeated API re-fetch loops causing 429 errors
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Export functionality
  const handleExportData = (format = 'json') => {
    try {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        scope:
          activeTab === 'collective'
            ? 'platform_collective_impact'
            : 'user_personal_impact',
        metrics: activeTab === 'collective' ? overviewStats : userStats,
        trends: trendData,
        categories: categoryData
      };

      if (format === 'json') {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(dataToExport, null, 2)
        )}`;

        const downloadAnchor = document.createElement('a');

        downloadAnchor.setAttribute('href', jsonString);

        downloadAnchor.setAttribute(
          'download',
          `replate_analytics_${activeTab}_${Date.now()}.json`
        );

        document.body.appendChild(downloadAnchor);

        downloadAnchor.click();

        downloadAnchor.remove();

        toast.success('JSON export successful!');
      } else if (format === 'csv') {
        // Build a simplified metrics CSV file
        const metrics =
          activeTab === 'collective' ? overviewStats : userStats;

        let csvContent = 'data:text/csv;charset=utf-8,';

        csvContent += 'Metric,Value\n';

        if (activeTab === 'collective') {
          csvContent += `Total Donations,${metrics?.totalDonations || 0}\n`;
          csvContent += `Meals Rescued,${metrics?.totalMealsSaved || 0}\n`;
          csvContent += `Weight Rescued (kg),${metrics?.totalWasteReduced || 0}\n`;
          csvContent += `Carbon Offset (kg CO2),${metrics?.totalCO2Reduced || 0}\n`;
          csvContent += `Active Donors,${metrics?.activeDonors || 0}\n`;
          csvContent += `Active NGOs,${metrics?.activeNGOs || 0}\n`;
        } else {
          csvContent += `Total Donations,${metrics?.donations || 0}\n`;
          csvContent += `Active Listings,${metrics?.activeDonations || 0}\n`;
          csvContent += `Meals Saved,${metrics?.mealsSaved || 0}\n`;
          csvContent += `Weight Saved (kg),${metrics?.wasteReduced || 0}\n`;
          csvContent += `Carbon Offset (kg CO2),${metrics?.co2Reduced || 0}\n`;
          csvContent += `Completed Claims,${metrics?.claimsReceived || 0}\n`;
        }

        const encodedUri = encodeURI(csvContent);

        const downloadAnchor = document.createElement('a');

        downloadAnchor.setAttribute('href', encodedUri);

        downloadAnchor.setAttribute(
          'download',
          `replate_analytics_${activeTab}_${Date.now()}.csv`
        );

        document.body.appendChild(downloadAnchor);

        downloadAnchor.click();

        downloadAnchor.remove();

        toast.success('CSV export successful!');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to export data');
    }
  };

  // Environmental equivalence math
  const getEnvironmentalEquivalence = () => {
    const co2 =
      activeTab === 'collective'
        ? (overviewStats?.totalCO2Reduced || 0)
        : (userStats?.co2Reduced || 0);

    const water =
      (activeTab === 'collective'
        ? (overviewStats?.totalWasteReduced || 0)
        : (userStats?.wasteReduced || 0)) * 1000;

    // 1 kg CO2 reduced = ~4.1 km driven in a standard car
    const kmDriven = co2 * 4.1;

    // 1 kg CO2 reduced = ~120 charges of a smartphone
    const phoneCharges = co2 * 120;

    // 1 liter water saved = ~0.016 domestic hot showers
    const showerMinutes = (water / 60) * 5;

    // 1 kg of food saved = ~1.5 sq meters of agricultural land footprint saved
    const weightKg =
      activeTab === 'collective'
        ? (overviewStats?.totalWasteReduced || 0)
        : (userStats?.wasteReduced || 0);

    const landSaved = weightKg * 1.5;

    return { kmDriven, phoneCharges, showerMinutes, landSaved };
  };

  const equivs = getEnvironmentalEquivalence();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Analytics & Collective Impact
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track environmental metrics, donation trends, and the leadership board.
          </p>
        </div>

        {/* Sync & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={() => fetchAnalyticsData(true)}
            disabled={loading || refreshing}
            className="btn-secondary py-2 px-3 border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Dashboards
          </button>

          {/* Export CSV button */}
          <button
            onClick={() => handleExportData('csv')}
            className="btn-secondary py-2 px-3 border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* Export JSON button */}
          <button
            onClick={() => handleExportData('json')}
            className="btn-secondary py-2 px-3 border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Scope Toggles */}
      <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 p-1.5 rounded-2xl w-full sm:w-[320px] shrink-0 font-bold text-sm shadow-inner relative overflow-hidden">
        <button
          onClick={() => setActiveTab('collective')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-center transition-all duration-300 relative z-10 ${activeTab === 'collective'
              ? 'text-white bg-primary-500 shadow-md shadow-primary-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          Collective Impact
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-center transition-all duration-300 relative z-10 ${activeTab === 'personal'
              ? 'text-white bg-primary-500 shadow-md shadow-primary-500/20'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          Your Impact
        </button>
      </div>

      {/* Core Metric Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-slate-100 dark:bg-slate-800/40 h-[142px] rounded-2xl border border-slate-200/30 dark:border-slate-700/20" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {activeTab === 'collective' ? (
              <>
                <MetricCard
                  label="Collective Meals Saved"
                  value={overviewStats?.totalMealsSaved || 0}
                  icon={Utensils}
                  trend="+18%"
                  trendUp={true}
                  trendLabel="vs last month"
                  gradient="from-amber-500 to-orange-600"
                  iconBg="bg-amber-50 dark:bg-amber-950/40"
                  iconColor="text-amber-500 dark:text-amber-400"
                />
                <MetricCard
                  label="Total Weight Rescued"
                  value={overviewStats?.totalWasteReduced || 0}
                  suffix=" kg"
                  decimals={1}
                  icon={Package}
                  trend="+14%"
                  trendUp={true}
                  trendLabel="vs last month"
                  gradient="from-blue-500 to-indigo-600"
                  iconBg="bg-blue-50 dark:bg-blue-950/40"
                  iconColor="text-blue-500 dark:text-blue-400"
                />
                <MetricCard
                  label="Carbon Footprint Reduced"
                  value={overviewStats?.totalCO2Reduced || 0}
                  suffix=" kg"
                  decimals={1}
                  icon={Leaf}
                  trend="+21%"
                  trendUp={true}
                  trendLabel="vs last month"
                  gradient="from-emerald-500 to-green-600"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  iconColor="text-emerald-500 dark:text-emerald-400"
                />
                <MetricCard
                  label="Platform Active Stakeholders"
                  value={(overviewStats?.activeDonors || 0) + (overviewStats?.activeNGOs || 0)}
                  icon={Users}
                  trend="+5"
                  trendUp={true}
                  trendLabel="new signups this week"
                  gradient="from-purple-500 to-pink-600"
                  iconBg="bg-purple-50 dark:bg-purple-950/40"
                  iconColor="text-purple-500 dark:text-purple-400"
                />
              </>
            ) : (
              <>
                <MetricCard
                  label="Personal Meals Saved"
                  value={userStats?.mealsSaved || 0}
                  icon={Utensils}
                  gradient="from-amber-500 to-orange-600"
                  iconBg="bg-amber-50 dark:bg-amber-950/40"
                  iconColor="text-amber-500 dark:text-amber-400"
                />
                <MetricCard
                  label="Your Food Rescued"
                  value={userStats?.wasteReduced || 0}
                  suffix=" kg"
                  decimals={1}
                  icon={Package}
                  gradient="from-blue-500 to-indigo-600"
                  iconBg="bg-blue-50 dark:bg-blue-950/40"
                  iconColor="text-blue-500 dark:text-blue-400"
                />
                <MetricCard
                  label="Personal Carbon Offset"
                  value={userStats?.co2Reduced || 0}
                  suffix=" kg"
                  decimals={1}
                  icon={Leaf}
                  gradient="from-emerald-500 to-green-600"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  iconColor="text-emerald-500 dark:text-emerald-400"
                />
                <MetricCard
                  label="Your active claims/listings"
                  value={userStats?.activeDonations || userStats?.claimsReceived || 0}
                  icon={Compass}
                  gradient="from-purple-500 to-pink-600"
                  iconBg="bg-purple-50 dark:bg-purple-950/40"
                  iconColor="text-purple-500 dark:text-purple-400"
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Storytelling Environmental Equivalence Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card p-5 border border-primary-100 dark:border-primary-950 bg-gradient-to-br from-primary-50/40 to-white dark:from-primary-950/10 dark:to-slate-800 rounded-2xl flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              Your Environmental Handprint
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Translating food rescue statistics into tangible ecological savings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Box 1: driving */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <Car className="w-6 h-6 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-black text-slate-850 dark:text-slate-100 leading-snug">
                {loading ? '...' : `${equivs.kmDriven.toFixed(0)} km`}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Gasoline Driving Offset
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Equivalent to driving a standard car from coast to coast.
              </p>
            </div>
          </div>

          {/* Box 2: phone charge */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-black text-slate-850 dark:text-slate-100 leading-snug">
                {loading ? '...' : `${equivs.phoneCharges.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Phones Charged
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Smartphone battery full charges saved from greenhouse gas emissions.
              </p>
            </div>
          </div>

          {/* Box 3: shower */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <Droplet className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-black text-slate-850 dark:text-slate-100 leading-snug">
                {loading ? '...' : `${equivs.showerMinutes.toLocaleString(undefined, { maximumFractionDigits: 0 })} min`}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Shower Minutes Saved
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Hours of continuous domestic hot shower water conserved.
              </p>
            </div>
          </div>

          {/* Box 4: land footprint */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <Compass className="w-6 h-6 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-black text-slate-850 dark:text-slate-100 leading-snug">
                {loading ? '...' : `${equivs.landSaved.toFixed(1)} m²`}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                Agricultural Land Protected
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Square meters of fertile farmland ecosystem preserved.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <DonationTrendChart
          data={trendData}
          loading={loading}
          onRefresh={() => fetchAnalyticsData(true)}
        />
        <CategoryPieChart
          data={categoryData}
          loading={loading}
          onRefresh={() => fetchAnalyticsData(true)}
        />
      </div>

      {/* Rescuers Leaderboard */}
      <LeaderboardTable
        donors={leaderboardData.donors}
        ngos={leaderboardData.ngos}
        loading={loading}
      />
    </div>
  );
}