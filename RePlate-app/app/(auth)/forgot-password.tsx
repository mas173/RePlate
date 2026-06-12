import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Button, Input } from '../../components/ui';

export default function ForgotPasswordScreen() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; code?: string; newPassword?: string }>({});

  const handleSendResetCode = async () => {
    if (!isLoaded) return;

    setErrors({});
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    setLoading(true);
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStep('reset');
      Alert.alert('Reset Code Sent', 'Please check your email for the password reset code.');
    } catch (err: any) {
      console.error(err);
      const message = err?.errors?.[0]?.message || 'Failed to send reset code';
      Alert.alert('Reset Request Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isLoaded) return;

    setErrors({});
    let valid = true;
    const newErrors: typeof errors = {};

    if (!code) {
      newErrors.code = 'Reset code is required';
      valid = false;
    }
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        Alert.alert('Password Reset Success', 'Your password has been successfully reset. Please sign in.', [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/sign-in'),
          },
        ]);
      } else {
        Alert.alert('Reset Password', 'Validation incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      const message = err?.errors?.[0]?.message || 'Failed to reset password';
      Alert.alert('Reset Password Failed', message);
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
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>RePlate</Text>
          <Text style={styles.subtitle}>Reducing waste, feeding communities</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Reset Password</Text>

          {step === 'request' ? (
            <View>
              <Text style={styles.instructions}>
                Enter your email address and we'll send you a code to reset your password.
              </Text>
              
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

              <Button
                title="Send Reset Code"
                onPress={handleSendResetCode}
                loading={loading}
                fullWidth
                style={styles.button}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.instructions}>
                Enter the verification code sent to your email along with your new password.
              </Text>

              <Input
                label="Verification Code"
                placeholder="enter reset code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                leftIcon="key-outline"
                error={errors.code}
              />

              <Input
                label="New Password"
                placeholder="enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
                error={errors.newPassword}
              />

              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                fullWidth
                style={styles.button}
              />
            </View>
          )}

          <Button
            title="Back to Sign In"
            onPress={() => router.replace('/(auth)/sign-in')}
            variant="outline"
            fullWidth
            style={styles.backButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.brand.forest,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral.secondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.brand.card,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.neutral.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral.main,
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    color: Colors.neutral.secondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 8,
  },
  backButton: {
    marginTop: 12,
    borderColor: 'transparent',
  },
});
