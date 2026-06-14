import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppAuth } from '../../hooks/useAppAuth';
import { apiClient } from '../../services/api';
import { Colors } from '../../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

interface Donation {
  id: string;
  food_name: string;
  category: string;
  quantity: string;
  status: 'available' | 'claimed' | 'completed' | 'in_progress';
  expires_at: string;
  created_at: string;
  description?: string;
  pickup_city?: string;
}

export default function MyDonationsScreen() {
  const { role } = useAppAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = async () => {
    try {
      setError(null);
      const response = await apiClient.get('/donations');
      setDonations(response.data.donations || []);
    } catch (err: any) {
      console.error('Error fetching donations:', err);
      setError(err.message || 'Failed to load donations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDonations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDonations();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available':
        return { bg: '#DCFCE7', text: '#16A34A', label: 'Available' };
      case 'claimed':
        return { bg: '#DBEAFE', text: '#2563EB', label: 'Claimed' };
      case 'completed':
        return { bg: '#F3F4F6', text: '#4B5563', label: 'Completed' };
      default:
        return { bg: '#F3E8FF', text: '#7C3AED', label: 'In Progress' };
    }
  };

  const renderDonationItem = ({ item }: { item: Donation }) => {
    const status = getStatusStyle(item.status);
    const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/modal?id=${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.foodTypeGroup}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="food-apple" size={18} color="#2E7D32" />
            </View>
            <View>
              <Text style={styles.foodName} numberOfLines={1}>
                {item.food_name}
              </Text>
              <Text style={styles.categoryLabel}>{item.category || 'Cooked Food'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusBadgeText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={14} color="#6B7280" />
            <Text style={styles.infoText}>Quantity: {item.quantity}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              Expires: {new Date(item.expires_at).toLocaleString()}
            </Text>
          </View>
          {item.pickup_city && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{item.pickup_city}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>Posted on {dateStr}</Text>
          <View style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>View Details</Text>
            <Ionicons name="chevron-forward" size={12} color="#2E7D32" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>My Donations</Text>
          <Ionicons name="leaf" size={16} color="#2E7D32" style={styles.headerLeaf} />
        </View>
        <Text style={styles.headerSubtitle}>
          Track claims, pending pickups, and history of your shared meals
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchDonations}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : donations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="basket-fill" size={64} color="#C1E1B9" />
          <Text style={styles.emptyTitle}>No donations shared yet</Text>
          <Text style={styles.emptySub}>
            Your shared meals will appear here. Click the + button in the tab bar to share surplus food.
          </Text>
          <TouchableOpacity style={styles.donateBtn} onPress={() => router.push('/donate')}>
            <Text style={styles.donateBtnText}>Donate Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={donations}
          renderItem={renderDonationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
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
    transform: [{ rotate: '45deg' }],
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodTypeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  categoryLabel: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  cardBody: {
    marginVertical: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#4B5563',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2E7D32',
    marginRight: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4329',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
  },
  donateBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  donateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
