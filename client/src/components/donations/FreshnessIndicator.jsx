import { motion } from 'framer-motion';
import { Sparkles, Calendar, ShieldAlert, Lightbulb } from 'lucide-react';
import { cn } from '@/utils/helpers';

/**
 * FreshnessIndicator - Renders the AI freshness analysis report beautifully
 *
 * @component
 */
export default function FreshnessIndicator({ 
  score, 
  urgency, 
  shelfLife, 
  recommendations = [], 
  distributionMethod, 
  analysis, 
  className 
}) {
  // Determine color theme based on freshness score
  const getScoreColor = (s) => {
    if (s >= 75) return 'text-emerald-600 dark:text-emerald-400';
    if (s >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getScoreBg = (s) => {
    if (s >= 75) return 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-900/20';
    if (s >= 40) return 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/20';
    return 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/20';
  };

  const getUrgencyBadgeColor = (u) => {
    const val = String(u || 'medium').toLowerCase();
    if (val === 'critical') return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200/50 dark:border-red-900/40';
    if (val === 'high') return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/50 dark:border-orange-900/40';
    if (val === 'medium') return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/40';
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/40';
  };

  const cleanScore = score !== undefined ? Number(score) : 50;

  return (
    <motion.div
      className={cn("p-5 rounded-2xl border bg-white dark:bg-slate-900/40 shadow-sm space-y-4", getScoreBg(cleanScore), className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">AI Freshness Analysis</h4>
        </div>
        <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider", getUrgencyBadgeColor(urgency))}>
          {urgency || 'medium'} Urgency
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Score Ring / Bar */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            {/* SVG circle gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-slate-100 dark:stroke-slate-800/60"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                className={cn("transition-all duration-1000 ease-out", 
                  cleanScore >= 75 ? "stroke-emerald-500" : cleanScore >= 40 ? "stroke-amber-500" : "stroke-rose-500"
                )}
                strokeWidth="6"
                fill="none"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * cleanScore) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={cn("text-lg font-extrabold tracking-tighter", getScoreColor(cleanScore))}>
                {cleanScore}%
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400">Fresh</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {cleanScore >= 75 ? 'Excellent Quality' : cleanScore >= 40 ? 'Good / Acceptable' : 'Consume Immediately'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              Shelf Life: {shelfLife || '1-2 days'}
            </div>
          </div>
        </div>

        {/* Distribution Method */}
        {distributionMethod && (
          <div className="flex flex-col justify-center bg-slate-50 dark:bg-slate-800/30 rounded-xl p-3 border border-slate-100 dark:border-slate-800/40">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Suggested Distribution
            </span>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              {distributionMethod}
            </p>
          </div>
        )}
      </div>

      {/* Safety recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Safety Recommendations
          </span>
          <ul className="space-y-1.5 pl-1">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-600 mt-1.5 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full analysis summary */}
      {analysis && (
        <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed italic">
            <strong>AI Note:</strong> {analysis}
          </p>
        </div>
      )}
    </motion.div>
  );
}
