import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Alert, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAppAuth } from '../../hooks/useAppAuth';
import { Card, Button, Input } from '../../components/ui';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { userAPI } from '../../services/api';
import type { BackendProfile } from '../../types/api';

export default function ProfileScreen() {
  const { signOut } = useClerk();
  const router = useRouter();
  const { profile, role, user, getToken, syncProfile } = useAppAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backendProfile, setBackendProfile] = useState<BackendProfile | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [city, setCity] = useState('');

  // Error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fetchFullProfile = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      
      const fullProfile = await userAPI.getProfile(token);
      setBackendProfile(fullProfile);
      
      // Initialize form values
      setFirstName(fullProfile.first_name || '');
      setLastName(fullProfile.last_name || '');
      setPhone(fullProfile.phone || '');
      setOrganizationName(fullProfile.organization_name || '');
      setCity(fullProfile.city || '');
    } catch (error) {
      console.error('Error fetching full profile:', error);
      Alert.alert('Error', 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, []);

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

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (phone.trim() && !/^\+?[0-9\s-]{7,15}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validate()) return;

    try {
      setSaving(true);
      const token = await getToken();
      if (!token) return;

      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        organization_name: organizationName.trim() || undefined,
        city: city.trim(),
      };

      await userAPI.updateProfile(token, payload);
      
      // Sync local Zustand auth state
      await syncProfile();
      
      // Refresh current component state
      await fetchFullProfile();
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.forest} />
          <Text style={styles.loadingText}>Loading profile details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          {!isEditing && (
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-sharp" size={16} color={Colors.brand.forest} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={40} color={Colors.brand.forest} />
            </View>
          )}
          <Text style={styles.name}>
            {profile?.fullName || user?.firstName || 'RePlater'}
          </Text>
          <Text style={styles.email}>
            {profile?.email || user?.primaryEmailAddress?.emailAddress}
          </Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{role || 'User'}</Text>
          </View>
        </Card>

        {isEditing ? (
          /* Edit Mode Form */
          <Card variant="outlined" style={styles.formCard}>
            <Text style={styles.formTitle}>Edit Personal Details</Text>
            
            <Input
              label="First Name *"
              placeholder="Enter first name"
              value={firstName}
              onChangeText={setFirstName}
              error={errors.firstName}
              leftIcon="person-outline"
            />
            
            <Input
              label="Last Name"
              placeholder="Enter last name"
              value={lastName}
              onChangeText={setLastName}
              leftIcon="person-outline"
            />
            
            <Input
              label="Organization"
              placeholder="Enter organization name"
              value={organizationName}
              onChangeText={setOrganizationName}
              leftIcon="business-outline"
            />
            
            <Input
              label="City *"
              placeholder="Enter city"
              value={city}
              onChangeText={setCity}
              error={errors.city}
              leftIcon="location-outline"
            />
            
            <Input
              label="Phone"
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
              leftIcon="call-outline"
            />

            <View style={styles.btnRow}>
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEditing(false);
                  setErrors({});
                  // Reset form fields
                  if (backendProfile) {
                    setFirstName(backendProfile.first_name || '');
                    setLastName(backendProfile.last_name || '');
                    setPhone(backendProfile.phone || '');
                    setOrganizationName(backendProfile.organization_name || '');
                    setCity(backendProfile.city || '');
                  }
                }}
                variant="outline"
                style={styles.actionBtn}
                disabled={saving}
              />
              <Button
                title={saving ? "Saving..." : "Save"}
                onPress={handleSaveChanges}
                style={styles.actionBtn}
                loading={saving}
                disabled={saving}
              />
            </View>
          </Card>
        ) : (
          /* View Mode Card */
          <Card variant="outlined" style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconCol}>
                <Ionicons name="business-outline" size={20} color={Colors.neutral.muted} />
                <Text style={styles.infoLabel}>Organization</Text>
              </View>
              <Text style={styles.infoValue}>{backendProfile?.organization_name || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconCol}>
                <Ionicons name="location-outline" size={20} color={Colors.neutral.muted} />
                <Text style={styles.infoLabel}>City</Text>
              </View>
              <Text style={styles.infoValue}>{backendProfile?.city || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconCol}>
                <Ionicons name="call-outline" size={20} color={Colors.neutral.muted} />
                <Text style={styles.infoLabel}>Phone</Text>
              </View>
              <Text style={styles.infoValue}>{backendProfile?.phone || '—'}</Text>
            </View>
          </Card>
        )}

        {/* Sign Out Button */}
        {!isEditing && (
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="danger"
            fullWidth
            style={styles.signOutButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.neutral.muted,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.brand.forest,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.mint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.brand.sage,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brand.forest,
    marginLeft: 4,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: Colors.brand.sage,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.brand.mint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.brand.sage,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.neutral.main,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: Colors.neutral.muted,
    marginBottom: 12,
  },
  roleTag: {
    backgroundColor: Colors.brand.mint,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.brand.sage,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.forest,
    textTransform: 'capitalize',
  },
  infoCard: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.border,
  },
  infoIconCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.neutral.muted,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.main,
  },
  formCard: {
    padding: 16,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.forest,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
  signOutButton: {
    marginTop: 'auto',
  },
});
