import { MapPin, Clock } from 'lucide-react';

export default function PickupLocationStep({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Pickup Location & Instructions
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Where should the NGO pick up the food?
        </p>
      </div>

      {/* Location card */}
      <div className="card p-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pickup Address</span>
        </div>

        {/* Address line */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g., 123 MG Road, Ground Floor"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
          />
        </div>

        {/* City, State, Pincode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Mumbai"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g., Maharashtra"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="e.g., 400001"
              value={data.pincode}
              onChange={(e) => onChange({ pincode: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Pickup time window */}
      <div className="card p-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pickup Time Window</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Available From <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              className="input"
              value={data.pickupFrom}
              onChange={(e) => onChange({ pickupFrom: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Available To <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              className="input"
              value={data.pickupTo}
              onChange={(e) => onChange({ pickupTo: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Special instructions */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Special Instructions <span className="text-slate-400 text-xs">(optional)</span>
        </label>
        <textarea
          className="input min-h-[100px] resize-y"
          placeholder="e.g., Use the back entrance, ask for the manager, parking available…"
          value={data.instructions}
          onChange={(e) => onChange({ instructions: e.target.value })}
        />
      </div>
    </div>
  );
}
