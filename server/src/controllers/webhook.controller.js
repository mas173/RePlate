import { Webhook } from 'svix';
import { clerkClient } from '@clerk/express';
import { supabaseAdmin } from '../config/supabase.js';
import { sendWelcomeEmail } from '../services/email.service.js';

/**
 * Upsert a user row into Supabase profiles table.
 * Uses clerk_id as the conflict key — idempotent and safe to replay.
 */
async function upsertProfile({ clerkId, email, firstName, lastName }) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        clerk_id:   clerkId,
        email:      email     ?? '',
        first_name: firstName ?? '',
        last_name:  lastName  ?? '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * POST /api/webhooks/clerk
 *
 * Receives Svix-signed events from Clerk and keeps Supabase
 * profiles table in sync.
 *
 * ⚠️  This route MUST receive the raw request body (Buffer).
 *     It is mounted with express.raw() BEFORE express.json() in index.js.
 */
export async function handleClerkWebhook(req, res) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret || secret === 'whsec_your_webhook_secret_here') {
    console.error('❌  CLERK_WEBHOOK_SECRET is not configured in server/.env');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // 1. Verify Svix signature
  const svixId        = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing Svix headers' });
  }

  let evt;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(req.body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('❌  Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { type, data } = evt;
  console.log(`📨  Clerk webhook: ${type} | user: ${data.id}`);

  // 2. Handle each event type
  try {
    if (type === 'user.created' || type === 'user.updated') {
      const profile = await upsertProfile({
        clerkId:   data.id,
        email:     data.email_addresses?.[0]?.email_address,
        firstName: data.first_name,
        lastName:  data.last_name,
      });
      console.log(`✅  Profile upserted: ${profile.clerk_id}`);
    }

    if (type === 'user.deleted') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('clerk_id', data.id);
      if (error) throw error;
      console.log(`🗑️   Profile deleted: ${data.id}`);
    }

    return res.status(200).json({ received: true, type });
  } catch (err) {
    console.error(`❌  Failed to process ${type}:`, err.message);
    return res.status(500).json({ error: 'Database sync failed' });
  }
}

/**
 * POST /api/auth/sync
 *
 * Client-initiated sync — called after sign-in to guarantee
 * a Supabase profile row exists even without the webhook
 * (useful during local dev without ngrok).
 */
export async function syncUser(req, res) {
  try {
    const { userId, email, firstName, lastName } = req.auth;
    const profile = await upsertProfile({
      clerkId: userId,
      email,
      firstName,
      lastName,
    });
    return res.status(200).json({ message: 'Profile synced', profile });
  } catch (err) {
    console.error('❌  syncUser error:', err.message);
    return res.status(500).json({ error: 'Failed to sync profile' });
  }
}

/**
 * POST /api/auth/role
 *
 * Updates both Clerk publicMetadata and the Supabase profiles table
 * with the user selected role ('donor' or 'ngo').
 */
export async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    const { userId } = req.auth;

    if (!role || !['donor', 'ngo'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be donor or ngo.' });
    }

    // Retrieve Clerk user and Supabase profile to handle Welcome Email safely
    let welcomeEmailSent = false;
    let userEmail = '';
    let firstName = '';
    let lastName = '';
    let signupCreatedAt = null;

    try {
      const user = await clerkClient.users.getUser(userId);
      welcomeEmailSent = user.publicMetadata?.welcomeEmailSent === true;
      userEmail = user.emailAddresses?.[0]?.emailAddress || '';
      firstName = user.firstName || '';
      lastName = user.lastName || '';
    } catch (clerkErr) {
      console.error('⚠️  Failed to fetch user from Clerk:', clerkErr.message);
    }

    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('created_at, email, first_name, last_name')
        .eq('clerk_id', userId)
        .single();
      
      if (profile) {
        if (!userEmail) userEmail = profile.email;
        if (!firstName) firstName = profile.first_name;
        if (!lastName) lastName = profile.last_name;
        signupCreatedAt = profile.created_at;
      }
    } catch (dbErr) {
      console.error('⚠️  Failed to fetch profile from Supabase:', dbErr.message);
    }

    // 1. Update Clerk public metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    // 2. Update Supabase profile role
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('clerk_id', userId);

    if (dbError) {
      console.error('❌  Supabase role update error:', dbError.message);
      // Even if database fails, Clerk is source of truth. We will try to sync later.
    }

    // Welcome email triggering logic (only for new registered users after implementation cutoff)
    if (!welcomeEmailSent && userEmail) {
      const CUTOFF_TIME = new Date('2026-06-11T15:00:00.000Z'); // Feature implementation date
      const profileDate = signupCreatedAt ? new Date(signupCreatedAt) : new Date();
      const isNewSignup = profileDate >= CUTOFF_TIME;

      if (isNewSignup) {
        try {
          await sendWelcomeEmail(userEmail, {
            firstName,
            lastName,
            role,
          });

          // Mark welcomeEmailSent as true in Clerk public metadata
          await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: { welcomeEmailSent: true },
          });
          console.log(`✉️  Sent Welcome Email to ${userEmail} and marked metadata welcomeEmailSent: true`);
        } catch (sendErr) {
          console.error('❌  Failed to send welcome email:', sendErr.message);
        }
      } else {
        console.log(`ℹ️  Welcome email skipped for ${userEmail} (registered before cutoff).`);
      }
    }

    return res.status(200).json({
      message: `Role successfully set to ${role}`,
      role,
    });
  } catch (err) {
    console.error('❌  updateUserRole error:', err.message);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
}

