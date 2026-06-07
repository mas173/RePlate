/**
 * Home / Dashboard Tab
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppAuth } from '@/hooks/useAppAuth';
import { analyticsAPI } from '@/services/api';
import { Card } from '@/components/ui';
import { Colors } from '@/constants/theme';

interface PlatformStats {
  totalDonations: number;
  totalMealsSaved: number;
  totalWasteReduced: number;
  activeDonors: number;
  activeNGOs: number;
}

export default function HomeScreen() {
  const { profile, role, isProfileLoaded } = useAppAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const data = await analyticsAPI.getPublicStats();
      setStats(data as PlatformStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.brand.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
          <Image
            source={require('@/assets/images/mainLogo.png')}
            style={{ width: 40, height: 40, marginRight: 12 }}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: Colors.neutral.muted }}>
              {greeting} 👋
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: Colors.brand.forest,
              }}
            >
              {isProfileLoaded ? profile?.fullName || 'RePlater' : 'Loading...'}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: Colors.brand.sage,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: Colors.brand.forest,
                textTransform: 'capitalize',
              }}
            >
              {role || 'user'}
            </Text>
          </View>
        </View>

        {/* Platform Impact Card */}
        <Card variant="elevated" style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              color: Colors.brand.green,
              marginBottom: 16,
            }}
          >
            Platform Impact
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[
              {
                label: 'Meals Saved',
                value: stats?.totalMealsSaved?.toLocaleString() || '—',
                emoji: '🍽️',
              },
              {
                label: 'Food Rescued',
                value: stats
                  ? `${(stats.totalWasteReduced / 1000).toFixed(1)} tons`
                  : '—',
                emoji: '♻️',
              },
              {
                label: 'Active Donors',
                value: stats?.activeDonors?.toLocaleString() || '—',
                emoji: '🤝',
              },
              {
                label: 'NGO Partners',
                value: stats?.activeNGOs?.toLocaleString() || '—',
                emoji: '🏢',
              },
            ].map((item, idx) => (
              <View
                key={idx}
                style={{
                  width: '47%',
                  backgroundColor: Colors.brand.mint,
                  borderRadius: 14,
                  padding: 14,
                }}
              >
                <Text style={{ fontSize: 22, marginBottom: 4 }}>{item.emoji}</Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: Colors.brand.forest,
                  }}
                >
                  {item.value}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: Colors.neutral.muted,
                    marginTop: 2,
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Quick Actions */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: Colors.neutral.main,
            marginBottom: 12,
          }}
        >
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Card
            variant="outlined"
            style={{ flex: 1, alignItems: 'center', paddingVertical: 20 }}
          >
            <Text style={{ fontSize: 28, marginBottom: 8 }}>📦</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: Colors.neutral.main,
              }}
            >
              {role === 'ngo' ? 'Claim Food' : 'Donate Food'}
            </Text>
          </Card>
          <Card
            variant="outlined"
            style={{ flex: 1, alignItems: 'center', paddingVertical: 20 }}
          >
            <Text style={{ fontSize: 28, marginBottom: 8 }}>📊</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: Colors.neutral.main,
              }}
            >
              My Impact
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
