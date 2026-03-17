'use client';

import { useState, useEffect } from 'react';
import { Trophy, Users, Target, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SUPPORTED_LEAGUES, LEAGUE_NAMES, SupportedLeagueId } from '@/types/api-football';

interface LeagueData {
  id: SupportedLeagueId;
  name: string;
  logo: string;
  country: string;
  flag: string;
  teams: number;
  matchesPlayed: number;
  upcomingMatches: number;
  avgGoals: number;
  topScorer: { name: string; goals: number; team: string };
}

const DEMO_LEAGUES: LeagueData[] = [
  {
    id: SUPPORTED_LEAGUES.PREMIER_LEAGUE,
    name: 'Premier League',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    country: 'England',
    flag: 'https://media.api-sports.io/flags/gb.svg',
    teams: 20,
    matchesPlayed: 290,
    upcomingMatches: 12,
    avgGoals: 2.85,
    topScorer: { name: 'Erling Haaland', goals: 27, team: 'Manchester City' },
  },
  {
    id: SUPPORTED_LEAGUES.CHAMPIONSHIP,
    name: 'Championship',
    logo: 'https://media.api-sports.io/football/leagues/40.png',
    country: 'England',
    flag: 'https://media.api-sports.io/flags/gb.svg',
    teams: 24,
    matchesPlayed: 420,
    upcomingMatches: 18,
    avgGoals: 2.68,
    topScorer: { name: 'Joel Piroe', goals: 21, team: 'Leeds United' },
  },
  {
    id: SUPPORTED_LEAGUES.LEAGUE_ONE,
    name: 'League One',
    logo: 'https://media.api-sports.io/football/leagues/41.png',
    country: 'England',
    flag: 'https://media.api-sports.io/flags/gb.svg',
    teams: 24,
    matchesPlayed: 410,
    upcomingMatches: 15,
    avgGoals: 2.72,
    topScorer: { name: 'Alfie May', goals: 19, team: 'Charlton Athletic' },
  },
  {
    id: SUPPORTED_LEAGUES.LEAGUE_TWO,
    name: 'League Two',
    logo: 'https://media.api-sports.io/football/leagues/42.png',
    country: 'England',
    flag: 'https://media.api-sports.io/flags/gb.svg',
    teams: 24,
    matchesPlayed: 405,
    upcomingMatches: 14,
    avgGoals: 2.58,
    topScorer: { name: 'Paul Mullin', goals: 18, team: 'Wrexham' },
  },
];

function LeagueCard({ league }: { league: LeagueData }) {
  return (
    <Link href={`/fixtures?league=${league.id}`}>
      <div className="card p-6 h-full cursor-pointer group">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-[var(--bg-secondary)] p-3 flex items-center justify-center group-hover:bg-[var(--bg-primary)] transition-colors">
            <Image
              src={league.logo}
              alt={league.name}
              width={40}
              height={40}
            />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors">
              {league.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Image src={league.flag} alt="" width={16} height={12} />
              <span>{league.country}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Teams</span>
            </div>
            <p className="text-xl font-display font-bold text-white">{league.teams}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Avg Goals</span>
            </div>
            <p className="text-xl font-display font-bold text-[var(--accent-primary)]">{league.avgGoals}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs">Played</span>
            </div>
            <p className="text-xl font-display font-bold text-white">{league.matchesPlayed}</p>
          </div>
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
            <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Upcoming</span>
            </div>
            <p className="text-xl font-display font-bold text-[var(--accent-secondary)]">{league.upcomingMatches}</p>
          </div>
        </div>

        {/* Top Scorer */}
        <div className="pt-4 border-t border-[var(--border-color)]">
          <p className="text-xs text-[var(--text-muted)] mb-2">Top Scorer</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{league.topScorer.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{league.topScorer.team}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-[var(--accent-warning)]">
                {league.topScorer.goals}
              </p>
              <p className="text-xs text-[var(--text-muted)]">goals</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LeaguesPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-[var(--accent-primary)]" />
          Leagues
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          English football leagues covered by FootyEdge
        </p>
      </div>

      {/* Coverage Info */}
      <div className="card p-6 mb-8 bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border-[var(--accent-primary)]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white mb-2">
              Complete English Football Coverage
            </h2>
            <p className="text-[var(--text-secondary)]">
              We track all four tiers of English professional football, from the Premier League 
              to League Two. Data is synced daily from API-Football.
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-3xl font-display font-bold text-[var(--accent-primary)]">92</p>
              <p className="text-xs text-[var(--text-muted)]">Teams</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-[var(--accent-secondary)]">1,525</p>
              <p className="text-xs text-[var(--text-muted)]">Matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leagues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
        {DEMO_LEAGUES.map((league) => (
          <LeagueCard key={league.id} league={league} />
        ))}
      </div>

      {/* Data Source */}
      <div className="mt-12 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Data provided by{' '}
          <a 
            href="https://www.api-football.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--accent-primary)] hover:underline"
          >
            API-Football
          </a>
          {' '}• Updated daily via automated sync
        </p>
      </div>
    </div>
  );
}
