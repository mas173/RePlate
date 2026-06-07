/**
 * Main tab navigation layout
 */

import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { Colors } from '@/constants/theme';

// Simple icon component using text emojis (will be replaced with proper icons later)
function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '700' : '500',
          color: focused ? Colors.brand.green : Colors.neutral.muted,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.brand.card,
          borderTopColor: Colors.brand.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.brand.green,
        tabBarInactiveTintColor: Colors.neutral.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🔍" label="Discover" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="donate"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🤲" label="Donate" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
