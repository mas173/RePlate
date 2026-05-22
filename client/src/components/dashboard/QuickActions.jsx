import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, BarChart3, Settings, ArrowRight } from 'lucide-react';

const ACTIONS = [
  {
    title: 'Donate Food',
    desc: 'Upload surplus food for redistribution',
    icon: PlusCircle,
    path: '/donate',
    gradient: 'from-primary-500 to-primary-600',
    hoverBorder: 'hover:border-primary-300 dark:hover:border-primary-700',
    iconBg: 'bg-primary-50 dark:bg-primary-950/40',
    iconColor: 'text-primary-600 dark:text-primary-400',
  },
  {
    title: 'View Analytics',
    desc: 'Track your impact and donation trends',
    icon: BarChart3,
    path: '/analytics',
    gradient: 'from-teal-500 to-teal-600',
    hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700',
    iconBg: 'bg-teal-50 dark:bg-teal-950/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    title: 'Settings',
    desc: 'Manage your account and preferences',
    icon: Settings,
    path: '/settings',
    gradient: 'from-slate-400 to-slate-500',
    hoverBorder: 'hover:border-slate-300 dark:hover:border-slate-600',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function QuickActions() {
  return (
    <motion.div
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>

      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.title} variants={item}>
              <Link
                to={action.path}
                className={`group flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 ${action.hoverBorder} hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 bg-white dark:bg-slate-800/40`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{action.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all duration-200" />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
