import '../global.css';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Image, Text } from 'react-native';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { tokenCache } from '../services/tokenCache';
import { Colors } from '../constants/theme';
import { useAppAuth } from '../hooks/useAppAuth';

// Complete any pending OAuth browser session BEFORE route matching
// This must run at the root level so the redirect URL is consumed
// before Expo Router interprets it as an unmatched route.
WebBrowser.maybeCompleteAuthSession();

// Keep splash screen visible until Clerk is loaded
SplashScreen.preventAutoHideAsync().catch(() => {});

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dGVhY2hpbmctZG9iZXJtYW4tOS5jbGVyay5hY2NvdW50cy5kZXYk';

if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  console.warn(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in process.env, using default fallback key.'
  );
}

function AuthGuard() {
  const { isLoaded, isSignedIn, isProfileLoaded } = useAppAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Track sign-out transition to show a loading spinner
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [prevSignedIn, setPrevSignedIn] = useState<boolean | null>(null);

  // Detect the moment isSignedIn transitions from true → false (sign-out)
  useEffect(() => {
    if (!isLoaded) return;

    if (prevSignedIn === true && isSignedIn === false) {
      // User just signed out — show spinner during redirect
      setIsSigningOut(true);
    }

    setPrevSignedIn(!!isSignedIn);
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    console.log('AuthGuard state:', { isLoaded, isSignedIn, isProfileLoaded, segments, hasKey: !!navigationState?.key });
    if (!isLoaded || !navigationState?.key) return;

    const routeSegments = segments as string[];
    const inAuthGroup = routeSegments[0] === '(auth)';
    const isProtectedRoute =
      routeSegments[0] === '(tabs)' || routeSegments[0] === 'modal' || routeSegments[0] === 'notifications';

    if (!isSignedIn) {
      // User is not signed in — redirect away from protected routes only
      // Auth screens (sign-in, sign-up) must stay accessible for unauthenticated users
      if (isProtectedRoute) {
        // Use a small delay to let Clerk fully tear down the session
        setTimeout(() => {
          router.replace('/');
          // Clear signing-out spinner after navigation settles
          setTimeout(() => setIsSigningOut(false), 300);
        }, 50);
      } else {
        // On landing page or auth screens — clear any signing-out state
        setIsSigningOut(false);
      }
    } else {
      // User is signed in
      if (!isProfileLoaded) return;

      if (inAuthGroup || !isProtectedRoute) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 0);
      }
    }
  }, [isLoaded, isSignedIn, isProfileLoaded, segments, navigationState?.key]);

  // Hide splash screen once Clerk and Profile loading are finalized
  useEffect(() => {
    if (isLoaded && (!isSignedIn || isProfileLoaded)) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoaded, isSignedIn, isProfileLoaded]);

  // Show branded loading spinner during sign-out transition or initial load
  if (!isLoaded || isSigningOut || (isSignedIn && !isProfileLoaded)) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/images/mainLogo.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>
          {isSigningOut ? 'Signing out...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY ?? ''} tokenCache={tokenCache}>
      <ClerkLoaded>
        <AuthGuard />
        <StatusBar style="dark" />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFBF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 72,
    height: 72,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});
