import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/sync
 * Sync Clerk user with Supabase profiles table
 * Called after user signs up or signs in
 */
router.post('/sync', requireAuth, async (req, res, next) => {
  try {
    // TODO: Implement user sync with Supabase
    res.status(200).json({
      message: 'User synced successfully',
      user: req.auth,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/webhook
 * Clerk webhook handler for user events
 */
router.post('/webhook', async (req, res, next) => {
  try {
    // TODO: Implement Clerk webhook verification and handling
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;
