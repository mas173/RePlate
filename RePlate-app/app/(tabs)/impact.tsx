import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { apiClient } from '../../services/api';
import { useAppAuth } from '../../hooks/useAppAuth';

const { width } = Dimensions.get('window');

interface UserStats {
  donations: number;
  activeDonations: number;
  mealsSaved: number;
  wasteReduced: number;
  co2Reduced: number;
  claimsReceived: number;
}

interface OverviewStats {
  totalDonations: number;
  totalMealsSaved: number;
  totalWasteReduced: number;
  totalCO2Reduced: number;
  activeDonors: number;
  activeNGOs: number;
}

interface CategoryItem {
  category: string;
  count: number;
  servings: number;
  weight: number;
}

interface LeaderEntry {
  id: string;
  organizationName?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  mealsSaved: number;
  weightSaved: number;
}

interface TrendItem {
  date: string;
  donationsCount: number;
  mealsSaved: number;
  weightSaved: number;
}

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

export default function ImpactScreen() {
  const { profile } = useAppAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ donors: LeaderEntry[]; ngos: LeaderEntry[] }>({ donors: [], ngos: [] });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [userRes, overviewRes, catRes, trendRes, leaderRes] = await Promise.allSettled([
        apiClient.get('/analytics/user'),
        apiClient.get('/analytics/overview'),
        apiClient.get('/analytics/categories'),
        apiClient.get('/analytics/trends'),
        apiClient.get('/analytics/leaderboard'),
      ]);

      if (userRes.status === 'fulfilled') setUserStats(userRes.value.data);
      if (overviewRes.status === 'fulfilled') setOverviewStats(overviewRes.value.data);
      if (catRes.status === 'fulfilled') setCategoryData(catRes.value.data.categories || []);
      if (trendRes.status === 'fulfilled') setTrendData(trendRes.value.data.trends || []);
      if (leaderRes.status === 'fulfilled') setLeaderboard(leaderRes.value.data);
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (profile) fetchData();
  }, [profile, fetchData]);

  // Personal environmental equivalences
  const pCo2 = userStats?.co2Reduced || 0;
  const pWeight = userStats?.wasteReduced || 0;
  const pKm = pCo2 * 4.1;
  const pPhones = Math.round(pCo2 * 120);
  const pShower = Math.round((pWeight * 1000 / 60) * 5);
  const pLand = (pWeight * 1.5).toFixed(1);

  // Badge logic
  const meals = userStats?.mealsSaved || 0;
  const badges = [
    { name: 'First Post', sub: 'Shared your first meal', icon: 'ribbon' as const, unlocked: meals >= 1 },
    { name: 'Helping Hand', sub: 'Shared 10+ meals', icon: 'hand-left' as const, unlocked: meals >= 10 },
    { name: 'Century', sub: 'Shared 100+ meals', icon: 'trophy' as const, unlocked: meals >= 100 },
    { name: 'Zero Waste', sub: 'No expired donations', icon: 'leaf' as const, unlocked: (userStats?.donations || 0) > 0 },
    { name: 'Green King', sub: 'Share 500+ meals', icon: 'shield-checkmark' as const, unlocked: meals >= 500 },
  ];

  // Level
  const level = meals >= 500 ? 5 : meals >= 100 ? 4 : meals >= 50 ? 3 : meals >= 10 ? 2 : 1;
  const nextTarget = [10, 50, 100, 500, 1000][level - 1];
  const progressPct = Math.min((meals / nextTarget) * 100, 100);

  const totalCatCount = categoryData.reduce((a, c) => a + c.count, 0) || 1;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>My Impact</Text>
            <Ionicons name="leaf" size={16} color="#2E7D32" style={styles.headerLeaf} />
          </View>
          <Text style={styles.headerSubtitle}>Loading your analytics...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Fetching real-time impact data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>My Impact</Text>
          <Ionicons name="leaf" size={16} color="#2E7D32" style={styles.headerLeaf} />
        </View>
        <Text style={styles.headerSubtitle}>
          Real-time metrics showing how your donations make a difference
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={['#2E7D32']} tintColor="#2E7D32" />
        }
      >
        {/* ===== LEVEL CARD ===== */}
        <View style={styles.summaryCard}>
          <View style={styles.sproutBadge}>
            <MaterialCommunityIcons name="sprout" size={24} color="#2E7D32" />
          </View>
          <Text style={styles.summaryTitle}>Eco Hero Level {level}</Text>
          <Text style={styles.summarySub}>You've rescued {meals} meals so far!</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPct}%` as DimensionValue }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>{meals}/{nextTarget} meals</Text>
              <Text style={styles.progressText}>{Math.max(0, nextTarget - meals)} to next level</Text>
            </View>
          </View>
        </View>

        {/* ===== YOUR PERSONAL STATS ===== */}
        <Text style={styles.sectionTitle}>📊 Your Personal Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#D97706" />
            </View>
            <Text style={styles.statNum}>{userStats?.mealsSaved || 0}</Text>
            <Text style={styles.statLabel}>Meals Rescued</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="cube" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statNum}>{(userStats?.wasteReduced || 0).toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>Food Rescued</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="leaf" size={20} color="#10B981" />
            </View>
            <Text style={styles.statNum}>{pCo2.toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>CO₂ Offset</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="list" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statNum}>{userStats?.donations || 0}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>
        </View>

        {/* ===== YOUR ENVIRONMENTAL HANDPRINT ===== */}
        <Text style={styles.sectionTitle}>🌍 Your Environmental Handprint</Text>
        <View style={styles.equivGrid}>
          <View style={styles.equivCard}>
            <Ionicons name="car-sport" size={22} color="#2E7D32" />
            <Text style={styles.equivValue}>{pKm.toFixed(0)} km</Text>
            <Text style={styles.equivLabel}>Driving Offset</Text>
          </View>
          <View style={styles.equivCard}>
            <Ionicons name="phone-portrait" size={22} color="#D97706" />
            <Text style={styles.equivValue}>{pPhones.toLocaleString()}</Text>
            <Text style={styles.equivLabel}>Phones Charged</Text>
          </View>
          <View style={styles.equivCard}>
            <Ionicons name="water" size={22} color="#3B82F6" />
            <Text style={styles.equivValue}>{pShower} min</Text>
            <Text style={styles.equivLabel}>Shower Saved</Text>
          </View>
          <View style={styles.equivCard}>
            <Ionicons name="map" size={22} color="#8B5CF6" />
            <Text style={styles.equivValue}>{pLand} m²</Text>
            <Text style={styles.equivLabel}>Land Protected</Text>
          </View>
        </View>

        {/* ===== COLLECTIVE / PLATFORM STATS ===== */}
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>🌐 Platform Collective Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#D97706" />
            </View>
            <Text style={styles.statNum}>{overviewStats?.totalMealsSaved || 0}</Text>
            <Text style={styles.statLabel}>Meals Rescued</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="cube" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statNum}>{(overviewStats?.totalWasteReduced || 0).toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>Food Rescued</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="leaf" size={20} color="#10B981" />
            </View>
            <Text style={styles.statNum}>{(overviewStats?.totalCO2Reduced || 0).toFixed(1)} kg</Text>
            <Text style={styles.statLabel}>CO₂ Offset</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="people" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statNum}>
              {(overviewStats?.activeDonors || 0) + (overviewStats?.activeNGOs || 0)}
            </Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
        </View>

        {/* ===== DONATION TRENDS LINE CHART ===== */}
        {trendData.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>📈 Donation Trends (Last 30 Days)</Text>
            <View style={styles.chartCard}>
              <LineChart
                data={{
                  labels: trendData.slice(-7).map((t) => {
                    const d = new Date(t.date);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }),
                  datasets: [
                    {
                      data: trendData.slice(-7).map((t) => t.mealsSaved || 0),
                      color: () => '#2E7D32',
                      strokeWidth: 2,
                    },
                    {
                      data: trendData.slice(-7).map((t) => t.donationsCount || 0),
                      color: () => '#3B82F6',
                      strokeWidth: 2,
                    },
                  ],
                  legend: ['Meals Saved', 'Donations'],
                }}
                width={width - 72}
                height={200}
                yAxisSuffix=""
                yAxisLabel=""
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                  labelColor: () => '#6B7280',
                  propsForDots: { r: '4', strokeWidth: '1.5', stroke: '#2E7D32' },
                  propsForBackgroundLines: { strokeDasharray: '4', stroke: '#F3F4F6' },
                }}
                bezier
                style={{ borderRadius: 12 }}
              />
            </View>
          </>
        )}

        {/* ===== CATEGORY PIE CHART ===== */}
        {categoryData.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🥧 Category Distribution</Text>
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
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="10"
                absolute
              />
            </View>
          </>
        )}

        {/* ===== CATEGORY BREAKDOWN (BARS) ===== */}
        {categoryData.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📦 Category Breakdown</Text>
            <View style={styles.categoryCard}>
              {categoryData
                .sort((a, b) => b.count - a.count)
                .slice(0, 6)
                .map((cat) => {
                  const info = CATEGORY_LABELS[cat.category] || { label: cat.category, icon: '🍴' };
                  const pctNum = Math.round((cat.count / totalCatCount) * 100);
                  return (
                    <View key={cat.category} style={styles.categoryRow}>
                      <Text style={styles.categoryEmoji}>{info.icon}</Text>
                      <View style={styles.categoryInfo}>
                        <View style={styles.categoryLabelRow}>
                          <Text style={styles.categoryName}>{info.label}</Text>
                          <Text style={styles.categoryPct}>{pctNum}%</Text>
                        </View>
                        <View style={styles.categoryBarBg}>
                          <View style={[styles.categoryBarFill, { width: `${pctNum}%` as DimensionValue }]} />
                        </View>
                      </View>
                    </View>
                  );
                })}
            </View>
          </>
        )}

        {/* ===== LEADERBOARD: TOP DONORS ===== */}
        {leaderboard.donors.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🏆 Top Donors</Text>
            <View style={styles.leaderCard}>
              {leaderboard.donors.map((entry, idx) => (
                <View key={entry.id} style={styles.leaderRow}>
                  <View style={[styles.leaderRank, idx === 0 && { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.leaderRankText, idx === 0 && { color: '#D97706' }]}>
                      {idx + 1}
                    </Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={styles.leaderName} numberOfLines={1}>
                      {entry.organizationName || `${entry.firstName || ''} ${entry.lastName || ''}`.trim() || 'Anonymous'}
                    </Text>
                    {entry.city ? <Text style={styles.leaderCity}>{entry.city}</Text> : null}
                  </View>
                  <View style={styles.leaderStats}>
                    <Text style={styles.leaderMeals}>{entry.mealsSaved} meals</Text>
                    <Text style={styles.leaderWeight}>{entry.weightSaved.toFixed(1)} kg</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ===== LEADERBOARD: TOP NGOs ===== */}
        {leaderboard.ngos.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🤝 Top NGOs</Text>
            <View style={styles.leaderCard}>
              {leaderboard.ngos.map((entry, idx) => (
                <View key={entry.id} style={styles.leaderRow}>
                  <View style={[styles.leaderRank, idx === 0 && { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.leaderRankText, idx === 0 && { color: '#059669' }]}>
                      {idx + 1}
                    </Text>
                  </View>
                  <View style={styles.leaderInfo}>
                    <Text style={styles.leaderName} numberOfLines={1}>
                      {entry.organizationName || `${entry.firstName || ''} ${entry.lastName || ''}`.trim() || 'Anonymous'}
                    </Text>
                    {entry.city ? <Text style={styles.leaderCity}>{entry.city}</Text> : null}
                  </View>
                  <View style={styles.leaderStats}>
                    <Text style={styles.leaderMeals}>{entry.mealsSaved} meals</Text>
                    <Text style={styles.leaderWeight}>{entry.weightSaved.toFixed(1)} kg</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ===== EARNED BADGES ===== */}
        <Text style={styles.sectionTitle}>🎖️ Earned Badges</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgesRow}
          contentContainerStyle={styles.badgesContent}
        >
          {badges.map((b) => (
            <View key={b.name} style={styles.badgeItem}>
              <View
                style={[
                  styles.badgeCircle,
                  b.unlocked
                    ? { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }
                    : { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
                ]}
              >
                <Ionicons
                  name={b.unlocked ? b.icon : 'lock-closed'}
                  size={b.unlocked ? 28 : 22}
                  color={b.unlocked ? '#2E7D32' : '#9CA3AF'}
                />
              </View>
              <Text style={[styles.badgeName, !b.unlocked && { color: '#9CA3AF' }]}>{b.name}</Text>
              <Text style={styles.badgeSub}>{b.sub}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBF7' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EAF3E9' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1B4329' },
  headerLeaf: { marginLeft: 6, transform: [{ rotate: '45deg' }] },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, color: '#6B7280', marginTop: 12, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // Level card
  summaryCard: { backgroundColor: '#1B4329', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24 },
  sproutBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FAFBF7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  summaryTitle: { fontSize: 18, fontWeight: '800', color: '#FAFBF7' },
  summarySub: { fontSize: 12, color: '#A3B899', marginTop: 4, textAlign: 'center' },
  progressContainer: { width: '100%', marginTop: 18 },
  progressBar: { height: 8, backgroundColor: '#2E583D', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#C1E1B9' },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressText: { fontSize: 10.5, color: '#A3B899', fontWeight: '600' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1B4329', marginBottom: 14 },
  divider: { height: 1, backgroundColor: '#EAF3E9', marginVertical: 8 },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statBox: {
    width: (width - 52) / 2, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#EAF3E9', elevation: 1,
  },
  iconCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statNum: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginTop: 2 },

  // Equivalences
  equivGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  equivCard: {
    width: (width - 50) / 2, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#EAF3E9', alignItems: 'center', gap: 4,
  },
  equivValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  equivLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280' },

  // Category
  categoryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#EAF3E9', marginBottom: 24, gap: 10 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryEmoji: { fontSize: 20 },
  categoryInfo: { flex: 1 },
  categoryLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  categoryName: { fontSize: 12, fontWeight: '700', color: '#374151' },
  categoryPct: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  categoryBarBg: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  categoryBarFill: { height: '100%', backgroundColor: '#2E7D32', borderRadius: 3 },

  // Leaderboard
  leaderCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#EAF3E9', marginBottom: 24, gap: 10 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  leaderRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  leaderRankText: { fontSize: 12, fontWeight: '800', color: '#6B7280' },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  leaderCity: { fontSize: 11, color: '#6B7280' },
  leaderStats: { alignItems: 'flex-end' },
  leaderMeals: { fontSize: 12, fontWeight: '800', color: '#2E7D32' },
  leaderWeight: { fontSize: 10, color: '#6B7280' },

  // Badges
  badgesRow: { width: width },
  badgesContent: { paddingRight: 32, gap: 16 },
  badgeItem: { alignItems: 'center', width: width * 0.22 },
  badgeCircle: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  badgeName: { fontSize: 11, fontWeight: '700', color: '#111827', textAlign: 'center' },
  badgeSub: { fontSize: 9, color: '#6B7280', textAlign: 'center', marginTop: 1 },
});
