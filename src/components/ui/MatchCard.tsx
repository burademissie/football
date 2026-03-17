'use client';

import { format } from 'date-fns';
import { MapPin, Clock, TrendingUp, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MatchWithTeams } from '@/types/database';

interface MatchCardProps {
  match: MatchWithTeams;
  showPrediction?: boolean;
}

export function MatchCard({ match, showPrediction = true }: MatchCardProps) {
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(match.status);
  const isFinished = ['FT', 'AET', 'PEN'].includes(match.status);
  const hasValueBet = match.value_bets?.some(vb => vb.is_value);

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <span className="badge badge-live flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {match.status === 'HT' ? 'Half Time' : `${match.status_elapsed}'`}
        </span>
      );
    }
    if (isFinished) {
      return <span className="badge bg-[var(--bg-secondary)] text-[var(--text-muted)]">FT</span>;
    }
    return (
      <span className="badge badge-upcoming">
        {format(new Date(match.match_date), 'HH:mm')}
      </span>
    );
  };

  return (
    <Link href={`/match/${match.id}`}>
      <div className="card p-4 cursor-pointer group">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {match.league?.logo && (
              <Image
                src={match.league.logo}
                alt={match.league.name}
                width={20}
                height={20}
                className="rounded"
              />
            )}
            <span className="text-xs text-[var(--text-muted)] font-medium">
              {match.league?.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasValueBet && (
              <span className="badge badge-value flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Value
              </span>
            )}
            {getStatusBadge()}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] p-2 flex items-center justify-center group-hover:bg-[var(--bg-primary)] transition-colors">
              {match.home_team?.logo ? (
                <Image
                  src={match.home_team.logo}
                  alt={match.home_team.name}
                  width={32}
                  height={32}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">
                {match.home_team?.name || 'Home Team'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Home</p>
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center px-4">
            {isLive || isFinished ? (
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-display font-bold ${isLive ? 'text-[var(--accent-danger)]' : 'text-white'}`}>
                  {match.home_score ?? 0}
                </span>
                <span className="text-[var(--text-muted)]">-</span>
                <span className={`text-2xl font-display font-bold ${isLive ? 'text-[var(--accent-danger)]' : 'text-white'}`}>
                  {match.away_score ?? 0}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-display font-bold text-[var(--text-muted)]">VS</p>
              </div>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {format(new Date(match.match_date), 'MMM d')}
            </p>
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center gap-3 justify-end">
            <div className="flex-1 min-w-0 text-right">
              <p className="font-semibold text-white truncate">
                {match.away_team?.name || 'Away Team'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Away</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[var(--bg-secondary)] p-2 flex items-center justify-center group-hover:bg-[var(--bg-primary)] transition-colors">
              {match.away_team?.logo ? (
                <Image
                  src={match.away_team.logo}
                  alt={match.away_team.name}
                  width={32}
                  height={32}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--accent-secondary)]/20" />
              )}
            </div>
          </div>
        </div>

        {/* Prediction Bar */}
        {showPrediction && match.prediction && !isFinished && (
          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[var(--text-muted)]">Win Probability</span>
              <div className="flex items-center gap-1 text-[var(--accent-primary)]">
                <TrendingUp className="w-3 h-3" />
                <span>{Math.round(match.prediction.confidence_score * 100)}% confidence</span>
              </div>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-[var(--bg-secondary)]">
              <div 
                className="bg-[var(--accent-primary)] transition-all duration-500"
                style={{ width: `${match.prediction.home_win_prob * 100}%` }}
              />
              <div 
                className="bg-[var(--text-muted)] transition-all duration-500"
                style={{ width: `${match.prediction.draw_prob * 100}%` }}
              />
              <div 
                className="bg-[var(--accent-secondary)] transition-all duration-500"
                style={{ width: `${match.prediction.away_win_prob * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-[var(--accent-primary)]">
                {Math.round(match.prediction.home_win_prob * 100)}%
              </span>
              <span className="text-[var(--text-muted)]">
                {Math.round(match.prediction.draw_prob * 100)}%
              </span>
              <span className="text-[var(--accent-secondary)]">
                {Math.round(match.prediction.away_win_prob * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Venue */}
        {match.venue && (
          <div className="flex items-center gap-2 mt-3 text-xs text-[var(--text-muted)]">
            <MapPin className="w-3 h-3" />
            <span>{match.venue}, {match.city}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
