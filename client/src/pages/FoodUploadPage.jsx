import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import { FoodUploadForm } from '@/components/donations';

/**
 * Food Upload Form Page
 *
 * Multi-step form for donors to upload food donations:
 * - Step 1: Food details (name, category, quantity, storage)
 * - Step 2: Image upload with AI analysis
 * - Step 3: Pickup/location details
 * - Step 4: Review & submit
 *
 * Features:
 * - Drag & drop image upload
 * - AI-powered freshness analysis
 * - Auto-categorization
 * - Expiry date estimation
 *
 * @component
 * @requires role - 'donor'
 */
export default function FoodUploadPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <motion.div
        className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1">
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
        <span className="text-slate-800 dark:text-slate-200 font-medium">Donate Food</span>
      </motion.div>

      {/* Page title */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Upload Food Donation
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          List your surplus food in under 2 minutes. Our AI will handle the rest.
        </p>
      </motion.div>

      {/* Form card */}
      <motion.div
        className="card p-6 sm:p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <FoodUploadForm />
      </motion.div>
    </div>
  );
}
