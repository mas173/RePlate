import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ImpactScreen() {
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.sproutBadge}>
            <MaterialCommunityIcons name="sprout" size={24} color="#2E7D32" />
          </View>
          <Text style={styles.summaryTitle}>Eco Hero Level 4</Text>
          <Text style={styles.summarySub}>You are in the top 5% of food donors in your city!</Text>
          
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>350/500 kg saved</Text>
              <Text style={styles.progressText}>150 kg to next level</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Environmental Savings</Text>
        <View style={styles.statsGrid}>
          {/* Meals Shared */}
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#2E7D32" />
            </View>
            <Text style={styles.statNum}>180</Text>
            <Text style={styles.statLabel}>Meals Shared</Text>
            <Text style={styles.statDesc}>Nutritious servings delivered to local NGO shelters.</Text>
          </View>

          {/* CO2 Prevented */}
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="earth" size={20} color="#2196F3" />
            </View>
            <Text style={styles.statNum}>285.5 kg</Text>
            <Text style={styles.statLabel}>CO₂ Prevented</Text>
            <Text style={styles.statDesc}>Equivalent to planting 12 young trees in your city.</Text>
          </View>

          {/* Landfill Saved */}
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="delete-restore" size={20} color="#FF9800" />
            </View>
            <Text style={styles.statNum}>72.4 kg</Text>
            <Text style={styles.statLabel}>Landfill Prevented</Text>
            <Text style={styles.statDesc}>Organic solid waste saved from entering urban landfills.</Text>
          </View>

          {/* Water Saved */}
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0F7FA' }]}>
              <Ionicons name="water" size={20} color="#00ACC1" />
            </View>
            <Text style={styles.statNum}>12.4K L</Text>
            <Text style={styles.statLabel}>Water Conserved</Text>
            <Text style={styles.statDesc}>Virtual water saved from lifecycle crop cultivation.</Text>
          </View>
        </View>

        {/* Badge Achievements */}
        <Text style={styles.sectionTitle}>Earned Badges</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgesRow}
          contentContainerStyle={styles.badgesContent}
        >
          <View style={styles.badgeItem}>
            <View style={[styles.badgeCircle, { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }]}>
              <Ionicons name="ribbon" size={28} color="#2E7D32" />
            </View>
            <Text style={styles.badgeName}>First Post</Text>
            <Text style={styles.badgeSub}>First meal shared</Text>
          </View>

          <View style={styles.badgeItem}>
            <View style={[styles.badgeCircle, { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }]}>
              <Ionicons name="trophy" size={28} color="#2E7D32" />
            </View>
            <Text style={styles.badgeName}>Century</Text>
            <Text style={styles.badgeSub}>Shared 100+ meals</Text>
          </View>

          <View style={styles.badgeItem}>
            <View style={[styles.badgeCircle, { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }]}>
              <Ionicons name="leaf" size={28} color="#2E7D32" />
            </View>
            <Text style={styles.badgeName}>Zero Waste</Text>
            <Text style={styles.badgeSub}>No expiry waste</Text>
          </View>

          <View style={styles.badgeItem}>
            <View style={[styles.badgeCircle, { backgroundColor: '#F3F4F6', borderColor: '#9CA3AF' }]}>
              <Ionicons name="lock-closed" size={24} color="#9CA3AF" />
            </View>
            <Text style={[styles.badgeName, { color: '#9CA3AF' }]}>Green King</Text>
            <Text style={styles.badgeSub}>Share 500+ meals</Text>
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAF3E9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B4329',
  },
  headerLeaf: {
    marginLeft: 6,
    transform: [{ rotate: '45deg' }],
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    width: '100%',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B4329',
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAF3E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 3,
    elevation: 1,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 2,
  },
  statDesc: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 13,
    marginTop: 4,
  },
  badgesRow: {
    width: width,
  },
  badgesContent: {
    paddingRight: 32,
    gap: 16,
  },
  badgeItem: {
    alignItems: 'center',
    width: width * 0.22,
  },
  badgeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  badgeSub: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 1,
  },
});
