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
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  
  // Dynamic stats states
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // AI Assistant states
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState<any[]>([]);
  const [botInput, setBotInput] = useState('');
  const [botSending, setBotSending] = useState(false);

  const chatScrollRef = useRef<ScrollView>(null);

  // Setup initial message when profile loads
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

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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

      // 4. Fetch recent donations and claims
      const donationsRes = await apiClient.get(`/donations?limit=5&t=${Date.now()}`);
      const claimsRes = await apiClient.get(`/claims?limit=5&t=${Date.now()}`);

      const rawDonations = donationsRes.data?.donations || [];
      const rawClaims = claimsRes.data?.claims || claimsRes.data || [];

      // Map donations
      const donationActivities = rawDonations.map((d: any) => ({
        id: `donation-${d.id}`,
        donationId: d.id,
        type: 'donation',
        title: profile.role === 'ngo' ? 'New Food Posted' : 'Donation Posted',
        sub: d.food_name,
        time: new Date(d.created_at),
        status: d.status,
      }));

      // Map claims
      const claimActivities = rawClaims.map((c: any) => ({
        id: `claim-${c.id}`,
        donationId: c.donation_id,
        type: 'claim',
        title: profile.role === 'donor' ? 'Donation Claimed' : 'Food Claimed',
        sub: c.donation?.food_name || 'Food item',
        time: new Date(c.created_at),
        status: c.status,
      }));

      const combined = [...donationActivities, ...claimActivities]
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 4);

      setActivities(combined);
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
      const interval = setInterval(() => fetchHomeData(true), 30000);
      return () => clearInterval(interval);
    }
  }, [profile, fetchHomeData]);

  // Send message to AI Assistant
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
    } catch (err: any) {
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

  const handleSuggestionPress = (suggestion: string) => {
    handleSendBotMessage(suggestion);
  };

  const handleActivityPress = (donationId: string) => {
    if (donationId) {
      router.push(`/modal?id=${donationId}`);
    }
  };

  const formatLandfillWeight = (weightInKg: number) => {
    if (!weightInKg) return '0 kg';
    if (weightInKg >= 1000) {
      return `${(weightInKg / 1000).toFixed(1)} tons`;
    }
    return `${weightInKg.toFixed(0)} kg`;
  };

  const firstName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : user?.firstName || 'RePlater';

  const isNgo = profile?.role === 'ngo';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBF7" />

      {/* Main Scroll Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchHomeData(true)} colors={['#2E7D32']} />
        }
      >
        
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
                <Text style={styles.monthImpactTitle}>Your Lifetime Impact</Text>
                <Ionicons name="leaf" size={12} color="#2E7D32" style={{ marginLeft: 4 }} />
              </View>
              
              <View style={styles.monthImpactContent}>
                <View>
                  <Text style={styles.monthImpactNum}>{userStats.mealsSaved}</Text>
                  <Text style={styles.monthImpactLabel}>Meals Saved</Text>
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

              <TouchableOpacity 
                style={styles.viewImpactRow} 
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/impact')}
              >
                <Text style={styles.viewImpactText}>View Detailed Impact</Text>
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
            <Text style={styles.statLabel}>Meals Saved</Text>
            <Text style={styles.statVal}>{userStats.mealsSaved}</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="arrow-up" size={10} color="#2E7D32" />
              <Text style={styles.statTrendText}>All-time record</Text>
            </View>
          </View>

          {/* People Helped */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="people" size={16} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>People Helped</Text>
            <Text style={styles.statVal}>{userStats.mealsSaved * 3}</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="arrow-up" size={10} color="#2E7D32" />
              <Text style={styles.statTrendText}>Based on portions</Text>
            </View>
          </View>

          {/* Food Saved */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="leaf" size={16} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>Waste Saved</Text>
            <Text style={styles.statVal}>{userStats.wasteReduced ? `${userStats.wasteReduced.toFixed(1)} kg` : '0 kg'}</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="arrow-up" size={10} color="#2E7D32" />
              <Text style={styles.statTrendText}>Redirected surplus</Text>
            </View>
          </View>

          {/* CO2 Prevented */}
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="earth" size={16} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>CO₂ Prevented</Text>
            <Text style={styles.statVal}>{userStats.co2Reduced ? `${userStats.co2Reduced.toFixed(1)} kg` : '0 kg'}</Text>
            <View style={styles.statTrendRow}>
              <Ionicons name="arrow-up" size={10} color="#2E7D32" />
              <Text style={styles.statTrendText}>Emissions avoided</Text>
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
              <Text style={styles.landfillTitle}>{formatLandfillWeight(platformStats.totalWasteReduced)}</Text>
              <Text style={styles.landfillDesc}>of food waste from going to landfill.</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.landfillBtn} 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/impact')}
          >
            <Text style={styles.landfillBtnText}>See Platform</Text>
            <Ionicons name="arrow-forward" size={12} color="#FAFBF7" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Recent Activity Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity 
            style={styles.viewAllBtn} 
            activeOpacity={0.7}
            onPress={() => router.push(isNgo ? '/(tabs)/explore' : '/(tabs)/my-donations')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={12} color="#2E7D32" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

        {/* Recent Activity Card list */}
        <View style={styles.activityListCard}>
          {activities.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={36} color="#9CA3AF" />
              <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 8, fontWeight: '600' }}>No recent activities found.</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>Donations & claims will appear here.</Text>
            </View>
          ) : (
            activities.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <View style={styles.activityDivider} />}
                <TouchableOpacity 
                  style={styles.activityRow} 
                  activeOpacity={0.7}
                  onPress={() => handleActivityPress(item.donationId)}
                >
                  <View style={[
                    styles.activityIconCircle, 
                    { backgroundColor: item.type === 'claim' ? '#EBF5FF' : '#E6F4EA' }
                  ]}>
                    <Ionicons 
                      name={item.type === 'claim' ? 'people' : 'add'} 
                      size={16} 
                      color={item.type === 'claim' ? '#2563EB' : '#2E7D32'} 
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activitySub} numberOfLines={1}>{item.sub}</Text>
                  </View>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityTime}>{getRelativeTime(item.time)}</Text>
                    <View style={[
                      styles.statusBadge, 
                      item.status === 'available' || item.status === 'pending' ? styles.statusWarning : styles.statusSuccess
                    ]}>
                      <Text style={
                        item.status === 'available' || item.status === 'pending' ? styles.statusTextWarning : styles.statusTextSuccess
                      }>
                        {item.status?.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            ))
          )}
        </View>

        {/* Quick Action Grid Row */}
        <View style={styles.actionGridRow}>
          {isNgo ? (
            <>
              {/* Find Donations */}
              <TouchableOpacity
                style={[styles.actionGridCard, { backgroundColor: '#F3F7F1', borderColor: '#E6EFE5' }]}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <View style={styles.actionGridLeft}>
                  <View style={[styles.actionGridIconCircle, { backgroundColor: '#E4F0E1' }]}>
                    <Ionicons name="search" size={20} color="#2E7D32" />
                  </View>
                  <View style={styles.actionGridTextWrapper}>
                    <Text style={styles.actionGridTitle}>Find Food</Text>
                    <Text style={styles.actionGridSub}>Discover surplus food near you</Text>
                  </View>
                </View>
                <View style={[styles.gridArrowCircle, { backgroundColor: '#2E7D32' }]}>
                  <Ionicons name="arrow-forward" size={14} color="#FAFBF7" />
                </View>
              </TouchableOpacity>

              {/* My Claims */}
              <TouchableOpacity
                style={[styles.actionGridCard, { backgroundColor: '#F0F7FF', borderColor: '#E1EEFF' }]}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/my-donations')}
              >
                <View style={styles.actionGridLeft}>
                  <View style={[styles.actionGridIconCircle, { backgroundColor: '#E1EEFF' }]}>
                    <Ionicons name="list" size={20} color="#2563EB" />
                  </View>
                  <View style={styles.actionGridTextWrapper}>
                    <Text style={[styles.actionGridTitle, { color: '#1E3A8A' }]}>My Claims</Text>
                    <Text style={styles.actionGridSub}>Track food you have claimed</Text>
                  </View>
                </View>
                <View style={[styles.gridArrowCircle, { backgroundColor: '#2563EB' }]}>
                  <Ionicons name="arrow-forward" size={14} color="#FAFBF7" />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Donate Food */}
              <TouchableOpacity
                style={[styles.actionGridCard, { backgroundColor: '#F3F7F1', borderColor: '#E6EFE5' }]}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/donate')}
              >
                <View style={styles.actionGridLeft}>
                  <View style={[styles.actionGridIconCircle, { backgroundColor: '#E4F0E1' }]}>
                    <MaterialCommunityIcons name="food-apple" size={20} color="#2E7D32" />
                  </View>
                  <View style={styles.actionGridTextWrapper}>
                    <Text style={styles.actionGridTitle}>Donate Food</Text>
                    <Text style={styles.actionGridSub}>Share surplus food in a few taps</Text>
                  </View>
                </View>
                <View style={[styles.gridArrowCircle, { backgroundColor: '#2E7D32' }]}>
                  <Ionicons name="arrow-forward" size={14} color="#FAFBF7" />
                </View>
              </TouchableOpacity>

              {/* My Donations */}
              <TouchableOpacity
                style={[styles.actionGridCard, { backgroundColor: '#F0F7FF', borderColor: '#E1EEFF' }]}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/my-donations')}
              >
                <View style={styles.actionGridLeft}>
                  <View style={[styles.actionGridIconCircle, { backgroundColor: '#E1EEFF' }]}>
                    <Ionicons name="list" size={20} color="#2563EB" />
                  </View>
                  <View style={styles.actionGridTextWrapper}>
                    <Text style={[styles.actionGridTitle, { color: '#1E3A8A' }]}>My Donations</Text>
                    <Text style={styles.actionGridSub}>Manage your listed donations</Text>
                  </View>
                </View>
                <View style={[styles.gridArrowCircle, { backgroundColor: '#2563EB' }]}>
                  <Ionicons name="arrow-forward" size={14} color="#FAFBF7" />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* AI Assistant Pill Bar */}
        <TouchableOpacity 
          style={styles.aiAssistantCard} 
          activeOpacity={0.85}
          onPress={() => setIsBotOpen(true)}
        >
          <View style={styles.aiLeft}>
            <View style={styles.aiIconCircle}>
              <Ionicons name="sparkles" size={16} color="#FAFBF7" />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>Need help or statistics?</Text>
              <Text style={styles.aiSub}>Tap to speak with RePlate AI Assistant</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#6B7280" />
        </TouchableOpacity>

      </ScrollView>

      {/* AI Assistant Chatbot Modal */}
      <Modal
        visible={isBotOpen}
        animationType="slide"
        onRequestClose={() => setIsBotOpen(false)}
      >
        <SafeAreaView style={styles.botModalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={{ flex: 1 }}
          >
            {/* Bot Header */}
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
              <TouchableOpacity 
                style={styles.botCloseButton} 
                onPress={() => setIsBotOpen(false)}
              >
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
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
                    msg.role === 'user' ? styles.botUserRow : styles.botAssistantRow
                  ]}
                >
                  {msg.role === 'assistant' && (
                    <View style={styles.botSproutIcon}>
                      <MaterialCommunityIcons name="sprout" size={16} color="#FAFBF7" />
                    </View>
                  )}
                  <View style={[
                    styles.botBubble, 
                    msg.role === 'user' ? styles.botUserBubble : styles.botAssistantBubble
                  ]}>
                    <Text style={[
                      styles.botMessageText,
                      msg.role === 'user' ? styles.botUserText : styles.botAssistantText
                    ]}>
                      {msg.content}
                    </Text>

                    {/* Navigation Path Trigger Button */}
                    {msg.navigationPath && (
                      <TouchableOpacity 
                        style={styles.botNavBtn}
                        onPress={() => {
                          setIsBotOpen(false);
                          router.push(msg.navigationPath);
                        }}
                      >
                        <Text style={styles.botNavBtnText}>Go to page</Text>
                        <Ionicons name="arrow-forward" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}

              {botSending && (
                <View style={[styles.botMessageRow, styles.botAssistantRow]}>
                  <View style={styles.botSproutIcon}>
                    <MaterialCommunityIcons name="sprout" size={16} color="#FAFBF7" />
                  </View>
                  <View style={[styles.botBubble, styles.botAssistantBubble, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                    <ActivityIndicator size="small" color="#2E7D32" />
                    <Text style={[styles.botMessageText, styles.botAssistantText, { fontStyle: 'italic', color: '#6B7280' }]}>Thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Suggestion Chips */}
            <View style={styles.botSuggestionsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSuggestionPress('Tell me my impact stats')}>
                  <Text style={styles.suggestionText}>📊 My Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSuggestionPress('Check platform overall impact')}>
                  <Text style={styles.suggestionText}>🌍 Global Impact</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSuggestionPress('Check my notifications')}>
                  <Text style={styles.suggestionText}>🔔 Notifications</Text>
                </TouchableOpacity>
                {isNgo ? (
                  <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSuggestionPress('Show active claims')}>
                    <Text style={styles.suggestionText}>📦 Active Claims</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.suggestionChip} onPress={() => handleSuggestionPress('Show my active donations')}>
                    <Text style={styles.suggestionText}>🍲 My Donations</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            {/* Bot Input Bar */}
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
          </KeyboardAvoidingView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
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
  botNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B4329',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  botNavBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  botSuggestionsContainer: {
    height: 48,
    marginVertical: 4,
    justifyContent: 'center',
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBF2EA',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 1,
    elevation: 1,
  },
  suggestionText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
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
});
