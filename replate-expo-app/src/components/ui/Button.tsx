/**
 * RePlate reusable Button component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      gap: 8,
      ...(fullWidth && { width: '100%' }),
    };

    // Size
    const sizes: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: 16, paddingVertical: 10 },
      md: { paddingHorizontal: 20, paddingVertical: 14 },
      lg: { paddingHorizontal: 28, paddingVertical: 18 },
    };

    // Variant
    const variants: Record<string, ViewStyle> = {
      primary: { backgroundColor: Colors.brand.forest },
      secondary: { backgroundColor: Colors.brand.green },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.brand.border,
      },
      ghost: { backgroundColor: 'transparent' },
      danger: { backgroundColor: Colors.status.danger },
    };

    return {
      ...base,
      ...sizes[size],
      ...variants[variant],
      ...(disabled && { opacity: 0.5 }),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '700',
    };

    const sizes: Record<string, TextStyle> = {
      sm: { fontSize: 13 },
      md: { fontSize: 15 },
      lg: { fontSize: 17 },
    };

    const variants: Record<string, TextStyle> = {
      primary: { color: '#fff' },
      secondary: { color: '#fff' },
      outline: { color: Colors.neutral.main },
      ghost: { color: Colors.brand.forest },
      danger: { color: '#fff' },
    };

    return { ...base, ...sizes[size], ...variants[variant], ...textStyle };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getContainerStyle()}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.brand.forest : '#fff'}
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
