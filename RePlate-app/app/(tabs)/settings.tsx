import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAppAuth } from '../../hooks/useAppAuth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../../services/api';

const { width } = Dimensions.get('window');

interface SettingRowProps {
  icon: string;
  iconPack?: 'ionicons' | 'material';
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, iconPack = 'ionicons', iconBg, iconColor, title, subtitle, onPress, rightElement, danger }: SettingRowProps) {
  const IconComponent = iconPack === 'material' ? MaterialCommunityIcons : Ionicons;
  return (
    <TouchableOpacity
      style={styles.settingRow}
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.settingIconCircle, { backgroundColor: iconBg }]}>
        <IconComponent name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.settingTextWrap}>
        <Text style={[styles.settingTitle, danger && { color: '#EF4444' }]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const router = useRouter();
  const { profile, role, user } = useAppAuth();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Address Modal States
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', address_line: '', city: '', state: '', pincode: '' });
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Verification Modal States
  const [isVerifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<any>(null); // contains is_verified, verification_status, fssai_number
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyForm, setVerifyForm] = useState({ fssai_number: '', document_url: '' });

  const fullName = profile?.fullName || user?.fullName || 'RePlater';
  const email = profile?.email || user?.primaryEmailAddress?.emailAddress || '';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch Settings
      const settingsRes = await apiClient.get('/users/settings');
      if (settingsRes.data?.settings) {
        setPushNotifications(settingsRes.data.settings.push ?? true);
        setEmailNotifications(settingsRes.data.settings.email ?? true);
      }
      // Fetch Verification Status
      const verifyRes = await apiClient.get('/users/verify-status');
      setVerifyStatus(verifyRes.data?.verification);
    } catch (err) {
      console.log('Failed to fetch initial settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePush = async (value: boolean) => {
    setPushNotifications(value);
    await saveSettings({ push: value, email: emailNotifications });
  };

  const handleToggleEmail = async (value: boolean) => {
    setEmailNotifications(value);
    await saveSettings({ push: pushNotifications, email: value });
  };

  const saveSettings = async (preferences: any) => {
    try {
      await apiClient.put('/users/settings', { notification_preferences: preferences });
    } catch (err) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  // --- Address Management ---
  const openAddressModal = async () => {
    setAddressModalVisible(true);
    setAddressLoading(true);
    try {
      const res = await apiClient.get('/users/addresses');
      setAddresses(res.data?.addresses || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.address_line || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      Alert.alert('Missing Info', 'Please fill in all address fields.');
      return;
    }
    try {
      setAddressLoading(true);
      await apiClient.post('/users/addresses', { ...newAddress, is_default: addresses.length === 0 });
      setNewAddress({ name: '', address_line: '', city: '', state: '', pincode: '' });
      setIsAddingAddress(false);
      // Refresh list
      const res = await apiClient.get('/users/addresses');
      setAddresses(res.data?.addresses || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to add address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      setAddressLoading(true);
      await apiClient.delete(`/users/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefaultAddress = async (address: any) => {
    try {
      setAddressLoading(true);
      await apiClient.put(`/users/addresses/${address.id}`, { ...address, is_default: true });
      const res = await apiClient.get('/users/addresses');
      setAddresses(res.data?.addresses || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to set default address');
    } finally {
      setAddressLoading(false);
    }
  };

  // --- Verification Management ---
  const openVerifyModal = () => {
    setVerifyModalVisible(true);
  };

  const handleSubmitVerification = async () => {
    if (!verifyForm.fssai_number) {
      Alert.alert('Error', 'FSSAI Number is required.');
      return;
    }
    if (verifyForm.fssai_number.length !== 14) {
      Alert.alert('Error', 'FSSAI Number must be 14 digits.');
      return;
    }
    try {
      setVerifyLoading(true);
      const res = await apiClient.post('/users/verify', verifyForm);
      setVerifyStatus(res.data?.verification);
      Alert.alert('Success', 'Verification details submitted successfully. It is now under review.');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit verification details.');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8} onPress={() => router.push('/profile')}>
          <View style={styles.profileLeft}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color="#2E7D32" />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileEmail} numberOfLines={1}>{email}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{role || 'Donor'}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="person-outline"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            title="Edit Profile"
            subtitle="Name, phone, organization"
            onPress={() => router.push('/profile')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="location-outline"
            iconBg="#E3F2FD"
            iconColor="#2196F3"
            title="Saved Addresses"
            subtitle="Manage pickup/dropoff locations"
            onPress={openAddressModal}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-checkmark-outline"
            iconBg="#FFF3E0"
            iconColor="#FF9800"
            title="Verification"
            subtitle={verifyStatus?.verification_status === 'verified' ? 'Verified Account' : 'FSSAI & identity documents'}
            onPress={openVerifyModal}
            rightElement={
              verifyStatus?.verification_status === 'verified' ? (
                <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
                  <Text style={[styles.statusBadgeText, { color: '#2E7D32' }]}>Verified</Text>
                </View>
              ) : verifyStatus?.verification_status === 'pending' ? (
                <View style={[styles.statusBadge, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="time" size={14} color="#FF9800" />
                  <Text style={[styles.statusBadgeText, { color: '#FF9800' }]}>Pending</Text>
                </View>
              ) : undefined
            }
          />
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="notifications-outline"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            title="Push Notifications"
            subtitle="Alerts for claims & pickups"
            rightElement={
              loading ? <ActivityIndicator size="small" color="#2E7D32" /> :
              <Switch
                value={pushNotifications}
                onValueChange={handleTogglePush}
                trackColor={{ false: '#E5E7EB', true: '#A5D6A7' }}
                thumbColor={pushNotifications ? '#2E7D32' : '#9CA3AF'}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="mail-outline"
            iconBg="#E3F2FD"
            iconColor="#2196F3"
            title="Email Notifications"
            subtitle="Weekly reports & updates"
            rightElement={
              loading ? <ActivityIndicator size="small" color="#2E7D32" /> :
              <Switch
                value={emailNotifications}
                onValueChange={handleToggleEmail}
                trackColor={{ false: '#E5E7EB', true: '#A5D6A7' }}
                thumbColor={emailNotifications ? '#2E7D32' : '#9CA3AF'}
              />
            }
          />
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="moon-outline"
            iconBg="#F3E8FF"
            iconColor="#7C3AED"
            title="Dark Mode"
            subtitle="Coming soon"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E7EB', true: '#A5D6A7' }}
                thumbColor={darkMode ? '#2E7D32' : '#9CA3AF'}
                disabled
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="language-outline"
            iconBg="#FFF3E0"
            iconColor="#FF9800"
            title="Language"
            subtitle="English"
          />
        </View>

        {/* Support Section */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="help-circle-outline"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            title="Help Center"
            subtitle="FAQs & guides"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chatbubble-ellipses-outline"
            iconBg="#E3F2FD"
            iconColor="#2196F3"
            title="Contact Support"
            subtitle="Chat with our team"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="document-text-outline"
            iconBg="#F3F4F6"
            iconColor="#4B5563"
            title="Terms & Privacy Policy"
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>RePlate v1.0.0</Text>
      </ScrollView>

      {/* --- Address Management Modal --- */}
      <Modal visible={isAddressModalVisible} animationType="slide" onRequestClose={() => setAddressModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Saved Addresses</Text>
            <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            {isAddingAddress ? (
              <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.formLabel}>Address Name (e.g. Main Branch)</Text>
                <TextInput style={styles.input} value={newAddress.name} onChangeText={t => setNewAddress({...newAddress, name: t})} placeholder="Branch Name" />
                
                <Text style={styles.formLabel}>Address Line</Text>
                <TextInput style={styles.input} value={newAddress.address_line} onChangeText={t => setNewAddress({...newAddress, address_line: t})} placeholder="123 Street Name" />
                
                <View style={styles.row}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.formLabel}>City</Text>
                    <TextInput style={styles.input} value={newAddress.city} onChangeText={t => setNewAddress({...newAddress, city: t})} placeholder="City" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formLabel}>State</Text>
                    <TextInput style={styles.input} value={newAddress.state} onChangeText={t => setNewAddress({...newAddress, state: t})} placeholder="State" />
                  </View>
                </View>

                <Text style={styles.formLabel}>Pincode</Text>
                <TextInput style={styles.input} value={newAddress.pincode} onChangeText={t => setNewAddress({...newAddress, pincode: t})} placeholder="123456" keyboardType="numeric" />

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddingAddress(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleAddAddress} disabled={addressLoading}>
                    {addressLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Save Address</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.modalBody}>
                {addressLoading && !addresses.length ? (
                  <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
                ) : (
                  <FlatList
                    data={addresses}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                      <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No saved addresses</Text>
                        <Text style={styles.emptySub}>Add an address to make pickups easier.</Text>
                      </View>
                    }
                    renderItem={({ item }) => (
                      <View style={[styles.addressCard, item.is_default && styles.addressCardDefault]}>
                        <View style={styles.addressHeader}>
                          <Text style={styles.addressName}>{item.name}</Text>
                          {item.is_default && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Default</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressLine}>{item.address_line}</Text>
                        <Text style={styles.addressLine}>{item.city}, {item.state} {item.pincode}</Text>
                        <View style={styles.addressActions}>
                          {!item.is_default && (
                            <TouchableOpacity onPress={() => handleSetDefaultAddress(item)}>
                              <Text style={styles.actionTextBlue}>Set Default</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => handleDeleteAddress(item.id)}>
                            <Text style={styles.actionTextRed}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  />
                )}
                <TouchableOpacity style={styles.fullWidthBtn} onPress={() => setIsAddingAddress(true)}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.fullWidthBtnText}>Add New Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* --- Verification Modal --- */}
      <Modal visible={isVerifyModalVisible} animationType="slide" onRequestClose={() => setVerifyModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Account Verification</Text>
            <TouchableOpacity onPress={() => setVerifyModalVisible(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {!verifyStatus || verifyStatus.verification_status === 'unverified' || verifyStatus.verification_status === 'rejected' ? (
              <View>
                <View style={styles.verifyBanner}>
                  <Ionicons name="shield-checkmark" size={32} color="#2E7D32" />
                  <Text style={styles.verifyBannerTitle}>Verify your identity</Text>
                  <Text style={styles.verifyBannerSub}>Verified accounts build trust and help food reach the right people safely.</Text>
                </View>

                {verifyStatus?.verification_status === 'rejected' && (
                  <View style={[styles.statusBanner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <Text style={{ color: '#EF4444', fontWeight: '600' }}>Your previous verification was rejected. Please re-submit valid documents.</Text>
                  </View>
                )}

                <Text style={styles.formLabel}>FSSAI License Number (14 Digits)</Text>
                <TextInput
                  style={styles.input}
                  value={verifyForm.fssai_number}
                  onChangeText={t => setVerifyForm({...verifyForm, fssai_number: t})}
                  placeholder="e.g. 10012011000001"
                  keyboardType="numeric"
                  maxLength={14}
                />

                <Text style={styles.formLabel}>Verification Document URL</Text>
                <TextInput
                  style={styles.input}
                  value={verifyForm.document_url}
                  onChangeText={t => setVerifyForm({...verifyForm, document_url: t})}
                  placeholder="Link to document (Optional)"
                />

                <TouchableOpacity style={[styles.fullWidthBtn, { marginTop: 20 }]} onPress={handleSubmitVerification} disabled={verifyLoading}>
                  {verifyLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.fullWidthBtnText}>Submit Verification</Text>}
                </TouchableOpacity>
              </View>
            ) : verifyStatus.verification_status === 'pending' ? (
              <View style={styles.statusCenter}>
                <Ionicons name="time-outline" size={64} color="#FF9800" />
                <Text style={styles.statusTitle}>Verification Pending</Text>
                <Text style={styles.statusSub}>Your verification details are under review. We will notify you once approved.</Text>
                <View style={styles.detailsCard}>
                  <Text style={styles.detailLabel}>FSSAI Number</Text>
                  <Text style={styles.detailValue}>{verifyStatus.fssai_number}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.statusCenter}>
                <Ionicons name="checkmark-circle" size={64} color="#2E7D32" />
                <Text style={styles.statusTitle}>Account Verified</Text>
                <Text style={styles.statusSub}>You are a verified member of the RePlate community.</Text>
                <View style={styles.detailsCard}>
                  <Text style={styles.detailLabel}>FSSAI Number</Text>
                  <Text style={styles.detailValue}>{verifyStatus.fssai_number}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F1' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14, backgroundColor: '#FAFBF7', borderBottomWidth: 1, borderBottomColor: '#EAF3E9' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1B4329' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  profileCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderWidth: 1, borderColor: '#EAF3E9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  profileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#E8F5E9' },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  profileInfo: { marginLeft: 14, flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  profileEmail: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  rolePill: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  roleText: { fontSize: 10, fontWeight: '700', color: '#2E7D32', textTransform: 'capitalize' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#EAF3E9', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  settingIconCircle: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingTextWrap: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  settingSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 60 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: '#FECACA', marginBottom: 16, gap: 8 },
  signOutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  versionText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#FAFBF7' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EAF3E9', backgroundColor: '#FFF' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalCloseBtn: { padding: 4 },
  modalBody: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', width: '100%' },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 15, color: '#111827' },
  modalActions: { flexDirection: 'row', marginTop: 24, gap: 12 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#4B5563', fontSize: 15, fontWeight: '600' },
  primaryBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  fullWidthBtn: { flexDirection: 'row', height: 48, borderRadius: 12, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 8 },
  fullWidthBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  
  addressCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  addressCardDefault: { borderColor: '#A5D6A7', backgroundColor: '#F9FBF9' },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  addressName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  defaultBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  defaultBadgeText: { fontSize: 10, color: '#2E7D32', fontWeight: '700' },
  addressLine: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  addressActions: { flexDirection: 'row', marginTop: 12, gap: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  actionTextBlue: { color: '#2563EB', fontSize: 13, fontWeight: '600' },
  actionTextRed: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#4B5563', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },

  verifyBanner: { backgroundColor: '#E8F5E9', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 16 },
  verifyBannerTitle: { fontSize: 18, fontWeight: '700', color: '#1B4329', marginTop: 12 },
  verifyBannerSub: { fontSize: 13, color: '#2E7D32', textAlign: 'center', marginTop: 6, paddingHorizontal: 12 },
  statusBanner: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  statusCenter: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  statusTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 },
  statusSub: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  detailsCard: { width: '100%', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 24 },
  detailLabel: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' },
  detailValue: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 4 },
});
