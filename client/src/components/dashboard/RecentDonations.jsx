import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { getStatusColor, getRelativeTime } from '@/utils/helpers';
import { FOOD_CATEGORIES } from '@/utils/constants';

const MOCK_DONATIONS = [
  {
    id: 1,
    name: 'Cooked Rice & Curry',
    category: 'cooked_meals',
    quantity: '15 meals',
    status: 'available',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 2,
    name: 'Assorted Pastries',
    category: 'bakery',
    quantity: '30 items',
    status: 'claimed',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 3,
    name: 'Fresh Vegetables',
    category: 'raw_produce',
    quantity: '8 kg',
    status: 'picked_up',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 4,
    name: 'Fruit Basket',
    category: 'fruits',
    quantity: '5 kg',
    status: 'delivered',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 5,
    name: 'Packaged Snacks',
    category: 'packaged',
    quantity: '20 packs',
    status: 'available',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
];

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
        {MOCK_DONATIONS.map((donation, i) => (
          <motion.div
            key={donation.id}
            className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
          >
            {/* Category icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-teal-50 dark:from-primary-900/30 dark:to-teal-900/30 flex items-center justify-center text-lg shrink-0 border border-primary-100/60 dark:border-primary-800/30">
              {getCategoryIcon(donation.category)}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {donation.name}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{donation.quantity}</p>
            </div>

            {/* Status */}
            <StatusBadge status={donation.status} />

            {/* Time */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 shrink-0">
              <Clock className="w-3 h-3" />
              {getRelativeTime(donation.createdAt)}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
