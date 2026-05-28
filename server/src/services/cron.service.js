import { CronJob } from 'cron';
import { supabaseAdmin } from '../config/supabase.js';
import { sendExpiryWarning } from './email.service.js';

/**
 * Auto-expire available donations whose expires_at is in the past.
 * Also creates an in-app notification for the donor.
 */
async function runAutoExpiry() {
  try {
    // Fetch donations that should be expired
    const { data: expiredDonations, error: fetchErr } = await supabaseAdmin
      .from('donations')
      .select('id, donor_id, food_name')
      .eq('status', 'available')
      .lt('expires_at', new Date().toISOString());

    if (fetchErr) {
      console.error('[Cron] Failed to fetch expired donations:', fetchErr.message);
      return;
    }

    if (!expiredDonations || expiredDonations.length === 0) return;

    console.log(`[Cron] Auto-expiring ${expiredDonations.length} donation(s)...`);

    for (const donation of expiredDonations) {
      // Update status to expired
      const { error: updateErr } = await supabaseAdmin
        .from('donations')
        .update({ status: 'expired' })
        .eq('id', donation.id);

      if (updateErr) {
        console.error(`[Cron] Failed to expire donation ${donation.id}:`, updateErr.message);
        continue;
      }

      // Create in-app notification for the donor
      await supabaseAdmin.from('notifications').insert({
        user_id: donation.donor_id,
        type: 'expiry_warning',
        title: 'Donation Expired',
        message: `Your donation "${donation.food_name}" has expired and is no longer visible to NGOs.`,
        data: { donation_id: donation.id },
      });
    }

    console.log(`[Cron] Auto-expiry complete.`);
  } catch (err) {
    console.error('[Cron] Auto-expiry error:', err.message);
  }
}

/**
 * Send expiry warnings for donations expiring within 4 hours.
 * Only sends one warning per donation (checks for existing notification).
 */
async function runExpiryWarnings() {
  try {
    const now = new Date();
    const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    // Find available donations expiring in the next 4 hours
    const { data: soonExpiring, error: fetchErr } = await supabaseAdmin
      .from('donations')
      .select('id, donor_id, food_name, quantity, expires_at, location, urgency_level')
      .eq('status', 'available')
      .gt('expires_at', now.toISOString())
      .lt('expires_at', fourHoursLater.toISOString());

    if (fetchErr) {
      console.error('[Cron] Failed to fetch soon-expiring donations:', fetchErr.message);
      return;
    }

    if (!soonExpiring || soonExpiring.length === 0) return;

    console.log(`[Cron] Found ${soonExpiring.length} soon-expiring donation(s)`);

    for (const donation of soonExpiring) {
      // Check if we already sent an expiry warning for this donation
      const { data: existing, error: checkErr } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', donation.donor_id)
        .eq('type', 'expiry_warning')
        .like('title', 'Expiring Soon%')
        .filter('data->>donation_id', 'eq', donation.id)
        .limit(1);

      if (checkErr) {
        console.error(`[Cron] Warning check failed for ${donation.id}:`, checkErr.message);
        continue;
      }

      if (existing && existing.length > 0) continue;

      // Create in-app notification
      await supabaseAdmin.from('notifications').insert({
        user_id: donation.donor_id,
        type: 'expiry_warning',
        title: 'Expiring Soon',
        message: `Your donation "${donation.food_name}" is expiring soon and hasn't been claimed yet. Consider sharing it with more NGOs.`,
        data: { donation_id: donation.id },
      });

      // Send email warning
      const { data: donorProfile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', donation.donor_id)
        .single();

      if (donorProfile?.email) {
        await sendExpiryWarning(donorProfile.email, {
          foodName: donation.food_name,
          quantity: donation.quantity,
          expiryDate: new Date(donation.expires_at).toLocaleString(),
          location: donation.location,
          urgencyLevel: donation.urgency_level,
        });
      }

      console.log(`[Cron] Expiry warning sent for donation ${donation.id}`);
    }
  } catch (err) {
    console.error('[Cron] Expiry warning error:', err.message);
  }
}

/**
 * Start all background cron jobs
 */
export function startCronJobs() {
  // Run every 5 minutes
  const job = new CronJob('*/5 * * * *', async () => {
    console.log(`[Cron] Running scheduled tasks at ${new Date().toISOString()}`);

    await runAutoExpiry();
    await runExpiryWarnings();
  });

  job.start();

  console.log('🕐 Cron jobs started (every 5 minutes)');
}

export default { startCronJobs };