import { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector
} from 'recharts';
import { RefreshCw, LayoutGrid } from 'lucide-react';

const CATEGORY_COLORS = {
  cooked_meals: '#F59E0B', // Amber
  raw_produce: '#10B981',  // Emerald
  bakery: '#8B5CF6',       // Purple
  dairy: '#3B82F6',        // Blue
  beverages: '#06B6D4',    // Cyan
  packaged: '#EC4899',     // Pink
  fruits: '#EF4444',       // Red
  grains: '#F97316',       // Orange
  meat: '#E11D48',         // Rose
  other: '#64748B'         // Slate
};

const CATEGORY_LABELS = {
  cooked_meals: 'Cooked Meals',
  raw_produce: 'Raw Produce',
  bakery: 'Bakery Items',
  dairy: 'Dairy & Eggs',
  beverages: 'Beverages',
  packaged: 'Packaged Goods',
  fruits: 'Fresh Fruits',
  grains: 'Grains & Pasta',
  meat: 'Meat & Poultry',
  other: 'Other Food'
};

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 8) * cos;
  const sy = cy + (outerRadius + 8) * sin;
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 14;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  const formattedCat = CATEGORY_LABELS[payload.category] || payload.category;

  return (
    <g>
      <text x={cx} y={cy} dy={-4} textAnchor="middle" fill="#94A3B8" fontSize={11} fontWeight={600}>
        {formattedCat}
      </text>
      <text x={cx} y={cy} dy={16} textAnchor="middle" fill={fill} fontSize={16} fontWeight={800}>
        {value} {payload.unit || 'Items'}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 8}
        fill={fill}
        opacity={0.4}
      />
    </g>
  );
};

export default function CategoryPieChart({ data = [], loading = false, onRefresh }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Pre-process categories, filter out zero elements
  const cleanData = data
    .map(item => ({
      category: item.category,
      value: item.count || 0,
      servings: item.servings || 0,
      weight: parseFloat(item.weight) || 0,
    }))
    .filter(item => item.value > 0);

  // Fallback data if empty
  const chartData = cleanData.length > 0 ? cleanData : [
    { category: 'cooked_meals', value: 1, servings: 20, weight: 10 },
    { category: 'raw_produce', value: 1, servings: 0, weight: 15 },
    { category: 'bakery', value: 1, servings: 10, weight: 5 },
  ];

  const totalItems = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="card p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col h-[400px]">
      <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-base">
            Food Category Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Distribution of rescued surplus food by structural food type.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors shrink-0"
            title="Refresh categories"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 dark:text-slate-450 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col sm:flex-row items-center justify-center gap-6 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-850/50 backdrop-blur-[1px] z-10 rounded-xl">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-800/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 z-10">
            <LayoutGrid className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-xs text-slate-450 dark:text-slate-500 font-medium">
              No category data recorded yet.
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
              Categories will automatically populate as donations are posted.
            </p>
          </div>
        ) : null}

        {/* Pie Area */}
        <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend Section */}
        <div className="flex-1 w-full overflow-y-auto max-h-[160px] sm:max-h-[220px] pr-2 scrollbar-thin">
          <div className="space-y-2">
            {chartData.map((entry, index) => {
              const color = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other;
              const label = CATEGORY_LABELS[entry.category] || entry.category;
              const pct = totalItems > 0 ? ((entry.value / totalItems) * 100).toFixed(0) : '0';
              const isActive = activeIndex === index;

              return (
                <div
                  key={index}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-50 dark:bg-transparent border-slate-200 dark:border-slate-400/60 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className={`text-xs font-bold truncate ${
                      isActive ? 'text-slate-800 dark:text-white' : 'text-slate-550 dark:text-slate-400'
                    }`}>
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4 font-mono text-xs text-right">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {entry.value}
                    </span>
                    <span className="font-semibold text-slate-400 dark:text-slate-500 w-8">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
