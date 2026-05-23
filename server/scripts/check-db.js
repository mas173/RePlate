import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching profiles:', error.message);
    return;
  }

  console.log('\n📊 Profiles currently in Supabase Database:');
  console.table(
    data.map(p => ({
      clerk_id: p.clerk_id,
      email: p.email,
      name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || '(No Name)',
      role: p.role || 'donor',
      created_at: p.created_at || p.updated_at
    }))
  );
}

checkProfiles();
