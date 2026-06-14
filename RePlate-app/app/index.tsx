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
          <View style={[styles.slideScrollContent, { width }]}>
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
          </View>

          {/* ==================== SCREEN 2 ==================== */}
          <View style={[styles.slideScrollContent, { width }]}>
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

            {/* Compact Steps Container */}
            <View style={styles.compactStepsContainer}>
              <View style={styles.compactStepRow}>
                <View style={styles.compactStepIconCircle}>
                  <Ionicons name="storefront" size={14} color="#1B4329" />
                </View>
                <Text style={styles.compactStepText}>
                  <Text style={styles.compactStepHighlight}>Donors</Text> share surplus food easily.
                </Text>
              </View>
              <View style={styles.compactStepRow}>
                <View style={styles.compactStepIconCircle}>
                  <Ionicons name="people" size={14} color="#1B4329" />
                </View>
                <Text style={styles.compactStepText}>
                  <Text style={styles.compactStepHighlight}>NGOs</Text> claim and rescue food in real-time.
                </Text>
              </View>
              <View style={styles.compactStepRow}>
                <View style={styles.compactStepIconCircle}>
                  <Ionicons name="heart" size={14} color="#1B4329" />
                </View>
                <Text style={styles.compactStepText}>
                  <Text style={styles.compactStepHighlight}>Communities</Text> receive fresh, nutritious meals.
                </Text>
              </View>
            </View>

            {/* Matchmaking Highlight */}
            <View style={styles.infoBadgeContainer}>
              <Ionicons name="flash-sharp" size={14} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.infoBadgeText}>
                Real-time matchmaking & smart routing alerts shelters instantly.
              </Text>
            </View>
          </View>

          {/* ==================== SCREEN 3 ==================== */}
          <View style={[styles.slideScrollContent, { width }]}>
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

            {/* Spotlight Stat Card with animation */}
            <Animated.View style={[styles.spotlightStatCard, featuresAnimatedStyle]}>
              <View style={styles.spotlightRow}>
                <View style={styles.spotlightCell}>
                  <Text style={styles.spotlightNumber}>24M+</Text>
                  <Text style={styles.spotlightLabel}>Meals Served</Text>
                </View>
                <View style={styles.spotlightDivider} />
                <View style={styles.spotlightCell}>
                  <Text style={styles.spotlightNumber}>18K+</Text>
                  <Text style={styles.spotlightLabel}>Tons Saved</Text>
                </View>
              </View>
              <View style={styles.spotlightStatsDividerLine} />
              <View style={styles.spotlightRow}>
                <View style={styles.spotlightCell}>
                  <Text style={styles.spotlightNumber}>1,200+</Text>
                  <Text style={styles.spotlightLabel}>NGO Partners</Text>
                </View>
                <View style={styles.spotlightDivider} />
                <View style={styles.spotlightCell}>
                  <Text style={styles.spotlightNumber}>500+ T</Text>
                  <Text style={styles.spotlightLabel}>CO₂ Prevented</Text>
                </View>
              </View>
            </Animated.View>

            {/* Quote Block (Testimonial) */}
            <View style={styles.quoteBlock}>
              <MaterialCommunityIcons name="format-quote-open" size={16} color="#2E7D32" style={styles.quoteIcon} />
              <Text style={styles.quoteText}>
                "RePlate helps us source fresh food easily, reducing our food acquisition costs by 40%."
              </Text>
              <Text style={styles.quoteAuthor}>— Hope Kitchen Foundation</Text>
            </View>
          </View>
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
    height: height * 0.22,
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
  // Compact Steps (Slide 2)
  compactStepsContainer: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    gap: 12,
    marginTop: 8,
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  compactStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactStepIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E4F0E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactStepText: {
    fontSize: 12.5,
    color: '#4B5563',
    flex: 1,
  },
  compactStepHighlight: {
    fontWeight: '700',
    color: '#1B4329',
  },
  // Spotlight Stat (Slide 3)
  spotlightStatCard: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  spotlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 8,
  },
  spotlightCell: {
    alignItems: 'center',
    flex: 1,
  },
  spotlightDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  spotlightNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
  },
  spotlightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4329',
    marginTop: 2,
  },
  spotlightFooterText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  spotlightStatsDividerLine: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
    marginVertical: 10,
  },
  infoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    width: width * 0.9,
    alignSelf: 'center',
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
    flex: 1,
    lineHeight: 14,
  },
  quoteBlock: {
    backgroundColor: '#F3F7F1',
    borderLeftWidth: 3,
    borderLeftColor: '#2E7D32',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    width: width * 0.9,
    alignSelf: 'center',
  },
  quoteIcon: {
    marginBottom: 4,
  },
  quoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#374151',
    lineHeight: 15,
  },
  quoteAuthor: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B4329',
    textAlign: 'right',
    marginTop: 4,
  },
});
