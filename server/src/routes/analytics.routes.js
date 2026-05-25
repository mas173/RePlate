import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

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
 * Get high-impact leadership rankings
 */
router.get('/leaderboard', requireAuth, async (req, res, next) => {
  try {
    // Fetch Top Donors by chronological volume output fallback
    const { data: topDonors, error: donorErr } = await supabaseAdmin
      .from('profiles')
      .select('id, organization_name, first_name, last_name, city')
      .eq('role', 'donor')
      .order('created_at', { ascending: false })
      .limit(5);

    if (donorErr) throw donorErr;

    // Fetch Top NGOs by activation longevity ranking fallback
    const { data: topNGOs, error: ngoErr } = await supabaseAdmin
      .from('profiles')
      .select('id, organization_name, first_name, last_name, city')
      .eq('role', 'ngo')
      .order('created_at', { ascending: false })
      .limit(5);

    if (ngoErr) throw ngoErr;

    res.status(200).json({
      donors: topDonors || [],
      ngos: topNGOs || []
    });
  } catch (error) {
    next(error);
  }
});

export default router;