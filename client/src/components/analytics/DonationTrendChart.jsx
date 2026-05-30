import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Calendar, RefreshCw } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Format the date label beautifully (e.g. May 28, 2026)
    let formattedLabel = label;
    try {
      const date = new Date(label);
      formattedLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      // Fallback
    }

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/50 p-3.5 rounded-xl shadow-2xl text-white text-xs font-sans min-w-[160px] animate-fade-in">
        <p className="font-bold text-slate-350 border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary-400" />
          {formattedLabel}
        </p>
        <div className="space-y-1.5">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-extrabold text-sm" style={{ color: item.color }}>
                {item.value.toLocaleString()}
                {item.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function DonationTrendChart({ data = [], loading = false, onRefresh }) {
  const [activeMetric, setActiveMetric] = useState('both'); // 'donations' | 'meals' | 'both'

  // Pre-process and sort data chronologically
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Fill in empty dates if there is no data to make it look full and dynamic
  const chartData = sortedData.length > 0 ? sortedData : [
    { date: '2026-05-20', donationsCount: 0, mealsSaved: 0, weightSaved: 0 },
    { date: '2026-05-21', donationsCount: 0, mealsSaved: 0, weightSaved: 0 },
    { date: '2026-05-22', donationsCount: 0, mealsSaved: 0, weightSaved: 0 },
    { date: '2026-05-23', donationsCount: 0, mealsSaved: 0, weightSaved: 0 },
    { date: '2026-05-24', donationsCount: 0, mealsSaved: 0, weightSaved: 0 },
    { date: '2026-05-25', donationsCount: 0, mealsSaved: 0, weightSaved: 0 },
    { date: '2026-05-26', donationsCount: 0, mealsSaved: 0, weightSaved: 0 },
  ].map(item => {
    // Offset dates dynamically from today
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return item; // Just returning stub as fallback
  });

  const formatXAxis = (tickItem) => {
    try {
      const date = new Date(tickItem);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return tickItem;
    }
  };

  return (
    <div className="card p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 shrink-0">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base">
            Donation Trends (Last 30 Days)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize the volume of food donations and meals saved over time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Metric selector tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold border border-slate-200/40 dark:border-slate-800/40">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                activeMetric === 'both'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All Metrics
            </button>
            <button
              onClick={() => setActiveMetric('donations')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                activeMetric === 'donations'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Donations
            </button>
            <button
              onClick={() => setActiveMetric('meals')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                activeMetric === 'meals'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Meals Saved
            </button>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors"
              title="Refresh chart data"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 dark:text-slate-450 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-850/50 backdrop-blur-[1px] z-10 rounded-xl">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-800/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">
              No trend data available for the last 30 days yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
              Donations will show up chronologically once impact transactions are logged.
            </p>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="colorMeals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700/40" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#94A3B8"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={10}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '3 3' }} />
            
            {(activeMetric === 'both' || activeMetric === 'donations') && (
              <Area
                type="monotone"
                name="Donations Posted"
                dataKey="donationsCount"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorDonations)"
                activeDot={{ r: 5, strokeWidth: 1.5, stroke: '#FFFFFF' }}
              />
            )}
            
            {(activeMetric === 'both' || activeMetric === 'meals') && (
              <Area
                type="monotone"
                name="Meals Rescued"
                dataKey="mealsSaved"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMeals)"
                activeDot={{ r: 5, strokeWidth: 1.5, stroke: '#FFFFFF' }}
              />
            )}
            
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '15px' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
