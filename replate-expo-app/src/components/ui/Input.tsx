/**
 * RePlate reusable Input component
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: Colors.neutral.sub,
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: error
            ? Colors.status.danger
            : isFocused
            ? Colors.brand.green
            : Colors.brand.border,
          borderRadius: 14,
          backgroundColor: '#fff',
          paddingHorizontal: 14,
          gap: 10,
        }}
      >
        {icon && <View>{icon}</View>}
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 14,
            fontSize: 15,
            color: Colors.neutral.main,
          }}
          placeholderTextColor={Colors.neutral.muted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: Colors.status.danger,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
