-- FootyEdge Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leagues table
CREATE TABLE IF NOT EXISTS leagues (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  logo TEXT,
  flag TEXT,
  season INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10),
  country VARCHAR(100),
  logo TEXT,
  founded INTEGER,
  venue_name VARCHAR(255),
  venue_city VARCHAR(100),
  venue_capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY,
  league_id INTEGER REFERENCES leagues(id),
  season INTEGER NOT NULL,
  round VARCHAR(100),
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  match_date TIMESTAMPTZ NOT NULL,
  match_timestamp BIGINT NOT NULL,
  venue VARCHAR(255),
  city VARCHAR(100),
  status VARCHAR(10) DEFAULT 'NS',
  status_elapsed INTEGER,
  home_score INTEGER,
  away_score INTEGER,
  home_halftime_score INTEGER,
  away_halftime_score INTEGER,
  home_fulltime_score INTEGER,
  away_fulltime_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team statistics table
CREATE TABLE IF NOT EXISTS team_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id INTEGER REFERENCES teams(id),
  league_id INTEGER REFERENCES leagues(id),
  season INTEGER NOT NULL,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  home_wins INTEGER DEFAULT 0,
  home_draws INTEGER DEFAULT 0,
  home_losses INTEGER DEFAULT 0,
  home_goals_for INTEGER DEFAULT 0,
  home_goals_against INTEGER DEFAULT 0,
  away_wins INTEGER DEFAULT 0,
  away_draws INTEGER DEFAULT 0,
  away_losses INTEGER DEFAULT 0,
  away_goals_for INTEGER DEFAULT 0,
  away_goals_against INTEGER DEFAULT 0,
  form VARCHAR(10),
  clean_sheets INTEGER DEFAULT 0,
  failed_to_score INTEGER DEFAULT 0,
  avg_goals_scored DECIMAL(4,2) DEFAULT 0,
  avg_goals_conceded DECIMAL(4,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, league_id, season)
);

-- Match predictions table
CREATE TABLE IF NOT EXISTS match_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id INTEGER REFERENCES matches(id) UNIQUE,
  home_win_prob DECIMAL(5,4) NOT NULL,
  draw_prob DECIMAL(5,4) NOT NULL,
  away_win_prob DECIMAL(5,4) NOT NULL,
  over_2_5_prob DECIMAL(5,4) NOT NULL,
  under_2_5_prob DECIMAL(5,4) NOT NULL,
  btts_yes_prob DECIMAL(5,4) NOT NULL,
  btts_no_prob DECIMAL(5,4) NOT NULL,
  predicted_home_goals DECIMAL(4,2) NOT NULL,
  predicted_away_goals DECIMAL(4,2) NOT NULL,
  confidence_score DECIMAL(5,4) NOT NULL,
  model_version VARCHAR(50) DEFAULT 'v1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Value bets table
CREATE TABLE IF NOT EXISTS value_bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id INTEGER REFERENCES matches(id),
  bet_type VARCHAR(20) NOT NULL,
  calculated_prob DECIMAL(5,4) NOT NULL,
  bookmaker_odds DECIMAL(6,2) NOT NULL,
  implied_prob DECIMAL(5,4) NOT NULL,
  edge_percentage DECIMAL(6,2) NOT NULL,
  expected_value DECIMAL(6,4) NOT NULL,
  kelly_stake DECIMAL(5,4) NOT NULL,
  confidence VARCHAR(10) NOT NULL,
  is_value BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, bet_type)
);

-- Sync log table for tracking data updates
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  leagues_synced INTEGER DEFAULT 0,
  teams_synced INTEGER DEFAULT 0,
  matches_synced INTEGER DEFAULT 0,
  predictions_generated INTEGER DEFAULT 0,
  errors JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_league_id ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_home_team ON matches(home_team_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_team ON matches(away_team_id);
CREATE INDEX IF NOT EXISTS idx_team_stats_team_league ON team_stats(team_id, league_id);
CREATE INDEX IF NOT EXISTS idx_value_bets_match ON value_bets(match_id);
CREATE INDEX IF NOT EXISTS idx_value_bets_is_value ON value_bets(is_value);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_leagues_updated_at ON leagues;
CREATE TRIGGER update_leagues_updated_at
  BEFORE UPDATE ON leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_stats_updated_at ON team_stats;
CREATE TRIGGER update_team_stats_updated_at
  BEFORE UPDATE ON team_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_match_predictions_updated_at ON match_predictions;
CREATE TRIGGER update_match_predictions_updated_at
  BEFORE UPDATE ON match_predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Allow public read access on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access on matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access on team_stats" ON team_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access on match_predictions" ON match_predictions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on value_bets" ON value_bets FOR SELECT USING (true);

-- Service role has full access (for sync operations)
CREATE POLICY "Service role full access on leagues" ON leagues FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on teams" ON teams FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on matches" ON matches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on team_stats" ON team_stats FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on match_predictions" ON match_predictions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on value_bets" ON value_bets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on sync_logs" ON sync_logs FOR ALL USING (auth.role() = 'service_role');
