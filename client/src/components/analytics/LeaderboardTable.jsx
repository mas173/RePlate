import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, MapPin, Heart, ShieldAlert, Package, Trophy, Sparkles, RefreshCw } from 'lucide-react';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -15 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function LeaderboardTable({ donors = [], ngos = [], loading = false }) {
  const [activeTab, setActiveTab] = useState('donors'); // 'donors' | 'ngos'

  const leaders = activeTab === 'donors' ? donors : ngos;

  const getRankBadge = (rank) => {
    switch (rank) {
      case 0:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center font-black shadow-sm relative">
            <Trophy className="w-4 h-4 fill-current absolute -top-1 right-[-4px] rotate-[15deg] text-amber-500 animate-pulse" />
            1
          </div>
        );
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-350 flex items-center justify-center font-black shadow-sm">
            2
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 flex items-center justify-center font-black shadow-sm">
            3
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center font-semibold text-xs border border-slate-100 dark:border-slate-700/40">
            {rank + 1}
          </div>
        );
    }
  };

  return (
    <div className="card p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col h-[460px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 shrink-0">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-1.5">
            <Award className="w-5 h-5 text-amber-500" />
            Top Rescuers Leaderboard
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Honoring our highly active community members driving massive social impact.
          </p>
        </div>

        {/* Donors / NGOs Tab toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold border border-slate-200/40 dark:border-slate-800/40 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'donors'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Top Donors
          </button>
          <button
            onClick={() => setActiveTab('ngos')}
            className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'ngos'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Top NGOs
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 relative">
        {loading ? (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-850/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-850/10 rounded-xl border border-dashed border-slate-150 dark:border-slate-700">
            <ShieldAlert className="w-7 h-7 text-slate-450 dark:text-slate-500 mb-1.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Leaderboard is currently empty.
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
              Complete and log the first food delivery to claim a spot on the board!
            </p>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2.5 pt-1 pb-2"
          >
            {leaders.map((leader, index) => {
              const displayName = leader.organizationName ||
                (leader.firstName && leader.lastName
                  ? `${leader.firstName} ${leader.lastName}`
                  : leader.firstName || 'Anonymous Member');
              const meals = leader.mealsSaved || 0;
              const weight = leader.weightSaved || 0;

              return (
                <motion.div
                  key={leader.id}
                  variants={item}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-700/30 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-card group transition-all duration-300"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank */}
                    <div className="shrink-0 flex items-center justify-center w-8">
                      {getRankBadge(index)}
                    </div>

                    {/* Avatar / Initials */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shrink-0 flex items-center justify-center relative">
                      {leader.avatarUrl ? (
                        <img src={leader.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      {index === 0 && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/10 to-amber-500/30 pointer-events-none" />
                      )}
                    </div>

                    {/* Name and Location */}
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-800 dark:text-white leading-snug truncate block group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                        {displayName}
                      </span>
                      {leader.city && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate">{leader.city}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Impact Stats */}
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    {/* Meals saved */}
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        {meals.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                        Meals
                      </span>
                    </div>

                    {/* Weight rescued */}
                    <div className="flex flex-col items-end min-w-[54px] border-l border-slate-100 dark:border-slate-750 pl-4">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-primary-500" />
                        {weight >= 1000 ? `${(weight / 1000).toFixed(1)}t` : `${weight.toFixed(0)}kg`}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider text-right">
                        Rescued
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
