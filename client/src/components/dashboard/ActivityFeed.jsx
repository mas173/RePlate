import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  CheckCircle,
  Truck,
  Award,
  Clock,
} from 'lucide-react';

import { useAppAuth } from '@/hooks/useAppAuth';
import { donationsAPI } from '@/services/api';
import { getRelativeTime } from '@/utils/helpers';

const activityIcons = {
  donation: Package,
  claimed: CheckCircle,
  pickup: Truck,
  delivered: CheckCircle,
  achievement: Award,
};

const activityColors = {
  donation: 'bg-primary-500',
  claimed: 'bg-blue-500',
  pickup: 'bg-purple-500',
  delivered: 'bg-emerald-500',
  achievement: 'bg-amber-500',
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    x: -12,
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

export default function ActivityFeed() {
  const { getAuthToken } = useAppAuth();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateActivities = (donations = []) => {
    const generated = [];

    donations.forEach((donation) => {
      generated.push({
        id: `${donation.id}-created`,
        type: 'donation',
        text: `You donated "${donation.food_name}" (${donation.quantity})`,
        time: donation.created_at,
      });

      if (donation.status === 'claimed') {
        generated.push({
          id: `${donation.id}-claimed`,
          type: 'claimed',
          text: `"${donation.food_name}" was claimed by an NGO`,
          time: donation.updated_at || donation.created_at,
        });
      }

      if (donation.status === 'picked_up') {
        generated.push({
          id: `${donation.id}-pickup`,
          type: 'pickup',
          text: `"${donation.food_name}" was picked up successfully`,
          time: donation.updated_at || donation.created_at,
        });
      }

      if (donation.status === 'delivered') {
        generated.push({
          id: `${donation.id}-delivered`,
          type: 'delivered',
          text: `"${donation.food_name}" was delivered successfully`,
          time: donation.updated_at || donation.created_at,
        });
      }
    });

    return generated.sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    );
  };

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getAuthToken();

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await donationsAPI.getAll(token);

      const donations = response?.donations || response || [];

      const generatedActivities = generateActivities(donations);

      setActivities(generatedActivities);
    } catch (error) {
      console.error('Failed to fetch activity feed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />

        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse mt-1" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Activity Feed
        </h3>

        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          Live Updates
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-10">
          <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />

          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No activity yet
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Your donation activity will appear here.
          </p>
        </div>
      ) : (
        <motion.div
          className="relative"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/60" />

          <div className="space-y-5">
            {activities.map((activity) => {
              const Icon =
                activityIcons[activity.type] || Package;

              return (
                <motion.div
                  key={activity.id}
                  variants={item}
                  className="flex items-start gap-4 relative"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${activityColors[activity.type] ||
                      activityColors.donation
                      } ring-4 ring-white dark:ring-slate-800/60 shrink-0 mt-0.5 z-10`}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {activity.text}
                        </p>

                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {getRelativeTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}