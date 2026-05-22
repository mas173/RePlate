import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Utensils, Leaf, Activity, TrendingUp, TrendingDown } from 'lucide-react';

function AnimatedCounter({ end, duration = 1500, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

const STATS = [
  {
    label: 'Total Donations',
    value: 156,
    suffix: '',
    trend: '+12%',
    trendUp: true,
    trendLabel: 'vs last month',
    icon: Package,
    gradient: 'from-primary-500 to-primary-600',
    iconBg: 'bg-primary-50 dark:bg-primary-950/40',
    iconColor: 'text-primary-600 dark:text-primary-400',
  },
  {
    label: 'Meals Saved',
    value: 2412,
    suffix: '',
    trend: '+8%',
    trendUp: true,
    trendLabel: 'vs last month',
    icon: Utensils,
    gradient: 'from-teal-500 to-teal-600',
    iconBg: 'bg-teal-50 dark:bg-teal-950/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    label: 'CO₂ Reduced',
    value: 1200,
    suffix: ' kg',
    trend: '+15%',
    trendUp: true,
    trendLabel: 'vs last month',
    icon: Leaf,
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Active Donations',
    value: 8,
    suffix: '',
    trend: '-2',
    trendUp: false,
    trendLabel: 'from yesterday',
    icon: Activity,
    gradient: 'from-orange-500 to-amber-500',
    iconBg: 'bg-orange-50 dark:bg-orange-950/40',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function StatsOverview() {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={item}
            className="stat-card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden"
          >
            {/* Subtle gradient accent top border */}
            <div className={`absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                stat.trendUp
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
                  : 'text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/40'
              }`}>
                {stat.trendUp
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />
                }
                {stat.trend}
              </div>
            </div>

            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              <AnimatedCounter end={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stat.trendLabel}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
