import React from 'react';
import { View, Text, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAppAuth } from '../../hooks/useAppAuth';
import { Card, Button } from '../../components/ui';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { signOut } = useClerk();
  const router = useRouter();
  const { profile, role, user } = useAppAuth();

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={styles.headerTitle}>Profile</Text>

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

        {/* Info Items */}
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Organization</Text>
            <Text style={styles.infoValue}>{profile?.organization || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City</Text>
            <Text style={styles.infoValue}>{profile?.city || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profile?.phone || '—'}</Text>
          </View>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          fullWidth
          style={styles.signOutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.bg,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.brand.forest,
    marginBottom: 20,
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
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.neutral.muted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.main,
  },
  signOutButton: {
    marginTop: 'auto',
  },
});
