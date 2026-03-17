'use client';

import { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { MatchCard } from '@/components/ui/MatchCard';
import { LeagueFilter } from '@/components/ui/LeagueFilter';
import { MatchWithTeams } from '@/types/database';
import { SupportedLeagueId } from '@/types/api-football';
import { format, addDays, startOfDay } from 'date-fns';

// Extended demo data
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
      id: 33, name: 'Manchester United', code: 'MUN', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/33.png',
      founded: 1878, venue_name: 'Old Trafford', venue_city: 'Manchester', venue_capacity: 76212,
      created_at: '', updated_at: '',
    },
    away_team: {
      id: 34, name: 'Newcastle', code: 'NEW', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/34.png',
      founded: 1892, venue_name: "St. James' Park", venue_city: 'Newcastle upon Tyne', venue_capacity: 52305,
      created_at: '', updated_at: '',
    },
    league: {
      id: 39, name: 'Premier League', country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb.svg', season: 2025,
      created_at: '', updated_at: '',
    },
    prediction: {
      id: '1', match_id: 1, home_win_prob: 0.42, draw_prob: 0.28, away_win_prob: 0.30,
      over_2_5_prob: 0.58, under_2_5_prob: 0.42, btts_yes_prob: 0.62, btts_no_prob: 0.38,
      predicted_home_goals: 1.6, predicted_away_goals: 1.2, confidence_score: 0.78,
      model_version: 'v1.0', created_at: '', updated_at: '',
    },
    value_bets: [{ id: '1', match_id: 1, bet_type: 'over_2_5', calculated_prob: 0.58, bookmaker_odds: 1.95, implied_prob: 0.513, edge_percentage: 13.1, expected_value: 0.131, kelly_stake: 0.034, confidence: 'high', is_value: true, created_at: '' }],
  },
  {
    id: 2,
    league_id: 39,
    season: 2025,
    round: 'Regular Season - 30',
    home_team_id: 40,
    away_team_id: 49,
    match_date: new Date(Date.now() + 90000000).toISOString(),
    match_timestamp: Math.floor(Date.now() / 1000) + 90000,
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
      id: 40, name: 'Liverpool', code: 'LIV', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/40.png',
      founded: 1892, venue_name: 'Anfield', venue_city: 'Liverpool', venue_capacity: 55212,
      created_at: '', updated_at: '',
    },
    away_team: {
      id: 49, name: 'Chelsea', code: 'CHE', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/49.png',
      founded: 1905, venue_name: 'Stamford Bridge', venue_city: 'London', venue_capacity: 40834,
      created_at: '', updated_at: '',
    },
    league: {
      id: 39, name: 'Premier League', country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb.svg', season: 2025,
      created_at: '', updated_at: '',
    },
    prediction: {
      id: '2', match_id: 2, home_win_prob: 0.55, draw_prob: 0.24, away_win_prob: 0.21,
      over_2_5_prob: 0.65, under_2_5_prob: 0.35, btts_yes_prob: 0.58, btts_no_prob: 0.42,
      predicted_home_goals: 2.1, predicted_away_goals: 1.1, confidence_score: 0.82,
      model_version: 'v1.0', created_at: '', updated_at: '',
    },
    value_bets: [{ id: '2', match_id: 2, bet_type: 'home_win', calculated_prob: 0.55, bookmaker_odds: 2.10, implied_prob: 0.476, edge_percentage: 15.5, expected_value: 0.155, kelly_stake: 0.041, confidence: 'high', is_value: true, created_at: '' }],
  },
  {
    id: 3,
    league_id: 39,
    season: 2025,
    round: 'Regular Season - 30',
    home_team_id: 50,
    away_team_id: 47,
    match_date: new Date(Date.now() + 172800000).toISOString(),
    match_timestamp: Math.floor(Date.now() / 1000) + 172800,
    venue: 'Etihad Stadium',
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
      id: 50, name: 'Manchester City', code: 'MCI', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/50.png',
      founded: 1880, venue_name: 'Etihad Stadium', venue_city: 'Manchester', venue_capacity: 55017,
      created_at: '', updated_at: '',
    },
    away_team: {
      id: 47, name: 'Tottenham', code: 'TOT', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/47.png',
      founded: 1882, venue_name: 'Tottenham Hotspur Stadium', venue_city: 'London', venue_capacity: 62850,
      created_at: '', updated_at: '',
    },
    league: {
      id: 39, name: 'Premier League', country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      flag: 'https://media.api-sports.io/flags/gb.svg', season: 2025,
      created_at: '', updated_at: '',
    },
    prediction: {
      id: '3', match_id: 3, home_win_prob: 0.62, draw_prob: 0.22, away_win_prob: 0.16,
      over_2_5_prob: 0.72, under_2_5_prob: 0.28, btts_yes_prob: 0.55, btts_no_prob: 0.45,
      predicted_home_goals: 2.4, predicted_away_goals: 0.9, confidence_score: 0.85,
      model_version: 'v1.0', created_at: '', updated_at: '',
    },
  },
  {
    id: 4,
    league_id: 40,
    season: 2025,
    round: 'Regular Season - 38',
    home_team_id: 63,
    away_team_id: 71,
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
      id: 63, name: 'Leeds United', code: 'LEE', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/63.png',
      founded: 1919, venue_name: 'Elland Road', venue_city: 'Leeds', venue_capacity: 37890,
      created_at: '', updated_at: '',
    },
    away_team: {
      id: 71, name: 'Sunderland', code: 'SUN', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/71.png',
      founded: 1879, venue_name: 'Stadium of Light', venue_city: 'Sunderland', venue_capacity: 49000,
      created_at: '', updated_at: '',
    },
    league: {
      id: 40, name: 'Championship', country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/40.png',
      flag: 'https://media.api-sports.io/flags/gb.svg', season: 2025,
      created_at: '', updated_at: '',
    },
    prediction: {
      id: '4', match_id: 4, home_win_prob: 0.48, draw_prob: 0.26, away_win_prob: 0.26,
      over_2_5_prob: 0.52, under_2_5_prob: 0.48, btts_yes_prob: 0.55, btts_no_prob: 0.45,
      predicted_home_goals: 1.5, predicted_away_goals: 1.1, confidence_score: 0.71,
      model_version: 'v1.0', created_at: '', updated_at: '',
    },
  },
  {
    id: 5,
    league_id: 40,
    season: 2025,
    round: 'Regular Season - 38',
    home_team_id: 68,
    away_team_id: 70,
    match_date: new Date(Date.now() + 345600000).toISOString(),
    match_timestamp: Math.floor(Date.now() / 1000) + 345600,
    venue: 'The City Ground',
    city: 'Nottingham',
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
      id: 68, name: 'Norwich City', code: 'NOR', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/68.png',
      founded: 1902, venue_name: 'Carrow Road', venue_city: 'Norwich', venue_capacity: 27244,
      created_at: '', updated_at: '',
    },
    away_team: {
      id: 70, name: 'West Brom', code: 'WBA', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/60.png',
      founded: 1878, venue_name: 'The Hawthorns', venue_city: 'West Bromwich', venue_capacity: 26688,
      created_at: '', updated_at: '',
    },
    league: {
      id: 40, name: 'Championship', country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/40.png',
      flag: 'https://media.api-sports.io/flags/gb.svg', season: 2025,
      created_at: '', updated_at: '',
    },
    prediction: {
      id: '5', match_id: 5, home_win_prob: 0.38, draw_prob: 0.30, away_win_prob: 0.32,
      over_2_5_prob: 0.48, under_2_5_prob: 0.52, btts_yes_prob: 0.52, btts_no_prob: 0.48,
      predicted_home_goals: 1.2, predicted_away_goals: 1.1, confidence_score: 0.68,
      model_version: 'v1.0', created_at: '', updated_at: '',
    },
  },
  {
    id: 6,
    league_id: 41,
    season: 2025,
    round: 'Regular Season - 40',
    home_team_id: 1359,
    away_team_id: 1355,
    match_date: new Date(Date.now() + 432000000).toISOString(),
    match_timestamp: Math.floor(Date.now() / 1000) + 432000,
    venue: 'Stadium MK',
    city: 'Milton Keynes',
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
      id: 1359, name: 'MK Dons', code: 'MKD', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/1359.png',
      founded: 2004, venue_name: 'Stadium MK', venue_city: 'Milton Keynes', venue_capacity: 30500,
      created_at: '', updated_at: '',
    },
    away_team: {
      id: 1355, name: 'Bolton', code: 'BOL', country: 'England',
      logo: 'https://media.api-sports.io/football/teams/69.png',
      founded: 1874, venue_name: 'University of Bolton Stadium', venue_city: 'Bolton', venue_capacity: 28723,
      created_at: '', updated_at: '',
    },
    league: {
      id: 41, name: 'League One', country: 'England',
      logo: 'https://media.api-sports.io/football/leagues/41.png',
      flag: 'https://media.api-sports.io/flags/gb.svg', season: 2025,
      created_at: '', updated_at: '',
    },
    prediction: {
      id: '6', match_id: 6, home_win_prob: 0.35, draw_prob: 0.32, away_win_prob: 0.33,
      over_2_5_prob: 0.45, under_2_5_prob: 0.55, btts_yes_prob: 0.50, btts_no_prob: 0.50,
      predicted_home_goals: 1.1, predicted_away_goals: 1.0, confidence_score: 0.62,
      model_version: 'v1.0', created_at: '', updated_at: '',
    },
  },
];

export default function FixturesPage() {
  const [selectedLeague, setSelectedLeague] = useState<SupportedLeagueId | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredMatches = selectedLeague === 'all' 
    ? DEMO_MATCHES 
    : DEMO_MATCHES.filter(m => m.league_id === selectedLeague);

  // Group matches by date
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const dateKey = format(new Date(match.match_date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, MatchWithTeams[]>);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[var(--accent-primary)]" />
            Fixtures
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Upcoming matches across all English leagues
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Syncing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-sm text-[var(--text-muted)]">Filter by league</span>
        </div>
        <LeagueFilter selectedLeague={selectedLeague} onSelect={setSelectedLeague} />
      </div>

      {/* Matches by Date */}
      <div className="space-y-8">
        {Object.entries(groupedMatches)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, matches]) => (
            <div key={date}>
              <h2 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                <span className="text-sm font-normal text-[var(--text-muted)]">
                  ({matches.length} {matches.length === 1 ? 'match' : 'matches'})
                </span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-white mb-2">No Fixtures Found</h3>
          <p className="text-[var(--text-secondary)]">
            No upcoming matches for the selected league.
          </p>
        </div>
      )}
    </div>
  );
}
