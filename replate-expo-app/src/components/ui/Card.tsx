/**
 * RePlate reusable Card component
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: number;
}

export default function Card({
  children,
  style,
  variant = 'elevated',
  padding = 16,
}: CardProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Colors.brand.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.brand.card,
          borderWidth: 1,
          borderColor: Colors.brand.border,
        };
      case 'flat':
        return {
          backgroundColor: Colors.brand.mint,
        };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        {
          borderRadius: 18,
          padding,
        },
        getVariantStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
}
