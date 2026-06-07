/**
 * Sign Up Screen
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
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { Colors } from '@/constants/theme';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || undefined,
        emailAddress: email.trim(),
        password,
      });

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Sign up failed. Please try again.';
      Alert.alert('Sign Up Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, fullName, email, password, signUp]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Verification could not be completed.');
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Verification failed. Please try again.';
      Alert.alert('Verification Error', message);
    } finally {
      setLoading(false);
    }
  }, [isLoaded, verificationCode, signUp, setActive, router]);

  // Verification step UI
  if (pendingVerification) {
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
              Verify your email
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: Colors.neutral.muted,
                textAlign: 'center',
              }}
            >
              We sent a 6-digit code to {email}
            </Text>
          </View>

          <Input
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button
            title="Verify Email"
            onPress={handleVerify}
            loading={loading}
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            onPress={() => setPendingVerification(false)}
            style={{ alignSelf: 'center', marginTop: 16 }}
          >
            <Text style={{ fontSize: 13, color: Colors.brand.green, fontWeight: '600' }}>
              ← Back to sign up
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Sign Up form UI
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
            Create an account
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: Colors.neutral.muted,
              textAlign: 'center',
            }}
          >
            Join RePlate and start making a difference
          </Text>
        </View>

        {/* Form */}
        <View style={{ marginBottom: 24 }}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
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
            placeholder="Create a password (min 8 characters)"
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

        {/* Sign Up Button */}
        <Button
          title="Create Account"
          onPress={handleSignUp}
          loading={loading}
          fullWidth
          size="lg"
        />

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

        {/* Sign In link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={{ fontSize: 14, color: Colors.neutral.sub }}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: Colors.brand.forest,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
