import { motion } from 'framer-motion';
import { getRelativeTime } from '@/utils/helpers';

const ACTIVITIES = [
  {
    id: 1,
    text: 'You donated "Cooked Rice & Curry" (15 meals)',
    type: 'donation',
    time: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 2,
    text: '"Assorted Pastries" was claimed by Hope Foundation',
    type: 'claimed',
    time: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 3,
    text: '"Fresh Vegetables" was picked up successfully',
    type: 'pickup',
    time: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 4,
    text: '"Fruit Basket" was delivered to City Shelter',
    type: 'delivered',
    time: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 5,
    text: 'You earned the "50 Meals Saved" achievement badge',
    type: 'achievement',
    time: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

const dotColors = {
  donation: 'bg-primary-500',
  claimed: 'bg-blue-500',
  pickup: 'bg-purple-500',
  delivered: 'bg-emerald-500',
  achievement: 'bg-amber-500',
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function ActivityFeed() {
  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <h3 className="font-semibold text-slate-900 dark:text-white mb-5">Activity Feed</h3>

      <motion.div
        className="relative"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/60" />

        <div className="space-y-5">
          {ACTIVITIES.map((activity) => (
            <motion.div
              key={activity.id}
              variants={item}
              className="flex items-start gap-4 relative"
            >
              {/* Dot */}
              <div className={`w-3.5 h-3.5 rounded-full ${dotColors[activity.type] || dotColors.donation} ring-4 ring-white dark:ring-slate-800/60 shrink-0 mt-0.5 z-10`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activity.text}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {getRelativeTime(activity.time)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
