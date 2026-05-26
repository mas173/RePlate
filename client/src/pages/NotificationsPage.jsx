import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellOff, CheckCheck, Package, ClipboardCheck,
  AlertTriangle, Award, Info, Filter, ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppAuth } from '@/hooks/useAppAuth';
import { notificationsAPI } from '@/services/api';

const NOTIFICATION_ICONS = {
  donation_alert: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  claim_update: { icon: ClipboardCheck, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  expiry_warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  achievement: { icon: Award, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  system: { icon: Info, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
};

function getRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

export default function NotificationsPage() {
  const { getAuthToken } = useAppAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const res = await notificationsAPI.getAll(token);
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );

      await notificationsAPI.markRead(token, id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      await notificationsAPI.markAllRead(token);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to mark all as read');
      await fetchNotifications(); // Revert by refetching
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await handleMarkRead(notification.id);
    }

    // Navigate to related content
    const donationId = notification.data?.donation_id;
    if (donationId) {
      navigate(`/donations/${donationId}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto py-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-glow-green">
              <Bell className="w-4.5 h-4.5 text-white" />
            </div>
            Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You\'re all caught up!'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'read', label: 'Read' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="btn-secondary px-3 py-2 text-xs gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Notification list */}
      {filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BellOff className="w-9 h-9 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {filter === 'all'
              ? 'When you post donations or receive claims, notifications will appear here.'
              : 'Try changing the filter to see other notifications.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => {
              const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;
              const IconComp = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`card p-4 cursor-pointer group transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 ${
                    !notification.is_read
                      ? 'border-l-4 border-l-primary-500 bg-primary-50/30 dark:bg-primary-950/10'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                      <IconComp className={`w-5 h-5 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-semibold leading-tight ${
                          !notification.is_read
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {getRelativeTime(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${
                        !notification.is_read
                          ? 'text-slate-600 dark:text-slate-400'
                          : 'text-slate-500 dark:text-slate-500'
                      }`}>
                        {notification.message}
                      </p>
                    </div>

                    {/* Arrow */}
                    {notification.data?.donation_id && (
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
