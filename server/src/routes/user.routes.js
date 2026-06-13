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

/**
 * GET /api/users/addresses
 * Get user's saved addresses
 */
router.get('/addresses', requireAuth, async (req, res, next) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const { data: addresses, error } = await supabaseAdmin
      .from('saved_addresses')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ addresses });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/addresses
 * Add a new saved address
 */
router.post('/addresses', requireAuth, async (req, res, next) => {
  try {
    const { name, address_line, city, state, pincode, latitude, longitude, is_default } = req.body;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (is_default) {
      await supabaseAdmin
        .from('saved_addresses')
        .update({ is_default: false })
        .eq('profile_id', profile.id);
    }

    const { data: address, error } = await supabaseAdmin
      .from('saved_addresses')
      .insert([{
        profile_id: profile.id,
        name,
        address_line,
        city,
        state,
        pincode,
        latitude,
        longitude,
        is_default: is_default || false
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Address saved successfully', address });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/addresses/:id
 * Update a saved address
 */
router.put('/addresses/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address_line, city, state, pincode, latitude, longitude, is_default } = req.body;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (is_default) {
      await supabaseAdmin
        .from('saved_addresses')
        .update({ is_default: false })
        .eq('profile_id', profile.id);
    }

    const { data: address, error } = await supabaseAdmin
      .from('saved_addresses')
      .update({
        name,
        address_line,
        city,
        state,
        pincode,
        latitude,
        longitude,
        is_default,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('profile_id', profile.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Address updated successfully', address });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/users/addresses/:id
 * Delete a saved address
 */
router.delete('/addresses/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const { error } = await supabaseAdmin
      .from('saved_addresses')
      .delete()
      .eq('id', id)
      .eq('profile_id', profile.id);

    if (error) throw error;

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/verify-status
 * Get verification status
 */
router.get('/verify-status', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('is_verified, verification_status, fssai_number, verification_document_url')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (error) throw error;

    res.status(200).json({ verification: profile });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/verify
 * Submit verification details
 */
router.post('/verify', requireAuth, async (req, res, next) => {
  try {
    const { fssai_number, verification_document_url } = req.body;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        fssai_number,
        verification_document_url,
        verification_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', req.auth.userId)
      .select('is_verified, verification_status, fssai_number, verification_document_url')
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Verification details submitted', verification: profile });
  } catch (error) {
    next(error);
  }
});

export default router;
