import { Webhook } from 'svix';
import { supabaseAdmin } from '../config/supabase.js';

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
