import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Sparkles, ChevronRight, RefreshCw, Filter, Calendar } from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { donationsAPI } from '@/services/api';
import { getUrgencyColor, getRelativeTime } from '@/utils/helpers';
import { FOOD_CATEGORIES } from '@/utils/constants';

function getCategoryIcon(value) {
  const cat = FOOD_CATEGORIES.find((c) => c.value === value);
  return cat ? cat.icon : '🍴';
}

function getCategoryLabel(value) {
  const cat = FOOD_CATEGORIES.find((c) => c.value === value);
  return cat ? cat.label : value;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
};

export default function AvailableFoodPage() {
  const { getAuthToken } = useAppAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  const fetchAvailableDonations = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);
    try {
      const token = await getAuthToken();
      if (token) {
        // GET /api/donations with status=available is filtered on the server side
        const res = await donationsAPI.getAll(token);
        setDonations(res.donations || []);
      }
    } catch (err) {
      console.error('Failed to load available donations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAvailableDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredDonations = donations.filter((donation) => {
    // Only display available food
    if (donation.status !== 'available') return false;

    const matchesSearch =
      donation.food_name.toLowerCase().includes(search.toLowerCase()) ||
      (donation.description && donation.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || donation.category === categoryFilter;
    
    const matchesCity = !cityFilter || 
      donation.pickup_city?.toLowerCase().includes(cityFilter.toLowerCase()) ||
      donation.pickup_address?.toLowerCase().includes(cityFilter.toLowerCase());

    const matchesUrgency = urgencyFilter === 'all' || donation.urgency === urgencyFilter;

    return matchesSearch && matchesCategory && matchesCity && matchesUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Available Food donations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Browse and claim fresh surplus food listings near your organization.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchAvailableDonations(true)}
            disabled={loading || refreshing}
            className="btn-secondary p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 backdrop-blur-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search food by name..."
              className="input pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* City / Location Filter */}
          <div className="md:col-span-3 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Filter by city/address..."
              className="input pl-10 w-full"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              className="input w-full"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {FOOD_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="md:col-span-2">
            <select
              className="input w-full"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
            >
              <option value="all">All Urgency</option>
              <option value="critical">🚨 Critical</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>

        {/* Quick category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            All Food
          </button>
          {FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1 ${
                categoryFilter === cat.value
                  ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card h-[280px] animate-pulse bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
      ) : filteredDonations.length > 0 ? (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {filteredDonations.map((donation) => {
              const categoryDetails = FOOD_CATEGORIES.find((c) => c.value === donation.category);
              const isAiAnalyzed = donation.ai_freshness_score !== null && donation.ai_freshness_score !== undefined;
              const formattedExpiry = new Date(donation.expires_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <motion.div
                  key={donation.id}
                  variants={cardVariants}
                  layout
                  onClick={() => navigate(`/donations/${donation.id}`)}
                  className="card group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer relative bg-white dark:bg-slate-850/80 border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between min-h-[280px]"
                >
                  {/* Card top image/gradient */}
                  <div className="h-32 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-850">
                    {donation.images && donation.images.length > 0 ? (
                      <img
                        src={donation.images[0]}
                        alt={donation.food_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-teal-500/10 flex items-center justify-center">
                        <span className="text-5xl filter saturate-75">{categoryDetails?.icon || '🍴'}</span>
                      </div>
                    )}
                    
                    {/* Floating badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="badge bg-black/40 backdrop-blur-md text-white border-0 flex items-center gap-1 text-[10px]">
                        <span>{categoryDetails?.icon}</span>
                        <span>{categoryDetails?.label}</span>
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                      {isAiAnalyzed && (
                        <span className="badge bg-indigo-500 dark:bg-indigo-600 text-white border-none flex items-center gap-1 shadow-sm text-[10px]">
                          <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                          {donation.ai_freshness_score}% Fresh
                        </span>
                      )}
                    </div>

                    {/* Geolocation Mock Distance */}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-rose-400" />
                      <span>{donation.pickup_city || 'Nearby'} · ~1.8 km</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                        {donation.food_name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        By {donation.profiles?.organization_name || donation.profiles?.first_name || 'Donor'}
                      </p>
                      {donation.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2">
                          {donation.description}
                        </p>
                      )}
                    </div>

                    {/* Details and dates */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/40 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate text-red-500 font-medium">Expires {formattedExpiry}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0 justify-end">
                        <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                          {donation.quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Urgency and Claim Trigger */}
                  <div className="px-5 py-3.5 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getUrgencyColor(donation.urgency)}`}>
                        {donation.urgency} Urgency
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary-500 flex items-center gap-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      View details <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card py-16 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 max-w-lg mx-auto rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Available Donations
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {search || categoryFilter !== 'all' || cityFilter || urgencyFilter !== 'all'
              ? 'We couldn\'t find any match with your current search parameters. Try adjusting your filters.'
              : 'There are currently no food donations listed in your area. Check back soon!'}
          </p>
          {(search || categoryFilter !== 'all' || cityFilter || urgencyFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setCityFilter('');
                setUrgencyFilter('all');
              }}
              className="btn-secondary px-5 py-2 mt-5 text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
