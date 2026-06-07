/**
 * Root layout — Clerk provider, theme provider, and navigation structure
 */

import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Slot, useRouter, useSegments, DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { tokenCache } from '@/services/tokenCache';
import { Colors } from '@/constants/theme';

import '@/global.css';

// Keep splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// Custom light theme using RePlate brand colors
const RePlateLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.brand.green,
    background: Colors.brand.bg,
    card: Colors.brand.card,
    border: Colors.brand.border,
    text: Colors.neutral.main,
  },
};

const ReplateDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.brand.green,
    background: Colors.dark.background,
    card: Colors.dark.backgroundElement,
    border: Colors.dark.backgroundSelected,
    text: Colors.dark.text,
  },
};

/**
 * Auth guard — redirects unauthenticated users to sign-in
 * and authenticated users away from auth screens
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      // Not signed in and not on auth screen → go to sign in
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && inAuthGroup) {
      // Signed in but on auth screen → go to main app
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide splash after a short delay to allow layout to settle
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ThemeProvider
          value={colorScheme === 'dark' ? ReplateDark : RePlateLight}
        >
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <AuthGuard>
            <Slot />
          </AuthGuard>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
