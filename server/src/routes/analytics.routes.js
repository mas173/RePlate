import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * GET /api/analytics/public-stats
 * Get platform-wide analytics overview publicly (no auth required)
 */
router.get('/public-stats', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_platform_stats');
    if (error) throw error;

    res.status(200).json({
      totalDonations: data?.total_donations || 0,
      totalMealsSaved: data?.total_meals_saved || 0,
      totalWasteReduced: data?.total_weight_saved || 0,
      totalCO2Reduced: data?.total_co2_reduced || 0,
      activeDonors: data?.total_donors || 0,
      activeNGOs: data?.total_ngos || 0,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/overview
 * Get platform-wide analytics overview
 */
router.get('/overview', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('get_platform_stats');
    if (error) throw error;

    res.status(200).json({
      totalDonations: data?.total_donations || 0,
      totalMealsSaved: data?.total_meals_saved || 0,
      totalWasteReduced: data?.total_weight_saved || 0,
      totalCO2Reduced: data?.total_co2_reduced || 0,
      activeDonors: data?.total_donors || 0,
      activeNGOs: data?.total_ngos || 0,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/user
 * Get analytics for the current user
 */
router.get('/user', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { data, error } = await supabaseAdmin.rpc('get_user_impact', {
      p_user_id: profile.id,
    });

    if (error) throw error;

    res.status(200).json({
      donations: data?.total_donations || 0,
      activeDonations: data?.active_donations || 0,
      mealsSaved: data?.meals_saved || 0,
      wasteReduced: data?.weight_saved || 0,
      co2Reduced: data?.co2_reduced || 0,
      claimsReceived: data?.claims_received || 0,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/trends
 * Get real chronological donation trends for charts (Last 30 Days)
 */
router.get('/trends', requireAuth, async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: trendData, error } = await supabaseAdmin
      .from('donations')
      .select('created_at, servings, weight_kg')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Aggregate into structural daily buckets for charting UI libraries
    const dailyGroups = (trendData || []).reduce((acc, current) => {
      const dateKey = current.created_at.split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, donationsCount: 0, mealsSaved: 0, weightSaved: 0 };
      }
      acc[dateKey].donationsCount += 1;
      acc[dateKey].mealsSaved += current.servings || 0;
      acc[dateKey].weightSaved += current.weight_kg || 0;
      return acc;
    }, {});

    res.status(200).json({ trends: Object.values(dailyGroups) });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/leaderboard
 * Get high-impact leadership rankings dynamically computed from impact_logs
 */
router.get('/leaderboard', requireAuth, async (req, res, next) => {
  try {
    // 1. Fetch active profiles
    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, organization_name, first_name, last_name, city, avatar_url, role')
      .eq('is_active', true);

    if (profileErr) throw profileErr;

    // 2. Fetch impact logs
    const { data: logs, error: logsErr } = await supabaseAdmin
      .from('impact_logs')
      .select('donor_id, ngo_id, meals_saved, weight_kg');

    if (logsErr) throw logsErr;

    // 3. Aggregate logs per user/org
    const donorStats = {};
    const ngoStats = {};

    (logs || []).forEach(log => {
      if (log.donor_id) {
        if (!donorStats[log.donor_id]) {
          donorStats[log.donor_id] = { meals: 0, weight: 0 };
        }
        donorStats[log.donor_id].meals += log.meals_saved || 0;
        donorStats[log.donor_id].weight += parseFloat(log.weight_kg) || 0;
      }
      if (log.ngo_id) {
        if (!ngoStats[log.ngo_id]) {
          ngoStats[log.ngo_id] = { meals: 0, weight: 0 };
        }
        ngoStats[log.ngo_id].meals += log.meals_saved || 0;
        ngoStats[log.ngo_id].weight += parseFloat(log.weight_kg) || 0;
      }
    });

    // 4. Map back to profiles, sort and slice top 5
    const donors = (profiles || [])
      .filter(p => p.role === 'donor')
      .map(p => ({
        id: p.id,
        organizationName: p.organization_name,
        firstName: p.first_name,
        lastName: p.last_name,
        city: p.city,
        avatarUrl: p.avatar_url,
        mealsSaved: donorStats[p.id]?.meals || 0,
        weightSaved: donorStats[p.id]?.weight || 0
      }))
      .sort((a, b) => b.mealsSaved - a.mealsSaved || b.weightSaved - a.weightSaved)
      .slice(0, 5);

    const ngos = (profiles || [])
      .filter(p => p.role === 'ngo')
      .map(p => ({
        id: p.id,
        organizationName: p.organization_name,
        firstName: p.first_name,
        lastName: p.last_name,
        city: p.city,
        avatarUrl: p.avatar_url,
        mealsSaved: ngoStats[p.id]?.meals || 0,
        weightSaved: ngoStats[p.id]?.weight || 0
      }))
      .sort((a, b) => b.mealsSaved - a.mealsSaved || b.weightSaved - a.weightSaved)
      .slice(0, 5);

    res.status(200).json({ donors, ngos });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/categories
 * Get platform-wide category distribution metrics
 */
router.get('/categories', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('donations')
      .select('category, servings, weight_kg');

    if (error) throw error;

    // Aggregate category groups in JS
    const categoryGroups = (data || []).reduce((acc, current) => {
      const cat = current.category || 'other';
      if (!acc[cat]) {
        acc[cat] = { category: cat, count: 0, servings: 0, weight: 0 };
      }
      acc[cat].count += 1;
      acc[cat].servings += current.servings || 0;
      acc[cat].weight += parseFloat(current.weight_kg) || 0;
      return acc;
    }, {});

    res.status(200).json({ categories: Object.values(categoryGroups) });
  } catch (error) {
    next(error);
  }
});

export default router;