/**
 * scripts/backfill-users.js
 *
 * One-time script to sync all existing Clerk users into the
 * Supabase profiles table.
 *
 * Usage:  cd server && npm run backfill
 */

import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/express';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function backfill() {
  console.log('\n🔄  RePlate — Clerk → Supabase user backfill\n');

  let offset = 0;
  const limit = 100;
  let totalSynced = 0;

  while (true) {
    const { data: users, totalCount } = await clerkClient.users.getUserList({ limit, offset });
    if (!users || users.length === 0) break;

    console.log(`📋  Processing ${users.length} users (offset ${offset} of ${totalCount})…`);

    for (const user of users) {
      const email     = user.emailAddresses?.[0]?.emailAddress ?? '';
      const firstName = user.firstName ?? '';
      const lastName  = user.lastName  ?? '';

      const { error } = await supabase
        .from('profiles')
        .upsert(
          { clerk_id: user.id, email, first_name: firstName, last_name: lastName, updated_at: new Date().toISOString() },
          { onConflict: 'clerk_id' }
        );

      if (error) {
        console.error(`  ❌  ${user.id} (${email}):`, error.message);
      } else {
        console.log(`  ✅  ${user.id} — ${email || '(no email)'}`);
        totalSynced++;
      }
    }

    offset += limit;
    if (offset >= totalCount) break;
  }

  console.log(`\n📊  Done — synced: ${totalSynced}\n`);
}

backfill().catch(err => { console.error('Fatal:', err); process.exit(1); });
