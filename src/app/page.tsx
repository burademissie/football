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
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { StatsCard } from '@/components/ui/StatsCard';
import { MatchCard } from '@/components/ui/MatchCard';
import { ValueBetCard } from '@/components/ui/ValueBetCard';
import { MatchWithTeams, ValueBet } from '@/types/database';

export default function Dashboard() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [valueBets, setValueBets] = useState<(ValueBet & { match?: any })[]>([]);
  const [stats, setStats] = useState({ matches: 0, valueBets: 0, leagues: 4 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch upcoming fixtures
        const fixturesRes = await fetch('/api/fixtures?status=upcoming&limit=6');
        const fixturesData = await fixturesRes.json();
        
        if (fixturesData.success) {
          setMatches(fixturesData.fixtures);
          setStats(prev => ({ ...prev, matches: fixturesData.count }));
        }

        // Fetch value bets
        const valueBetsRes = await fetch('/api/value-bets?limit=4');
        const valueBetsData = await valueBetsRes.json();
        
        if (valueBetsData.success) {
          setValueBets(valueBetsData.valueBets);
          setStats(prev => ({ ...prev, valueBets: valueBetsData.count }));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
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
          title="Total Matches"
          value={isLoading ? '...' : stats.matches}
          subtitle="In database"
          icon={Calendar}
          variant="primary"
        />
        <StatsCard
          title="Value Bets Found"
          value={isLoading ? '...' : stats.valueBets}
          subtitle="Above 5% edge"
          icon={Zap}
          variant="secondary"
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
          value={stats.leagues}
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
              <Calendar className="w-5 h-5 text-[var(--accent-primary)]" />
              Recent Fixtures
            </h2>
            <Link 
              href="/fixtures" 
              className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-4">
              {matches.slice(0, 4).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Calendar className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">No upcoming fixtures found</p>
            </div>
          )}
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
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
            </div>
          ) : valueBets.length > 0 ? (
            <div className="space-y-4">
              {valueBets.slice(0, 2).map((vb) => (
                <ValueBetCard key={vb.id} valueBet={vb} />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Zap className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">No value bets found yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-2">Run predictions to generate value bets</p>
            </div>
          )}
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
