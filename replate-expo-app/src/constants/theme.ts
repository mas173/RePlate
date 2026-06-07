/**
 * RePlate Mobile Design Tokens
 * Shared color palette, typography, spacing, and platform constants
 */

import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  brand: {
    forest: '#1F5A3A',
    green: '#2E7D32',
    sage: '#DDE8D9',
    mint: '#F3F7F1',
    bg: '#FAFAF8',
    card: '#FFFFFF',
    border: '#E5E7EB',
  },
  neutral: {
    main: '#111827',
    sub: '#4B5563',
    muted: '#6B7280',
  },
  accent: {
    gold: '#D9A441',
    yellow: '#F6E8B1',
    cream: '#FFF8E8',
  },
  status: {
    success: '#10b981',
    warning: '#f97316',
    danger: '#ef4444',
    info: '#14b8a6',
  },
  light: {
    text: '#111827',
    background: '#FAFAF8',
    backgroundElement: '#F3F7F1',
    backgroundSelected: '#DDE8D9',
    textSecondary: '#4B5563',
  },
  dark: {
    text: '#f1f5f9',
    background: '#0f172a',
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
    textSecondary: '#94a3b8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
