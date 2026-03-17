'use client';

import { useState, useEffect } from 'react';
import { Zap, Filter, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { ValueBetCard } from '@/components/ui/ValueBetCard';
import { ValueBet, BetType } from '@/types/database';

const DEMO_VALUE_BETS: (ValueBet & { match?: any })[] = [
  {
    id: '1',
    match_id: 1,
    bet_type: 'home_win',
    calculated_prob: 0.55,
    bookmaker_odds: 2.10,
    implied_prob: 0.476,
    edge_percentage: 15.5,
    expected_value: 0.155,
    kelly_stake: 0.041,
    confidence: 'high',
    is_value: true,
    created_at: new Date().toISOString(),
    match: {
      id: 1,
      match_date: new Date(Date.now() + 86400000).toISOString(),
      home_team: { name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
      away_team: { name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
      league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    },
  },
  {
    id: '2',
    match_id: 2,
    bet_type: 'over_2_5',
    calculated_prob: 0.58,
    bookmaker_odds: 1.95,
    implied_prob: 0.513,
    edge_percentage: 13.1,
    expected_value: 0.131,
    kelly_stake: 0.034,
    confidence: 'high',
    is_value: true,
    created_at: new Date().toISOString(),
    match: {
      id: 2,
      match_date: new Date(Date.now() + 172800000).toISOString(),
      home_team: { name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
      away_team: { name: 'Newcastle', logo: 'https://media.api-sports.io/football/teams/34.png' },
      league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    },
  },
  {
    id: '3',
    match_id: 3,
    bet_type: 'btts_yes',
    calculated_prob: 0.62,
    bookmaker_odds: 1.80,
    implied_prob: 0.556,
    edge_percentage: 11.6,
    expected_value: 0.116,
    kelly_stake: 0.032,
    confidence: 'high',
    is_value: true,
    created_at: new Date().toISOString(),
    match: {
      id: 3,
      match_date: new Date(Date.now() + 259200000).toISOString(),
      home_team: { name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
      away_team: { name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png' },
      league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    },
  },
  {
    id: '4',
    match_id: 4,
    bet_type: 'away_win',
    calculated_prob: 0.38,
    bookmaker_odds: 3.20,
    implied_prob: 0.313,
    edge_percentage: 21.6,
    expected_value: 0.216,
    kelly_stake: 0.048,
    confidence: 'medium',
    is_value: true,
    created_at: new Date().toISOString(),
    match: {
      id: 4,
      match_date: new Date(Date.now() + 345600000).toISOString(),
      home_team: { name: 'Leeds United', logo: 'https://media.api-sports.io/football/teams/63.png' },
      away_team: { name: 'Sunderland', logo: 'https://media.api-sports.io/football/teams/71.png' },
      league: { name: 'Championship', logo: 'https://media.api-sports.io/football/leagues/40.png' },
    },
  },
  {
    id: '5',
    match_id: 5,
    bet_type: 'under_2_5',
    calculated_prob: 0.52,
    bookmaker_odds: 2.05,
    implied_prob: 0.488,
    edge_percentage: 6.6,
    expected_value: 0.066,
    kelly_stake: 0.018,
    confidence: 'medium',
    is_value: true,
    created_at: new Date().toISOString(),
    match: {
      id: 5,
      match_date: new Date(Date.now() + 432000000).toISOString(),
      home_team: { name: 'Norwich City', logo: 'https://media.api-sports.io/football/teams/68.png' },
      away_team: { name: 'West Brom', logo: 'https://media.api-sports.io/football/teams/60.png' },
      league: { name: 'Championship', logo: 'https://media.api-sports.io/football/leagues/40.png' },
    },
  },
  {
    id: '6',
    match_id: 6,
    bet_type: 'draw',
    calculated_prob: 0.32,
    bookmaker_odds: 3.60,
    implied_prob: 0.278,
    edge_percentage: 15.2,
    expected_value: 0.152,
    kelly_stake: 0.035,
    confidence: 'low',
    is_value: true,
    created_at: new Date().toISOString(),
    match: {
      id: 6,
      match_date: new Date(Date.now() + 518400000).toISOString(),
      home_team: { name: 'MK Dons', logo: 'https://media.api-sports.io/football/teams/1359.png' },
      away_team: { name: 'Bolton', logo: 'https://media.api-sports.io/football/teams/69.png' },
      league: { name: 'League One', logo: 'https://media.api-sports.io/football/leagues/41.png' },
    },
  },
];

const BET_TYPE_OPTIONS: { value: BetType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Markets' },
  { value: 'home_win', label: 'Home Win' },
  { value: 'draw', label: 'Draw' },
  { value: 'away_win', label: 'Away Win' },
  { value: 'over_2_5', label: 'Over 2.5' },
  { value: 'under_2_5', label: 'Under 2.5' },
  { value: 'btts_yes', label: 'BTTS Yes' },
  { value: 'btts_no', label: 'BTTS No' },
];

const CONFIDENCE_OPTIONS = [
  { value: 'all', label: 'All Confidence' },
  { value: 'high', label: 'High Only' },
  { value: 'medium', label: 'Medium+' },
];

export default function ValueBetsPage() {
  const [betTypeFilter, setBetTypeFilter] = useState<BetType | 'all'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [minEdge, setMinEdge] = useState<number>(5);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredBets = DEMO_VALUE_BETS.filter(bet => {
    if (betTypeFilter !== 'all' && bet.bet_type !== betTypeFilter) return false;
    if (confidenceFilter === 'high' && bet.confidence !== 'high') return false;
    if (confidenceFilter === 'medium' && bet.confidence === 'low') return false;
    if (bet.edge_percentage < minEdge) return false;
    return true;
  });

  const totalExpectedValue = filteredBets.reduce((sum, bet) => sum + bet.expected_value, 0);
  const avgEdge = filteredBets.length > 0 
    ? filteredBets.reduce((sum, bet) => sum + bet.edge_percentage, 0) / filteredBets.length 
    : 0;

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Zap className="w-8 h-8 text-[var(--accent-primary)]" />
          Value Bets
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Bets with positive expected value based on our probability model
        </p>
      </div>

      {/* Info Banner */}
      <div className="card p-4 mb-8 border-[var(--accent-secondary)]/30 bg-[var(--accent-secondary)]/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--accent-secondary)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[var(--text-secondary)]">
              <strong className="text-white">What is a value bet?</strong> A value bet occurs when our calculated probability 
              is higher than the implied probability from bookmaker odds. The <span className="text-[var(--accent-primary)]">edge percentage</span> shows 
              how much value we believe exists in the bet.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-1">Value Bets Found</p>
          <p className="text-3xl font-display font-bold text-[var(--accent-primary)]">{filteredBets.length}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-1">Average Edge</p>
          <p className="text-3xl font-display font-bold text-white">{avgEdge.toFixed(1)}%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-1">Total Expected Value</p>
          <p className="text-3xl font-display font-bold text-[var(--accent-secondary)]">
            +{(totalExpectedValue * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-white">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Bet Type Filter */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2">Market Type</label>
            <select
              value={betTypeFilter}
              onChange={(e) => setBetTypeFilter(e.target.value as BetType | 'all')}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            >
              {BET_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Confidence Filter */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2">Confidence Level</label>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            >
              {CONFIDENCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Min Edge Filter */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2">
              Minimum Edge: <span className="text-[var(--accent-primary)]">{minEdge}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={minEdge}
              onChange={(e) => setMinEdge(Number(e.target.value))}
              className="w-full accent-[var(--accent-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Value Bets Grid */}
      {filteredBets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredBets
            .sort((a, b) => b.edge_percentage - a.edge_percentage)
            .map((bet) => (
              <ValueBetCard key={bet.id} valueBet={bet} />
            ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-white mb-2">No Value Bets Found</h3>
          <p className="text-[var(--text-secondary)]">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-12 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-muted)] text-center">
          <strong>Disclaimer:</strong> These predictions are based on statistical models and historical data. 
          Past performance does not guarantee future results. Always gamble responsibly.
        </p>
      </div>
    </div>
  );
}
