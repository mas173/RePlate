import { Platform } from 'react-native';

export const Colors = {
  brand: {
    forest: '#1F5A3A',
    green: '#2E7D32',
    sage: '#DDE8D9',
    mint: '#F3F7F1',
    gold: '#D9A441',
    yellow: '#F6E8B1',
    cream: '#FFF8E8',
    bg: '#FAFAF8',
    card: '#FFFFFF',
    border: '#E5E7EB',
  },
  neutral: {
    main: '#111827',
    secondary: '#4B5563',
    muted: '#6B7280',
    white: '#FFFFFF',
  },
  feedback: {
    error: '#DC2626',
    success: '#16A34A',
    warning: '#D97706',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 26,
    '4xl': 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 18,
    normal: 22,
    relaxed: 26,
  },
};

export const Shadows = {
  sm: {
    shadowColor: Colors.neutral.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.neutral.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.neutral.main,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: '.SF Compact Rounded',
    mono: 'Courier New',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-condensed',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
