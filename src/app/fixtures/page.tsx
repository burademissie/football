'use client';

import { useState, useEffect } from 'react';
import { Calendar, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { MatchCard } from '@/components/ui/MatchCard';
import { LeagueFilter } from '@/components/ui/LeagueFilter';
import { MatchWithTeams } from '@/types/database';
import { SupportedLeagueId } from '@/types/api-football';
import { format } from 'date-fns';

export default function FixturesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<SupportedLeagueId | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch fixtures from API
  const fetchFixtures = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedLeague !== 'all') {
        params.append('league', String(selectedLeague));
      }
      params.append('limit', '100');
      
      const response = await fetch(`/api/fixtures?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.fixtures);
      } else {
        setError(data.error || 'Failed to fetch fixtures');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when league changes
  useEffect(() => {
    fetchFixtures();
  }, [selectedLeague]);

  // Group matches by date
  const groupedMatches = matches.reduce((acc, match) => {
    const dateKey = format(new Date(match.match_date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, MatchWithTeams[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[var(--accent-primary)]" />
            Fixtures
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">
            {matches.length} matches across English leagues
          </p>
        </div>
        <button
          onClick={fetchFixtures}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
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

      {/* Error State */}
      {error && (
        <div className="card p-6 mb-8 border-[var(--accent-danger)]/30 bg-[var(--accent-danger)]/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--accent-danger)]" />
            <p className="text-[var(--text-secondary)]">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <RefreshCw className="w-12 h-12 text-[var(--accent-primary)] mx-auto mb-4 animate-spin" />
          <p className="text-[var(--text-secondary)]">Loading fixtures...</p>
        </div>
      )}

      {/* Matches by Date */}
      {!isLoading && !error && (
        <div className="space-y-8">
          {Object.entries(groupedMatches)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dateMatches]) => (
              <div key={date}>
                <h2 className="text-lg font-display font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  <span className="text-sm font-normal text-[var(--text-muted)]">
                    ({dateMatches.length} {dateMatches.length === 1 ? 'match' : 'matches'})
                  </span>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {dateMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && matches.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-white mb-2">No Fixtures Found</h3>
          <p className="text-[var(--text-secondary)]">
            No matches found for the selected filters.
          </p>
        </div>
      )}
    </div>
  );
}
