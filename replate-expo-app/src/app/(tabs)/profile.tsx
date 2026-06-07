/**
 * Profile Tab
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAppAuth } from '@/hooks/useAppAuth';
import { Card, Button } from '@/components/ui';
import { Colors } from '@/constants/theme';

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
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.brand.bg }}>
      <View style={{ padding: 20, flex: 1 }}>
        {/* Header */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: Colors.brand.forest,
            marginBottom: 24,
          }}
        >
          Profile
        </Text>

        {/* Profile Card */}
        <Card variant="elevated" style={{ marginBottom: 20, alignItems: 'center', paddingVertical: 28 }}>
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginBottom: 12,
                borderWidth: 3,
                borderColor: Colors.brand.sage,
              }}
            />
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: Colors.brand.sage,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 32 }}>👤</Text>
            </View>
          )}
          <Text
            style={{
              fontSize: 20,
              fontWeight: '800',
              color: Colors.neutral.main,
              marginBottom: 4,
            }}
          >
            {profile?.fullName || user?.firstName || 'RePlater'}
          </Text>
          <Text style={{ fontSize: 13, color: Colors.neutral.muted, marginBottom: 8 }}>
            {profile?.email || user?.primaryEmailAddress?.emailAddress}
          </Text>
          <View
            style={{
              backgroundColor: Colors.brand.mint,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: Colors.brand.sage,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: Colors.brand.forest,
                textTransform: 'capitalize',
              }}
            >
              {role || 'User'}
            </Text>
          </View>
        </Card>

        {/* Info Items */}
        <Card variant="outlined" style={{ marginBottom: 20 }}>
          {[
            { label: 'Organization', value: profile?.organization || '—' },
            { label: 'City', value: profile?.city || '—' },
            { label: 'Phone', value: profile?.phone || '—' },
          ].map((item, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 12,
                borderBottomWidth: idx < 2 ? 1 : 0,
                borderBottomColor: Colors.brand.border,
              }}
            >
              <Text style={{ fontSize: 14, color: Colors.neutral.muted }}>{item.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.neutral.main }}>
                {item.value}
              </Text>
            </View>
          ))}
        </Card>

        {/* Sign Out */}
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="danger"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
