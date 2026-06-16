import '../global.css';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Image, Text } from 'react-native';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { tokenCache } from '../services/tokenCache';
import { Colors } from '../constants/theme';
import { useAppAuth } from '../hooks/useAppAuth';
import AnimatedSplashScreen from '../components/AnimatedSplashScreen';

// Complete any pending OAuth browser session BEFORE route matching
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

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [prevSignedIn, setPrevSignedIn] = useState<boolean | null>(null);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  // Compute route properties in render scope so we can conditionally show splash
  const routeSegments = segments as string[];
  const inAuthGroup = routeSegments[0] === '(auth)';
  
  const isPublicRoute = 
    routeSegments.length === 0 || 
    (routeSegments.length === 1 && routeSegments[0] === 'index') ||
    routeSegments[0] === '(auth)' || 
    routeSegments[0] === 'oauth-callback';
    
  const isProtectedRoute = !isPublicRoute;

  const isReadyToHideSplash = isLoaded && isSplashComplete && (!isSignedIn || isProtectedRoute);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashComplete(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (prevSignedIn === true && isSignedIn === false) {
      setIsSigningOut(true);
    }
    setPrevSignedIn(!!isSignedIn);
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    console.log('[AuthGuard] Triggered:', {
      isLoaded,
      isSplashComplete,
      isSignedIn,
      isProfileLoaded,
      segments,
      navKey: navigationState?.key
    });

    if (!isLoaded || !isSplashComplete || !navigationState?.key) {
      console.log('[AuthGuard] Not loaded, splash not complete, or no nav key, returning');
      return;
    }

    console.log('[AuthGuard] routeSegments:', routeSegments, 'isProtectedRoute:', isProtectedRoute, 'inAuthGroup:', inAuthGroup);

    if (!isSignedIn) {
      if (isProtectedRoute) {
        console.log('[AuthGuard] Logged out but on protected route, redirecting to /');
        setIsSigningOut(true);
        setTimeout(() => {
          router.replace('/');
          setTimeout(() => setIsSigningOut(false), 800);
        }, 50);
      } else {
        console.log('[AuthGuard] Logged out and on public route');
        if (!isSigningOut) {
          setIsSigningOut(false);
        }
      }
    } else {
      if (inAuthGroup || !isProtectedRoute) {
        console.log('[AuthGuard] Signed in and on auth/public route, redirecting to /(tabs)/home');
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 0);
      }
    }
  }, [isLoaded, isSplashComplete, isSignedIn, segments, navigationState?.key]);

  useEffect(() => {
    if (isReadyToHideSplash) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReadyToHideSplash]);

  if (!isReadyToHideSplash) {
    return <AnimatedSplashScreen />;
  }

  // Use Stack here instead of Slot so that nested screens keep the parent screens in the stack.
  // This prevents unmounting of the bottom tabs when navigating to a modal.
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFBF7' }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAFBF7' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="notifications" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="(auth)" />
      </Stack>

      {isSigningOut && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.loadingContainer}>
            <Image
              source={require('../assets/images/mainLogo.png')}
              style={styles.loadingLogo}
              resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 24 }} />
            <Text style={styles.loadingText}>Signing out safely...</Text>
          </View>
        </View>
      )}
    </View>
  );
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
