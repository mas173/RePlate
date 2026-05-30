import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, RefreshCw, Calendar, MapPin, Sparkles, ChevronRight,
  AlertTriangle, CheckCircle, Clock, Truck, XCircle, Filter
} from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { adminAPI } from '@/services/api';
import { getUrgencyColor } from '@/utils/helpers';
import { FOOD_CATEGORIES } from '@/utils/constants';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'available', label: 'Available' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_ICONS = {
  available: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
  claimed: <Clock className="w-3.5 h-3.5 text-amber-500" />,
  picked_up: <Truck className="w-3.5 h-3.5 text-sky-500" />,
  delivered: <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />,
  expired: <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />,
  cancelled: <XCircle className="w-3.5 h-3.5 text-red-400" />,
};

const STATUS_BADGE = {
  available: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  claimed: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  picked_up: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  delivered: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  expired: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export default function AdminDonationsPage() {
  const { getAuthToken } = useAppAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const qp = [];
      if (search.trim()) qp.push(`search=${encodeURIComponent(search.trim())}`);
      if (statusFilter) qp.push(`status=${statusFilter}`);
      if (categoryFilter) qp.push(`category=${categoryFilter}`);
      const params = qp.length ? `?${qp.join('&')}` : '';
      const res = await adminAPI.getDonations(token, params);
      setDonations(res.donations || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleStatusChange = async (donationId, newStatus) => {
    setUpdatingId(donationId);
    try {
      const token = await getAuthToken();
      if (!token) return;
      await adminAPI.updateDonationStatus(token, donationId, newStatus);
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: newStatus } : d));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getCatIcon = (val) => {
    const cat = FOOD_CATEGORIES.find(c => c.value === val);
    return cat ? cat.icon : '🍴';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-500" />
              All Donations
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Oversee and moderate all food donations on the platform.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{donations.length} total</span>
            <button
              onClick={fetchDonations}
              disabled={loading}
              className="btn-secondary p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <div className="card p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <form onSubmit={handleSearch} className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by food name or description..."
              className="input pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="md:col-span-3">
            <select
              className="input w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <select
              className="input w-full"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {FOOD_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Donations Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card h-[90px] animate-pulse bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
      ) : donations.length > 0 ? (
        <motion.div className="space-y-2.5" variants={containerVariants} initial="hidden" animate="show">
          {/* Table header */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <div className="col-span-4">Food Item</div>
            <div className="col-span-2">Donor</div>
            <div className="col-span-1">Urgency</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Expires</div>
            <div className="col-span-2 text-right">Moderate</div>
          </div>

          <AnimatePresence>
            {donations.map(donation => {
              const donor = donation.profiles || {};
              const donorName = donor.organization_name || `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || 'Unknown';
              const statusBadge = STATUS_BADGE[donation.status] || STATUS_BADGE.available;
              const expiresDate = donation.expires_at
                ? new Date(donation.expires_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : '—';
              const isExpired = donation.expires_at && new Date(donation.expires_at) < new Date();

              return (
                <motion.div
                  key={donation.id}
                  variants={cardVariants}
                  layout
                  className="card bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center px-5 py-3.5">
                    {/* Food Info */}
                    <div
                      className="lg:col-span-4 flex items-center gap-3 min-w-0 cursor-pointer group"
                      onClick={() => navigate(`/donations/${donation.id}`)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shrink-0">
                        {getCatIcon(donation.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                          {donation.food_name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                          {donation.quantity} · {donation.pickup_city || 'No location'}
                        </p>
                      </div>
                      {donation.ai_freshness_score != null && (
                        <span className="badge bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[9px] font-bold shrink-0">
                          <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />{donation.ai_freshness_score}%
                        </span>
                      )}
                    </div>

                    {/* Donor */}
                    <div className="lg:col-span-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                      {donorName}
                    </div>

                    {/* Urgency */}
                    <div className="lg:col-span-1">
                      <span className={`badge text-[9px] font-bold uppercase tracking-wide ${getUrgencyColor(donation.urgency)}`}>
                        {donation.urgency}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                      <span className={`badge text-[10px] font-bold capitalize border ${statusBadge}`}>
                        {STATUS_ICONS[donation.status]}
                        <span className="ml-1">{(donation.status || '').replace('_', ' ')}</span>
                      </span>
                    </div>

                    {/* Expires */}
                    <div className={`lg:col-span-1 text-xs font-medium ${isExpired ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      {expiresDate}
                    </div>

                    {/* Moderate */}
                    <div className="lg:col-span-2 flex justify-end">
                      <select
                        className="input text-[10px] py-1 px-2 w-auto min-w-[100px] rounded-lg"
                        value={donation.status}
                        disabled={updatingId === donation.id}
                        onChange={(e) => handleStatusChange(donation.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.filter(s => s.value).map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card py-16 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 max-w-lg mx-auto rounded-3xl">
          <Package className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Donations Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {search || statusFilter || categoryFilter
              ? 'No donations match your current filters.'
              : 'No donations have been posted on the platform yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
