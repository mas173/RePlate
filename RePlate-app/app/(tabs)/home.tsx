import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppAuth } from '../../hooks/useAppAuth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiClient } from '../../services/api';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width, height } = Dimensions.get('window');

const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const formatWaste = (kg: number) => {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} Tons`;
  }
  return `${kg} kg`;
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  cooked_meals: { label: 'Cooked Meals', icon: '🍽️' },
  raw_produce: { label: 'Raw Produce', icon: '🥬' },
  bakery: { label: 'Bakery', icon: '🍞' },
  dairy: { label: 'Dairy', icon: '🥛' },
  beverages: { label: 'Beverages', icon: '🥤' },
  packaged: { label: 'Packaged', icon: '📦' },
  fruits: { label: 'Fruits', icon: '🍎' },
  grains: { label: 'Grains', icon: '🌾' },
  meat: { label: 'Meat', icon: '🥩' },
  other: { label: 'Other', icon: '🍴' },
};

const getCategoryIcon = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('cooked') || cat.includes('meal')) {
    return { lib: MaterialCommunityIcons, name: 'food' as const, color: '#2E7D32', bg: '#E6F4EA' };
  }
  if (cat.includes('produce') || cat.includes('veg') || cat.includes('raw')) {
    return { lib: MaterialCommunityIcons, name: 'carrot' as const, color: '#EA580C', bg: '#FFF7ED' };
  }
  if (cat.includes('bakery') || cat.includes('bread')) {
    return { lib: MaterialCommunityIcons, name: 'bread-slice' as const, color: '#D97706', bg: '#FEF3C7' };
  }
  if (cat.includes('dairy') || cat.includes('milk')) {
    return { lib: MaterialCommunityIcons, name: 'cow' as const, color: '#2563EB', bg: '#EBF5FF' };
  }
  if (cat.includes('bev') || cat.includes('drink')) {
    return { lib: Ionicons, name: 'cafe-outline' as const, color: '#06B6D4', bg: '#ECFEFF' };
  }
  if (cat.includes('packaged') || cat.includes('pack')) {
    return { lib: MaterialCommunityIcons, name: 'package-variant-closed' as const, color: '#7C3AED', bg: '#F3E8FF' };
  }
  if (cat.includes('fruit')) {
    return { lib: MaterialCommunityIcons, name: 'food-apple' as const, color: '#EF4444', bg: '#FEE2E2' };
  }
  if (cat.includes('grain')) {
    return { lib: MaterialCommunityIcons, name: 'barley' as const, color: '#84CC16', bg: '#F7FEE7' };
  }
  if (cat.includes('meat')) {
    return { lib: MaterialCommunityIcons, name: 'food-steak' as const, color: '#B91C1C', bg: '#FEE2E2' };
  }
  return { lib: Ionicons, name: 'fast-food-outline' as const, color: '#4B5563', bg: '#F3F4F6' };
};



export default function HomeScreen() {
  const { profile, user } = useAppAuth();
  const router = useRouter();

  // Home screen data states
  const [unreadCount, setUnreadCount] = useState(0);
  const [userStats, setUserStats] = useState({
    donations: 0,
    activeDonations: 0,
    mealsSaved: 0,
    wasteReduced: 0,
    co2Reduced: 0,
    claimsReceived: 0,
  });
  const [platformStats, setPlatformStats] = useState({
    totalDonations: 0,
    totalMealsSaved: 0,
    totalWasteReduced: 0,
    totalCO2Reduced: 0,
    activeDonors: 0,
    activeNGOs: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // AI Assistant states
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState<any[]>([]);
  const [botInput, setBotInput] = useState('');
  const [botSending, setBotSending] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);

  // Detailed Analytics Modal states
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ donors: any[]; ngos: any[] }>({ donors: [], ngos: [] });

  // Setup initial bot message when profile loads
  useEffect(() => {
    if (profile || user) {
      const name = profile?.fullName
        ? profile.fullName.split(' ')[0]
        : user?.firstName || 'RePlater';
      setBotMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi ${name}! I'm your RePlate AI Assistant. How can I help you today? You can ask me about your stats, check notifications, or inquire about nearby donations.`,
          timestamp: new Date()
        }
      ]);
    }
  }, [profile, user]);

  const fetchHomeData = useCallback(async (isRefresh = false) => {
    if (!profile) return;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // 1. Fetch unread count
      const unreadRes = await apiClient.get('/notifications/unread-count');
      setUnreadCount(unreadRes.data.unreadCount || 0);

      // 2. Fetch user stats
      const userRes = await apiClient.get(`/analytics/user?t=${Date.now()}`);
      setUserStats(userRes.data);

      // 3. Fetch platform stats
      const platformRes = await apiClient.get(`/analytics/overview?t=${Date.now()}`);
      setPlatformStats(platformRes.data);

      // 4. Fetch recent activities and active item
      const donationsRes = await apiClient.get(`/donations?t=${Date.now()}`);
      const claimsRes = await apiClient.get(`/claims?t=${Date.now()}`);

      const rawDonations = donationsRes.data?.donations || [];
      const rawClaims = claimsRes.data?.claims || claimsRes.data || [];

      // Map donations
      const donationActivities = rawDonations.map((d: any) => ({
        id: `donation-${d.id}`,
        donationId: d.id,
        type: 'donation',
        title: 'Donation Posted',
        sub: d.food_name,
        time: new Date(d.created_at),
        status: d.status,
      }));

      // Map claims
      const claimActivities = rawClaims.map((c: any) => ({
        id: `claim-${c.id}`,
        donationId: c.donation_id,
        type: 'claim',
        title: 'Food Claimed',
        sub: c.donation?.food_name || 'Food item',
        time: new Date(c.created_at),
        status: c.status,
      }));

      const combined = [...donationActivities, ...claimActivities]
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 3);

      setActivities(combined);

      // Determine active item based on role
      const isNGO = profile?.role === 'ngo';
      if (isNGO) {
        const activeNGOClaims = rawClaims.filter(
          (c: any) => c.status !== 'completed' && c.status !== 'delivered'
        );
        if (activeNGOClaims.length > 0) {
          const firstClaim = activeNGOClaims[0];
          setActiveItem({
            id: firstClaim.donation_id || firstClaim.donationId,
            food_name: firstClaim.donation?.food_name || 'Food item',
            status: firstClaim.status || 'pending',
            pickup_city: firstClaim.donation?.pickup_city || 'Local',
            expires_at: firstClaim.donation?.expires_at,
            images: firstClaim.donation?.images || [],
            category: firstClaim.donation?.category || 'other',
            type: 'claim',
          });
        } else {
          setActiveItem(null);
        }
      } else {
        const activeDonorList = rawDonations.filter(
          (d: any) => d.status !== 'completed' && d.status !== 'delivered'
        );
        if (activeDonorList.length > 0) {
          const firstDonation = activeDonorList[0];
          setActiveItem({
            id: firstDonation.id,
            food_name: firstDonation.food_name,
            status: firstDonation.status || 'available',
            pickup_city: firstDonation.pickup_city || 'Local',
            expires_at: firstDonation.expires_at,
            images: firstDonation.images || [],
            category: firstDonation.category || 'other',
            type: 'donation',
          });
        } else {
          setActiveItem(null);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch home screen data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      fetchHomeData();
    }
  }, [profile, fetchHomeData]);

  // Fetch detailed analytics data on demand
  const handleOpenAnalytics = async () => {
    setIsAnalyticsOpen(true);
    setAnalyticsLoading(true);
    try {
      const [catRes, leaderRes] = await Promise.allSettled([
        apiClient.get('/analytics/categories'),
        apiClient.get('/analytics/leaderboard'),
      ]);

      if (catRes.status === 'fulfilled') setCategoryData(catRes.value.data.categories || []);
      if (leaderRes.status === 'fulfilled') setLeaderboard(leaderRes.value.data);
    } catch (err) {
      console.warn('Failed to fetch detailed analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleSendBotMessage = async (textToSend?: string) => {
    const messageText = textToSend || botInput;
    if (!messageText.trim()) return;

    if (!textToSend) {
      setBotInput('');
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: messageText,
      timestamp: new Date()
    };

    setBotMessages(prev => [...prev, userMsg]);
    setBotSending(true);

    try {
      const historyPayload = botMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await apiClient.post('/assistant/text', {
        message: messageText,
        conversationHistory: historyPayload
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.data?.response || 'I am sorry, I am having trouble connecting to my brain right now.',
        timestamp: new Date(),
        navigationPath: response.data?.navigationPath
      };

      setBotMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.warn('Failed to chat with AI Assistant:', err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Failed to send message. Please check your internet connection.',
        timestamp: new Date()
      };
      setBotMessages(prev => [...prev, errorMsg]);
    } finally {
      setBotSending(false);
    }
  };

  const firstName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : user?.firstName || 'RePlater';

  // Level logic
  const meals = userStats.mealsSaved || 0;
  const level = meals >= 500 ? 5 : meals >= 100 ? 4 : meals >= 50 ? 3 : meals >= 10 ? 2 : 1;
  const nextTarget = [10, 50, 100, 500, 1000][level - 1];
  const progressPct = Math.min((meals / nextTarget) * 100, 100);

  // Equivalences
  const pCo2 = userStats.co2Reduced || 0;
  const pWeight = userStats.wasteReduced || 0;
  const pKm = pCo2 * 4.1;
  const pPhones = Math.round(pCo2 * 120);

  const isDataLoading = !profile || (loading && !refreshing);
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isDataLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [isDataLoading, fadeAnim]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBF7" />

      {/* Top Header Row */}
      <View style={styles.header}>
        <View style={styles.logoGroup}>
          <Image
            source={require('../../assets/images/mainLogo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>RePlate</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.75}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#1B4329" />
            {unreadCount > 0 && <View style={styles.greenBadgeDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : require('../../assets/images/icon.png')}
              style={styles.avatarImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchHomeData(true)} colors={['#2E7D32']} />
        }
      >
        {/* Welcome Section & Keep Going Badge */}
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeTextGroup}>
            <Text style={styles.greetingText}>Good morning, {firstName}! 👋</Text>
            <Text style={styles.subGreetingText}>Every meal you share creates a better tomorrow.</Text>
          </View>

          <View style={styles.keepGoingBadge}>
            <View style={styles.sproutBadgeIcon}>
              <MaterialCommunityIcons name="sprout" size={18} color="#2E7D32" />
            </View>
            <View style={styles.badgeTextGroup}>
              <Text style={styles.badgeLabel}>Keep going!</Text>
              <Text style={styles.badgeSubLabel}>You're making impact</Text>
            </View>
          </View>
        </View>

        {/* YOUR IMPACT Green Card */}
        <View style={styles.impactCard}>
          {/* Salad Bowl Hand Illustration Overlay */}
          <Image
            source={require('../../assets/images/salad_bowl_hand.png')}
            style={styles.saladBowlHandIllustration}
            resizeMode="contain"
          />

          <View style={styles.impactCardHeader}>
            <Text style={styles.impactTitle}>YOUR IMPACT</Text>
            <Ionicons name="leaf-outline" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </View>

          {/* Metrics Row */}
          {isDataLoading ? (
            <Animated.View style={[styles.impactMetricsContainer, { opacity: fadeAnim, borderBottomWidth: 0 }]}>
              <View style={[styles.impactMetricBox, { alignItems: 'center' }]}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', opacity: 0.2 }} />
                <View style={{ width: 35, height: 16, marginTop: 8, borderRadius: 4, backgroundColor: '#FFFFFF', opacity: 0.2 }} />
                <View style={{ width: 55, height: 10, marginTop: 6, borderRadius: 3, backgroundColor: '#FFFFFF', opacity: 0.2 }} />
              </View>
              <View style={[styles.metricDivider, { backgroundColor: '#FFFFFF', opacity: 0.2 }]} />
              <View style={[styles.impactMetricBox, { alignItems: 'center' }]}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', opacity: 0.2 }} />
                <View style={{ width: 35, height: 16, marginTop: 8, borderRadius: 4, backgroundColor: '#FFFFFF', opacity: 0.2 }} />
                <View style={{ width: 55, height: 10, marginTop: 6, borderRadius: 3, backgroundColor: '#FFFFFF', opacity: 0.2 }} />
              </View>
              <View style={[styles.metricDivider, { backgroundColor: '#FFFFFF', opacity: 0.2 }]} />
              <View style={[styles.impactMetricBox, { alignItems: 'center' }]}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFFFFF', opacity: 0.2 }} />
                <View style={{ width: 35, height: 16, marginTop: 8, borderRadius: 4, backgroundColor: '#FFFFFF', opacity: 0.2 }} />
                <View style={{ width: 55, height: 10, marginTop: 6, borderRadius: 3, backgroundColor: '#FFFFFF', opacity: 0.2 }} />
              </View>
            </Animated.View>
          ) : (
            <View style={styles.impactMetricsContainer}>
              <View style={styles.impactMetricBox}>
                <View style={styles.impactMetricIconCircle}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.impactMetricValue}>{userStats.mealsSaved}</Text>
                <Text style={styles.impactMetricLabel}>Meals Saved</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.impactMetricBox}>
                <View style={styles.impactMetricIconCircle}>
                  <Ionicons name="people" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.impactMetricValue}>{userStats.mealsSaved * 3}</Text>
                <Text style={styles.impactMetricLabel}>People Helped</Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.impactMetricBox}>
                <View style={styles.impactMetricIconCircle}>
                  <Ionicons name="leaf" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.impactMetricValue}>
                  {userStats.wasteReduced ? userStats.wasteReduced.toFixed(1) : '0'} kg
                </Text>
                <Text style={styles.impactMetricLabel}>Waste Prevented</Text>
              </View>
            </View>
          )}

          {/* Donate Food White Button */}
          <TouchableOpacity
            style={styles.donateFoodBtn}
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/donate')}
          >
            <View style={styles.donateFoodBtnLeft}>
              <Ionicons name="gift-outline" size={18} color="#1B4329" style={{ marginRight: 6 }} />
              <Text style={styles.donateFoodBtnText}>Donate Food</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#1B4329" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/(tabs)/donate')}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={12} color="#2E7D32" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

        {/* 4 Cards Grid Row */}
        <View style={styles.quickActionsRow}>
          {/* Card 1: Donate Food */}
          <TouchableOpacity
            style={styles.quickActionCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/donate')}
          >
            <View style={[styles.qaIconCircle, { backgroundColor: '#E6F4EA' }]}>
              <Ionicons name="calendar-outline" size={18} color="#2E7D32" />
            </View>
            <Text style={styles.qaTitle}>Donate Food</Text>
            <Text style={styles.qaSub}>Share surplus food</Text>
            <View style={[styles.qaArrowCircle, { backgroundColor: '#E6F4EA' }]}>
              <Ionicons name="arrow-forward" size={12} color="#2E7D32" />
            </View>
          </TouchableOpacity>

          {/* Card 2: My Donations */}
          <TouchableOpacity
            style={styles.quickActionCard}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/my-donations')}
          >
            <View style={[styles.qaIconCircle, { backgroundColor: '#EBF5FF' }]}>
              <Ionicons name="cube-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.qaTitle}>My Donations</Text>
            <Text style={styles.qaSub}>Manage your donations</Text>
            <View style={[styles.qaArrowCircle, { backgroundColor: '#EBF5FF' }]}>
              <Ionicons name="arrow-forward" size={12} color="#2563EB" />
            </View>
          </TouchableOpacity>

          {/* Card 3: AI Assistant */}
          <TouchableOpacity
            style={styles.quickActionCard}
            activeOpacity={0.8}
            onPress={() => setIsBotOpen(true)}
          >
            <View style={[styles.qaIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="#7C3AED" />
            </View>
            <Text style={styles.qaTitle}>AI Assistant</Text>
            <Text style={styles.qaSub}>Get help & insights</Text>
            <View style={[styles.qaArrowCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="arrow-forward" size={12} color="#7C3AED" />
            </View>
          </TouchableOpacity>

          {/* Card 4: Impact Report */}
          <TouchableOpacity
            style={styles.quickActionCard}
            activeOpacity={0.8}
            onPress={handleOpenAnalytics}
          >
            <View style={[styles.qaIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="bar-chart-outline" size={18} color="#EA580C" />
            </View>
            <Text style={styles.qaTitle}>Impact Report</Text>
            <Text style={styles.qaSub}>See your analytics</Text>
            <View style={[styles.qaArrowCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="arrow-forward" size={12} color="#EA580C" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Your Active Donations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {profile?.role === 'ngo' ? 'Your Active Rescues' : 'Your Active Donations'}
          </Text>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() =>
              router.push(profile?.role === 'ngo' ? ('/(tabs)/activity' as any) : '/(tabs)/my-donations')
            }
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={12} color="#2E7D32" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

        {/* Active Donations Card */}
        {isDataLoading ? (
          <Animated.View style={[styles.activeDonationCard, { opacity: fadeAnim, padding: 12 }]}>
            <View style={{ width: 58, height: 58, borderRadius: 10, backgroundColor: '#E1E8E2' }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ width: 120, height: 14, borderRadius: 3, backgroundColor: '#E1E8E2' }} />
              <View style={{ width: 60, height: 12, marginTop: 8, borderRadius: 3, backgroundColor: '#E1E8E2' }} />
            </View>
            <View style={{ width: 75, height: 28, borderRadius: 14, backgroundColor: '#E1E8E2' }} />
          </Animated.View>
        ) : activeItem ? (
          <View style={styles.activeDonationCard}>
            {activeItem.images && activeItem.images.length > 0 ? (
              <Image
                source={{ uri: activeItem.images[0] }}
                style={styles.activeDonationImg}
                resizeMode="cover"
              />
            ) : (
              (() => {
                const iconInfo = getCategoryIcon(activeItem.category);
                return (
                  <View style={[styles.activeDonationImgPlaceholder, { backgroundColor: iconInfo.bg }]}>
                    {iconInfo.lib === Ionicons ? (
                      <Ionicons name={iconInfo.name as any} size={24} color={iconInfo.color} />
                    ) : (
                      <MaterialCommunityIcons name={iconInfo.name as any} size={24} color={iconInfo.color} />
                    )}
                  </View>
                );
              })()
            )}
            <View style={styles.activeDonationInfo}>
              <Text style={styles.activeDonationTitle} numberOfLines={1}>
                {activeItem.food_name}
              </Text>
              <View
                style={[
                  styles.pendingBadge,
                  {
                    backgroundColor:
                      activeItem.status === 'completed' || activeItem.status === 'delivered'
                        ? '#DCFCE7'
                        : activeItem.status === 'available'
                        ? '#E6F4EA'
                        : '#DBEAFE',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pendingBadgeText,
                    {
                      color:
                        activeItem.status === 'completed' || activeItem.status === 'delivered'
                          ? '#16A34A'
                          : activeItem.status === 'available'
                          ? '#2E7D32'
                          : '#2563EB',
                    },
                  ]}
                >
                  {activeItem.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <View style={styles.activeDonationMetaRow}>
                <View style={styles.metaCol}>
                  <Ionicons name="location-outline" size={12} color="#6B7280" />
                  <Text style={styles.metaColText} numberOfLines={1}>
                    {activeItem.pickup_city || 'Local'}
                  </Text>
                </View>
                {activeItem.expires_at && (
                  <View style={styles.metaCol}>
                    <Ionicons name="time-outline" size={12} color="#6B7280" />
                    <Text style={styles.metaColText} numberOfLines={1}>
                      {new Date(activeItem.expires_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() => router.push(`/modal?id=${activeItem.id}`)}
            >
              <Text style={styles.viewDetailsBtnText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeDonationCard}>
            <View style={[styles.qaIconCircle, { backgroundColor: '#E6F4EA', marginRight: 12 }]}>
              <Ionicons
                name={profile?.role === 'ngo' ? 'restaurant-outline' : 'gift-outline'}
                size={20}
                color="#2E7D32"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeDonationTitle}>All caught up!</Text>
              <Text style={[styles.metaColText, { marginTop: 4 }]}>
                {profile?.role === 'ngo'
                  ? 'No active claims at the moment.'
                  : 'No active listings at the moment.'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() =>
                router.push(profile?.role === 'ngo' ? ('/(tabs)/activity' as any) : '/(tabs)/donate')
              }
            >
              <Text style={styles.viewDetailsBtnText}>
                {profile?.role === 'ngo' ? 'Rescue Food' : 'Donate Food'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Your Lifetime Impact */}
        <View style={styles.lifetimeImpactCard}>
          <View style={styles.lifetimeImpactTopRow}>
            <Text style={styles.lifetimeImpactTitle}>Your Lifetime Impact</Text>
            <TouchableOpacity style={styles.viewAnalyticsCircleBtn} onPress={handleOpenAnalytics}>
              <Text style={styles.viewAnalyticsText}>View Analytics</Text>
              <View style={styles.analyticsArrowIconWrap}>
                <Ionicons name="arrow-forward" size={12} color="#111827" />
              </View>
            </TouchableOpacity>
          </View>

          {isDataLoading ? (
            <Animated.View style={[styles.lifetimeMetricsRow, { opacity: fadeAnim, marginTop: 8 }]}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#E1E8E2' }} />
                  <View style={{ width: 45, height: 12, marginLeft: 6, borderRadius: 3, backgroundColor: '#E1E8E2' }} />
                </View>
              ))}
            </Animated.View>
          ) : (
            <View style={styles.lifetimeMetricsRow}>
              <View style={styles.lifetimeMetricItem}>
                <View style={styles.lifetimeIconCircle}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={14} color="#2E7D32" />
                </View>
                <Text style={styles.lifetimeMetricValText}>
                  {meals} <Text style={{ fontWeight: '500', color: '#6B7280', fontSize: 10 }}>Meals</Text>
                </Text>
              </View>

              <View style={styles.lifetimeMetricItem}>
                <View style={styles.lifetimeIconCircle}>
                  <Ionicons name="people" size={14} color="#2E7D32" />
                </View>
                <Text style={styles.lifetimeMetricValText}>
                  {meals * 3} <Text style={{ fontWeight: '500', color: '#6B7280', fontSize: 10 }}>People</Text>
                </Text>
              </View>

              <View style={styles.lifetimeMetricItem}>
                <View style={styles.lifetimeIconCircle}>
                  <Ionicons name="leaf" size={14} color="#2E7D32" />
                </View>
                <Text style={styles.lifetimeMetricValText}>
                  {pWeight ? pWeight.toFixed(1) : '0'} <Text style={{ fontWeight: '500', color: '#6B7280', fontSize: 10 }}>kg</Text>
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* RePlate Community Banner */}
        <View style={styles.communityBanner}>
          <View style={styles.communityInfo}>
            <View style={styles.communityTitleRow}>
              <Text style={styles.communityTitle}>RePlate Community</Text>
              <Ionicons name="leaf" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </View>
              {isDataLoading ? (
                <Animated.View style={[styles.communityStatsRow, { opacity: fadeAnim, marginBottom: 0 }]}>
                  <View style={styles.communityStatCol}>
                    <View style={{ width: 60, height: 22, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.25)', marginBottom: 4 }} />
                    <Text style={styles.communityStatLabel}>Meals Shared</Text>
                  </View>
                  <View style={styles.communityStatDivider} />
                  <View style={styles.communityStatCol}>
                    <View style={{ width: 70, height: 22, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.25)', marginBottom: 4 }} />
                    <Text style={styles.communityStatLabel}>Waste Prevented</Text>
                  </View>
                </Animated.View>
              ) : (
                <View style={[styles.communityStatsRow, { marginBottom: 0 }]}>
                  <View style={styles.communityStatCol}>
                    <Text style={styles.communityStatVal}>
                      {formatNumber(platformStats.totalMealsSaved || 0)}
                    </Text>
                    <Text style={styles.communityStatLabel}>Meals Shared</Text>
                  </View>
                  <View style={styles.communityStatDivider} />
                  <View style={styles.communityStatCol}>
                    <Text style={styles.communityStatVal}>
                      {formatWaste(platformStats.totalWasteReduced || 0)}
                    </Text>
                    <Text style={styles.communityStatLabel}>Waste Prevented</Text>
                  </View>
                </View>
              )}
          </View>

          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(tabs)/activity' as any)}>
            <Text style={styles.exploreBtnText}>Explore Platform</Text>
            <Ionicons name="arrow-forward" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <Image
            source={require('../../assets/images/globe_community.png')}
            style={styles.communityGlobeIllustration}
            resizeMode="contain"
          />
        </View>
      </ScrollView>

      {/* AI Assistant Chatbot Modal */}
      <Modal visible={isBotOpen} animationType="slide" onRequestClose={() => setIsBotOpen(false)}>
        <SafeAreaView style={styles.botModalContainer}>
          <View style={styles.botHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.botHeaderIconCircle}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.botTitle}>RePlate Assistant</Text>
                <Text style={styles.botSubtitle}>Powered by Gemini AI</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.botCloseButton} onPress={() => setIsBotOpen(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={chatScrollRef}
            style={styles.botMessageList}
            contentContainerStyle={{ paddingVertical: 16 }}
          >
            {botMessages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.botMessageRow,
                  msg.role === 'user' ? styles.botUserRow : styles.botAssistantRow,
                ]}
              >
                {msg.role === 'assistant' && (
                  <View style={styles.botSproutIcon}>
                    <MaterialCommunityIcons name="sprout" size={16} color="#FAFBF7" />
                  </View>
                )}
                <View
                  style={[
                    styles.botBubble,
                    msg.role === 'user' ? styles.botUserBubble : styles.botAssistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.botMessageText,
                      msg.role === 'user' ? styles.botUserText : styles.botAssistantText,
                    ]}
                  >
                    {msg.content}
                  </Text>
                </View>
              </View>
            ))}

            {botSending && (
              <View style={[styles.botMessageRow, styles.botAssistantRow]}>
                <View style={styles.botSproutIcon}>
                  <MaterialCommunityIcons name="sprout" size={16} color="#FAFBF7" />
                </View>
                <View
                  style={[
                    styles.botBubble,
                    styles.botAssistantBubble,
                    { flexDirection: 'row', alignItems: 'center', gap: 6 },
                  ]}
                >
                  <ActivityIndicator size="small" color="#2E7D32" />
                  <Text style={[styles.botMessageText, { fontStyle: 'italic', color: '#6B7280' }]}>
                    Thinking...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.botInputContainer}>
            <TextInput
              style={styles.botInput}
              value={botInput}
              onChangeText={setBotInput}
              placeholder="Ask me anything..."
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={() => handleSendBotMessage()}
              editable={!botSending}
            />
            <TouchableOpacity
              style={[styles.botSendBtn, !botInput.trim() && styles.botSendBtnDisabled]}
              onPress={() => handleSendBotMessage()}
              disabled={!botInput.trim() || botSending}
            >
              <Ionicons name="send" size={16} color="#FAFBF7" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Detailed Analytics Modal (Moved from old Impact Screen) */}
      <Modal visible={isAnalyticsOpen} animationType="slide" onRequestClose={() => setIsAnalyticsOpen(false)}>
        <SafeAreaView style={styles.analyticsModalContainer}>
          <View style={styles.analyticsHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="bar-chart" size={20} color="#2E7D32" />
              <Text style={styles.analyticsTitleText}>Detailed Analytics</Text>
            </View>
            <TouchableOpacity style={styles.botCloseButton} onPress={() => setIsAnalyticsOpen(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {analyticsLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
              {/* Level progress */}
              <View style={styles.summaryCard}>
                <View style={styles.sproutBadge}>
                  <MaterialCommunityIcons name="sprout" size={24} color="#2E7D32" />
                </View>
                <Text style={styles.summaryTitle}>Eco Hero Level {level}</Text>
                <Text style={styles.summarySub}>You've rescued {meals} meals so far!</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text style={styles.progressText}>{meals}/{nextTarget} meals</Text>
                    <Text style={styles.progressText}>{Math.max(0, nextTarget - meals)} to next level</Text>
                  </View>
                </View>
              </View>

              {/* Personal equivalences */}
              <Text style={styles.analyticsSectionTitle}>🌍 Your Environmental Handprint</Text>
              <View style={styles.equivGrid}>
                <View style={styles.equivCard}>
                  <Ionicons name="car-sport" size={22} color="#2E7D32" />
                  <Text style={styles.equivValue}>{pKm.toFixed(0)} km</Text>
                  <Text style={styles.equivLabel}>Driving Offset</Text>
                </View>
                <View style={styles.equivCard}>
                  <Ionicons name="phone-portrait" size={22} color="#EA580C" />
                  <Text style={styles.equivValue}>{pPhones.toLocaleString()}</Text>
                  <Text style={styles.equivLabel}>Phones Charged</Text>
                </View>
              </View>

              {/* Category pie chart */}
              {categoryData.length > 0 && (
                <>
                  <Text style={styles.analyticsSectionTitle}>🥧 Category Distribution</Text>
                  <View style={styles.chartCard}>
                    <PieChart
                      data={categoryData
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5)
                        .map((cat, i) => {
                          const colors = ['#2E7D32', '#3B82F6', '#D97706', '#8B5CF6', '#EF4444'];
                          const info = CATEGORY_LABELS[cat.category] || { label: cat.category, icon: '🍴' };
                          return {
                            name: info.label,
                            count: cat.count,
                            color: colors[i % colors.length],
                            legendFontColor: '#374151',
                            legendFontSize: 11,
                          };
                        })}
                      width={width - 72}
                      height={180}
                      chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                      accessor="count"
                      backgroundColor="transparent"
                      paddingLeft="10"
                      absolute
                    />
                  </View>
                </>
              )}

              {/* Leaderboards */}
              {leaderboard.donors.length > 0 && (
                <>
                  <Text style={styles.analyticsSectionTitle}>🏆 Top Donors Leaderboard</Text>
                  <View style={styles.leaderCard}>
                    {leaderboard.donors.slice(0, 3).map((entry, idx) => (
                      <View key={entry.id} style={styles.leaderRow}>
                        <View style={[styles.leaderRank, idx === 0 && { backgroundColor: '#FEF3C7' }]}>
                          <Text style={[styles.leaderRankText, idx === 0 && { color: '#D97706' }]}>
                            {idx + 1}
                          </Text>
                        </View>
                        <View style={styles.leaderInfo}>
                          <Text style={styles.leaderName} numberOfLines={1}>
                            {entry.organizationName || 'Anonymous Donor'}
                          </Text>
                          <Text style={styles.leaderCity}>{entry.city || 'Local'}</Text>
                        </View>
                        <View style={styles.leaderStats}>
                          <Text style={styles.leaderMeals}>{entry.mealsSaved} meals</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
    paddingHorizontal: width * 0.05,
  },
  header: {
    width: '100%',
    paddingHorizontal: width * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F0',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B4329',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF2EA',
    position: 'relative',
  },
  greenBadgeDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2E7D32',
  },
  avatarWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EBF2EA',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  welcomeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  welcomeTextGroup: {
    flex: 1.1,
    paddingRight: 8,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B4329',
  },
  subGreetingText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 4,
  },
  keepGoingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAF3E9',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  sproutBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F7F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  badgeTextGroup: {
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1B4329',
  },
  badgeSubLabel: {
    fontSize: 8.5,
    color: '#6B7280',
    marginTop: 1,
  },
  impactCard: {
    width: '100%',
    backgroundColor: '#1B4329',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  impactCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  impactTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  impactMetricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  impactMetricBox: {
    alignItems: 'center',
  },
  impactMetricIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  impactMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  impactMetricLabel: {
    fontSize: 8.5,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  donateFoodBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  donateFoodBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donateFoodBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4329',
  },
  saladBowlHandIllustration: {
    position: 'absolute',
    right: -30,
    bottom: -50,
    width: 220,
    height: 330,
    resizeMode: 'contain',
    opacity: 0.35,
    transform: [{ scaleX: -1 }],
    zIndex: -1,
  },
  sectionHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B4329',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  quickActionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAF3E9',
    position: 'relative',
    height: 124,
    justifyContent: 'space-between',
  },
  qaIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  qaTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  qaSub: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 10,
  },
  qaArrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  activeDonationCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAF3E9',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  activeDonationImg: {
    width: 58,
    height: 58,
    borderRadius: 10,
    marginRight: 12,
  },
  activeDonationImgPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 10,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDonationInfo: {
    flex: 1,
  },
  activeDonationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1B4329',
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    marginTop: 4,
  },
  pendingBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2E7D32',
  },
  activeDonationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaColText: {
    fontSize: 9.5,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewDetailsBtn: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewDetailsBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2E7D32',
  },
  lifetimeImpactCard: {
    width: '100%',
    backgroundColor: '#F3F7F1',
    borderWidth: 1,
    borderColor: '#EAF3E9',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 24,
  },
  lifetimeImpactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  lifetimeImpactTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  lifetimeMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  lifetimeMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lifetimeIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lifetimeMetricValText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  viewAnalyticsCircleBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  viewAnalyticsText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#111827',
  },
  analyticsArrowIconWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityBanner: {
    width: '100%',
    backgroundColor: '#2E583D',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  communityInfo: {
    width: '60%',
  },
  communityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  communityTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  communityStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 12,
  },
  communityStatCol: {
    alignItems: 'flex-start',
  },
  communityStatVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  communityStatLabel: {
    fontSize: 8.5,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  communityStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  exploreBtn: {
    backgroundColor: '#1B4329',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    zIndex: 2,
  },
  exploreBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  communityGlobeIllustration: {
    position: 'absolute',
    right: -25,
    bottom: -75,
    width: 180,
    height: 270,
    resizeMode: 'contain',
  },
  recentActivityStagesCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAF3E9',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stageItem: {
    flex: 1,
    alignItems: 'center',
  },
  stageIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stageTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  stageTime: {
    fontSize: 7.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  stageLine: {
    width: 1,
    height: 32,
    backgroundColor: '#EAF3E9',
  },
  botModalContainer: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  botHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF2EA',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  botHeaderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  botSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
  botCloseButton: {
    padding: 4,
  },
  botMessageList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  botMessageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '85%',
  },
  botUserRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botAssistantRow: {
    alignSelf: 'flex-start',
  },
  botSproutIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  botBubble: {
    borderRadius: 16,
    padding: 12,
  },
  botUserBubble: {
    backgroundColor: '#2E7D32',
    borderTopRightRadius: 2,
  },
  botAssistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBF2EA',
    borderTopLeftRadius: 2,
  },
  botMessageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  botUserText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  botAssistantText: {
    color: '#1F2937',
  },
  botInputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBF2EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  botInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#F3F4F6',
    borderRadius: 19,
    paddingHorizontal: 16,
    color: '#111827',
    fontSize: 13.5,
    marginRight: 8,
  },
  botSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botSendBtnDisabled: {
    backgroundColor: '#A3D9A5',
  },
  analyticsModalContainer: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  analyticsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  analyticsTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4329',
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#1B4329',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  sproutBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAFBF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FAFBF7',
  },
  summarySub: {
    fontSize: 12,
    color: '#A3B899',
    marginTop: 4,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 18,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2E583D',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C1E1B9',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressText: {
    fontSize: 10.5,
    color: '#A3B899',
    fontWeight: '600',
  },
  analyticsSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1B4329',
    marginTop: 12,
    marginBottom: 14,
  },
  equivGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  equivCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    alignItems: 'center',
    gap: 4,
  },
  equivValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  equivLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    marginBottom: 24,
    gap: 10,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  leaderRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderRankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  leaderCity: {
    fontSize: 11,
    color: '#6B7280',
  },
  leaderStats: {
    alignItems: 'flex-end',
  },
  leaderMeals: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2E7D32',
  },
});
