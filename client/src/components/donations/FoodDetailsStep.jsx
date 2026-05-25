import { FOOD_CATEGORIES, STORAGE_CONDITIONS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

export default function FoodDetailsStep({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Food Details
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tell us about the food you'd like to donate.
        </p>
      </div>

      {/* Food name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Food Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="input"
          placeholder="e.g., Cooked Rice & Curry, Assorted Pastries"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      {/* Category grid */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {FOOD_CATEGORIES.map((cat) => {
            const isSelected = data.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onChange({ category: cat.value })}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 text-center',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                )}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={cn(
                  'text-xs font-medium leading-tight',
                  isSelected
                    ? 'text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400'
                )}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity + Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            className="input"
            placeholder="e.g., 15"
            value={data.quantity}
            onChange={(e) => onChange({ quantity: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Unit
          </label>
          <select
            className="input"
            value={data.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
          >
            <option value="meals">Meals</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="items">Items</option>
            <option value="packs">Packs</option>
            <option value="litres">Litres</option>
            <option value="servings">Servings</option>
          </select>
        </div>
      </div>

      {/* Expiry date + time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="input"
            value={data.expiryDate}
            onChange={(e) => onChange({ expiryDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Expiry Time
          </label>
          <input
            type="time"
            className="input"
            value={data.expiryTime}
            onChange={(e) => onChange({ expiryTime: e.target.value })}
          />
        </div>
      </div>

      {/* Storage conditions */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Storage Condition <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STORAGE_CONDITIONS.map((cond) => {
            const isSelected = data.storageCondition === cond.value;
            const icons = {
              room_temp: '🌡️',
              refrigerated: '❄️',
              frozen: '🧊',
              heated: '🔥',
            };
            return (
              <button
                key={cond.value}
                type="button"
                onClick={() => onChange({ storageCondition: cond.value })}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                <span className="text-lg">{icons[cond.value] || '📦'}</span>
                <span className={cn(
                  'text-sm font-medium',
                  isSelected
                    ? 'text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400'
                )}>
                  {cond.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
