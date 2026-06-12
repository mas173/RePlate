import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendClaimConfirmation } from '../services/email.service.js';
import { invalidateCachePattern } from '../middleware/cache.js';

const router = Router();

// Helper to estimate weight and other metrics if missing
function estimateMetrics(weightKgVal, quantityStr) {
  let weight = parseFloat(weightKgVal);
  if (!weight || isNaN(weight)) {
    // Attempt parsing from quantity string e.g. "15 kg"
    const match = String(quantityStr || '').trim().match(/^([\d.]+)\s*(.*)$/);
    const val = match ? parseFloat(match[1]) : 1.0;
    const unit = match ? match[2].toLowerCase() : 'meals';
    if (unit === 'kg' || unit === 'kilograms') {
      weight = val;
    } else if (unit === 'meals' || unit === 'servings') {
      weight = val * 0.5;
    } else {
      weight = val * 0.25;
    }
  }

  if (isNaN(weight) || weight <= 0) {
    weight = 1.0;
  }

  return {
    weightKg: parseFloat(weight.toFixed(2)),
    mealsSaved: Math.round(weight / 0.5) || 1,
    co2Reduced: parseFloat((weight * 2.5).toFixed(2)),
    waterSaved: parseFloat((weight * 1000).toFixed(2))
  };
}

/**
 * GET /api/claims
 * Get all claims for the current user
 * - NGOs see their claimed donations
 * - Donors see claims on their donations
 * - Admins see all claims
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    let claims = [];

    if (profile.role === 'ngo') {
      const { data, error } = await supabaseAdmin
        .from('claims')
        .select(`
          *,
          donation:donation_id (
            *,
            donor:donor_id (
              first_name,
              last_name,
              organization_name,
              email,
              phone
            )
          )
        `)
        .eq('ngo_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      claims = data || [];
    } else if (profile.role === 'donor') {
      // First get all donations of this donor
      const { data: donations, error: donErr } = await supabaseAdmin
        .from('donations')
        .select('id')
        .eq('donor_id', profile.id);

      if (donErr) throw donErr;

      const donationIds = (donations || []).map((d) => d.id);

      if (donationIds.length > 0) {
        const { data, error } = await supabaseAdmin
          .from('claims')
          .select(`
            *,
            donation:donation_id (
              *
            ),
            ngo:ngo_id (
              first_name,
              last_name,
              organization_name,
              email,
              phone
            )
          `)
          .in('donation_id', donationIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        claims = data || [];
      }
    } else if (profile.role === 'admin') {
      const { data, error } = await supabaseAdmin
        .from('claims')
        .select(`
          *,
          donation:donation_id (
            *,
            donor:donor_id (
              first_name,
              last_name,
              organization_name
            )
          ),
          ngo:ngo_id (
            first_name,
            last_name,
            organization_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      claims = data || [];
    }

    res.status(200).json({ claims, total: claims.length });
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
    const { donationId, notes, pickupScheduledAt } = req.body;

    if (!donationId) {
      return res.status(400).json({ error: 'donationId is required' });
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Check if donation exists and is available
    const { data: donation, error: donErr } = await supabaseAdmin
      .from('donations')
      .select('status')
      .eq('id', donationId)
      .single();

    if (donErr || !donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ error: 'Donation is no longer available' });
    }

    // Create the claim record
    const { data: claim, error: claimErr } = await supabaseAdmin
      .from('claims')
      .insert({
        donation_id: donationId,
        ngo_id: profile.id,
        status: 'confirmed',
        notes: notes || null,
        pickup_scheduled_at: pickupScheduledAt || null
      })
      .select()
      .single();

    if (claimErr) throw claimErr;

    // Update donation status to claimed
    const { error: updateDonationErr } = await supabaseAdmin
      .from('donations')
      .update({ status: 'claimed' })
      .eq('id', donationId);

    if (updateDonationErr) throw updateDonationErr;

    // --- Send notifications for the claim (non-blocking) ---
    try {
      // Get full donation details for notifications
      const { data: fullDonation } = await supabaseAdmin
        .from('donations')
        .select('*, profiles:donor_id(id, email, first_name, last_name, organization_name)')
        .eq('id', donationId)
        .single();

      const { data: ngoProfile } = await supabaseAdmin
        .from('profiles')
        .select('email, organization_name')
        .eq('id', profile.id)
        .single();

      if (fullDonation) {
        const donorProfileId = fullDonation.profiles?.id;
        const donorEmail = fullDonation.profiles?.email;
        const ngoName = ngoProfile?.organization_name || 'An NGO';

        // In-app notification for the donor
        if (donorProfileId) {
          await supabaseAdmin.from('notifications').insert({
            user_id: donorProfileId,
            type: 'claim_update',
            title: 'Donation Claimed!',
            message: `Your donation "${fullDonation.food_name}" has been claimed by ${ngoName}.`,
            data: { donation_id: donationId, claim_id: claim.id },
          });
        }

        // In-app notification for the NGO
        await supabaseAdmin.from('notifications').insert({
          user_id: profile.id,
          type: 'claim_update',
          title: 'Claim Confirmed',
          message: `You have successfully claimed "${fullDonation.food_name}". Please arrange pickup.`,
          data: { donation_id: donationId, claim_id: claim.id },
        });

        // Email confirmations
        if (donorEmail && ngoProfile?.email) {
          const metrics = estimateMetrics(fullDonation.weight_kg, fullDonation.quantity);
          sendClaimConfirmation(donorEmail, ngoProfile.email, {
            foodName: fullDonation.food_name,
            expiryDate: new Date(fullDonation.expires_at).toLocaleString(),
            location: fullDonation.pickup_address,
            donorContact: donorEmail,
            quantity: fullDonation.quantity,
            id: fullDonation.id,
            metrics,
          }, {
            ngoName,
          }).catch((err) => console.error('Claim email failed:', err.message));
        }
      }
    } catch (notifErr) {
      console.error('Claim notification failed (non-critical):', notifErr.message);
    }

    // Invalidate caches
    invalidateCachePattern('donations:*');
    invalidateCachePattern(`donation:*:${donationId}*`);
    invalidateCachePattern('analytics:*');

    res.status(201).json({ message: 'Donation claimed successfully', claim });
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
    const { id } = req.params;
    const { status, feedback, rating } = req.body;

    const validStatuses = ['confirmed', 'picked_up', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid claim status' });
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get current claim
    const { data: claim, error: claimErr } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (claimErr || !claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Security check: Only owner NGO or admin can update status
    if (profile.role !== 'admin' && claim.ngo_id !== profile.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this claim.' });
    }

    const updateData = { status };
    if (status === 'picked_up') {
      updateData.picked_up_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
      if (feedback) updateData.feedback = feedback;
      if (rating) updateData.rating = parseInt(rating, 10);
    }

    // Update claim status
    const { data: updatedClaim, error: updateErr } = await supabaseAdmin
      .from('claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Determine target donation status
    let donationStatus = 'claimed';
    if (status === 'picked_up') {
      donationStatus = 'picked_up';
    } else if (status === 'delivered') {
      donationStatus = 'delivered';
    } else if (status === 'cancelled') {
      donationStatus = 'available';
    }

    // Update donation status
    const { error: updateDonationErr } = await supabaseAdmin
      .from('donations')
      .update({ status: donationStatus })
      .eq('id', claim.donation_id);

    if (updateDonationErr) throw updateDonationErr;

    // If delivered, write to impact logs
    if (status === 'delivered') {
      const { data: donation, error: donErr } = await supabaseAdmin
        .from('donations')
        .select('*')
        .eq('id', claim.donation_id)
        .single();

      if (!donErr && donation) {
        const metrics = estimateMetrics(donation.weight_kg, donation.quantity);
        
        await supabaseAdmin.from('impact_logs').insert({
          donation_id: donation.id,
          donor_id: donation.donor_id,
          ngo_id: claim.ngo_id,
          weight_kg: metrics.weightKg,
          meals_saved: metrics.mealsSaved,
          co2_reduced_kg: metrics.co2Reduced,
          water_saved_liters: metrics.waterSaved
        });
      }
    }

    // Invalidate caches
    invalidateCachePattern('donations:*');
    invalidateCachePattern(`donation:*:${claim.donation_id}*`);
    invalidateCachePattern('analytics:*');

    res.status(200).json({ message: 'Claim status updated successfully', claim: updatedClaim });
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
    const { id } = req.params;

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('clerk_id', req.auth.userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get current claim
    const { data: claim, error: claimErr } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('id', id)
      .single();

    if (claimErr || !claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Security check: Only owner NGO or admin can cancel claim
    if (profile.role !== 'admin' && claim.ngo_id !== profile.id) {
      return res.status(403).json({ error: 'Access denied. You do not own this claim.' });
    }

    // Update claim status to cancelled
    const { error: updateClaimErr } = await supabaseAdmin
      .from('claims')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateClaimErr) throw updateClaimErr;

    // Reset donation status back to available
    const { error: updateDonationErr } = await supabaseAdmin
      .from('donations')
      .update({ status: 'available' })
      .eq('id', claim.donation_id);

    if (updateDonationErr) throw updateDonationErr;

    // Invalidate caches
    invalidateCachePattern('donations:*');
    invalidateCachePattern(`donation:*:${claim.donation_id}*`);
    invalidateCachePattern('analytics:*');

    res.status(200).json({ message: 'Claim cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
