import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAppAuth } from '../../hooks/useAppAuth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SettingRowProps {
  icon: string;
  iconPack?: 'ionicons' | 'material';
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, iconPack = 'ionicons', iconBg, iconColor, title, subtitle, onPress, rightElement, danger }: SettingRowProps) {
  const IconComponent = iconPack === 'material' ? MaterialCommunityIcons : Ionicons;
  return (
    <TouchableOpacity
      style={styles.settingRow}
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.settingIconCircle, { backgroundColor: iconBg }]}>
        <IconComponent name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.settingTextWrap}>
        <Text style={[styles.settingTitle, danger && { color: '#EF4444' }]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const router = useRouter();
  const { profile, role, user } = useAppAuth();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const firstName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : user?.firstName || 'RePlater';

  const fullName = profile?.fullName || user?.fullName || 'RePlater';
  const email = profile?.email || user?.primaryEmailAddress?.emailAddress || '';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
          <View style={styles.profileLeft}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color="#2E7D32" />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileEmail} numberOfLines={1}>{email}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{role || 'Donor'}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="person-outline"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            title="Edit Profile"
            subtitle="Name, phone, organization"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="location-outline"
            iconBg="#E3F2FD"
            iconColor="#2196F3"
            title="Pickup Address"
            subtitle="Manage saved addresses"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-checkmark-outline"
            iconBg="#FFF3E0"
            iconColor="#FF9800"
            title="Verification"
            subtitle="FSSAI & identity documents"
          />
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="notifications-outline"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            title="Push Notifications"
            subtitle="Alerts for claims & pickups"
            rightElement={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#E5E7EB', true: '#A5D6A7' }}
                thumbColor={pushNotifications ? '#2E7D32' : '#9CA3AF'}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="mail-outline"
            iconBg="#E3F2FD"
            iconColor="#2196F3"
            title="Email Notifications"
            subtitle="Weekly reports & updates"
            rightElement={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#E5E7EB', true: '#A5D6A7' }}
                thumbColor={emailNotifications ? '#2E7D32' : '#9CA3AF'}
              />
            }
          />
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="moon-outline"
            iconBg="#F3E8FF"
            iconColor="#7C3AED"
            title="Dark Mode"
            subtitle="Coming soon"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E7EB', true: '#A5D6A7' }}
                thumbColor={darkMode ? '#2E7D32' : '#9CA3AF'}
                disabled
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="language-outline"
            iconBg="#FFF3E0"
            iconColor="#FF9800"
            title="Language"
            subtitle="English"
          />
        </View>

        {/* Support Section */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="help-circle-outline"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            title="Help Center"
            subtitle="FAQs & guides"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chatbubble-ellipses-outline"
            iconBg="#E3F2FD"
            iconColor="#2196F3"
            title="Contact Support"
            subtitle="Chat with our team"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="document-text-outline"
            iconBg="#F3F4F6"
            iconColor="#4B5563"
            title="Terms & Privacy Policy"
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>RePlate v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F1',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FAFBF7',
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B4329',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  rolePill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
    textTransform: 'capitalize',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  settingIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  settingSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 60,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
});
