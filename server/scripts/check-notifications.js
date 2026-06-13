import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching notifications:', error.message);
    return;
  }

  console.log('\n📊 Notifications in Database:');
  for (const n of data || []) {
    console.log(`- ID: ${n.id}`);
    console.log(`  Type: ${n.type}`);
    console.log(`  Title: ${n.title}`);
    console.log(`  Data Type: ${typeof n.data}`);
    console.log(`  Data Value:`, n.data);
  }
}

checkNotifications();
