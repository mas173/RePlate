import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkDonations() {
  const { data, error } = await supabase
    .from('donations')
    .select('id, food_name, ai_analysis, ai_freshness_score')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching donations:', error.message);
    return;
  }

  console.log('\n📊 Donations AI Analysis in Database:');
  for (const d of data || []) {
    console.log(`- ID: ${d.id} | Food: ${d.food_name}`);
    console.log(`  AI Freshness Score: ${d.ai_freshness_score}`);
    console.log(`  AI Analysis Type: ${typeof d.ai_analysis}`);
    console.log(`  AI Analysis Value:`, d.ai_analysis);
  }
}

checkDonations();
