import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppAuth } from '../../hooks/useAppAuth';
import { Colors } from '../../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const { profile, user } = useAppAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    
    let active = true;
    const fetchUnreadCount = async () => {
      try {
        const response = await apiClient.get('/notifications/unread-count');
        if (active) {
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (err) {
        console.warn('Failed to fetch unread count:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [profile]);

  // Get user's first name dynamically
  const firstName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : user?.firstName || 'RePlater';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBF7" />

      {/* Main Scroll Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Premium Header */}
        <View style={styles.header}>
          <View style={styles.logoGroup}>
            <Image
              source={require('../../assets/images/mainLogo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.appNameContainer}>
              <Text style={styles.brandRe}>Re</Text>
              <Text style={styles.brandPlate}>Plate</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {/* Notification Icon with Red Badge */}
            <TouchableOpacity 
              style={styles.iconButton} 
              activeOpacity={0.75}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#1F5A3A" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Avatar Group with active status indicator */}
            <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8} onPress={() => router.push('/profile')}>
              <Image
                source={user?.imageUrl ? { uri: user.imageUrl } : require('../../assets/images/icon.png')}
                style={styles.avatarImage}
              />
              <View style={styles.activeDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Brand Tagline below header */}
        <View style={styles.taglineRow}>
          <View style={styles.line} />
          <Text style={styles.taglineText}>REDUCE WASTE. FEED MORE.</Text>
          <View style={styles.line} />
        </View>

        {/* Welcome & Impact Hero Grid */}
        <View style={styles.welcomeHeroContainer}>
          {/* Left Welcome and Impact Details */}
          <View style={styles.heroLeft}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.username}>{firstName}! 👋</Text>
            <Text style={styles.welcomeSub}>Every meal you share creates a better tomorrow.</Text>

            {/* Impact This Month Sub-Card */}
            <View style={styles.monthImpactCard}>
              <View style={styles.monthImpactHeader}>
                <Text style={styles.monthImpactTitle}>Your Impact This Month</Text>
                <Ionicons name="leaf" size={12} color="#2E7D32" style={{ marginLeft: 4 }} />
              </View>
              
              <View style={styles.monthImpactContent}>
                <View>
                  <Text style={styles.monthImpactNum}>42</Text>
                  <Text style={styles.monthImpactLabel}>Meals Shared</Text>
                </View>
                {/* Bowl Graphic */}
                <View style={styles.bowlGraphicContainer}>
                  <View style={styles.bowlCircle}>
                    <MaterialCommunityIcons name="food-apple" size={24} color="#2E7D32" />
                  </View>
                  <View style={styles.bowlHeartBadge}>
                    <Ionicons name="heart" size={10} color="#FFFFFF" />
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.viewImpactRow} activeOpacity={0.7}>
                <Text style={styles.viewImpactText}>View Impact</Text>
                <Ionicons name="arrow-forward" size={12} color="#2E7D32" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Curved Volunteer Image */}
          <View style={styles.heroRight}>
            <Image
              source={require('../../assets/images/hero_image.png')}
              style={styles.volunteerHeroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Stats Row Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsScrollContent}
        >
          {/* Meals Shared */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>Meals Shared</Text>
            <Text style={styles.statVal}>42</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="arrow-up" size={10} color="#2E7D32" />
              <Text style={styles.statTrendText}>12% vs last month</Text>
            </View>
          </View>

          {/* People Helped */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="people" size={16} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>People Helped</Text>
            <Text style={styles.statVal}>126</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="arrow-up" size={10} color="#2E7D32" />
              <Text style={styles.statTrendText}>18% vs last month</Text>
            </View>
          </View>

          {/* Food Saved */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="leaf" size={16} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>Food Saved</Text>
            <Text style={styles.statVal}>28.5 kg</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="arrow-up" size={10} color="#2E7D32" />
              <Text style={styles.statTrendText}>15% vs last month</Text>
            </View>
          </View>

          {/* CO2 Prevented */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="earth" size={16} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>CO₂ Prevented</Text>
            <Text style={styles.statVal}>63.2 kg</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="arrow-up" size={10} color="#2E7D32" />
              <Text style={styles.statTrendText}>10% vs last month</Text>
            </View>
          </View>
        </ScrollView>

        {/* Prevented Landfill Impact Card */}
        <View style={styles.landfillCard}>
          <View style={styles.landfillLeft}>
            {/* Sprout Icon */}
            <View style={styles.sproutWrapper}>
              <MaterialCommunityIcons name="sprout" size={32} color="#2E7D32" />
            </View>
            <View style={styles.landfillTextContainer}>
              <Text style={styles.landfillSub}>Together we've prevented</Text>
              <Text style={styles.landfillTitle}>2.1 tons</Text>
              <Text style={styles.landfillDesc}>of food waste from going to landfill.</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.landfillBtn} activeOpacity={0.8}>
            <Text style={styles.landfillBtnText}>See Our Impact</Text>
            <Ionicons name="arrow-forward" size={12} color="#FAFBF7" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Recent Activity Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity style={styles.viewAllBtn} activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={12} color="#2E7D32" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

        {/* Recent Activity Card list */}
        <View style={styles.activityListCard}>
          {/* Row 1 */}
          <View style={styles.activityRow}>
            <View style={[styles.activityIconCircle, { backgroundColor: '#E6F4EA' }]}>
              <Ionicons name="add" size={16} color="#2E7D32" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Donation created</Text>
              <Text style={styles.activitySub}>25 Veg Meal Packets</Text>
            </View>
            <View style={styles.activityMeta}>
              <Text style={styles.activityTime}>Today, 09:12 AM</Text>
              <View style={[styles.statusBadge, styles.statusSuccess]}>
                <Text style={styles.statusTextSuccess}>Completed</Text>
              </View>
            </View>
          </View>
          <View style={styles.activityDivider} />

          {/* Row 2 */}
          <View style={styles.activityRow}>
            <View style={[styles.activityIconCircle, { backgroundColor: '#FFF4E5' }]}>
              <Ionicons name="sparkles" size={14} color="#D97706" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>AI freshness analysis completed</Text>
              <Text style={styles.activitySub}>Food is good to consume</Text>
            </View>
            <View style={styles.activityMeta}>
              <Text style={styles.activityTime}>Today, 09:15 AM</Text>
              <View style={[styles.statusBadge, styles.statusSuccess]}>
                <Text style={styles.statusTextSuccess}>Completed</Text>
              </View>
            </View>
          </View>
          <View style={styles.activityDivider} />

          {/* Row 3 */}
          <View style={styles.activityRow}>
            <View style={[styles.activityIconCircle, { backgroundColor: '#EBF5FF' }]}>
              <Ionicons name="people" size={14} color="#2563EB" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>NGO claimed your donation</Text>
              <Text style={styles.activitySub}>Hope Foundation NGO</Text>
            </View>
            <View style={styles.activityMeta}>
              <Text style={styles.activityTime}>Today, 09:32 AM</Text>
              <View style={[styles.statusBadge, styles.statusInfo]}>
                <Text style={styles.statusTextInfo}>Claimed</Text>
              </View>
            </View>
          </View>
          <View style={styles.activityDivider} />

          {/* Row 4 */}
          <View style={styles.activityRow}>
            <View style={[styles.activityIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <MaterialCommunityIcons name="truck-delivery" size={14} color="#7C3AED" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Pickup confirmed</Text>
              <Text style={styles.activitySub}>Pickup in progress</Text>
            </View>
            <View style={styles.activityMeta}>
              <Text style={styles.activityTime}>Today, 10:10 AM</Text>
              <View style={[styles.statusBadge, styles.statusWarning]}>
                <Text style={styles.statusTextWarning}>In Progress</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Action Grid Row */}
        <View style={styles.actionGridRow}>
          {/* Card 1: Donate Food */}
          <TouchableOpacity
            style={[styles.actionGridCard, { backgroundColor: '#F3F7F1', borderColor: '#E6EFE5' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/donate')}
          >
            <View style={styles.actionGridLeft}>
              <View style={[styles.actionGridIconCircle, { backgroundColor: '#E4F0E1' }]}>
                <MaterialCommunityIcons name="food-apple" size={20} color="#2E7D32" />
              </View>
              <View style={styles.actionGridTextWrapper}>
                <Text style={styles.actionGridTitle}>Donate Food</Text>
                <Text style={styles.actionGridSub}>Share surplus food in just a few taps</Text>
              </View>
            </View>
            <View style={[styles.gridArrowCircle, { backgroundColor: '#2E7D32' }]}>
              <Ionicons name="arrow-forward" size={14} color="#FAFBF7" />
            </View>
          </TouchableOpacity>

          {/* Card 2: Find Donations */}
          <TouchableOpacity
            style={[styles.actionGridCard, { backgroundColor: '#F0F7FF', borderColor: '#E1EEFF' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/my-donations')}
          >
            <View style={styles.actionGridLeft}>
              <View style={[styles.actionGridIconCircle, { backgroundColor: '#E1EEFF' }]}>
                <Ionicons name="location" size={20} color="#2563EB" />
              </View>
              <View style={styles.actionGridTextWrapper}>
                <Text style={[styles.actionGridTitle, { color: '#1E3A8A' }]}>Find Donations</Text>
                <Text style={styles.actionGridSub}>Discover nearby donations to help</Text>
              </View>
            </View>
            <View style={[styles.gridArrowCircle, { backgroundColor: '#2563EB' }]}>
              <Ionicons name="arrow-forward" size={14} color="#FAFBF7" />
            </View>
          </TouchableOpacity>
        </View>

        {/* AI Assistant Pill Bar */}
        <TouchableOpacity style={styles.aiAssistantCard} activeOpacity={0.85}>
          <View style={styles.aiLeft}>
            <View style={styles.aiIconCircle}>
              <Ionicons name="mic" size={16} color="#FAFBF7" />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>Need help donating?</Text>
              <Text style={styles.aiSub}>Tap to speak with RePlate AI Assistant</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#6B7280" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    width: width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 38,
    height: 38,
    marginRight: 6,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRe: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B4329',
  },
  brandPlate: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E7D32',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF2EA',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EBF2EA',
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: '#FAFBF7',
  },
  taglineRow: {
    width: width * 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  line: {
    height: 1,
    backgroundColor: '#B5C9B4',
    flex: 1,
  },
  taglineText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 1,
    marginHorizontal: 8,
  },
  welcomeHeroContainer: {
    width: width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroLeft: {
    flex: 1.1,
    paddingRight: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B4329',
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    marginTop: 2,
  },
  welcomeSub: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  monthImpactCard: {
    backgroundColor: '#F3F7F1',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6EFE5',
  },
  monthImpactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthImpactTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  monthImpactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  monthImpactNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B4329',
  },
  monthImpactLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  bowlGraphicContainer: {
    position: 'relative',
    marginRight: 4,
    marginBottom: 4,
  },
  bowlCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  bowlHeartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F3F7F1',
  },
  viewImpactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E6EFE5',
    paddingTop: 8,
  },
  viewImpactText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  heroRight: {
    flex: 0.9,
    height: height * 0.22,
    borderTopLeftRadius: 160,
    borderBottomLeftRadius: 160,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EBF2EA',
    backgroundColor: '#E5E7EB',
  },
  volunteerHeroImage: {
    width: '100%',
    height: '100%',
  },
  statsScroll: {
    width: width,
    marginBottom: 20,
  },
  statsScrollContent: {
    paddingLeft: width * 0.05,
    paddingRight: 16,
    gap: 12,
  },
  statCard: {
    width: width * 0.35,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 3,
    elevation: 1,
  },
  statIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  statTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statTrendText: {
    fontSize: 8.5,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 1,
  },
  landfillCard: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAF3E9',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  landfillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  sproutWrapper: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F3F7F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  landfillTextContainer: {
    flex: 1,
  },
  landfillSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  landfillTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  landfillDesc: {
    fontSize: 9.5,
    color: '#6B7280',
    marginTop: 2,
  },
  landfillBtn: {
    backgroundColor: '#1B4329',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  landfillBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FAFBF7',
  },
  sectionHeader: {
    width: width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4329',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  activityListCard: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
    paddingRight: 8,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 15,
  },
  activitySub: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 2,
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  activityTime: {
    fontSize: 9.5,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusSuccess: {
    backgroundColor: '#DCFCE7',
  },
  statusInfo: {
    backgroundColor: '#DBEAFE',
  },
  statusWarning: {
    backgroundColor: '#F3E8FF',
  },
  statusTextSuccess: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  statusTextInfo: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  statusTextWarning: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#7C3AED',
  },
  activityDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  actionGridRow: {
    width: width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  actionGridCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 74,
  },
  actionGridLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 4,
  },
  actionGridIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionGridTextWrapper: {
    flex: 1,
  },
  actionGridTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B4329',
  },
  actionGridSub: {
    fontSize: 8.5,
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 11,
  },
  gridArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAssistantCard: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiTextContainer: {
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  aiSub: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 1,
  },
});
