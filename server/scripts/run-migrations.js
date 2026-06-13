import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runMigrations() {
  const connectionString = `postgresql://postgres:${encodeURIComponent(process.env.DB_PASS)}@db.moypewilzosjudwdzbhf.supabase.co:5432/postgres`;
  
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    console.log('Executing Profiles Table updates...');
    await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS fssai_number TEXT,
      ADD COLUMN IF NOT EXISTS verification_document_url TEXT,
      ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified';
    `);
    console.log('Profiles table updated successfully.');

    console.log('Creating saved_addresses table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        address_line TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pincode TEXT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('saved_addresses table created/verified successfully.');

    console.log('Setting up RLS and Policies for saved_addresses...');
    await client.query(`
      ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;
    `);

    // Drop policy if it exists to avoid errors, then create it
    await client.query(`
      DROP POLICY IF EXISTS "Users can manage their own saved addresses" ON saved_addresses;
    `);
    
    await client.query(`
      CREATE POLICY "Users can manage their own saved addresses"
        ON saved_addresses FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = saved_addresses.profile_id
            AND profiles.clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
          )
        );
    `);
    console.log('RLS and Policies applied successfully.');

    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    await client.end();
  }
}

runMigrations();
