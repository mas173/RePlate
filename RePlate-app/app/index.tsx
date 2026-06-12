import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  // Animation values for entrance
  const contentOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textTranslateY = useSharedValue(30);
  const heroScale = useSharedValue(0.95);
  const featuresTranslateY = useSharedValue(40);
  const buttonsTranslateY = useSharedValue(30);

  // Floating leaf animations
  const leaf1Y = useSharedValue(0);
  const leaf1Rot = useSharedValue(0);
  const leaf2Y = useSharedValue(0);
  const leaf2Rot = useSharedValue(0);
  const leaf3Y = useSharedValue(0);
  const leaf3Rot = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    contentOpacity.value = withTiming(1, { duration: 1000 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    textTranslateY.value = withTiming(0, { duration: 1000 });
    heroScale.value = withSpring(1, { damping: 14 });
    featuresTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 1000 })
    );
    buttonsTranslateY.value = withDelay(
      500,
      withTiming(0, { duration: 1000 })
    );

    // Floating background leaves animations
    leaf1Y.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 3000 }),
        withTiming(-12, { duration: 3000 })
      ),
      -1,
      true
    );
    leaf1Rot.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 3500 }),
        withTiming(-15, { duration: 3500 })
      ),
      -1,
      true
    );

    leaf2Y.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 4000 }),
        withTiming(15, { duration: 4000 })
      ),
      -1,
      true
    );
    leaf2Rot.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 4500 }),
        withTiming(20, { duration: 4500 })
      ),
      -1,
      true
    );

    leaf3Y.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 2500 }),
        withTiming(-8, { duration: 2500 })
      ),
      -1,
      true
    );
    leaf3Rot.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2800 }),
        withTiming(-10, { duration: 2800 })
      ),
      -1,
      true
    );
  }, []);

  // Handle slide change on scroll
  const handleScroll = (event: any) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  // Animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
  }));

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: featuresTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  // Background leaf animated styles
  const leaf1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: leaf1Y.value }, { rotate: `${leaf1Rot.value}deg` }],
  }));

  const leaf2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: leaf2Y.value }, { rotate: `${leaf2Rot.value}deg` }],
  }));

  const leaf3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: leaf3Y.value }, { rotate: `${leaf3Rot.value}deg` }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBF7" />

      {/* Floating Background Leaves */}
      <Animated.View style={[styles.bgLeaf, styles.leaf1, leaf1Style]}>
        <Ionicons name="leaf" size={24} color="#C1E1B9" />
      </Animated.View>
      <Animated.View style={[styles.bgLeaf, styles.leaf2, leaf2Style]}>
        <Ionicons name="leaf" size={32} color="#C1E1B9" />
      </Animated.View>
      <Animated.View style={[styles.bgLeaf, styles.leaf3, leaf3Style]}>
        <Ionicons name="leaf" size={20} color="#C1E1B9" />
      </Animated.View>

      {/* Static Header Section */}
      <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
        <Image
          source={require('../assets/images/mainLogo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.appNameContainer}>
          <Text style={styles.brandRe}>Re</Text>
          <Text style={styles.brandPlate}>Plate</Text>
        </View>
        <View style={styles.taglineRow}>
          <View style={styles.line} />
          <Text style={styles.taglineText}>REDUCE WASTE. FEED MORE.</Text>
          <View style={styles.line} />
        </View>
      </Animated.View>

      {/* Horizontal Swipeable Carousel (Flex 1) */}
      <View style={styles.carouselWrapper}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.carouselContainer}
        >
          {/* ==================== SCREEN 1 ==================== */}
          <ScrollView
            style={{ width }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.slideScrollContent}
          >
            {/* Slide 1 Pill */}
            <View style={styles.pillContainer}>
              <Text style={styles.pillText}>1 of 3</Text>
            </View>

            {/* Heading Statement */}
            <Animated.View style={[styles.headingSection, textAnimatedStyle]}>
              <Text style={styles.headingMain}>Good food</Text>
              <View style={styles.headingRow}>
                <Text style={styles.headingHighlight}>deserves a second chance.</Text>
                <Ionicons name="leaf" size={14} color="#2E7D32" style={styles.headingLeaf} />
              </View>
              <Text style={styles.subheadingText}>
                Join RePlate in reducing food waste and helping communities in need.
              </Text>
            </Animated.View>

            {/* Hero Image masked as a curve */}
            <Animated.View style={[styles.heroContainer, heroAnimatedStyle]}>
              <Image
                source={require('../assets/images/hero_image.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </Animated.View>

            {/* Features Card List */}
            <Animated.View style={[styles.featuresContainer, featuresAnimatedStyle]}>
              <View style={styles.featuresCard}>
                <View style={styles.featureItem}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="recycle" size={22} color="#1B4329" />
                  </View>
                  <Text style={styles.featureLabel}>Reduce</Text>
                  <Text style={styles.featureLabelSub}>Food Waste</Text>
                </View>

                <View style={styles.featureDivider} />

                <View style={styles.featureItem}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="hand-heart" size={22} color="#1B4329" />
                  </View>
                  <Text style={styles.featureLabel}>Help</Text>
                  <Text style={styles.featureLabelSub}>Communities</Text>
                </View>

                <View style={styles.featureDivider} />

                <View style={styles.featureItem}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="earth" size={22} color="#1B4329" />
                  </View>
                  <Text style={styles.featureLabel}>Protect Our</Text>
                  <Text style={styles.featureLabelSub}>Planet</Text>
                </View>

                <View style={styles.featureDivider} />

                <View style={styles.featureItem}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="food-apple" size={22} color="#1B4329" />
                  </View>
                  <Text style={styles.featureLabel}>Share Good,</Text>
                  <Text style={styles.featureLabelSub}>Spread Hope</Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>

          {/* ==================== SCREEN 2 ==================== */}
          <ScrollView
            style={{ width }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.slideScrollContent}
          >
            {/* Slide 2 Pill */}
            <View style={[styles.pillContainer, { backgroundColor: '#E4F0E1' }]}>
              <Text style={[styles.pillText, { color: '#1B4329' }]}>2 of 3</Text>
            </View>

            {/* Heading Statement */}
            <View style={styles.headingSection}>
              <View style={styles.headingRow}>
                <Text style={styles.headingMain}>What We Do</Text>
                <Ionicons name="leaf" size={14} color="#2E7D32" style={styles.headingLeaf} />
              </View>
              <Text style={styles.subheadingText}>
                RePlate connects food donors with NGOs to ensure good food reaches the people who need it most.
              </Text>
            </View>

            {/* Cycle Diagram Container */}
            <View style={styles.cycleDiagramContainer}>
              {/* Outer Circular Ring (arrow representation) */}
              <View style={styles.cycleRing}>
                {/* Central Circle Logo */}
                <View style={styles.centerLogoCircle}>
                  <Image
                    source={require('../assets/images/mainLogo.png')}
                    style={styles.cycleCenterLogo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Grid Layout for the 4 Cards */}
              <View style={styles.cycleGrid}>
                {/* Row 1 */}
                <View style={styles.cycleRow}>
                  {/* Card 1: Donors */}
                  <View style={styles.cycleCard}>
                    <View style={styles.cycleIconCircle}>
                      <Ionicons name="storefront-outline" size={18} color="#1B4329" />
                    </View>
                    <Text style={styles.cycleCardTitle}>Donors</Text>
                    <Text style={styles.cycleCardText}>Share surplus food easily</Text>
                  </View>

                  {/* Card 2: NGOs */}
                  <View style={styles.cycleCard}>
                    <View style={styles.cycleIconCircle}>
                      <Ionicons name="people-outline" size={18} color="#1B4329" />
                    </View>
                    <Text style={styles.cycleCardTitle}>NGOs</Text>
                    <Text style={styles.cycleCardText}>Find and collect food in need</Text>
                  </View>
                </View>

                {/* Connecting Arrows Overlay */}
                <View style={styles.cycleArrowsContainer}>
                  {/* Top Arrow: Donors -> NGOs */}
                  <Ionicons name="arrow-forward-outline" size={16} color="#2E7D32" style={styles.arrowTop} />
                  {/* Right Arrow: NGOs -> Planet */}
                  <Ionicons name="arrow-down-outline" size={16} color="#2E7D32" style={styles.arrowRight} />
                  {/* Bottom Arrow: Planet -> Communities */}
                  <Ionicons name="arrow-back-outline" size={16} color="#2E7D32" style={styles.arrowBottom} />
                  {/* Left Arrow: Communities -> Donors */}
                  <Ionicons name="arrow-up-outline" size={16} color="#2E7D32" style={styles.arrowLeft} />
                </View>

                {/* Row 2 */}
                <View style={styles.cycleRow}>
                  {/* Card 4: Communities */}
                  <View style={styles.cycleCard}>
                    <View style={styles.cycleIconCircle}>
                      <Ionicons name="heart-outline" size={18} color="#1B4329" />
                    </View>
                    <Text style={styles.cycleCardTitle}>Communities</Text>
                    <Text style={styles.cycleCardText}>Get access to nutritious meals</Text>
                  </View>

                  {/* Card 3: Planet */}
                  <View style={styles.cycleCard}>
                    <View style={styles.cycleIconCircle}>
                      <Ionicons name="earth-outline" size={18} color="#1B4329" />
                    </View>
                    <Text style={styles.cycleCardTitle}>Planet</Text>
                    <Text style={styles.cycleCardText}>Less waste, better future</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* List Heading */}
            <View style={[styles.headingSection, { marginTop: 24, marginBottom: 8 }]}>
              <View style={styles.headingRow}>
                <Text style={[styles.headingMain, { fontSize: 22 }]}>What This App Does</Text>
                <Ionicons name="leaf" size={12} color="#2E7D32" style={styles.headingLeaf} />
              </View>
            </View>

            {/* Actions List Card */}
            <View style={styles.actionsListCard}>
              {/* Item 1 */}
              <View style={styles.actionRowItem}>
                <View style={styles.actionIconCircle}>
                  <MaterialCommunityIcons name="basket-outline" size={18} color="#2E7D32" />
                </View>
                <View style={styles.actionRowContent}>
                  <Text style={styles.actionRowTitle}>Make Food Donation Easy</Text>
                  <Text style={styles.actionRowSub}>Create and share food donations in just a few taps.</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
              <View style={styles.actionDivider} />

              {/* Item 2 */}
              <View style={styles.actionRowItem}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="search-outline" size={18} color="#2E7D32" />
                </View>
                <View style={styles.actionRowContent}>
                  <Text style={styles.actionRowTitle}>Discover Nearby Donations</Text>
                  <Text style={styles.actionRowSub}>NGOs can find available food near them in real-time.</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
              <View style={styles.actionDivider} />

              {/* Item 3 */}
              <View style={styles.actionRowItem}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="map-outline" size={18} color="#2E7D32" />
                </View>
                <View style={styles.actionRowContent}>
                  <Text style={styles.actionRowTitle}>Smart Map & Navigation</Text>
                  <Text style={styles.actionRowSub}>Get directions, track pickups, and save time.</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
              <View style={styles.actionDivider} />

              {/* Item 4 */}
              <View style={styles.actionRowItem}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="mic-outline" size={18} color="#2E7D32" />
                </View>
                <View style={styles.actionRowContent}>
                  <Text style={styles.actionRowTitle}>AI Voice Assistant</Text>
                  <Text style={styles.actionRowSub}>Use voice to create donations and get help in your language.</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
              <View style={styles.actionDivider} />

              {/* Item 5 */}
              <View style={styles.actionRowItem}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="notifications-outline" size={18} color="#2E7D32" />
                </View>
                <View style={styles.actionRowContent}>
                  <Text style={styles.actionRowTitle}>Real-time Updates</Text>
                  <Text style={styles.actionRowSub}>Stay informed with notifications and status updates.</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </View>
          </ScrollView>

          {/* ==================== SCREEN 3 ==================== */}
          <ScrollView
            style={{ width }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.slideScrollContent}
          >
            {/* Slide 3 Pill */}
            <View style={[styles.pillContainer, { backgroundColor: '#E4F0E1' }]}>
              <Text style={[styles.pillText, { color: '#1B4329' }]}>3 of 3</Text>
            </View>

            {/* Heading Statement */}
            <View style={styles.headingSection}>
              <View style={styles.headingRow}>
                <Text style={styles.headingMain}>Our Impact So Far</Text>
                <Ionicons name="leaf" size={14} color="#2E7D32" style={styles.headingLeaf} />
              </View>
              <Text style={styles.subheadingText}>
                Together, we are creating a better, hunger-free and waste-free world.
              </Text>
            </View>

            {/* Stats Card Container */}
            <View style={styles.statsMainCard}>
              {/* Row 1 */}
              <View style={styles.statsMainRow}>
                <View style={styles.statCell}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#2E7D32" />
                  <Text style={styles.statMainNumber}>24M+</Text>
                  <Text style={styles.statMainTitle}>Meals Delivered</Text>
                  <Text style={styles.statMainDesc}>Nutritious meals served to people in need.</Text>
                </View>
                <View style={styles.statCellDivider} />
                <View style={styles.statCell}>
                  <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
                  <Text style={styles.statMainNumber}>18K+ Tons</Text>
                  <Text style={styles.statMainTitle}>Food Saved</Text>
                  <Text style={styles.statMainDesc}>Good food saved from being wasted every year.</Text>
                </View>
              </View>

              <View style={styles.statsRowDivider} />

              {/* Row 2 */}
              <View style={styles.statsMainRow}>
                <View style={styles.statCell}>
                  <Ionicons name="people-outline" size={20} color="#2E7D32" />
                  <Text style={styles.statMainNumber}>1,200+</Text>
                  <Text style={styles.statMainTitle}>NGO Partners</Text>
                  <Text style={styles.statMainDesc}>Trusted partners working across communities.</Text>
                </View>
                <View style={styles.statCellDivider} />
                <View style={styles.statCell}>
                  <Ionicons name="earth-outline" size={20} color="#2E7D32" />
                  <Text style={styles.statMainNumber}>12+</Text>
                  <Text style={styles.statMainTitle}>Countries</Text>
                  <Text style={styles.statMainDesc}>Spreading impact across borders together.</Text>
                </View>
              </View>

              <View style={styles.statsRowDivider} />

              {/* Row 3 */}
              <View style={styles.statsMainRow}>
                <View style={styles.statCell}>
                  <MaterialCommunityIcons name="recycle" size={20} color="#2E7D32" />
                  <Text style={styles.statMainNumber}>500+ Tons</Text>
                  <Text style={styles.statMainTitle}>CO₂ Prevented</Text>
                  <Text style={styles.statMainDesc}>Reducing emissions for a greener tomorrow.</Text>
                </View>
                <View style={styles.statCellDivider} />
                <View style={styles.statCell}>
                  <MaterialCommunityIcons name="hand-heart" size={20} color="#2E7D32" />
                  <Text style={styles.statMainNumber}>Millions</Text>
                  <Text style={styles.statMainTitle}>Lives Touched</Text>
                  <Text style={styles.statMainDesc}>Small actions creating a big change.</Text>
                </View>
              </View>
            </View>

            {/* Stories Section Title */}
            <View style={styles.storiesTitleRow}>
              <View style={styles.headingRow}>
                <Ionicons name="leaf" size={14} color="#2E7D32" style={{ marginRight: 6 }} />
                <Text style={styles.storiesTitle}>Stories That Inspire</Text>
              </View>
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={14} color="#2E7D32" />
              </TouchableOpacity>
            </View>

            {/* Horizontal Stories List */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.storiesScrollView}
              contentContainerStyle={styles.storiesContentStyle}
            >
              {/* Story 1 */}
              <View style={styles.storyCard}>
                <Image
                  source={require('../assets/images/hero_image.png')}
                  style={styles.storyCardImage}
                  resizeMode="cover"
                />
                <View style={styles.storyCardContent}>
                  <View style={styles.storyBadge}>
                    <Text style={styles.storyBadgeText}>Impact</Text>
                  </View>
                  <Text style={styles.storyCardTitle}>How a Simple Meal Changed a Family's Day</Text>
                  <Text style={styles.storyCardSub}>Real stories from real communities.</Text>
                  <View style={styles.storyCardFooter}>
                    <Ionicons name="calendar-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                    <Text style={styles.storyCardDate}>May 10, 2024</Text>
                  </View>
                </View>
              </View>

              {/* Story 2 */}
              <View style={styles.storyCard}>
                <Image
                  source={require('../assets/images/icon.png')}
                  style={styles.storyCardImage}
                  resizeMode="cover"
                />
                <View style={styles.storyCardContent}>
                  <View style={[styles.storyBadge, { backgroundColor: '#F0F9FF' }]}>
                    <Text style={[styles.storyBadgeText, { color: '#0284C7' }]}>Sustainability</Text>
                  </View>
                  <Text style={styles.storyCardTitle}>Why Reducing Food Waste Matters</Text>
                  <Text style={styles.storyCardSub}>Every action counts for a better planet.</Text>
                  <View style={styles.storyCardFooter}>
                    <Ionicons name="calendar-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                    <Text style={styles.storyCardDate}>Apr 22, 2024</Text>
                  </View>
                </View>
              </View>

              {/* Story 3 */}
              <View style={styles.storyCard}>
                <Image
                  source={require('../assets/images/replateFull.png')}
                  style={styles.storyCardImage}
                  resizeMode="cover"
                />
                <View style={styles.storyCardContent}>
                  <View style={[styles.storyBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.storyBadgeText, { color: '#059669' }]}>Community</Text>
                  </View>
                  <Text style={styles.storyCardTitle}>NGOs Making a Big Difference</Text>
                  <Text style={styles.storyCardSub}>Meet the heroes behind every meal.</Text>
                  <View style={styles.storyCardFooter}>
                    <Ionicons name="calendar-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                    <Text style={styles.storyCardDate}>Mar 15, 2024</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Be a Part of the Change CTA Card */}
            <View style={styles.ctaCard}>
              <View style={styles.ctaIconCircle}>
                <MaterialCommunityIcons name="food-apple" size={20} color="#2E7D32" />
              </View>
              <View style={styles.ctaTextContainer}>
                <Text style={styles.ctaTitle}>Be a Part of the Change</Text>
                <Text style={styles.ctaSub}>Your small step can create a big impact.</Text>
              </View>
              <Ionicons name="heart" size={20} color="#C1E1B9" style={styles.ctaHeart} />
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Static dots indicator linked to activeIndex */}
      <View style={styles.dotsStaticContainer}>
        <View style={[styles.dot, activeIndex === 0 && styles.dotActive]} />
        <View style={[styles.dot, activeIndex === 1 && styles.dotActive]} />
        <View style={[styles.dot, activeIndex === 2 && styles.dotActive]} />
      </View>

      {/* Static Buttons Action Group */}
      <Animated.View style={[styles.actionContainer, buttonsAnimatedStyle]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/sign-up')}
        >
          <Text style={styles.btnPrimaryText}>Get Started</Text>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={16} color="#FAFBF7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text style={styles.btnSecondaryText}>I already have an account</Text>
        </TouchableOpacity>

        {/* Muted Footer Message */}
        <View style={styles.footerRow}>
          <Ionicons name="heart" size={14} color="#2E7D32" style={styles.heartIcon} />
          <Text style={styles.footerText}>Small actions, big impact.</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  logoImage: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandRe: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1B4329',
  },
  brandPlate: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  line: {
    height: 1,
    backgroundColor: '#B5C9B4',
    flex: 1,
  },
  taglineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 1.2,
    marginHorizontal: 8,
  },
  bgLeaf: {
    position: 'absolute',
    opacity: 0.15,
    zIndex: 1,
  },
  leaf1: {
    top: height * 0.10,
    left: width * 0.05,
    transform: [{ rotate: '-20deg' }],
  },
  leaf2: {
    top: height * 0.22,
    right: width * 0.04,
    transform: [{ rotate: '45deg' }],
  },
  leaf3: {
    bottom: height * 0.28,
    left: width * 0.04,
    transform: [{ rotate: '-45deg' }],
  },
  carouselWrapper: {
    flex: 1,
    width: '100%',
  },
  carouselContainer: {
    flexGrow: 1,
  },
  slideScrollContent: {
    paddingBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pillContainer: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginVertical: 10,
    alignSelf: 'center',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  headingSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headingMain: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B4329',
    textAlign: 'center',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headingHighlight: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
  },
  headingLeaf: {
    marginLeft: 4,
    transform: [{ rotate: '45deg' }],
  },
  subheadingText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  heroContainer: {
    width: width * 0.88,
    height: height * 0.28,
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#EAF3E9',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  featuresContainer: {
    width: width * 0.9,
    alignItems: 'center',
  },
  featuresCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F7F1',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E6EFE5',
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E4F0E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
  },
  featureLabelSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 1,
  },
  featureDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#D1E0CE',
  },

  // Screen 2 Cycle Diagram Styling
  cycleDiagramContainer: {
    width: width * 0.9,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  cycleRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: '#C1E1B9',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
  },
  centerLogoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FAFBF7',
    borderWidth: 4,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1B4329',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  cycleCenterLogo: {
    width: 60,
    height: 60,
  },
  cycleGrid: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    position: 'absolute',
    zIndex: 2,
  },
  cycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cycleCard: {
    width: width * 0.4,
    backgroundColor: '#F3F7F1',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EFE5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cycleIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E4F0E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  cycleCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4329',
  },
  cycleCardText: {
    fontSize: 9,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 2,
  },
  cycleArrowsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  arrowTop: {
    position: 'absolute',
    top: 50,
  },
  arrowRight: {
    position: 'absolute',
    right: 70,
  },
  arrowBottom: {
    position: 'absolute',
    bottom: 50,
  },
  arrowLeft: {
    position: 'absolute',
    left: 70,
  },

  // Actions List Card
  actionsListCard: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  actionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  actionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionRowContent: {
    flex: 1,
  },
  actionRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  actionRowSub: {
    fontSize: 10.5,
    color: '#4B5563',
    marginTop: 2,
    lineHeight: 14,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },

  // Screen 3 Stats grid
  statsMainCard: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  statsMainRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  statCellDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
  },
  statsRowDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  statMainNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E7D32',
    marginTop: 6,
  },
  statMainTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  statMainDesc: {
    fontSize: 9.5,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12.5,
  },

  // Stories Section
  storiesTitleRow: {
    width: width * 0.9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  storiesTitle: {
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
    marginRight: 2,
  },
  storiesScrollView: {
    width: width,
    marginBottom: 20,
  },
  storiesContentStyle: {
    paddingLeft: width * 0.05,
    paddingRight: 16,
    gap: 12,
  },
  storyCard: {
    width: width * 0.64,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  storyCardImage: {
    width: '100%',
    height: 110,
    backgroundColor: '#E5E7EB',
  },
  storyCardContent: {
    padding: 12,
  },
  storyBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  storyBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D97706',
  },
  storyCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 16,
  },
  storyCardSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  storyCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  storyCardDate: {
    fontSize: 9.5,
    color: '#6B7280',
    fontWeight: '600',
  },

  // CTA Card
  ctaCard: {
    width: width * 0.9,
    backgroundColor: '#F3F7F1',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EFE5',
    marginBottom: 10,
  },
  ctaIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E4F0E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1B4329',
  },
  ctaSub: {
    fontSize: 10.5,
    color: '#4B5563',
    marginTop: 2,
  },
  ctaHeart: {
    marginLeft: 8,
  },

  // Dots Static Indicator
  dotsStaticContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#1B4329',
  },

  // Footer Actions
  actionContainer: {
    width: width * 0.9,
    alignItems: 'center',
    gap: 10,
    alignSelf: 'center',
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: '#1B4329',
    width: '100%',
    borderRadius: 30,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#1B4329',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPrimaryText: {
    color: '#FAFBF7',
    fontSize: 16,
    fontWeight: '700',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    width: '100%',
    borderRadius: 30,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  heartIcon: {
    marginRight: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
});
