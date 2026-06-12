import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '../services/api';
import { useAppAuth } from '../hooks/useAppAuth';

interface Notification {
  id: string;
  type: 'donation_alert' | 'claim_update' | 'expiry_warning' | 'achievement' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: {
    donation_id?: string;
    claim_id?: string;
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isSignedIn } = useAppAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!isSignedIn) return;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiClient.get('/notifications');
      const data = response.data.notifications || [];
      setNotifications(data);

      // Auto mark all as read on viewing if there are any unread ones
      const hasUnread = data.some((n: Notification) => !n.is_read);
      if (hasUnread) {
        // Run in background so user doesn't wait
        apiClient.patch('/notifications/read-all').catch((err) => {
          console.error('Failed to auto mark all notifications as read:', err);
        });
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      Alert.alert('Error', err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await apiClient.patch('/notifications/read-all');
    } catch (err: any) {
      console.error('Failed to mark all read:', err);
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        // Optimistic update
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        await apiClient.patch(`/notifications/${notification.id}/read`);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }

    // Redirection on clicking the notification
    const donationId = notification.data?.donation_id;
    if (donationId) {
      router.push(`/modal?id=${donationId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'donation_alert':
        return { name: 'cube', color: '#3B82F6', bg: '#EFF6FF' };
      case 'claim_update':
        return { name: 'checkmark-done-circle', color: '#10B981', bg: '#ECFDF5' };
      case 'expiry_warning':
        return { name: 'warning', color: '#F59E0B', bg: '#FEF3C7' };
      case 'achievement':
        return { name: 'trophy', color: '#8B5CF6', bg: '#F5F3FF' };
      default:
        return { name: 'information-circle', color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const renderItem = ({ item }: { item: Notification }) => {
    const iconConfig = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
        onPress={() => handleNotificationClick(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.name as any} size={20} color={iconConfig.color} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, !item.is_read && styles.unreadText]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.timeText}>{getRelativeTime(item.created_at)}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1B4329" />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Filter and Mark All Read Bar */}
      <View style={styles.filterBar}>
        <View style={styles.filterOptions}>
          {(['all', 'unread', 'read'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.filterBtn, filter === opt && styles.filterBtnActive]}
              onPress={() => setFilter(opt)}
            >
              <Text style={[styles.filterBtnText, filter === opt && styles.filterBtnTextActive]}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-done" size={16} color="#2E7D32" />
            <Text style={styles.markAllText}>Read All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.infoText}>Loading notifications...</Text>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#C7D2C4" />
          <Text style={styles.emptyTitle}>
            {filter === 'unread'
              ? 'No unread notifications'
              : filter === 'read'
              ? 'No read notifications'
              : 'All caught up!'}
          </Text>
          <Text style={styles.emptySub}>
            Notifications alert you about claims, updates, and milestones.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              colors={['#2E7D32']}
              tintColor="#2E7D32"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
    backgroundColor: '#FFFFFF',
  },
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
  },
  headerBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4329',
    marginLeft: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: '#1B4329',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
    backgroundColor: '#FFFFFF',
  },
  filterOptions: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterBtnTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1B4329',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    backgroundColor: '#F7FAF6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    color: '#111827',
    fontWeight: '800',
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  message: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginLeft: 8,
  },
});
