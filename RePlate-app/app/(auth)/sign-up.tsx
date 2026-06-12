import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity as RNTouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Colors } from '../../constants/theme';
import { Button, Input } from '../../components/ui';
import { useAppAuth } from '../../hooks/useAppAuth';

// Required for Expo OAuth redirect to work properly
WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  // Registration form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'donor' | 'ngo'>('donor');
  
  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  
  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    code?: string;
  }>({});

  const { updateRole } = useAppAuth();

  // Google OAuth sign-up
  const handleGoogleSignUp = useCallback(async () => {
    try {
      setGoogleLoading(true);

      const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: Linking.createURL('/oauth-callback', { scheme: 'replate' }),
      });

      if (createdSessionId) {
        // Google sign-up completed — activate the session
        await ssoSetActive?.({ session: createdSessionId });
        // Set the selected role after Google sign-up
        await updateRole(role);
      }
    } catch (err: any) {
      console.error('Google sign-up error:', err);
      const message = err?.errors?.[0]?.message || 'Google sign-up failed. Please try again.';
      Alert.alert('Google Sign Up Failed', message);
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow, role, updateRole]);

  const handleSignUp = async () => {
    if (!isLoaded) return;

    setErrors({});
    let valid = true;
    const newErrors: typeof errors = {};

    if (!firstName) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }
    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    }
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Create sign-up in Clerk
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(err);
      const message = err?.errors?.[0]?.message || 'Registration failed';
      Alert.alert('Sign Up Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;

    setErrors({});
    if (!code) {
      setErrors({ code: 'Verification code is required' });
      return;
    }

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        // Set the active session in Clerk
        const sessionId = completeSignUp.createdSessionId;
        await setActive({ session: sessionId });

        // Retrieve token and sync profile with selected role
        await updateRole(role);
        
        Alert.alert('Sign Up Complete', 'Welcome to RePlate!');
      } else {
        console.warn('Verification incomplete status:', completeSignUp.status);
        Alert.alert('Verification', 'Verification status incomplete. Please check the code.');
      }
    } catch (err: any) {
      console.error(err);
      const message = err?.errors?.[0]?.message || 'Verification failed';
      Alert.alert('Verification Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/mainLogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>RePlate</Text>
          <Text style={styles.subtitle}>Reducing waste, feeding communities</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {pendingVerification ? 'Verify Email' : 'Sign Up'}
          </Text>

          {!pendingVerification ? (
            <View>
              {/* Role Selection — shown before Google button so the role is set */}
              <Text style={styles.roleLabel}>I want to join as a:</Text>
              <View style={styles.roleContainer}>
                <RNTouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'donor' && styles.roleOptionActive,
                  ]}
                  onPress={() => setRole('donor')}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === 'donor' && styles.roleTextActive,
                    ]}
                  >
                    Donor (Food Provider)
                  </Text>
                </RNTouchableOpacity>

                <RNTouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'ngo' && styles.roleOptionActive,
                  ]}
                  onPress={() => setRole('ngo')}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === 'ngo' && styles.roleTextActive,
                    ]}
                  >
                    NGO (Receiver)
                  </Text>
                </RNTouchableOpacity>
              </View>

              {/* Google OAuth Button */}
              <RNTouchableOpacity
                style={styles.googleButton}
                activeOpacity={0.8}
                onPress={handleGoogleSignUp}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <Image
                    source={require('../../assets/images/google_icon.png')}
                    style={styles.googleIcon}
                  />
                )}
                <Text style={styles.googleButtonText}>
                  {googleLoading ? 'Signing up...' : 'Continue with Google'}
                </Text>
              </RNTouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign up with email</Text>
                <View style={styles.dividerLine} />
              </View>

              <Input
                label="First Name"
                placeholder="enter your first name"
                value={firstName}
                onChangeText={setFirstName}
                leftIcon="person-outline"
                error={errors.firstName}
              />

              <Input
                label="Last Name"
                placeholder="enter your last name"
                value={lastName}
                onChangeText={setLastName}
                leftIcon="person-outline"
              />

              <Input
                label="Email Address"
                placeholder="enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                leftIcon="mail-outline"
                error={errors.email}
              />

              <Input
                label="Password"
                placeholder="enter password (min 8 chars)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
                error={errors.password}
              />

              <Button
                title="Create Account"
                onPress={handleSignUp}
                loading={loading}
                fullWidth
                style={styles.button}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.instructions}>
                We've sent a 6-digit verification code to your email. Please enter it below.
              </Text>
              
              <Input
                label="Verification Code"
                placeholder="enter 6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                leftIcon="key-outline"
                error={errors.code}
              />

              <Button
                title="Verify Code"
                onPress={handleVerify}
                loading={loading}
                fullWidth
                style={styles.button}
              />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <RNTouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </RNTouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B4329',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EAF3E9',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FAFBF7',
  },
  roleOptionActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleTextActive: {
    color: '#1B4329',
    fontWeight: '700',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 48,
    marginBottom: 16,
    gap: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 10,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signInLink: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '700',
  },
});
