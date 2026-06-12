import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppAuth } from '../../hooks/useAppAuth';
import { Card, Button, Input } from '../../components/ui';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Mock active listings for NGOs (food donations available for claiming)
const MOCK_DONATIONS = [
  {
    id: '1',
    title: 'Fresh Paneer Butter Masala & Roti',
    donor: 'Royal Palace Banquet',
    distance: '1.2 km away',
    quantity: '25 Servings',
    expiry: 'Expires in 3 hours',
    type: 'Veg',
    category: 'Cooked',
  },
  {
    id: '2',
    title: 'Organic Vegetables Stock',
    donor: 'Nature Fresh Supermarket',
    distance: '2.5 km away',
    quantity: '15 kg',
    expiry: 'Expires in 2 days',
    type: 'Veg',
    category: 'Raw',
  },
  {
    id: '3',
    title: 'Chicken Biryani & Salan',
    donor: 'Deccan Spices Restaurant',
    distance: '3.8 km away',
    quantity: '40 Servings',
    expiry: 'Expires in 4 hours',
    type: 'Non-Veg',
    category: 'Cooked',
  },
];

// Mock active claims for Donors (NGOs claiming their food)
const MOCK_CLAIMS = [
  {
    id: '1',
    ngoName: 'Hope Foundation Shelters',
    foodItem: 'Veg Biryani',
    quantity: '30 Servings',
    status: 'NGO en route for pickup',
    time: 'Claimed 10 mins ago',
  },
  {
    id: '2',
    ngoName: 'Feed the Hungry NGO',
    foodItem: 'Wheat Flour & Pulses',
    quantity: '50 kg',
    status: 'Completed',
    time: 'Claimed 2 hours ago',
  },
];

export default function ExploreScreen() {
  const { role } = useAppAuth();
  const isDonor = role === 'donor';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  const filteredDonations = MOCK_DONATIONS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isDonor ? 'Active Claims' : 'Discover Food'}
        </Text>
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

      {isDonor ? (
        <FlatList
          data={MOCK_CLAIMS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Card variant="outlined" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.ngoBadge}>
                  <Ionicons name="business-outline" size={14} color={Colors.brand.forest} />
                  <Text style={styles.ngoText}>{item.ngoName}</Text>
                </View>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <Text style={styles.foodTitle}>{item.foodItem}</Text>
              <Text style={styles.quantityText}>Quantity: {item.quantity}</Text>

              <View style={styles.statusRow}>
                <Ionicons
                  name={item.status === 'Completed' ? 'checkmark-circle' : 'time'}
                  size={16}
                  color={item.status === 'Completed' ? Colors.feedback.success : Colors.feedback.warning}
                />
                <Text style={[styles.statusText, {
                  color: item.status === 'Completed' ? Colors.feedback.success : Colors.feedback.warning
                }]}>
                  {item.status}
                </Text>
              </View>
            </Card>
          )}
        />
      ) : (
        <FlatList
          data={filteredDonations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Card variant="outlined" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, item.type === 'Veg' ? styles.vegBadge : styles.nonVegBadge]}>
                  <Text style={[styles.badgeText, item.type === 'Veg' ? styles.vegText : styles.nonVegText]}>
                    {item.type}
                  </Text>
                </View>
                <Text style={styles.distanceText}>{item.distance}</Text>
              </View>

              <Text style={styles.foodTitle}>{item.title}</Text>
              <Text style={styles.donorText}>{item.donor}</Text>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="cube-outline" size={14} color={Colors.neutral.muted} />
                  <Text style={styles.detailText}>{item.quantity}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="hourglass-outline" size={14} color={Colors.neutral.muted} />
                  <Text style={styles.detailText}>{item.expiry}</Text>
                </View>
              </View>

              <Button
                title="Claim Food"
                onPress={() => {
                  Alert.alert(
                    'Confirm Claim',
                    `Would you like to claim ${item.quantity} of ${item.title} from ${item.donor}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Claim',
                        onPress: () => {
                          Alert.alert('Success', 'Food item claimed successfully. Coordinate pickup now.');
                        },
                      },
                    ]
                  );
                }}
                size="medium"
                fullWidth
                style={styles.claimButton}
              />
            </Card>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.bg,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.brand.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.brand.forest,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.neutral.secondary,
    lineHeight: 18,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.brand.card,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.brand.border,
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
    gap: 16,
  },
  card: {
    padding: 16,
    backgroundColor: Colors.brand.card,
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
    backgroundColor: Colors.brand.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.brand.sage,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
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
  },
});
