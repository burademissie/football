// Database types for Supabase tables

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string | null;
  flag: string | null;
  season: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  code: string | null;
  country: string | null;
  logo: string | null;
  founded: number | null;
  venue_name: string | null;
  venue_city: string | null;
  venue_capacity: number | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  league_id: number;
  season: number;
  round: string | null;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  match_timestamp: number;
  venue: string | null;
  city: string | null;
  status: MatchStatus;
  status_elapsed: number | null;
  home_score: number | null;
  away_score: number | null;
  home_halftime_score: number | null;
  away_halftime_score: number | null;
  home_fulltime_score: number | null;
  away_fulltime_score: number | null;
  created_at: string;
  updated_at: string;
}

export type MatchStatus = 
  | 'TBD'      // Time To Be Defined
  | 'NS'       // Not Started
  | '1H'       // First Half
  | 'HT'       // Halftime
  | '2H'       // Second Half
  | 'ET'       // Extra Time
  | 'P'        // Penalty In Progress
  | 'FT'       // Match Finished
  | 'AET'      // Match Finished After Extra Time
  | 'PEN'      // Match Finished After Penalty
  | 'BT'       // Break Time
  | 'SUSP'     // Match Suspended
  | 'INT'      // Match Interrupted
  | 'PST'      // Match Postponed
  | 'CANC'     // Match Cancelled
  | 'ABD'      // Match Abandoned
  | 'AWD'      // Technical Loss
  | 'WO'       // WalkOver
  | 'LIVE';    // In Progress

export interface TeamStats {
  id: string;
  team_id: number;
  league_id: number;
  season: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  home_wins: number;
  home_draws: number;
  home_losses: number;
  home_goals_for: number;
  home_goals_against: number;
  away_wins: number;
  away_draws: number;
  away_losses: number;
  away_goals_for: number;
  away_goals_against: number;
  form: string | null; // Last 5 results e.g., "WWDLW"
  clean_sheets: number;
  failed_to_score: number;
  avg_goals_scored: number;
  avg_goals_conceded: number;
  created_at: string;
  updated_at: string;
}

export interface MatchPrediction {
  id: string;
  match_id: number;
  home_win_prob: number;
  draw_prob: number;
  away_win_prob: number;
  over_2_5_prob: number;
  under_2_5_prob: number;
  btts_yes_prob: number;
  btts_no_prob: number;
  predicted_home_goals: number;
  predicted_away_goals: number;
  confidence_score: number;
  model_version: string;
  created_at: string;
  updated_at: string;
}

export interface ValueBet {
  id: string;
  match_id: number;
  bet_type: BetType;
  calculated_prob: number;
  bookmaker_odds: number;
  implied_prob: number;
  edge_percentage: number;
  expected_value: number;
  kelly_stake: number;
  confidence: 'low' | 'medium' | 'high';
  is_value: boolean;
  created_at: string;
}

export type BetType = 
  | 'home_win'
  | 'draw'
  | 'away_win'
  | 'over_2_5'
  | 'under_2_5'
  | 'btts_yes'
  | 'btts_no';

// Joined types for UI
export interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
  league: League;
  prediction?: MatchPrediction;
  value_bets?: ValueBet[];
}

export interface LeagueWithMatches extends League {
  matches: MatchWithTeams[];
}

// API Response types
export interface SyncResult {
  success: boolean;
  message: string;
  synced: {
    leagues: number;
    teams: number;
    matches: number;
  };
  errors?: string[];
  warnings?: string[];
}
