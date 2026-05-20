/**
 * Utility functions shared across the client application
 */

import { clsx } from 'clsx';

/**
 * Merge class names conditionally (Tailwind-friendly)
 * Usage: cn('base-class', condition && 'conditional-class', 'always-class')
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format a number with commas (e.g., 1000 → "1,000")
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat().format(num);
}

/**
 * Format weight in kg to human-readable string
 */
export function formatWeight(kg) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} tonnes`;
  return `${kg} kg`;
}

/**
 * Get urgency badge color
 */
export function getUrgencyColor(level) {
  const colors = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return colors[level] || colors.medium;
}

/**
 * Get donation status badge color
 */
export function getStatusColor(status) {
  const colors = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    claimed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    picked_up: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colors[status] || colors.available;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, length = 50) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

/**
 * Calculate environmental impact from weight in kg
 */
export function calculateImpact(weightInKg) {
  return {
    mealsSaved: Math.round(weightInKg / 0.5),
    co2Reduced: Math.round(weightInKg * 2.5 * 100) / 100,
    waterSaved: Math.round(weightInKg * 1000),
    landSaved: Math.round(weightInKg * 3.5 * 100) / 100,
  };
}
