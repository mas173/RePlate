import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../../services/api';
import { useAppAuth } from '../../hooks/useAppAuth';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ActivityItem {
  id: string;
  donationId: string;
  type: 'donation' | 'claim';
  title: string;
  sub: string;
  time: Date;
  status: string;
  donorName?: string;
  ngoName?: string;
}

export default function ActivityScreen() {
  const { profile } = useAppAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'donations' | 'claims'>('all');

  const fetchActivities = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch donations and claims in parallel
      const [donationsRes, claimsRes] = await Promise.allSettled([
        apiClient.get(`/donations?t=${Date.now()}`),
        apiClient.get(`/claims?t=${Date.now()}`),
      ]);

      let rawDonations = [];
      if (donationsRes.status === 'fulfilled') {
        rawDonations = donationsRes.value.data?.donations || donationsRes.value.data || [];
      }

      let rawClaims = [];
      if (claimsRes.status === 'fulfilled') {
        rawClaims = claimsRes.value.data?.claims || claimsRes.value.data || [];
      }

      // Map donations
      const donationActivities: ActivityItem[] = rawDonations.map((d: any) => ({
        id: `donation-${d.id}`,
        donationId: d.id,
        type: 'donation',
        title: 'Donation Posted',
        sub: d.food_name || 'Food Pack',
        time: new Date(d.created_at || d.updated_at),
        status: d.status || 'available',
        donorName: d.donor?.organization_name || 'Donor',
      }));

      // Map claims
      const claimActivities: ActivityItem[] = rawClaims.map((c: any) => ({
        id: `claim-${c.id}`,
        donationId: c.donation_id,
        type: 'claim',
        title: 'Food Claimed',
        sub: c.donation?.food_name || 'Food Pack',
        time: new Date(c.created_at || c.updated_at),
        status: c.status || 'pending',
        ngoName: c.ngo?.organization_name || 'NGO',
      }));

      // Combine and sort by date descending
      const combined = [...donationActivities, ...claimActivities].sort(
        (a, b) => b.time.getTime() - a.time.getTime()
      );

      setActivities(combined);
    } catch (err) {
      console.warn('Failed to fetch activity list:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      fetchActivities();
    }
  }, [profile, fetchActivities]);

  const filteredActivities = activities.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'donations') return item.type === 'donation';
    if (activeTab === 'claims') return item.type === 'claim';
    return true;
  });

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'delivered' || s === 'claimed') {
      return { bg: '#DCFCE7', text: '#16A34A' };
    }
    if (s === 'pending' || s === 'in_transit' || s === 'active') {
      return { bg: '#DBEAFE', text: '#2563EB' };
    }
    return { bg: '#FEF3C7', text: '#D97706' };
  };

  const handleItemPress = (donationId: string) => {
    if (donationId) {
      router.push(`/modal?id=${donationId}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Activity</Text>
          <Ionicons name="receipt-outline" size={20} color="#2E7D32" style={styles.headerLeaf} />
        </View>
        <Text style={styles.headerSubtitle}>
          Real-time tracking of all listings, claims, and completions
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'donations' && styles.tabBtnActive]}
          onPress={() => setActiveTab('donations')}
        >
          <Text style={[styles.tabText, activeTab === 'donations' && styles.tabTextActive]}>Donations</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'claims' && styles.tabBtnActive]}
          onPress={() => setActiveTab('claims')}
        >
          <Text style={[styles.tabText, activeTab === 'claims' && styles.tabTextActive]}>Claims</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Fetching activity log...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchActivities(true)}
              colors={['#2E7D32']}
              tintColor="#2E7D32"
            />
          }
        >
          {filteredActivities.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="history" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No activities found</Text>
              <Text style={styles.emptySub}>
                Your shared and claimed meals will show up here.
              </Text>
            </View>
          ) : (
            filteredActivities.map((item, index) => {
              const statusStyle = getStatusStyle(item.status);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.activityCard}
                  activeOpacity={0.8}
                  onPress={() => handleItemPress(item.donationId)}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      { backgroundColor: item.type === 'claim' ? '#EBF5FF' : '#E6F4EA' },
                    ]}
                  >
                    <Ionicons
                      name={item.type === 'claim' ? 'people' : 'gift-outline'}
                      size={20}
                      color={item.type === 'claim' ? '#2563EB' : '#2E7D32'}
                    />
                  </View>

                  <View style={styles.mainInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSub} numberOfLines={1}>
                      {item.sub}
                    </Text>
                    <Text style={styles.timeText}>{getRelativeTime(item.time)}</Text>
                  </View>

                  <View style={styles.badgeWrapper}>
                    <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color="#D1D5DB" style={{ marginTop: 6 }} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B4329',
  },
  headerLeaf: {
    marginLeft: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 4,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EAF3E9',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabBtnActive: {
    backgroundColor: '#2E7D32',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  itemSub: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  badgeWrapper: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4B5563',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
