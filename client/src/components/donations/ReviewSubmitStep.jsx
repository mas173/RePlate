import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Image as ImageIcon, MapPin, Clock, Edit2,
  Send, Loader2, CheckCircle, ArrowRight, Sparkles, ChevronLeft
} from 'lucide-react';
import { FOOD_CATEGORIES, STORAGE_CONDITIONS } from '@/utils/constants';

function getCategoryLabel(value) {
  const cat = FOOD_CATEGORIES.find((c) => c.value === value);
  return cat ? `${cat.icon} ${cat.label}` : value;
}

function getStorageLabel(value) {
  const cond = STORAGE_CONDITIONS.find((c) => c.value === value);
  return cond ? cond.label : value;
}

function SectionCard({ icon: Icon, iconBg, title, onEdit, children }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {title}
          </h4>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-1.5">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right max-w-[60%]">
        {value || <span className="text-slate-300 dark:text-slate-600 italic">Not provided</span>}
      </span>
    </div>
  );
}

function SuccessView({ onReset }) {
  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Success icon */}
      <motion.div
        className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
      >
        <CheckCircle className="w-10 h-10 text-primary-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Donation Submitted! 🎉
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          Your food donation has been listed. NGOs in your area will be notified, and our AI will analyse the freshness shortly.
        </p>

        {/* AI badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-950/40 dark:to-teal-950/40 border border-primary-200/60 dark:border-primary-800/60 mb-8">
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            AI freshness analysis will be ready in ~30 seconds
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="btn-primary py-2.5 px-6"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <button onClick={onReset} className="btn-secondary py-2.5 px-6">
            Donate More Food
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ReviewSubmitStep({ data, onEdit, onSubmit, isSubmitting, isSubmitted, onReset }) {
  if (isSubmitted) {
    return <SuccessView onReset={onReset} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Review & Submit
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Double-check everything before submitting your donation.
        </p>
      </div>

      {/* Food details */}
      <SectionCard
        icon={Package}
        iconBg="bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400"
        title="Food Details"
        onEdit={() => onEdit(1)}
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
          <InfoRow label="Name" value={data.name} />
          <InfoRow label="Category" value={getCategoryLabel(data.category)} />
          <InfoRow label="Quantity" value={data.quantity ? `${data.quantity} ${data.unit}` : ''} />
          <InfoRow label="Expiry" value={
            data.expiryDate
              ? `${data.expiryDate}${data.expiryTime ? ' at ' + data.expiryTime : ''}`
              : ''
          } />
          <InfoRow label="Storage" value={getStorageLabel(data.storageCondition)} />
        </div>
      </SectionCard>

      {/* Images */}
      <SectionCard
        icon={ImageIcon}
        iconBg="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"
        title="Images"
        onEdit={() => onEdit(2)}
      >
        {data.images && data.images.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {data.images.map((img, i) => (
              <img
                key={i}
                src={img.preview}
                alt={`Preview ${i + 1}`}
                className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700/60 shrink-0"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 italic">No images uploaded</p>
        )}
        {data.notes && <InfoRow label="Notes" value={data.notes} />}
      </SectionCard>

      {/* Location */}
      <SectionCard
        icon={MapPin}
        iconBg="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400"
        title="Pickup Location"
        onEdit={() => onEdit(3)}
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
          <InfoRow label="Address" value={data.address} />
          <InfoRow label="City" value={data.city} />
          <InfoRow label="State" value={data.state} />
          <InfoRow label="Pincode" value={data.pincode} />
          <InfoRow label="Pickup Window" value={
            data.pickupFrom && data.pickupTo
              ? `${data.pickupFrom} — ${data.pickupTo}`
              : ''
          } />
          {data.instructions && <InfoRow label="Instructions" value={data.instructions} />}
        </div>
      </SectionCard>

      {/* Submit / Back */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700/60">
        <button onClick={() => onEdit(3)} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-primary px-8 py-3 text-base shadow-glow-green disabled:shadow-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              Submit Donation <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
