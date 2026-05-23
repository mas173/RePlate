import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { syncUser } from '../controllers/webhook.controller.js';

const router = Router();

/**
 * POST /api/auth/sync
 *
 * Client-initiated profile sync. Called after sign-in to ensure
 * a Supabase profile row exists (fallback when webhook is not set up).
 *
 * Requires: Authorization: Bearer <clerk_session_token>
 */
router.post('/sync', requireAuth, syncUser);

export default router;
