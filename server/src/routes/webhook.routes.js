import { Router } from 'express';
import { handleClerkWebhook } from '../controllers/webhook.controller.js';

const router = Router();

/**
 * POST /api/webhooks/clerk
 * Receives raw-body Clerk webhook events (Svix-signed).
 */
router.post('/clerk', handleClerkWebhook);

export default router;
