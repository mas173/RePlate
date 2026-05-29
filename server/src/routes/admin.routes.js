import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * GET /api/admin/users
 * List all users with optional search and role filtering
 */
router.get('/users', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('profiles')
      .select('id, clerk_id, email, first_name, last_name, avatar_url, role, phone, organization_name, organization_type, city, state, is_verified, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const role = typeof req.query.role === 'string' ? req.query.role : '';

    if (role && ['donor', 'ngo', 'admin'].includes(role)) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,organization_name.ilike.%${search}%`
      );
    }

    const { data: users, error } = await query;
    if (error) throw error;

    res.status(200).json({ users: users || [], total: users ? users.length : 0 });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update a user's role in the profiles table
 */
router.patch('/users/:id/role', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['donor', 'ngo', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be one of: donor, ngo, admin' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: `Role updated to ${role}`, user: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/users/:id/status
 * Toggle user active status (soft deactivate / reactivate)
 */
router.patch('/users/:id/status', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: is_active ? 'User reactivated' : 'User deactivated', user: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Soft-deactivate a user (sets is_active = false)
 */
router.delete('/users/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/donations
 * List all donations with admin-level detail, filterable
 */
router.get('/donations', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('donations')
      .select('*, profiles:donor_id(first_name, last_name, organization_name, email, role)')
      .order('created_at', { ascending: false });

    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (search) {
      query = query.or(`food_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: donations, error } = await query;
    if (error) throw error;

    res.status(200).json({ donations: donations || [], total: donations ? donations.length : 0 });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/donations/:id/status
 * Admin force-update a donation's status (moderation)
 */
router.patch('/donations/:id/status', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('donations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!updated) return res.status(404).json({ error: 'Donation not found' });

    res.status(200).json({ message: `Donation status updated to ${status}`, donation: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/analytics
 * Aggregate platform-wide admin analytics
 */
router.get('/analytics', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    // User counts by role
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role, is_active, created_at');
    if (pErr) throw pErr;

    const totalUsers = (profiles || []).length;
    const totalDonors = (profiles || []).filter(p => p.role === 'donor').length;
    const totalNGOs = (profiles || []).filter(p => p.role === 'ngo').length;
    const totalAdmins = (profiles || []).filter(p => p.role === 'admin').length;
    const activeUsers = (profiles || []).filter(p => p.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;

    // Donation stats
    const { data: donations, error: dErr } = await supabaseAdmin
      .from('donations')
      .select('id, status, servings, weight_kg, category, created_at');
    if (dErr) throw dErr;

    const totalDonations = (donations || []).length;
    const activeDonations = (donations || []).filter(d => d.status === 'available').length;
    const claimedDonations = (donations || []).filter(d => d.status === 'claimed').length;
    const deliveredDonations = (donations || []).filter(d => d.status === 'delivered').length;
    const expiredDonations = (donations || []).filter(d => d.status === 'expired').length;
    const cancelledDonations = (donations || []).filter(d => d.status === 'cancelled').length;

    // Claims stats
    const { data: claims, error: cErr } = await supabaseAdmin
      .from('claims')
      .select('id, status');
    if (cErr) throw cErr;

    const totalClaims = (claims || []).length;
    const activeClaims = (claims || []).filter(c => c.status === 'confirmed' || c.status === 'picked_up').length;
    const completedClaims = (claims || []).filter(c => c.status === 'delivered').length;

    // Impact aggregation
    const { data: impactLogs, error: iErr } = await supabaseAdmin
      .from('impact_logs')
      .select('meals_saved, weight_kg, co2_reduced_kg, water_saved_liters');
    if (iErr) throw iErr;

    const platformImpact = (impactLogs || []).reduce((acc, log) => {
      acc.totalMealsSaved += log.meals_saved || 0;
      acc.totalWeightSaved += parseFloat(log.weight_kg) || 0;
      acc.totalCO2Reduced += parseFloat(log.co2_reduced_kg) || 0;
      acc.totalWaterSaved += parseFloat(log.water_saved_liters) || 0;
      return acc;
    }, { totalMealsSaved: 0, totalWeightSaved: 0, totalCO2Reduced: 0, totalWaterSaved: 0 });

    // User registrations by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const userGrowth = (profiles || [])
      .filter(p => new Date(p.created_at) >= sixMonthsAgo)
      .reduce((acc, p) => {
        const month = new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!acc[month]) acc[month] = { month, donors: 0, ngos: 0, admins: 0 };
        if (p.role === 'donor') acc[month].donors++;
        else if (p.role === 'ngo') acc[month].ngos++;
        else if (p.role === 'admin') acc[month].admins++;
        return acc;
      }, {});

    res.status(200).json({
      totalUsers,
      totalDonors,
      totalNGOs,
      totalAdmins,
      activeUsers,
      inactiveUsers,
      totalDonations,
      activeDonations,
      claimedDonations,
      deliveredDonations,
      expiredDonations,
      cancelledDonations,
      totalClaims,
      activeClaims,
      completedClaims,
      platformImpact,
      userGrowth: Object.values(userGrowth),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/activity
 * Recent platform activity feed (latest donations + claims + users)
 */
router.get('/activity', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    // Recent donations (last 10)
    const { data: recentDonations, error: dErr } = await supabaseAdmin
      .from('donations')
      .select('id, food_name, status, category, created_at, profiles:donor_id(first_name, last_name, organization_name)')
      .order('created_at', { ascending: false })
      .limit(10);
    if (dErr) throw dErr;

    // Recent claims (last 10)
    const { data: recentClaims, error: cErr } = await supabaseAdmin
      .from('claims')
      .select('id, status, created_at, donations:donation_id(food_name), profiles:ngo_id(organization_name, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(10);
    if (cErr) throw cErr;

    // Recent user registrations (last 10)
    const { data: recentUsers, error: uErr } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, organization_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    if (uErr) throw uErr;

    // Merge and sort by created_at
    const activity = [
      ...(recentDonations || []).map(d => ({
        type: 'donation',
        id: d.id,
        title: `New donation: "${d.food_name}"`,
        subtitle: `by ${d.profiles?.organization_name || `${d.profiles?.first_name || ''} ${d.profiles?.last_name || ''}`.trim() || 'Unknown'}`,
        status: d.status,
        category: d.category,
        created_at: d.created_at,
      })),
      ...(recentClaims || []).map(c => ({
        type: 'claim',
        id: c.id,
        title: `Food claimed: "${c.donations?.food_name || 'Donation'}"`,
        subtitle: `by ${c.profiles?.organization_name || `${c.profiles?.first_name || ''} ${c.profiles?.last_name || ''}`.trim() || 'Unknown NGO'}`,
        status: c.status,
        created_at: c.created_at,
      })),
      ...(recentUsers || []).map(u => ({
        type: 'user_joined',
        id: u.id,
        title: `New ${u.role} joined`,
        subtitle: u.organization_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown',
        status: u.role,
        created_at: u.created_at,
      })),
    ]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 20);

    res.status(200).json({ activity });
  } catch (error) {
    next(error);
  }
});

export default router;
