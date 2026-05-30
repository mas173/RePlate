import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }

    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      organization_name,
      organization_type,
      organization_address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      avatar_url
    } = req.body;

    const updateData = {
      first_name,
      last_name,
      phone,
      organization_name,
      organization_type,
      organization_address,
      city,
      state,
      pincode,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      updated_at: new Date().toISOString()
    };

    if (avatar_url) {
      updateData.avatar_url = avatar_url;
    }

    // Clean undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('clerk_id', req.auth.userId)
      .select()
      .single();

    if (error) throw error;
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/settings
 * Get user notification & app settings
 */
router.get('/settings', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('notification_preferences')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      throw error;
    }

    res.status(200).json({ settings: profile.notification_preferences || {} });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/settings
 * Update user settings
 */
router.put('/settings', requireAuth, async (req, res, next) => {
  try {
    const { notification_preferences } = req.body;

    if (!notification_preferences || typeof notification_preferences !== 'object') {
      return res.status(400).json({ error: 'Invalid notification preferences' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        notification_preferences,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', req.auth.userId)
      .select()
      .single();

    if (error) throw error;
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.status(200).json({ message: 'Settings updated successfully', settings: profile.notification_preferences });
  } catch (error) {
    next(error);
  }
});

export default router;
