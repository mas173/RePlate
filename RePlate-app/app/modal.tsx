import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import { Colors } from '../constants/theme';
import { useAppAuth } from '../hooks/useAppAuth';

const { width } = Dimensions.get('window');

interface Profile {
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  email?: string;
  phone?: string;
}

interface Claim {
  id: string;
  status: 'confirmed' | 'picked_up' | 'delivered' | 'cancelled';
  pickup_scheduled_at: string;
  notes?: string;
  ngo_id: string;
  profiles?: Profile;
}

interface Donation {
  id: string;
  food_name: string;
  category: string;
  quantity: string;
  storage_condition: string;
  expires_at: string;
  created_at: string;
  description?: string;
  pickup_address: string;
  pickup_city: string;
  status: 'available' | 'claimed' | 'completed' | 'in_progress' | 'cancelled' | 'expired' | 'picked_up' | 'delivered';
  donor_id: string;
  latitude?: number;
  longitude?: number;
  ai_analysis?: string | any;
  ai_freshness_score?: number;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  profiles?: Profile;
  images?: string[];
}

export default function DonationDetailModal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { role, user, profile } = useAppAuth();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState<'meals' | 'kg'>('meals');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editExpiryTime, setEditExpiryTime] = useState('');
  const [editStorageCondition, setEditStorageCondition] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editIsVegetarian, setEditIsVegetarian] = useState(false);
  const [editIsVegan, setEditIsVegan] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Claim states
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimNotes, setClaimNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [claimingInProgress, setClaimingInProgress] = useState(false);

  // Status transition states
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/donations/${id}`);
      const data = response.data;
      setDonation(data.donation);
      setClaims(data.claims || []);

      if (data.donation) {
        const donationData = data.donation;
        setEditName(donationData.food_name || '');
        setEditCategory(donationData.category || 'Cooked');
        
        // Parse quantity e.g. "15 meals"
        const qtyParts = donationData.quantity?.split(' ') || [];
        setEditQuantity(qtyParts[0] || '');
        setEditUnit((qtyParts[1] as any) === 'kg' ? 'kg' : 'meals');

        // Parse expiry
        if (donationData.expires_at) {
          const expiry = new Date(donationData.expires_at);
          setEditExpiryDate(expiry.toISOString().split('T')[0]);
          setEditExpiryTime(expiry.toTimeString().split(' ')[0].substring(0, 5));
        }

        setEditStorageCondition(donationData.storage_condition || 'room_temp');
        
        // Parse address parts if possible, or use full
        const addrParts = donationData.pickup_address?.split(', ') || [];
        setEditAddress(addrParts[0] || '');
        setEditCity(donationData.pickup_city || '');
        
        const stateZip = addrParts[1] || '';
        const zipParts = stateZip.split(' - ');
        setEditState(zipParts[0] || '');
        setEditPincode(zipParts[1] || '');

        setEditNotes(donationData.description || '');
        setEditIsVegetarian(!!donationData.is_vegetarian);
        setEditIsVegan(!!donationData.is_vegan);
      }
    } catch (err: any) {
      console.error('Error fetching donation details:', err);
      Alert.alert('Error', err.message || 'Failed to load details.');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleUpdate = async () => {
    if (!editName || !editQuantity || !editExpiryDate) {
      Alert.alert('Missing Fields', 'Please enter title, quantity and expiry date.');
      return;
    }

    setEditSaving(true);
    try {
      const payload = {
        name: editName,
        category: editCategory,
        quantity: parseFloat(editQuantity),
        unit: editUnit,
        expiryDate: editExpiryDate,
        expiryTime: editExpiryTime || '23:59',
        storageCondition: editStorageCondition,
        address: editAddress,
        city: editCity,
        state: editState,
        pincode: editPincode,
        notes: editNotes,
        isVegetarian: editIsVegetarian,
        isVegan: editIsVegan,
      };

      await apiClient.patch(`/donations/${id}`, payload);
      Alert.alert('Success', 'Donation updated successfully.');
      setIsEditing(false);
      fetchDetails();
    } catch (err: any) {
      console.error('Error updating donation:', err);
      Alert.alert('Error', err.message || 'Failed to update donation.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Donation',
      'Are you sure you want to delete this donation posting? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/donations/${id}`);
              Alert.alert('Deleted', 'Donation deleted successfully.');
              router.back();
            } catch (err: any) {
              console.error('Error deleting donation:', err);
              Alert.alert('Error', err.message || 'Failed to delete donation.');
            }
          },
        },
      ]
    );
  };

  const handleCancelDonation = async () => {
    Alert.alert(
      'Cancel Donation',
      'Are you sure you want to cancel this donation? It will no longer be available for claim.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await apiClient.patch(`/donations/${id}/status`, { status: 'cancelled' });
              Alert.alert('Success', 'Donation cancelled.');
              fetchDetails();
            } catch (err: any) {
              console.error('Error cancelling donation:', err);
              Alert.alert('Error', err.message || 'Failed to cancel donation.');
            }
          },
        },
      ]
    );
  };

  const handleClaim = async () => {
    if (!pickupDate || !pickupTime) {
      Alert.alert('Scheduled Time Required', 'Please enter a pickup date and time.');
      return;
    }

    setClaimingInProgress(true);
    try {
      const scheduledDateTime = new Date(`${pickupDate}T${pickupTime}:00`).toISOString();
      
      await apiClient.post('/claims', {
        donationId: id,
        pickupScheduledAt: scheduledDateTime,
        notes: claimNotes.trim() || undefined,
      });

      Alert.alert('Success 🎉', 'Food donation claimed successfully!');
      setIsClaiming(false);
      setClaimNotes('');
      setPickupDate('');
      setPickupTime('');
      fetchDetails();
    } catch (err: any) {
      console.error('Error claiming donation:', err);
      Alert.alert('Error', err.message || 'Failed to claim donation.');
    } finally {
      setClaimingInProgress(false);
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this claim as ${newStatus.replace('_', ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdatingStatus(true);
            try {
              await apiClient.patch(`/claims/${claimId}/status`, { status: newStatus });
              Alert.alert('Success', `Status updated to ${newStatus.replace('_', ' ')}.`);
              fetchDetails();
            } catch (err: any) {
              console.error('Error updating claim status:', err);
              Alert.alert('Error', err.message || 'Failed to update status.');
            } finally {
              setUpdatingStatus(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelClaim = async (claimId: string) => {
    Alert.alert(
      'Cancel Claim',
      'Are you sure you want to cancel your claim on this food donation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Cancel',
          style: 'destructive',
          onPress: async () => {
            setUpdatingStatus(true);
            try {
              await apiClient.delete(`/claims/${claimId}`);
              Alert.alert('Success', 'Claim cancelled successfully.');
              fetchDetails();
            } catch (err: any) {
              console.error('Error cancelling claim:', err);
              Alert.alert('Error', err.message || 'Failed to cancel claim.');
            } finally {
              setUpdatingStatus(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Fetching donation details...</Text>
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
        <Text style={styles.loadingText}>Donation not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isOwner = donation.donor_id === profile?.id;
  const isAdmin = (role as any) === 'admin';
  const canModify = isOwner || isAdmin;
  const canEdit = canModify && donation.status === 'available';

  const getCategoryEmoji = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'cooked': return '🍲';
      case 'raw': return '🥬';
      case 'packaged': return '📦';
      default: return '🍴';
    }
  };

  const getUrgencyText = (expiresAt: string) => {
    const diffHours = (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60);
    if (diffHours < 2) return 'CRITICAL';
    if (diffHours < 6) return 'HIGH';
    if (diffHours < 24) return 'MEDIUM';
    return 'LOW';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return '#DC2626';
      case 'HIGH': return '#D97706';
      case 'MEDIUM': return '#2E7D32';
      default: return '#4B5563';
    }
  };

  const getStatusBadgeColors = (status: string) => {
    switch (status) {
      case 'available': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'claimed': return { bg: '#E3F2FD', text: '#1E88E5' };
      case 'picked_up': return { bg: '#FFF3E0', text: '#FB8C00' };
      case 'delivered': return { bg: '#F3E5F5', text: '#8E24AA' };
      case 'completed': return { bg: '#F3F4F6', text: '#4B5563' };
      default: return { bg: '#FFEBEE', text: '#C62828' };
    }
  };

  const parsedAiAnalysis = typeof donation.ai_analysis === 'string'
    ? JSON.parse(donation.ai_analysis)
    : donation.ai_analysis;

  const activeClaim = claims.find((c) => c.status !== 'cancelled');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1B4329" />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isEditing ? 'Edit Donation' : 'Donation Details'}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {isEditing ? (
          /* ================= EDIT MODE ================= */
          <View style={styles.form}>
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Food Item Title *</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Rice and curry"
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.selectorRow}>
                {(['Cooked', 'Raw', 'Packaged'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.selectorBtn, editCategory === cat && styles.selectorBtnActive]}
                    onPress={() => setEditCategory(cat)}
                  >
                    <Text style={[styles.selectorText, editCategory === cat && styles.selectorTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quantity and Unit */}
            <View style={styles.inputRow}>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.label}>Unit</Text>
                <View style={styles.selectorRow}>
                  {(['meals', 'kg'] as const).map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.selectorBtn, editUnit === u && styles.selectorBtnActive, { flex: 1 }]}
                      onPress={() => setEditUnit(u)}
                    >
                      <Text style={[styles.selectorText, editUnit === u && styles.selectorTextActive]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Expiry Date and Time */}
            <View style={styles.inputRow}>
              <View style={{ flex: 1.2 }}>
                <Text style={styles.label}>Expiry Date *</Text>
                <TextInput
                  style={styles.input}
                  value={editExpiryDate}
                  onChangeText={setEditExpiryDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.label}>Expiry Time</Text>
                <TextInput
                  style={styles.input}
                  value={editExpiryTime}
                  onChangeText={setEditExpiryTime}
                  placeholder="HH:MM"
                />
              </View>
            </View>

            {/* Storage Condition */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Storage Condition</Text>
              <View style={styles.selectorRow}>
                {(['room_temp', 'refrigerated', 'frozen'] as const).map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    style={[styles.selectorBtn, editStorageCondition === cond && styles.selectorBtnActive]}
                    onPress={() => setEditStorageCondition(cond)}
                  >
                    <Text style={[styles.selectorText, editStorageCondition === cond && styles.selectorTextActive, { fontSize: 11 }]}>
                      {cond === 'room_temp' ? 'Room Temp' : cond === 'refrigerated' ? 'Refrigerated' : 'Frozen'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pickup Address</Text>
              <TextInput
                style={styles.input}
                value={editAddress}
                onChangeText={setEditAddress}
                placeholder="Street address"
              />
            </View>

            {/* City, State, Pincode */}
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  value={editCity}
                  onChangeText={setEditCity}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={editState}
                  onChangeText={setEditState}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                value={editPincode}
                onChangeText={setEditPincode}
                keyboardType="numeric"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description / Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editNotes}
                onChangeText={setEditNotes}
                multiline
                numberOfLines={3}
                placeholder="Additional notes"
              />
            </View>

            {/* Vegetarian / Vegan Toggles */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleCheckbox, editIsVegetarian && styles.toggleCheckboxActive]}
                onPress={() => setEditIsVegetarian(!editIsVegetarian)}
              >
                <Text style={[styles.toggleText, editIsVegetarian && styles.toggleTextActive]}>🥬 Vegetarian</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleCheckbox, editIsVegan && styles.toggleCheckboxActive]}
                onPress={() => setEditIsVegan(!editIsVegan)}
              >
                <Text style={[styles.toggleText, editIsVegan && styles.toggleTextActive]}>🌱 Vegan</Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnCancel]}
                onPress={() => setIsEditing(false)}
                disabled={editSaving}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnSave]}
                onPress={handleUpdate}
                disabled={editSaving}
              >
                {editSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================= VIEW MODE ================= */
          <View style={styles.detailsContainer}>
            {/* Top Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: getUrgencyColor(getUrgencyText(donation.expires_at)) + '15' }]}>
                  <Text style={[styles.badgeText, { color: getUrgencyColor(getUrgencyText(donation.expires_at)) }]}>
                    {getUrgencyText(donation.expires_at)} URGENCY
                  </Text>
                </View>
                <View style={styles.postTime}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.postTimeText}>
                    Posted {new Date(donation.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {donation.images && donation.images.length > 0 ? (
                <Image
                  source={{ uri: donation.images[0] }}
                  style={styles.donationImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.donationImagePlaceholder}>
                  <Text style={styles.donationImagePlaceholderText}>
                    {getCategoryEmoji(donation.category)}
                  </Text>
                </View>
              )}

              <Text style={styles.foodTitle}>{donation.food_name}</Text>
              
              <View style={styles.categoryRow}>
                <Text style={styles.categoryEmoji}>{getCategoryEmoji(donation.category)}</Text>
                <Text style={styles.categoryName}>{donation.category} Food</Text>
              </View>

              {/* Badges row */}
              <View style={styles.tagRow}>
                {donation.is_vegetarian && (
                  <View style={[styles.tag, styles.tagVeg]}>
                    <Text style={styles.tagVegText}>🥬 Vegetarian</Text>
                  </View>
                )}
                {donation.is_vegan && (
                  <View style={[styles.tag, styles.tagVegan]}>
                    <Text style={styles.tagVeganText}>🌱 Vegan</Text>
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{donation.quantity}</Text>
                  <Text style={styles.statLabel}>Quantity</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>
                    {donation.storage_condition === 'room_temp' ? 'Room Temp' : donation.storage_condition === 'refrigerated' ? 'Refrigerated' : 'Frozen'}
                  </Text>
                  <Text style={styles.statLabel}>Storage</Text>
                </View>
              </View>

              {donation.description && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Donor Notes</Text>
                  <Text style={styles.notesText}>{donation.description}</Text>
                </View>
              )}
            </View>

            {/* AI Freshness Indicator */}
            {parsedAiAnalysis && (
              <View style={styles.card}>
                <View style={styles.aiHeader}>
                  <Ionicons name="sparkles" size={20} color="#2E7D32" />
                  <Text style={styles.aiTitle}>AI Freshness & Safety Analysis</Text>
                </View>
                
                <View style={styles.freshnessScoreContainer}>
                  <Text style={styles.freshnessScoreLabel}>Freshness Score:</Text>
                  <View style={styles.scoreGauge}>
                    <View style={[styles.scoreBar, { width: `${donation.ai_freshness_score || 85}%` }]} />
                  </View>
                  <Text style={styles.scoreText}>{donation.ai_freshness_score || 85}/100</Text>
                </View>

                {parsedAiAnalysis.safetyRecommendations && (
                  <View style={styles.aiDetails}>
                    <Text style={styles.aiSectionTitle}>Recommendations:</Text>
                    {parsedAiAnalysis.safetyRecommendations.map((rec: string, idx: number) => (
                      <Text key={idx} style={styles.aiDetailItem}>• {rec}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Logistics & Location */}
            <View style={styles.card}>
              <View style={styles.cardSectionTitleRow}>
                <Ionicons name="location-sharp" size={20} color="#2E7D32" />
                <Text style={styles.cardSectionTitle}>Logistics & Location</Text>
              </View>

              <View style={styles.logisticsDetail}>
                <View style={styles.logisticsRow}>
                  <Text style={styles.logisticsLabel}>Pickup Address</Text>
                  <Text style={styles.logisticsVal}>{donation.pickup_address}</Text>
                </View>
                <View style={styles.logisticsRow}>
                  <Text style={styles.logisticsLabel}>Best Before</Text>
                  <Text style={styles.logisticsVal}>
                    {new Date(donation.expires_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Active Claim status */}
            {activeClaim && (
              <View style={styles.card}>
                <View style={styles.cardSectionTitleRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  <Text style={styles.cardSectionTitle}>Active Claim Details</Text>
                </View>

                <View style={styles.logisticsDetail}>
                  <View style={styles.logisticsRow}>
                    <Text style={styles.logisticsLabel}>Claim Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColors(activeClaim.status).bg }]}>
                      <Text style={[styles.statusBadgeText, { color: getStatusBadgeColors(activeClaim.status).text }]}>
                        {activeClaim.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.logisticsRow}>
                    <Text style={styles.logisticsLabel}>Scheduled Pickup</Text>
                    <Text style={styles.logisticsVal}>
                      {new Date(activeClaim.pickup_scheduled_at).toLocaleString()}
                    </Text>
                  </View>

                  {activeClaim.notes && (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesTitle}>Claim Notes</Text>
                      <Text style={styles.notesText}>{activeClaim.notes}</Text>
                    </View>
                  )}
                </View>

                {/* NGO Action button (Confirm Pickup / Delivered / Cancel claim) */}
                {role === 'ngo' && activeClaim.ngo_id === profile?.id && (
                  <View style={styles.claimActions}>
                    {activeClaim.status === 'confirmed' && (
                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnPickup]}
                        onPress={() => handleUpdateClaimStatus(activeClaim.id, 'picked_up')}
                        disabled={updatingStatus}
                      >
                        <Text style={styles.btnActionText}>Confirm Pickup</Text>
                      </TouchableOpacity>
                    )}

                    {activeClaim.status === 'picked_up' && (
                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnDeliver]}
                        onPress={() => handleUpdateClaimStatus(activeClaim.id, 'delivered')}
                        disabled={updatingStatus}
                      >
                        <Text style={styles.btnActionText}>Mark as Delivered</Text>
                      </TouchableOpacity>
                    )}

                    {activeClaim.status === 'confirmed' && (
                      <TouchableOpacity
                        style={[styles.btnAction, styles.btnCancelClaim]}
                        onPress={() => handleCancelClaim(activeClaim.id)}
                        disabled={updatingStatus}
                      >
                        <Text style={styles.btnCancelClaimText}>Cancel Claim</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Owner Actions */}
            {canModify && (
              <View style={[styles.card, styles.ownerCard]}>
                <Text style={styles.ownerTitle}>Manage Posting</Text>
                
                {canEdit ? (
                  <TouchableOpacity style={[styles.btnAction, styles.btnEdit]} onPress={() => setIsEditing(true)}>
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.btnActionText}>Edit Posting</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editDisabledBox}>
                    <Text style={styles.editDisabledText}>
                      Editing disabled because status is "{donation.status.replace('_', ' ')}"
                    </Text>
                  </View>
                )}

                {donation.status === 'available' && (
                  <TouchableOpacity style={[styles.btnAction, styles.btnCancelDonation]} onPress={handleCancelDonation}>
                    <Ionicons name="close-circle-outline" size={18} color="#2E7D32" style={{ marginRight: 6 }} />
                    <Text style={styles.btnCancelDonationText}>Cancel Donation</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.btnAction, styles.btnDelete]} onPress={handleDelete}>
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.btnActionText}>Delete Posting</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* NGO claiming block */}
            {role === 'ngo' && donation.status === 'available' && (
              <View style={styles.card}>
                {isClaiming ? (
                  <View style={styles.claimForm}>
                    <Text style={styles.claimTitle}>Claim Food Donation</Text>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Scheduled Pickup Date *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={pickupDate}
                        onChangeText={setPickupDate}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Scheduled Pickup Time *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="HH:MM (24h)"
                        value={pickupTime}
                        onChangeText={setPickupTime}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Notes for Donor (Optional)</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        multiline
                        numberOfLines={3}
                        placeholder="E.g., Our vehicle will arrive in 2 hours."
                        value={claimNotes}
                        onChangeText={setClaimNotes}
                      />
                    </View>

                    <View style={styles.claimFormButtons}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.btnCancel]}
                        onPress={() => setIsClaiming(false)}
                        disabled={claimingInProgress}
                      >
                        <Text style={styles.btnCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.btnSave]}
                        onPress={handleClaim}
                        disabled={claimingInProgress}
                      >
                        {claimingInProgress ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.btnSaveText}>Confirm Claim</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.claimPromo}>
                    <Text style={styles.claimPromoTitle}>Want to rescue this surplus food?</Text>
                    <Text style={styles.claimPromoSub}>
                      Schedule a pickup time and claim it. It will be reserved for your organization.
                    </Text>
                    <TouchableOpacity style={styles.btnClaimPromo} onPress={() => setIsClaiming(true)}>
                      <Text style={styles.btnClaimPromoText}>Claim Food Now</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBF7',
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  backBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAF3E9',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B4329',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAFBF7',
    borderWidth: 1.5,
    borderColor: '#EAF3E9',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    color: '#111827',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  selectorRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  selectorBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 8,
  },
  selectorBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectorTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  toggleCheckbox: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFBF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCheckboxActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#1B4329',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#F3F4F6',
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  btnSave: {
    backgroundColor: '#2E7D32',
  },
  btnSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  postTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postTimeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  foodTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagVeg: {
    backgroundColor: '#E8F5E9',
  },
  tagVegText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  tagVegan: {
    backgroundColor: '#E8F5E9',
  },
  tagVeganText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B4329',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAF3E9',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FAFBF7',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAF3E9',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4329',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  notesBox: {
    marginTop: 16,
    backgroundColor: '#FAFBF7',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAF3E9',
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4329',
  },
  freshnessScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  freshnessScoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  scoreGauge: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2E7D32',
  },
  aiDetails: {
    backgroundColor: '#FAFBF7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAF3E9',
  },
  aiSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4329',
    marginBottom: 6,
  },
  aiDetailItem: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 4,
  },
  cardSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4329',
  },
  logisticsDetail: {
    gap: 12,
  },
  logisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  logisticsLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    width: 100,
  },
  logisticsVal: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1B4329',
    textAlign: 'right',
  },
  ownerCard: {
    backgroundColor: '#FDFEFC',
    borderColor: '#DDE8D9',
  },
  ownerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4329',
    marginBottom: 12,
  },
  btnAction: {
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnActionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnEdit: {
    backgroundColor: '#2E7D32',
  },
  btnDelete: {
    backgroundColor: '#DC2626',
    marginBottom: 0,
  },
  btnCancelDonation: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2E7D32',
  },
  btnCancelDonationText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  editDisabledBox: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  editDisabledText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  claimActions: {
    marginTop: 12,
    gap: 10,
  },
  btnPickup: {
    backgroundColor: '#FB8C00',
    marginBottom: 0,
  },
  btnDeliver: {
    backgroundColor: '#8E24AA',
    marginBottom: 0,
  },
  btnCancelClaim: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#DC2626',
    marginBottom: 0,
  },
  btnCancelClaimText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  claimPromo: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  claimPromoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B4329',
    textAlign: 'center',
  },
  claimPromoSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 16,
  },
  btnClaimPromo: {
    backgroundColor: '#2E7D32',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  btnClaimPromoText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  claimForm: {
    gap: 12,
  },
  claimTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B4329',
    marginBottom: 4,
  },
  claimFormButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  donationImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
  },
  donationImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donationImagePlaceholderText: {
    fontSize: 48,
  },
});
