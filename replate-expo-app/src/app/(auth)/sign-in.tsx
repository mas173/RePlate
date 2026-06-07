/**
 * Sign In Screen
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { Colors } from '@/constants/theme';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        console.log('Sign in incomplete:', JSON.stringify(result, null, 2));
        Alert.alert('Error', 'Sign in could not be completed. Please try again.');
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Sign in failed. Please check your credentials.';
      Alert.alert('Sign In Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, email, password, signIn, setActive, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.brand.bg }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Header */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Image
            source={require('@/assets/images/mainLogo.png')}
            style={{ width: 72, height: 72, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: Colors.brand.forest,
              marginBottom: 6,
            }}
          >
            Welcome back
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: Colors.neutral.muted,
              textAlign: 'center',
            }}
          >
            Sign in to continue saving food
          </Text>
        </View>

        {/* Form */}
        <View style={{ marginBottom: 24 }}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            rightIcon={
              <Text style={{ fontSize: 13, color: Colors.brand.green, fontWeight: '600' }}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />
        </View>

        {/* Sign In Button */}
        <Button
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          fullWidth
          size="lg"
        />

        {/* Forgot password */}
        <TouchableOpacity style={{ alignSelf: 'center', marginTop: 16 }}>
          <Text
            style={{
              fontSize: 13,
              color: Colors.brand.green,
              fontWeight: '600',
            }}
          >
            Forgot your password?
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 28,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.brand.border }} />
          <Text
            style={{
              marginHorizontal: 12,
              fontSize: 12,
              color: Colors.neutral.muted,
            }}
          >
            OR
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: Colors.brand.border }} />
        </View>

        {/* Sign Up link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, color: Colors.neutral.sub }}>
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: Colors.brand.forest,
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
