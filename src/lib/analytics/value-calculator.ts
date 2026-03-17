import { createServerClient } from '@/lib/supabase/client';
import { MatchPrediction, ValueBet, BetType } from '@/types/database';

/**
 * Value Bet Calculator
 * 
 * Identifies value bets by comparing our calculated probabilities
 * against bookmaker odds. A value bet exists when:
 * 
 * Edge = (Calculated Probability × Bookmaker Odds) - 1 > 0
 * 
 * Also calculates:
 * - Kelly Criterion stake sizing
 * - Expected Value (EV)
 * - Confidence levels
 */

export class ValueCalculator {
  private get supabase() {
    return createServerClient();
  }

  // Minimum edge required to consider a value bet (5%)
  private readonly MIN_EDGE = 0.05;
  
  // Kelly fraction (quarter Kelly for conservative betting)
  private readonly KELLY_FRACTION = 0.25;

  /**
   * Convert decimal odds to implied probability
   */
  oddsToImpliedProb(odds: number): number {
    return 1 / odds;
  }

  /**
   * Calculate edge percentage
   * Edge = (Our Probability × Odds) - 1
   */
  calculateEdge(calculatedProb: number, bookmakerOdds: number): number {
    return (calculatedProb * bookmakerOdds) - 1;
  }

  /**
   * Calculate Expected Value
   * EV = (Probability × (Odds - 1)) - (1 - Probability)
   */
  calculateEV(calculatedProb: number, bookmakerOdds: number): number {
    return (calculatedProb * (bookmakerOdds - 1)) - (1 - calculatedProb);
  }

  /**
   * Calculate Kelly Criterion stake
   * Kelly % = (bp - q) / b
   * where b = odds - 1, p = probability, q = 1 - p
   */
  calculateKellyStake(calculatedProb: number, bookmakerOdds: number): number {
    const b = bookmakerOdds - 1;
    const p = calculatedProb;
    const q = 1 - p;
    
    const kelly = (b * p - q) / b;
    
    // Apply Kelly fraction and clamp between 0 and 10%
    return Math.max(0, Math.min(0.1, kelly * this.KELLY_FRACTION));
  }

  /**
   * Determine confidence level based on edge and sample size
   */
  getConfidenceLevel(edge: number, confidenceScore: number): 'low' | 'medium' | 'high' {
    const combinedScore = edge * confidenceScore;
    
    if (combinedScore > 0.1) return 'high';
    if (combinedScore > 0.05) return 'medium';
    return 'low';
  }

  /**
   * Analyze a single bet type for value
   */
  analyzeBet(
    matchId: number,
    betType: BetType,
    calculatedProb: number,
    bookmakerOdds: number,
    confidenceScore: number
  ): Omit<ValueBet, 'id' | 'created_at'> {
    const impliedProb = this.oddsToImpliedProb(bookmakerOdds);
    const edge = this.calculateEdge(calculatedProb, bookmakerOdds);
    const ev = this.calculateEV(calculatedProb, bookmakerOdds);
    const kellyStake = this.calculateKellyStake(calculatedProb, bookmakerOdds);
    const confidence = this.getConfidenceLevel(edge, confidenceScore);
    const isValue = edge >= this.MIN_EDGE;

    return {
      match_id: matchId,
      bet_type: betType,
      calculated_prob: calculatedProb,
      bookmaker_odds: bookmakerOdds,
      implied_prob: impliedProb,
      edge_percentage: edge * 100, // Convert to percentage
      expected_value: ev,
      kelly_stake: kellyStake,
      confidence,
      is_value: isValue,
    };
  }

  /**
   * Calculate value bets for a match given prediction and odds
   */
  async calculateValueBets(
    matchId: number,
    prediction: MatchPrediction,
    odds: {
      homeWin: number;
      draw: number;
      awayWin: number;
      over25?: number;
      under25?: number;
      bttsYes?: number;
      bttsNo?: number;
    }
  ): Promise<ValueBet[]> {
    const valueBets: Omit<ValueBet, 'id' | 'created_at'>[] = [];

    // Analyze 1X2 market
    valueBets.push(
      this.analyzeBet(matchId, 'home_win', prediction.home_win_prob, odds.homeWin, prediction.confidence_score),
      this.analyzeBet(matchId, 'draw', prediction.draw_prob, odds.draw, prediction.confidence_score),
      this.analyzeBet(matchId, 'away_win', prediction.away_win_prob, odds.awayWin, prediction.confidence_score)
    );

    // Analyze Over/Under 2.5 if odds available
    if (odds.over25 && odds.under25) {
      valueBets.push(
        this.analyzeBet(matchId, 'over_2_5', prediction.over_2_5_prob, odds.over25, prediction.confidence_score),
        this.analyzeBet(matchId, 'under_2_5', prediction.under_2_5_prob, odds.under25, prediction.confidence_score)
      );
    }

    // Analyze BTTS if odds available
    if (odds.bttsYes && odds.bttsNo) {
      valueBets.push(
        this.analyzeBet(matchId, 'btts_yes', prediction.btts_yes_prob, odds.bttsYes, prediction.confidence_score),
        this.analyzeBet(matchId, 'btts_no', prediction.btts_no_prob, odds.bttsNo, prediction.confidence_score)
      );
    }

    // Save to database
    const { data, error } = await this.supabase
      .from('value_bets')
      .upsert(valueBets, { onConflict: 'match_id,bet_type' })
      .select();

    if (error) {
      console.error('Failed to save value bets:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get all value bets (edge > minimum threshold)
   */
  async getValueBets(minEdge: number = this.MIN_EDGE * 100): Promise<ValueBet[]> {
    const { data, error } = await this.supabase
      .from('value_bets')
      .select(`
        *,
        match:matches(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          league:leagues(*)
        )
      `)
      .eq('is_value', true)
      .gte('edge_percentage', minEdge)
      .order('edge_percentage', { ascending: false });

    if (error) {
      console.error('Failed to fetch value bets:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get value bets for upcoming matches only
   */
  async getUpcomingValueBets(): Promise<ValueBet[]> {
    const { data, error } = await this.supabase
      .from('value_bets')
      .select(`
        *,
        match:matches!inner(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*),
          league:leagues(*)
        )
      `)
      .eq('is_value', true)
      .eq('match.status', 'NS')
      .gte('match.match_date', new Date().toISOString())
      .order('edge_percentage', { ascending: false });

    if (error) {
      console.error('Failed to fetch upcoming value bets:', error);
      return [];
    }

    return data || [];
  }
}

export const valueCalculator = new ValueCalculator();
