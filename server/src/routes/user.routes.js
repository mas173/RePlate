import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    // TODO: Implement profile retrieval from Supabase
    res.status(200).json({ profile: null });
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
    // TODO: Implement profile update
    res.status(200).json({ message: 'Profile updated', profile: null });
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
    // TODO: Implement settings retrieval
    res.status(200).json({ settings: {} });
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
    // TODO: Implement settings update
    res.status(200).json({ message: 'Settings updated' });
  } catch (error) {
    next(error);
  }
});

export default router;
