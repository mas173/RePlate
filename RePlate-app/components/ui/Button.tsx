import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyles = () => {
    const stylesList: StyleProp<ViewStyle>[] = [styles.base];

    if (fullWidth) stylesList.push(styles.fullWidth);

    switch (variant) {
      case 'primary':
        stylesList.push(styles.primary);
        break;
      case 'secondary':
        stylesList.push(styles.secondary);
        break;
      case 'danger':
        stylesList.push(styles.danger);
        break;
      case 'outline':
        stylesList.push(styles.outline);
        break;
    }

    switch (size) {
      case 'small':
        stylesList.push(styles.small);
        break;
      case 'medium':
        stylesList.push(styles.medium);
        break;
      case 'large':
        stylesList.push(styles.large);
        break;
    }

    if (disabled) {
      stylesList.push(styles.disabled);
    }

    return stylesList;
  };

  const getTextColor = () => {
    if (disabled) return Colors.neutral.muted;
    if (variant === 'outline' || variant === 'secondary') {
      return Colors.brand.forest;
    }
    return Colors.neutral.white;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[getButtonStyles(), style]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: Colors.brand.green,
  },
  secondary: {
    backgroundColor: Colors.brand.sage,
  },
  danger: {
    backgroundColor: Colors.feedback.error,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.brand.green,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  disabled: {
    backgroundColor: Colors.brand.border,
    borderColor: Colors.brand.border,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
