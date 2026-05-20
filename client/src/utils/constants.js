/**
 * Application-wide constants
 */

export const ROLES = {
  DONOR: 'donor',
  NGO: 'ngo',
  ADMIN: 'admin',
};

export const DONATION_STATUS = {
  AVAILABLE: 'available',
  CLAIMED: 'claimed',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

export const URGENCY_LEVELS = {
  CRITICAL: 'critical',   // < 2 hours
  HIGH: 'high',           // 2-6 hours
  MEDIUM: 'medium',       // 6-24 hours
  LOW: 'low',             // > 24 hours
};

export const FOOD_CATEGORIES = [
  { value: 'cooked_meals', label: 'Cooked Meals', icon: '🍽️' },
  { value: 'raw_produce', label: 'Raw Produce', icon: '🥬' },
  { value: 'bakery', label: 'Bakery & Bread', icon: '🍞' },
  { value: 'dairy', label: 'Dairy Products', icon: '🥛' },
  { value: 'beverages', label: 'Beverages', icon: '🥤' },
  { value: 'packaged', label: 'Packaged Food', icon: '📦' },
  { value: 'fruits', label: 'Fruits', icon: '🍎' },
  { value: 'grains', label: 'Grains & Cereals', icon: '🌾' },
  { value: 'meat', label: 'Meat & Protein', icon: '🥩' },
  { value: 'other', label: 'Other', icon: '🍴' },
];

export const STORAGE_CONDITIONS = [
  { value: 'room_temp', label: 'Room Temperature' },
  { value: 'refrigerated', label: 'Refrigerated' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'heated', label: 'Heated / Hot' },
];

export const NAV_ITEMS = {
  donor: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Donations', path: '/donations', icon: 'Package' },
    { label: 'Upload Food', path: '/donate', icon: 'PlusCircle' },
    { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
  ngo: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Available Food', path: '/available', icon: 'Search' },
    { label: 'My Claims', path: '/claims', icon: 'ClipboardCheck' },
    { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
    { label: 'Users', path: '/admin/users', icon: 'Users' },
    { label: 'All Donations', path: '/admin/donations', icon: 'Package' },
    { label: 'Analytics', path: '/admin/analytics', icon: 'BarChart3' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
    { label: 'Settings', path: '/settings', icon: 'Settings' },
  ],
};
