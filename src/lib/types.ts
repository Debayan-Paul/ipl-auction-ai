/* ============================================
   IPL Auction — TypeScript Type Definitions
   ============================================ */

import { TeamAbbreviation } from './team-themes';

// === User & Auth ===
export type UserRole = 'free' | 'pro' | 'business_manager' | 'business_auctioneer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  team_abbreviation: TeamAbbreviation | null;
  franchise_id: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'pro' | 'business';
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
}

// === Players ===
export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
export type BattingPosition = 'Opener' | 'Middle-Order' | 'Finisher' | 'N/A';
export type PlayerOrigin = 'Indian' | 'Overseas';

export interface Player {
  id: string;
  legacy_id: number | null;
  name: string;
  slug: string;
  dob: string | null;
  batting_hand: string | null;
  bowling_skill: string | null;
  country: string;
  origin: PlayerOrigin;
  primary_role: PlayerRole;
  batting_position: BattingPosition;
  image_path: string | null;
  is_active: boolean;
  is_locked: boolean;
  locked_by_franchise_id: string | null;
}

export interface PlayerSeasonStats {
  id: string;
  player_id: string;
  season_year: number;
  matches: number;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  batting_avg: number;
  batting_sr: number;
  wickets: number;
  balls_bowled: number;
  runs_conceded: number;
  bowling_avg: number;
  bowling_sr: number;
  economy: number;
  catches: number;
  stumpings: number;
  run_outs: number;
  data_source: 'scraped' | 'manual' | 'computed';
}

export interface PlayerPrediction {
  id: string;
  player_id: string;
  prediction_year: number;
  model_version: string;
  franchise_id: string | null;
  predicted_runs: number;
  predicted_wickets: number;
  predicted_batting_avg: number;
  predicted_bowling_avg: number;
  predicted_sr: number;
  confidence_score: number;
  feature_importances: Record<string, number>;
  generated_at: string;
}

// === Comparison ===
export interface Comparison {
  id: string;
  user_id: string;
  player_ids: string[];
  gemini_pros_cons: GeminiPlayerInsight[] | null;
  gemini_verdict: string | null;
  gemini_scores: number[] | null;
  is_featured: boolean;
  view_count: number;
  created_at: string;
}

export interface GeminiPlayerInsight {
  player_id: string;
  player_name: string;
  pros: string[];
  cons: string[];
  score: number;
}

// === Teams ===
export interface Franchise {
  id: string;
  name: string;
  short_code: TeamAbbreviation;
  logo_url: string | null;
  theme_colors: {
    primary: string;
    secondary: string;
    accent: string;
    highlight: string;
  };
  budget_cr: number;
  is_verified: boolean;
  created_at: string;
}

export interface TeamSquad {
  id: string;
  franchise_id: string;
  player_id: string;
  season_year: number;
  purchase_price_cr: number;
  acquisition: 'auction' | 'retention' | 'trade';
  is_playing_xi: boolean;
  xi_role: string | null;
  xi_position: number | null;
  player?: Player;
}

// === Auction ===
export type AuctionStatus = 'waiting' | 'live' | 'paused' | 'completed';
export type LotStatus = 'upcoming' | 'bidding' | 'sold' | 'unsold';

export interface AuctionRoom {
  id: string;
  auctioneer_id: string;
  room_name: string;
  access_token: string;
  viewer_token: string;
  status: AuctionStatus;
  team_budgets: Record<string, number>;
  rules: AuctionRules;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface AuctionRules {
  purse_limit_cr: number;
  max_overseas: number;
  max_squad_size: number;
  max_retention: number;
  bid_increment_cr: number;
  bid_timer_seconds: number;
}

export interface AuctionLot {
  id: string;
  room_id: string;
  player_id: string;
  base_price_cr: number;
  current_bid_cr: number;
  current_bidder_id: string | null;
  current_bidder_name: string | null;
  current_bidder_team: string | null;
  status: LotStatus;
  sold_to_franchise_id: string | null;
  sold_price_cr: number | null;
  lot_order: number;
  bid_started_at: string | null;
  bid_history: BidEntry[];
  player?: Player;
}

export interface BidEntry {
  franchise_id: string;
  team_name: string;
  amount: number;
  timestamp: string;
}

// === Admin ===
export type AuctionPhase = 'before' | 'during' | 'after';
export type MatchStatus = 'upcoming' | 'in_progress' | 'completed';

export interface FeatureFlag {
  id: string;
  feature_key: string;
  enabled: boolean;
  auction_phase: AuctionPhase;
  description: string;
  updated_at: string;
}

export interface SeasonControl {
  id: string;
  season_year: number;
  match_status: MatchStatus;
  auction_status: 'not_started' | 'scheduled' | 'in_progress' | 'completed';
  ai_predictions_enabled: boolean;
  global_model_updated: boolean;
  controlled_by: string;
  updated_at: string;
}

// === Misc ===
export interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  icon?: string;
  color?: string;
}

export interface ChartDataPoint {
  year: number;
  value: number;
  label?: string;
}
