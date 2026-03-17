'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Zap, 
  TrendingUp, 
  Trophy,
  ArrowRight,
  BarChart3,
  Target,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { StatsCard } from '@/components/ui/StatsCard';
import { MatchCard } from '@/components/ui/MatchCard';
import { ValueBetCard } from '@/components/ui/ValueBetCard';
import { MatchWithTeams, ValueBet } from '@/types/database';

// Demo data for showcase
const DEMO_MATCHES: MatchWithTeams[] = [
  {
    id: 1,
    league_id: 39,
    season: 2025,
    round: 'Regular Season - 30',
    home_team_id: 33,
    away_team_id: 34,
    match_date: new Date(Date.now() + 86400000).toISOString(),
    match_timestamp: Math.floor(Date.now() / 1000) + 86400,
    venue: 'Old Trafford',
    city: 'Manchester',
    status: 'NS',
    status_elapsed: null,
    home_score: null,
    away_score: null,
    home_halftime_score: null,
    away_halftime_score: null,
    home_fulltime_score: null,
    away_fulltime_score: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_team: {
      id: 33,
      name: 'Manchester United',
      code: 'MUN',
      country: 'England',
      logo: 'https://media.api-sports.io/football/teams/33.png',
      founded: 1878,
      venue_name: 'Old Trafford',
      venue_city: 'Manchester',
      venue_capacity: 76212,
      created_at: '',
      updated_at: '',
    },
    away_team: {
      id: 34,
      name: 'Newcastle',
      code: 'NEW',
      country: 'England',
      logo: 'https://media.api-sports.io/football/teams/34.png',
      founded: 1892,
      venue_name: "St. James' Park",
      venue_city: 'Newcastle upon Tyne',
      venue_capacity: 52305,
      created_at: '',
      updated_at: '',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb.svg',
      season: 2025,
      created_at: '',
      updated_at: '',
    },
    prediction: {
      id: '1',
      match_id: 1,
      home_win_prob: 0.42,
      draw_prob: 0.28,
      away_win_prob: 0.30,
      over_2_5_prob: 0.58,
      under_2_5_prob: 0.42,
      btts_yes_prob: 0.62,
      btts_no_prob: 0.38,
      predicted_home_goals: 1.6,
      predicted_away_goals: 1.2,
      confidence_score: 0.78,
      model_version: 'v1.0',
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 2,
    league_id: 39,
    season: 2025,
    round: 'Regular Season - 30',
    home_team_id: 40,
    away_team_id: 49,
    match_date: new Date(Date.now() + 172800000).toISOString(),
    match_timestamp: Math.floor(Date.now() / 1000) + 172800,
    venue: 'Anfield',
    city: 'Liverpool',
    status: 'NS',
    status_elapsed: null,
    home_score: null,
    away_score: null,
    home_halftime_score: null,
    away_halftime_score: null,
    home_fulltime_score: null,
    away_fulltime_score: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_team: {
      id: 40,
      name: 'Liverpool',
      code: 'LIV',
      country: 'England',
      logo: 'https://media.api-sports.io/football/teams/40.png',
      founded: 1892,
      venue_name: 'Anfield',
      venue_city: 'Liverpool',
      venue_capacity: 55212,
      created_at: '',
      updated_at: '',
    },
    away_team: {
      id: 49,
      name: 'Chelsea',
      code: 'CHE',
      country: 'England',
      logo: 'https://media.api-sports.io/football/teams/49.png',
      founded: 1905,
      venue_name: 'Stamford Bridge',
      venue_city: 'London',
      venue_capacity: 40834,
      created_at: '',
      updated_at: '',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb.svg',
      season: 2025,
      created_at: '',
      updated_at: '',
    },
    prediction: {
      id: '2',
      match_id: 2,
      home_win_prob: 0.55,
      draw_prob: 0.24,
      away_win_prob: 0.21,
      over_2_5_prob: 0.65,
      under_2_5_prob: 0.35,
      btts_yes_prob: 0.58,
      btts_no_prob: 0.42,
      predicted_home_goals: 2.1,
      predicted_away_goals: 1.1,
      confidence_score: 0.82,
      model_version: 'v1.0',
      created_at: '',
      updated_at: '',
    },
  },
  {
    id: 3,
    league_id: 40,
    season: 2025,
    round: 'Regular Season - 38',
    home_team_id: 63,
    away_team_id: 64,
    match_date: new Date(Date.now() + 259200000).toISOString(),
    match_timestamp: Math.floor(Date.now() / 1000) + 259200,
    venue: 'Elland Road',
    city: 'Leeds',
    status: 'NS',
    status_elapsed: null,
    home_score: null,
    away_score: null,
    home_halftime_score: null,
    away_halftime_score: null,
    home_fulltime_score: null,
    away_fulltime_score: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    home_team: {
      id: 63,
      name: 'Leeds United',
      code: 'LEE',
      country: 'England',
      logo: 'https://media.api-sports.io/football/teams/63.png',
      founded: 1919,
      venue_name: 'Elland Road',
      venue_city: 'Leeds',
      venue_capacity: 37890,
      created_at: '',
      updated_at: '',
    },
    away_team: {
      id: 64,
      name: 'Sunderland',
      code: 'SUN',
      country: 'England',
      logo: 'https://media.api-sports.io/football/teams/71.png',
      founded: 1879,
      venue_name: 'Stadium of Light',
      venue_city: 'Sunderland',
      venue_capacity: 49000,
      created_at: '',
      updated_at: '',
    },
    league: {
      id: 40,
      name: 'Championship',
      country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/40.png',
      flag: 'https://media.api-sports.io/flags/gb.svg',
      season: 2025,
      created_at: '',
      updated_at: '',
    },
    prediction: {
      id: '3',
      match_id: 3,
      home_win_prob: 0.48,
      draw_prob: 0.26,
      away_win_prob: 0.26,
      over_2_5_prob: 0.52,
      under_2_5_prob: 0.48,
      btts_yes_prob: 0.55,
      btts_no_prob: 0.45,
      predicted_home_goals: 1.5,
      predicted_away_goals: 1.1,
      confidence_score: 0.71,
      model_version: 'v1.0',
      created_at: '',
      updated_at: '',
    },
  },
];

const DEMO_VALUE_BETS: (ValueBet & { match?: any })[] = [
  {
    id: '1',
    match_id: 1,
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
      id: 1,
      match_date: new Date(Date.now() + 86400000).toISOString(),
      home_team: { name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
      away_team: { name: 'Newcastle', logo: 'https://media.api-sports.io/football/teams/34.png' },
      league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    },
  },
  {
    id: '2',
    match_id: 2,
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
      id: 2,
      match_date: new Date(Date.now() + 172800000).toISOString(),
      home_team: { name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
      away_team: { name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
      league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    },
  },
  {
    id: '3',
    match_id: 3,
    bet_type: 'btts_yes',
    calculated_prob: 0.55,
    bookmaker_odds: 1.85,
    implied_prob: 0.541,
    edge_percentage: 1.8,
    expected_value: 0.018,
    kelly_stake: 0.012,
    confidence: 'medium',
    is_value: true,
    created_at: new Date().toISOString(),
    match: {
      id: 3,
      match_date: new Date(Date.now() + 259200000).toISOString(),
      home_team: { name: 'Leeds United', logo: 'https://media.api-sports.io/football/teams/63.png' },
      away_team: { name: 'Sunderland', logo: 'https://media.api-sports.io/football/teams/71.png' },
      league: { name: 'Championship', logo: 'https://media.api-sports.io/football/leagues/40.png' },
    },
  },
];

export default function Dashboard() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          <span className="text-gradient">Football Betting</span>
          <br />
          <span className="text-white">Intelligence Platform</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
          Advanced analytics and value bet identification for English football leagues. 
          Powered by Poisson distribution models and real-time data from API-Football.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatsCard
          title="Upcoming Matches"
          value="47"
          subtitle="Next 7 days"
          icon={Calendar}
          variant="primary"
        />
        <StatsCard
          title="Value Bets Found"
          value="12"
          subtitle="Above 5% edge"
          icon={Zap}
          variant="secondary"
          trend={{ value: 23, isPositive: true }}
        />
        <StatsCard
          title="Prediction Accuracy"
          value="68%"
          subtitle="Last 30 days"
          icon={Target}
          variant="warning"
        />
        <StatsCard
          title="Leagues Tracked"
          value="4"
          subtitle="English leagues"
          icon={Trophy}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Matches */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
              Upcoming Fixtures
            </h2>
            <Link 
              href="/fixtures" 
              className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4 stagger-children">
            {DEMO_MATCHES.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>

        {/* Value Bets Sidebar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--accent-primary)]" />
              Top Value Bets
            </h2>
            <Link 
              href="/value-bets" 
              className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4 stagger-children">
            {DEMO_VALUE_BETS.slice(0, 2).map((vb) => (
              <ValueBetCard key={vb.id} valueBet={vb} />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 mb-8">
        <h2 className="text-2xl font-display font-bold text-white mb-8 text-center">
          How <span className="text-gradient">FootyEdge</span> Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-7 h-7 text-[var(--accent-primary)]" />
            </div>
            <h3 className="font-display font-bold text-white mb-2">Data Collection</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Real-time fixture and statistics data synced from API-Football into our Supabase database.
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-[var(--accent-secondary)]/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-[var(--accent-secondary)]" />
            </div>
            <h3 className="font-display font-bold text-white mb-2">Probability Engine</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Poisson distribution model calculates match outcome probabilities based on team statistics.
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-[var(--accent-warning)]/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-[var(--accent-warning)]" />
            </div>
            <h3 className="font-display font-bold text-white mb-2">Value Detection</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Compare our probabilities against bookmaker odds to identify positive expected value bets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
