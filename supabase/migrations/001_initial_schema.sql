-- ============================================
-- RePlate - Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- or via Supabase CLI: supabase db push
-- ============================================

-- =====================
-- 1. Enable Extensions
-- =====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- 2. Custom Types (Enums)
-- =====================
CREATE TYPE user_role AS ENUM ('donor', 'ngo', 'admin');
CREATE TYPE donation_status AS ENUM ('available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled');
CREATE TYPE urgency_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE food_category AS ENUM ('cooked_meals', 'raw_produce', 'bakery', 'dairy', 'beverages', 'packaged', 'fruits', 'grains', 'meat', 'other');
CREATE TYPE storage_condition AS ENUM ('room_temp', 'refrigerated', 'frozen', 'heated');
CREATE TYPE claim_status AS ENUM ('pending', 'confirmed', 'picked_up', 'delivered', 'cancelled');
CREATE TYPE notification_type AS ENUM ('donation_alert', 'claim_update', 'expiry_warning', 'system', 'achievement');

-- =====================
-- 3. Profiles Table
-- =====================
-- Synced with Clerk user data
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'donor',
  phone TEXT,
  organization_name TEXT,          -- For donors (restaurant name) or NGOs
  organization_type TEXT,          -- e.g., 'restaurant', 'hotel', 'grocery', 'ngo', 'shelter'
  organization_address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "expiry_alerts": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 4. Donations Table
-- =====================
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  description TEXT,
  category food_category DEFAULT 'other',
  quantity TEXT NOT NULL,                    -- e.g., "50 meals", "10 kg"
  weight_kg DECIMAL(10, 2),                 -- Weight in kilograms
  servings INTEGER,                         -- Estimated number of servings
  storage_condition storage_condition DEFAULT 'room_temp',
  prepared_at TIMESTAMPTZ,                  -- When the food was prepared
  expires_at TIMESTAMPTZ NOT NULL,          -- Expiry/best before time
  pickup_address TEXT NOT NULL,
  pickup_city TEXT,
  pickup_instructions TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  images TEXT[] DEFAULT '{}',               -- Array of image URLs
  status donation_status DEFAULT 'available',
  urgency urgency_level DEFAULT 'medium',
  
  -- AI Analysis Fields
  ai_freshness_score INTEGER,               -- 0-100
  ai_analysis JSONB,                        -- Full AI analysis result
  ai_category_suggestion food_category,     -- AI-suggested category
  
  -- Metadata
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  allergens TEXT[],                          -- e.g., ['nuts', 'dairy', 'gluten']
  special_instructions TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 5. Claims Table
-- =====================
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status claim_status DEFAULT 'pending',
  pickup_scheduled_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate claims
  UNIQUE(donation_id, ngo_id)
);

-- =====================
-- 6. Notifications Table
-- =====================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',                  -- Additional data (donation_id, claim_id, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 7. Impact Logs Table
-- =====================
-- Tracks environmental impact for each completed donation
CREATE TABLE impact_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  weight_kg DECIMAL(10, 2) NOT NULL,
  meals_saved INTEGER NOT NULL,
  co2_reduced_kg DECIMAL(10, 2) NOT NULL,   -- kg CO₂ equivalent
  water_saved_liters DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 8. Audit Log Table
-- =====================
-- Tracks all significant actions for admin oversight
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,                     -- e.g., 'donation.created', 'claim.confirmed'
  entity_type TEXT,                         -- e.g., 'donation', 'claim', 'profile'
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 9. Indexes
-- =====================
CREATE INDEX idx_profiles_clerk_id ON profiles(clerk_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_city ON profiles(city);

CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_urgency ON donations(urgency);
CREATE INDEX idx_donations_category ON donations(category);
CREATE INDEX idx_donations_expires_at ON donations(expires_at);
CREATE INDEX idx_donations_city ON donations(pickup_city);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);

CREATE INDEX idx_claims_donation_id ON claims(donation_id);
CREATE INDEX idx_claims_ngo_id ON claims(ngo_id);
CREATE INDEX idx_claims_status ON claims(status);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_impact_logs_donor_id ON impact_logs(donor_id);
CREATE INDEX idx_impact_logs_ngo_id ON impact_logs(ngo_id);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =====================
-- 10. Updated_at Trigger
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- 11. Row Level Security (RLS)
-- =====================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS Policies: Profiles
-- =====================

-- Everyone can read profiles (needed for donation listings)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Service role can insert (for sync from Clerk webhook)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- =====================
-- RLS Policies: Donations
-- =====================

-- Anyone authenticated can view available donations
CREATE POLICY "Authenticated users can view donations"
  ON donations FOR SELECT
  USING (true);

-- Donors can create donations
CREATE POLICY "Donors can create donations"
  ON donations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = donor_id
      AND profiles.clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Donors can update their own donations
CREATE POLICY "Donors can update own donations"
  ON donations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = donor_id
      AND profiles.clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Donors can delete their own donations
CREATE POLICY "Donors can delete own donations"
  ON donations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = donor_id
      AND profiles.clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- =====================
-- RLS Policies: Claims
-- =====================

-- Users can view claims related to their donations or their own claims
CREATE POLICY "Users can view relevant claims"
  ON claims FOR SELECT
  USING (true);

-- NGOs can create claims
CREATE POLICY "NGOs can create claims"
  ON claims FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = ngo_id
      AND profiles.clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND profiles.role = 'ngo'
    )
  );

-- Participants can update claims
CREATE POLICY "Participants can update claims"
  ON claims FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND (profiles.id = ngo_id OR profiles.id IN (
        SELECT donor_id FROM donations WHERE donations.id = claims.donation_id
      ))
    )
  );

-- =====================
-- RLS Policies: Notifications
-- =====================

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_id
      AND profiles.clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_id
      AND profiles.clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =====================
-- RLS Policies: Impact Logs
-- =====================

-- Everyone can view impact logs (public data)
CREATE POLICY "Impact logs are viewable by everyone"
  ON impact_logs FOR SELECT
  USING (true);

-- Service role can insert impact logs
CREATE POLICY "Service role can insert impact logs"
  ON impact_logs FOR INSERT
  WITH CHECK (true);

-- =====================
-- RLS Policies: Audit Logs
-- =====================

-- Only admins can view audit logs (handled by backend service role)
CREATE POLICY "Service role can manage audit logs"
  ON audit_logs FOR ALL
  USING (true);

-- =====================
-- 12. Supabase Storage Bucket
-- =====================
-- Run this in Supabase Dashboard > Storage, or via API:
--
-- Create a public bucket called 'donation-images'
-- Set max file size to 5MB
-- Allow file types: image/jpeg, image/png, image/webp
--
-- Storage Policies (set in Dashboard > Storage > Policies):
--
-- SELECT (Download): Allow public access
--   Policy: true
--
-- INSERT (Upload): Allow authenticated users
--   Policy: auth.role() = 'authenticated'
--
-- DELETE: Allow file owner or admin
--   Policy: auth.uid() = owner OR
--           EXISTS (SELECT 1 FROM profiles WHERE clerk_id = auth.uid() AND role = 'admin')

-- =====================
-- 13. Database Functions
-- =====================

-- Function: Get platform-wide impact statistics
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_donations', (SELECT COUNT(*) FROM donations),
    'active_donations', (SELECT COUNT(*) FROM donations WHERE status = 'available'),
    'total_meals_saved', (SELECT COALESCE(SUM(meals_saved), 0) FROM impact_logs),
    'total_co2_reduced', (SELECT COALESCE(SUM(co2_reduced_kg), 0) FROM impact_logs),
    'total_weight_saved', (SELECT COALESCE(SUM(weight_kg), 0) FROM impact_logs),
    'total_donors', (SELECT COUNT(*) FROM profiles WHERE role = 'donor' AND is_active = true),
    'total_ngos', (SELECT COUNT(*) FROM profiles WHERE role = 'ngo' AND is_active = true),
    'total_claims_completed', (SELECT COUNT(*) FROM claims WHERE status = 'delivered')
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user-specific impact
CREATE OR REPLACE FUNCTION get_user_impact(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_donations', (SELECT COUNT(*) FROM donations WHERE donor_id = p_user_id),
    'active_donations', (SELECT COUNT(*) FROM donations WHERE donor_id = p_user_id AND status = 'available'),
    'meals_saved', (SELECT COALESCE(SUM(meals_saved), 0) FROM impact_logs WHERE donor_id = p_user_id),
    'co2_reduced', (SELECT COALESCE(SUM(co2_reduced_kg), 0) FROM impact_logs WHERE donor_id = p_user_id),
    'weight_saved', (SELECT COALESCE(SUM(weight_kg), 0) FROM impact_logs WHERE donor_id = p_user_id),
    'claims_received', (
      SELECT COUNT(*) FROM claims
      JOIN donations ON claims.donation_id = donations.id
      WHERE donations.donor_id = p_user_id AND claims.status = 'delivered'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Auto-expire donations past their expiry date
CREATE OR REPLACE FUNCTION expire_old_donations()
RETURNS void AS $$
BEGIN
  UPDATE donations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'available'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
