import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/claims
 * Get all claims for the current user
 * - NGOs see their claimed donations
 * - Donors see claims on their donations
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    // TODO: Implement claim listing
    res.status(200).json({ claims: [], total: 0 });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/claims
 * NGO claims a donation
 */
router.post('/', requireAuth, requireRole('ngo', 'admin'), async (req, res, next) => {
  try {
    // TODO: Implement donation claiming
    res.status(201).json({ message: 'Donation claimed', claim: null });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/claims/:id/status
 * Update claim status (confirm pickup, mark delivered, etc.)
 */
router.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    // TODO: Implement claim status update
    res.status(200).json({ message: 'Claim status updated' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/claims/:id
 * Cancel a claim
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    // TODO: Implement claim cancellation
    res.status(200).json({ message: 'Claim cancelled' });
  } catch (error) {
    next(error);
  }
});

export default router;
