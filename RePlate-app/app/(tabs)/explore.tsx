import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppAuth } from '../../hooks/useAppAuth';
import { Card, Button, Input } from '../../components/ui';
import { Colors } from '../../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '../../services/api';

interface Donation {
  id: string;
  food_name: string;
  category: string;
  quantity: string;
  status: string;
  expires_at: string;
  created_at: string;
  description?: string;
  pickup_city?: string;
  pickup_address?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  profiles?: {
    first_name?: string;
    last_name?: string;
    organization_name?: string;
    email?: string;
  };
}

interface Claim {
  id: string;
  donation_id: string;
  status: 'confirmed' | 'picked_up' | 'delivered' | 'cancelled';
  created_at: string;
  notes?: string;
  pickup_scheduled_at?: string;
  donation: {
    id: string;
    food_name: string;
    quantity: string;
    status: string;
    category?: string;
  };
  ngo?: {
    first_name?: string;
    last_name?: string;
    organization_name?: string;
    email?: string;
    phone?: string;
  };
}

export default function ExploreScreen() {
  const { role, profile } = useAppAuth();
  const isDonor = role === 'donor';
  const router = useRouter();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Veg' | 'Non-Veg'>('All');
  const [claimingInProgress, setClaimingInProgress] = useState<string | null>(null);

  const fetchData = async (isQuiet = false) => {
    if (!profile) return;
    try {
      if (!isQuiet) {
        setLoading(true);
      }
      setError(null);

      if (isDonor) {
        // Donors see the claims made on their donations
        const response = await apiClient.get(`/claims?t=${Date.now()}`);
        setClaims(response.data || []);
      } else {
        // NGOs see the available donations in the system
        const response = await apiClient.get(`/donations?t=${Date.now()}`);
        setDonations(response.data.donations || []);
      }
    } catch (err: any) {
      console.error('Error fetching data in Explore:', err);
      setError(err.message || 'Failed to sync with server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on initial mount. We removed useFocusEffect to prevent repeated API calls
  // when navigating back from donation detail pages. Use manual refresh to pull new data.
  useEffect(() => {
    fetchData();
  }, [role, profile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const handleClaimFood = (item: Donation) => {
    Alert.alert(
      'Confirm Claim',
      `Would you like to claim ${item.quantity} of ${item.food_name} from ${
        item.profiles?.organization_name || 'the donor'
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            setClaimingInProgress(item.id);
            try {
              await apiClient.post('/claims', {
                donationId: item.id,
                notes: 'Claimed via RePlate Mobile App',
              });
              Alert.alert('Success', 'Food item claimed successfully. Coordinate pickup now.', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigate to details page for tracking
                    router.push(`/modal?id=${item.id}`);
                  },
                },
              ]);
              fetchData(true);
            } catch (err: any) {
              console.error('Error claiming food:', err);
              Alert.alert('Error', err.message || 'Failed to claim food item');
            } finally {
              setClaimingInProgress(null);
            }
          },
        },
      ]
    );
  };

  const filteredDonations = donations.filter((item) => {
    const matchesSearch =
      item.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.profiles?.organization_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.profiles?.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.profiles?.last_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isVeg = !!item.is_vegetarian || !!item.is_vegan;
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Veg' && isVeg) ||
      (activeTab === 'Non-Veg' && !isVeg);

    return matchesSearch && matchesTab;
  });

  const getClaimStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#E0F2FE', text: '#0369A1', label: 'NGO En Route' };
      case 'picked_up':
        return { bg: '#FEF3C7', text: '#D97706', label: 'In Transit' };
      case 'delivered':
        return { bg: '#DCFCE7', text: '#16A34A', label: 'Delivered' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label: status };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>
            {isDonor ? 'Active Claims' : 'Discover Food'}
          </Text>
          <Ionicons name="compass" size={18} color={Colors.brand.forest} style={{ marginLeft: 6 }} />
        </View>
        <Text style={styles.headerSubtitle}>
          {isDonor
            ? 'Track NGO pickups and history of your shared food'
            : 'Find and claim fresh surplus food available in your area'}
        </Text>
      </View>

      {!isDonor && (
        <View style={styles.searchSection}>
          <Input
            placeholder="Search food, restaurants, markets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search-outline"
            containerStyle={styles.searchInputContainer}
          />
          <View style={styles.tabBar}>
            {(['All', 'Veg', 'Non-Veg'] as const).map((tab) => (
              <Button
                key={tab}
                title={tab}
                onPress={() => setActiveTab(tab)}
                variant={activeTab === tab ? 'primary' : 'outline'}
                size="small"
                style={styles.tabButton}
                textStyle={styles.tabButtonText}
              />
            ))}
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand.forest} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" onPress={() => fetchData()} size="medium" />
        </View>
      ) : isDonor ? (
        <FlatList
          data={claims}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.brand.forest]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="clipboard-text-search-outline" size={64} color="#C1E1B9" />
              <Text style={styles.emptyTitle}>No active claims</Text>
              <Text style={styles.emptySub}>
                When an NGO claims any of your shared food donations, they will appear here in real time.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusStyle = getClaimStatusStyle(item.status);
            const ngoName =
              item.ngo?.organization_name ||
              `${item.ngo?.first_name || ''} ${item.ngo?.last_name || ''}`.trim() ||
              'Hope NGO';
            const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(`/modal?id=${item.donation_id}`)}
              >
                <Card variant="outlined" style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.ngoBadge}>
                      <Ionicons name="business-outline" size={14} color={Colors.brand.forest} />
                      <Text style={styles.ngoText} numberOfLines={1}>
                        {ngoName}
                      </Text>
                    </View>
                    <Text style={styles.timeText}>{dateStr}</Text>
                  </View>

                  <Text style={styles.foodTitle}>{item.donation?.food_name || 'Food Donation'}</Text>
                  <Text style={styles.quantityText}>Quantity: {item.donation?.quantity || 'N/A'}</Text>

                  <View style={styles.cardFooterRow}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                        {statusStyle.label}
                      </Text>
                    </View>
                    <View style={styles.detailsBtn}>
                      <Text style={styles.detailsBtnText}>Track & Details</Text>
                      <Ionicons name="chevron-forward" size={12} color={Colors.brand.forest} />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.brand.forest]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="basket-outline" size={64} color="#C1E1B9" />
              <Text style={styles.emptyTitle}>No available donations</Text>
              <Text style={styles.emptySub}>
                There are no unclaimed food donations available right now. Pull down to refresh or check back later!
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isVeg = !!item.is_vegetarian || !!item.is_vegan;
            const donorName =
              item.profiles?.organization_name ||
              `${item.profiles?.first_name || ''} ${item.profiles?.last_name || ''}`.trim() ||
              'RePlate Donor';
            const expiresDate = new Date(item.expires_at);

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(`/modal?id=${item.id}`)}
              >
                <Card variant="outlined" style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, isVeg ? styles.vegBadge : styles.nonVegBadge]}>
                      <Text style={[styles.badgeText, isVeg ? styles.vegText : styles.nonVegText]}>
                        {isVeg ? 'Veg' : 'Non-Veg'}
                      </Text>
                    </View>
                    <Text style={styles.distanceText}>{item.pickup_city || 'Nearby'}</Text>
                  </View>

                  <Text style={styles.foodTitle}>{item.food_name}</Text>
                  <Text style={styles.donorText}>{donorName}</Text>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Ionicons name="cube-outline" size={14} color={Colors.neutral.muted} />
                      <Text style={styles.detailText}>{item.quantity}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={14} color={Colors.neutral.muted} />
                      <Text style={styles.detailText} numberOfLines={1}>
                        Expires: {expiresDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooterActions}>
                    <Button
                      title={claimingInProgress === item.id ? 'Claiming...' : 'Claim Food'}
                      onPress={() => handleClaimFood(item)}
                      disabled={claimingInProgress !== null}
                      size="medium"
                      style={styles.claimButton}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
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
    padding: 20,
    backgroundColor: '#FFFFFF',
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
  headerSubtitle: {
    fontSize: 13,
    color: Colors.neutral.secondary,
    lineHeight: 18,
    marginTop: 4,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
  },
  searchInputContainer: {
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vegBadge: {
    backgroundColor: '#E8F5E9',
  },
  nonVegBadge: {
    backgroundColor: '#FFEBEE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  vegText: {
    color: '#2E7D32',
  },
  nonVegText: {
    color: '#C62828',
  },
  distanceText: {
    fontSize: 12,
    color: Colors.neutral.muted,
    fontWeight: '600',
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral.main,
    marginBottom: 4,
  },
  donorText: {
    fontSize: 14,
    color: Colors.neutral.secondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  ngoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C1E1B9',
    maxWidth: '70%',
  },
  ngoText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.forest,
  },
  timeText: {
    fontSize: 11,
    color: Colors.neutral.muted,
  },
  quantityText: {
    fontSize: 14,
    color: Colors.neutral.secondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.neutral.secondary,
    fontWeight: '600',
  },
  claimButton: {
    backgroundColor: Colors.brand.forest,
    borderRadius: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.forest,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B4329',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.neutral.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  cardFooterActions: {
    marginTop: 4,
  },
});
