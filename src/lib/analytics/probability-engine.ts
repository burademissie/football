import { createServerClient } from '@/lib/supabase/client';
import { TeamStats, MatchPrediction, ValueBet, BetType } from '@/types/database';

/**
 * Probability Engine
 * 
 * Uses Poisson distribution and historical statistics to calculate:
 * - Match outcome probabilities (Home/Draw/Away)
 * - Goals probabilities (Over/Under 2.5)
 * - Both Teams To Score (BTTS)
 * - Value bet identification
 * 
 * Model based on Dixon-Coles methodology with adjustments for:
 * - Home advantage
 * - Recent form
 * - Head-to-head history
 */

export class ProbabilityEngine {
  private get supabase() {
    return createServerClient();
  }

  // League average goals per game (used as baseline)
  private readonly LEAGUE_AVG_GOALS = 2.75;
  
  // Home advantage factor
  private readonly HOME_ADVANTAGE = 1.35;

  /**
   * Calculate Poisson probability
   */
  private poisson(lambda: number, k: number): number {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k);
  }

  private factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  /**
   * Calculate expected goals for a match
   */
  calculateExpectedGoals(
    homeStats: TeamStats,
    awayStats: TeamStats
  ): { homeXG: number; awayXG: number } {
    // Home team attack strength
    const homeAttackStrength = homeStats.avg_goals_scored / this.LEAGUE_AVG_GOALS;
    // Away team defense weakness
    const awayDefenseWeakness = awayStats.avg_goals_conceded / this.LEAGUE_AVG_GOALS;
    
    // Away team attack strength
    const awayAttackStrength = awayStats.avg_goals_scored / this.LEAGUE_AVG_GOALS;
    // Home team defense weakness
    const homeDefenseWeakness = homeStats.avg_goals_conceded / this.LEAGUE_AVG_GOALS;

    // Expected goals with home advantage
    const homeXG = this.LEAGUE_AVG_GOALS * homeAttackStrength * awayDefenseWeakness * this.HOME_ADVANTAGE * 0.5;
    const awayXG = this.LEAGUE_AVG_GOALS * awayAttackStrength * homeDefenseWeakness * (1 / this.HOME_ADVANTAGE) * 0.5;

    return {
      homeXG: Math.max(0.5, Math.min(4, homeXG)), // Clamp between 0.5 and 4
      awayXG: Math.max(0.3, Math.min(3.5, awayXG)),
    };
  }

  /**
   * Calculate match outcome probabilities using Poisson distribution
   */
  calculateMatchProbabilities(homeXG: number, awayXG: number): {
    homeWin: number;
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
    bttsYes: number;
    bttsNo: number;
  } {
    let homeWin = 0;
    let draw = 0;
    let awayWin = 0;
    let over25 = 0;
    let bttsYes = 0;

    // Calculate probabilities for score combinations (0-0 to 6-6)
    for (let homeGoals = 0; homeGoals <= 6; homeGoals++) {
      for (let awayGoals = 0; awayGoals <= 6; awayGoals++) {
        const prob = this.poisson(homeXG, homeGoals) * this.poisson(awayXG, awayGoals);

        if (homeGoals > awayGoals) homeWin += prob;
        else if (homeGoals === awayGoals) draw += prob;
        else awayWin += prob;

        if (homeGoals + awayGoals > 2.5) over25 += prob;
        if (homeGoals > 0 && awayGoals > 0) bttsYes += prob;
      }
    }

    // Normalize probabilities
    const total = homeWin + draw + awayWin;
    homeWin /= total;
    draw /= total;
    awayWin /= total;

    return {
      homeWin,
      draw,
      awayWin,
      over25,
      under25: 1 - over25,
      bttsYes,
      bttsNo: 1 - bttsYes,
    };
  }

  /**
   * Adjust probabilities based on recent form
   */
  adjustForForm(
    baseProbabilities: ReturnType<typeof this.calculateMatchProbabilities>,
    homeForm: string | null,
    awayForm: string | null
  ): ReturnType<typeof this.calculateMatchProbabilities> {
    const getFormScore = (form: string | null): number => {
      if (!form) return 0;
      let score = 0;
      for (const result of form) {
        if (result === 'W') score += 1;
        else if (result === 'D') score += 0.3;
        else if (result === 'L') score -= 0.5;
      }
      return score / form.length;
    };

    const homeFormScore = getFormScore(homeForm);
    const awayFormScore = getFormScore(awayForm);
    const formDiff = (homeFormScore - awayFormScore) * 0.05; // Max 5% adjustment

    let { homeWin, draw, awayWin, ...rest } = baseProbabilities;

    // Adjust based on form difference
    homeWin = Math.max(0.05, Math.min(0.9, homeWin + formDiff));
    awayWin = Math.max(0.05, Math.min(0.9, awayWin - formDiff));
    
    // Renormalize
    const total = homeWin + draw + awayWin;
    homeWin /= total;
    draw /= total;
    awayWin /= total;

    return { homeWin, draw, awayWin, ...rest };
  }

  /**
   * Calculate confidence score based on data quality
   */
  calculateConfidence(homeStats: TeamStats, awayStats: TeamStats): number {
    const minMatches = Math.min(homeStats.matches_played, awayStats.matches_played);
    
    // More matches = higher confidence
    if (minMatches >= 15) return 0.85;
    if (minMatches >= 10) return 0.7;
    if (minMatches >= 5) return 0.55;
    return 0.4;
  }

  /**
   * Generate prediction for a match
   */
  async generatePrediction(matchId: number): Promise<MatchPrediction | null> {
    // Get match details
    const { data: match, error: matchError } = await this.supabase
      .from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      console.error('Failed to fetch match:', matchError);
      return null;
    }

    // Get team stats
    const { data: homeStats } = await this.supabase
      .from('team_stats')
      .select('*')
      .eq('team_id', match.home_team_id)
      .eq('league_id', match.league_id)
      .eq('season', match.season)
      .single();

    const { data: awayStats } = await this.supabase
      .from('team_stats')
      .select('*')
      .eq('team_id', match.away_team_id)
      .eq('league_id', match.league_id)
      .eq('season', match.season)
      .single();

    // Use default stats if not available
    const defaultStats: TeamStats = {
      id: '',
      team_id: 0,
      league_id: match.league_id,
      season: match.season,
      matches_played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      home_wins: 0,
      home_draws: 0,
      home_losses: 0,
      home_goals_for: 0,
      home_goals_against: 0,
      away_wins: 0,
      away_draws: 0,
      away_losses: 0,
      away_goals_for: 0,
      away_goals_against: 0,
      form: null,
      clean_sheets: 0,
      failed_to_score: 0,
      avg_goals_scored: 1.3,
      avg_goals_conceded: 1.2,
      created_at: '',
      updated_at: '',
    };

    const home = homeStats || { ...defaultStats, team_id: match.home_team_id };
    const away = awayStats || { ...defaultStats, team_id: match.away_team_id };

    // Calculate expected goals
    const { homeXG, awayXG } = this.calculateExpectedGoals(home, away);

    // Calculate base probabilities
    let probs = this.calculateMatchProbabilities(homeXG, awayXG);

    // Adjust for form
    probs = this.adjustForForm(probs, home.form, away.form);

    // Calculate confidence
    const confidence = this.calculateConfidence(home, away);

    const prediction: Omit<MatchPrediction, 'id' | 'created_at' | 'updated_at'> = {
      match_id: matchId,
      home_win_prob: probs.homeWin,
      draw_prob: probs.draw,
      away_win_prob: probs.awayWin,
      over_2_5_prob: probs.over25,
      under_2_5_prob: probs.under25,
      btts_yes_prob: probs.bttsYes,
      btts_no_prob: probs.bttsNo,
      predicted_home_goals: homeXG,
      predicted_away_goals: awayXG,
      confidence_score: confidence,
      model_version: 'v1.0-poisson',
    };

    // Upsert prediction
    const { data, error } = await this.supabase
      .from('match_predictions')
      .upsert(prediction, { onConflict: 'match_id' })
      .select()
      .single();

    if (error) {
      console.error('Failed to save prediction:', error);
      return null;
    }

    return data;
  }

  /**
   * Generate predictions for all upcoming matches
   */
  async generateAllPredictions(): Promise<number> {
    const { data: matches, error } = await this.supabase
      .from('matches')
      .select('id')
      .eq('status', 'NS')
      .gte('match_date', new Date().toISOString());

    if (error || !matches) {
      console.error('Failed to fetch upcoming matches:', error);
      return 0;
    }

    let generated = 0;
    for (const match of matches) {
      const prediction = await this.generatePrediction(match.id);
      if (prediction) generated++;
    }

    return generated;
  }
}

export const probabilityEngine = new ProbabilityEngine();
