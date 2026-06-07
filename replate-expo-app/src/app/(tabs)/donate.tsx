/**
 * Donate Tab — placeholder
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export default function DonateScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.brand.bg }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🤲</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.brand.forest, marginBottom: 8 }}>
          Donate Food
        </Text>
        <Text style={{ fontSize: 14, color: Colors.neutral.muted, textAlign: 'center' }}>
          List your surplus food and help feed those in need.{'\n'}Coming in Phase 2.
        </Text>
      </View>
    </SafeAreaView>
  );
}
