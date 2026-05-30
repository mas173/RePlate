import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/helpers';

function AnimatedCounter({ end, duration = 1000, suffix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = progress * end;
      
      setCount(decimals > 0 ? parseFloat(currentValue.toFixed(decimals)) : Math.floor(currentValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    if (end > 0) {
      window.requestAnimationFrame(step);
    } else {
      setCount(0);
    }
  }, [end, duration, decimals]);

  return (
    <span>
      {decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function MetricCard({
  label,
  value,
  suffix = '',
  decimals = 0,
  icon: Icon,
  trend,
  trendUp = true,
  trendLabel = 'vs last month',
  gradient = 'from-primary-500 to-primary-600',
  iconBg = 'bg-primary-50 dark:bg-primary-950/40',
  iconColor = 'text-primary-600 dark:text-primary-400',
  className
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
      }}
      className={cn(
        "stat-card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-5 rounded-2xl",
        className
      )}
    >
      {/* Dynamic top gradient bar */}
      <div
        className={cn(
          "absolute top-0 inset-x-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          gradient
        )}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            iconBg
          )}
        >
          {Icon && <Icon className={cn("w-5.5 h-5.5", iconColor)} />}
        </div>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
              trendUp
                ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
                : 'text-orange-700 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/40'
            )}
          >
            {trendUp ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {trend}
          </div>
        )}
      </div>

      <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">
        <AnimatedCounter
          end={value}
          suffix={suffix}
          decimals={decimals}
        />
      </p>

      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
        {label}
      </p>

      {trend !== undefined && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
          {trendLabel}
        </p>
      )}
    </motion.div>
  );
}
