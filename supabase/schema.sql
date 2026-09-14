-- ===================================================
-- IPL Auction Arena — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ===================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================
-- 1. Profiles (extends Supabase auth.users)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT, 
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'pro', 'business_manager', 'business_auctioneer', 'admin')),
  team_abbreviation TEXT,
  franchise_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================================================
-- 2. Teams / Franchises
-- ===================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  abbreviation TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT,
  logo_url TEXT,
  purse_remaining DECIMAL(10,2) DEFAULT 120.00,
  overseas_slots_used INT DEFAULT 0 CHECK (overseas_slots_used <= 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed IPL teams
INSERT INTO public.teams (abbreviation, name, city, primary_color, secondary_color) VALUES
  ('CSK', 'Chennai Super Kings', 'Chennai', '#ffc107', '#0055a4'),
  ('MI', 'Mumbai Indians', 'Mumbai', '#004ba0', '#ffd700'),
  ('RCB', 'Royal Challengers Bengaluru', 'Bengaluru', '#c62828', '#ffd700'),
  ('KKR', 'Kolkata Knight Riders', 'Kolkata', '#3a0078', '#ffd700'),
  ('DC', 'Delhi Capitals', 'Delhi', '#004ba0', '#c62828'),
  ('RR', 'Rajasthan Royals', 'Jaipur', '#254aa5', '#e91e90'),
  ('SRH', 'Sunrisers Hyderabad', 'Hyderabad', '#ff6f00', '#000000'),
  ('PBKS', 'Punjab Kings', 'Chandigarh', '#8b0000', '#ffd700'),
  ('GT', 'Gujarat Titans', 'Ahmedabad', '#0a1f44', '#00bcd4'),
  ('LSG', 'Lucknow Super Giants', 'Lucknow', '#d32f2f', '#ffd700')
ON CONFLICT (abbreviation) DO NOTHING;

-- ===================================================
-- 3. Players
-- ===================================================
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL,
  date_of_birth DATE,
  batting_hand TEXT DEFAULT 'Right',
  bowling_skill TEXT,
  primary_role TEXT NOT NULL CHECK (primary_role IN ('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper')),
  batting_position TEXT,
  origin TEXT NOT NULL CHECK (origin IN ('Indian', 'Overseas')),
  image_path TEXT,
  is_active BOOLEAN DEFAULT true,
  base_price DECIMAL(10,2),
  data_source TEXT DEFAULT 'scraped' CHECK (data_source IN ('scraped', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================
-- 4. Player Season Stats
-- ===================================================
CREATE TABLE IF NOT EXISTS public.player_season_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season_year INT NOT NULL,
  team_abbreviation TEXT,
  matches INT DEFAULT 0,
  innings INT DEFAULT 0,
  runs INT DEFAULT 0,
  balls_faced INT DEFAULT 0,
  batting_average DECIMAL(8,2),
  batting_strike_rate DECIMAL(8,2),
  fifties INT DEFAULT 0,
  centuries INT DEFAULT 0,
  fours INT DEFAULT 0,
  sixes INT DEFAULT 0,
  not_outs INT DEFAULT 0,
  highest_score INT DEFAULT 0,
  overs_bowled DECIMAL(8,1) DEFAULT 0,
  wickets INT DEFAULT 0,
  bowling_average DECIMAL(8,2),
  economy_rate DECIMAL(8,2),
  bowling_strike_rate DECIMAL(8,2),
  maidens INT DEFAULT 0,
  best_bowling TEXT,
  catches INT DEFAULT 0,
  stumpings INT DEFAULT 0,
  run_outs INT DEFAULT 0,
  UNIQUE(player_id, season_year)
);

-- ===================================================
-- 5. Subscriptions (Razorpay)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'expired', 'cancelled')),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================
-- 6. Feature Flags
-- ===================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  enabled_before_auction BOOLEAN DEFAULT false,
  enabled_during_auction BOOLEAN DEFAULT false,
  enabled_after_auction BOOLEAN DEFAULT false,
  min_role TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed feature flags
INSERT INTO public.feature_flags (key, label, enabled_before_auction, enabled_during_auction, enabled_after_auction, min_role) VALUES
  ('player_stats', 'Player Stats (Historical)', true, true, true, 'free'),
  ('ai_predictions', 'AI Predictions', true, false, true, 'pro'),
  ('player_comparison', 'Player Comparison', true, false, true, 'free'),
  ('team_vs_team', 'Team vs Team', true, false, true, 'pro'),
  ('live_auction_viewer', 'Live Auction Viewer', false, true, false, 'pro'),
  ('auctioneer_console', 'Auctioneer Console', false, true, false, 'business_auctioneer'),
  ('manager_bidding', 'Manager Bidding', false, true, false, 'business_manager'),
  ('digital_twin', 'Digital Twin Simulator', true, false, true, 'pro')
ON CONFLICT (key) DO NOTHING;

-- ===================================================
-- 7. Season Config
-- ===================================================
CREATE TABLE IF NOT EXISTS public.season_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_year INT UNIQUE NOT NULL,
  auction_phase TEXT NOT NULL DEFAULT 'before' CHECK (auction_phase IN ('before', 'during', 'after')),
  match_status TEXT NOT NULL DEFAULT 'upcoming' CHECK (match_status IN ('upcoming', 'in_progress', 'completed')),
  is_active BOOLEAN DEFAULT true,
  purse_limit DECIMAL(10,2) DEFAULT 120.00,
  overseas_cap INT DEFAULT 8,
  squad_size_min INT DEFAULT 18,
  squad_size_max INT DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.season_config (season_year, auction_phase, match_status, is_active)
VALUES (2027, 'before', 'upcoming', true)
ON CONFLICT (season_year) DO NOTHING;

-- ===================================================
-- 8. AI Predictions
-- ===================================================
CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  season_year INT NOT NULL,
  model_version TEXT NOT NULL,
  predicted_runs INT,
  predicted_batting_avg DECIMAL(8,2),
  predicted_batting_sr DECIMAL(8,2),
  predicted_wickets INT,
  predicted_economy DECIMAL(8,2),
  confidence DECIMAL(5,2),
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, season_year, model_version)
);

-- ===================================================
-- 9. Comparison History
-- ===================================================
CREATE TABLE IF NOT EXISTS public.comparison_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  player_ids UUID[] NOT NULL,
  ai_insights JSONB,
  ai_verdict TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================
-- RLS Policies
-- ===================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_history ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admin can read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Public read for players, teams, feature_flags, season_config
CREATE POLICY "Anyone can read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can read stats" ON public.player_season_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can read teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Anyone can read feature flags" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Anyone can read season config" ON public.season_config FOR SELECT USING (true);
CREATE POLICY "Anyone can read predictions" ON public.ai_predictions FOR SELECT USING (true);

-- Subscriptions: users can read their own
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Comparison history: users can read and create their own
CREATE POLICY "Users can view own comparisons" ON public.comparison_history FOR SELECT USING (auth.uid() = user_id OR is_featured = true);
CREATE POLICY "Users can create comparisons" ON public.comparison_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================================================
-- 10. Password Reset Tokens (Custom Auth)
-- ===================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for reset tokens (Service Role only)
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
-- No public policies -> only accessible via service role in API route.
