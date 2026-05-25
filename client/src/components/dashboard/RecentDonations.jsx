import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, PlusCircle } from 'lucide-react';
import { getStatusColor, getRelativeTime } from '@/utils/helpers';
import { FOOD_CATEGORIES } from '@/utils/constants';
import { useAppAuth } from '@/hooks/useAppAuth';
import { donationsAPI } from '@/services/api';

function getCategoryIcon(value) {
  const cat = FOOD_CATEGORIES.find((c) => c.value === value);
  return cat ? cat.icon : '🍴';
}

function StatusBadge({ status }) {
  const labels = {
    available: 'Available',
    claimed: 'Claimed',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    expired: 'Expired',
    cancelled: 'Cancelled',
  };
  return (
    <span className={`badge text-xs ${getStatusColor(status)}`}>
      {labels[status] || status}
    </span>
  );
}

export default function RecentDonations() {
  const { getAuthToken } = useAppAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIXED: Changed dependency array to an empty array [] so it runs once on mount
  useEffect(() => {
    async function fetchDonations() {
      try {
        const token = await getAuthToken();
        if (token) {
          const res = await donationsAPI.getAll(token, '?limit=5');
          setDonations(res.donations || []);
        }
      } catch (err) {
        console.error('Failed to fetch recent donations:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
        <h3 className="font-semibold text-slate-900 dark:text-white">Recent Donations</h3>
        <Link
          to="/donations"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {/* List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
        {loading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-4 px-6 py-3.5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/50 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 dark:bg-slate-700/50 rounded w-1/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-1/4" />
              </div>
              <div className="w-16 h-5 bg-slate-100 dark:bg-slate-700/50 rounded-full" />
            </div>
          ))
        ) : donations.length > 0 ? (
          donations.map((donation, i) => (
            <Link
              key={donation.id}
              to={`/donations/${donation.id}`}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors block"
            >
              {/* Category icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-teal-50 dark:from-primary-900/30 dark:to-teal-900/30 flex items-center justify-center text-lg shrink-0 border border-primary-100/60 dark:border-primary-800/30">
                {getCategoryIcon(donation.category)}
              </div>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  {donation.food_name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{donation.quantity}</p>
              </div>
              {/* Status */}
              <StatusBadge status={donation.status} />
              {/* Time */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 shrink-0">
                <Clock className="w-3 h-3" />
                {getRelativeTime(donation.created_at)}
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-3">
              <PlusCircle className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">No donations posted yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
              Share your surplus food to start saving meals and reducing CO₂ emissions.
            </p>
            <Link to="/donate" className="btn-primary py-1.5 px-4 text-xs mt-4">
              Donate Food
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}