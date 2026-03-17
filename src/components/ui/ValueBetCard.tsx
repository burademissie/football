'use client';

import { format } from 'date-fns';
import { Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { ValueBet, BetType } from '@/types/database';

interface ValueBetCardProps {
  valueBet: ValueBet & {
    match?: {
      id: number;
      match_date: string;
      home_team?: { name: string; logo: string };
      away_team?: { name: string; logo: string };
      league?: { name: string; logo: string };
    };
  };
}

const BET_TYPE_LABELS: Record<BetType, string> = {
  home_win: 'Home Win',
  draw: 'Draw',
  away_win: 'Away Win',
  over_2_5: 'Over 2.5 Goals',
  under_2_5: 'Under 2.5 Goals',
  btts_yes: 'Both Teams Score',
  btts_no: 'Clean Sheet',
};

export function ValueBetCard({ valueBet }: ValueBetCardProps) {
  const confidenceColors = {
    low: 'text-[var(--accent-warning)]',
    medium: 'text-[var(--accent-secondary)]',
    high: 'text-[var(--accent-primary)]',
  };

  const confidenceIcons = {
    low: AlertTriangle,
    medium: TrendingUp,
    high: CheckCircle,
  };

  const ConfidenceIcon = confidenceIcons[valueBet.confidence];

  return (
    <div className="card p-5 relative overflow-hidden">
      {/* Glow effect for high confidence */}
      {valueBet.confidence === 'high' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {valueBet.match?.league?.logo && (
            <Image
              src={valueBet.match.league.logo}
              alt=""
              width={18}
              height={18}
              className="rounded"
            />
          )}
          <span className="text-xs text-[var(--text-muted)]">
            {valueBet.match?.league?.name}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${confidenceColors[valueBet.confidence]}`}>
          <ConfidenceIcon className="w-3 h-3" />
          <span className="capitalize">{valueBet.confidence} Confidence</span>
        </div>
      </div>

      {/* Match Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {valueBet.match?.home_team?.logo && (
            <Image
              src={valueBet.match.home_team.logo}
              alt=""
              width={24}
              height={24}
            />
          )}
          <span className="font-medium text-sm">{valueBet.match?.home_team?.name}</span>
        </div>
        <span className="text-[var(--text-muted)] text-sm">vs</span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{valueBet.match?.away_team?.name}</span>
          {valueBet.match?.away_team?.logo && (
            <Image
              src={valueBet.match.away_team.logo}
              alt=""
              width={24}
              height={24}
            />
          )}
        </div>
      </div>

      {/* Bet Type Badge */}
      <div className="flex items-center justify-center mb-4">
        <div className="badge badge-value text-sm px-4 py-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          {BET_TYPE_LABELS[valueBet.bet_type]}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--text-muted)] mb-1">Edge</p>
          <p className="text-xl font-display font-bold text-[var(--accent-primary)]">
            +{valueBet.edge_percentage.toFixed(1)}%
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--text-muted)] mb-1">Odds</p>
          <p className="text-xl font-display font-bold text-white">
            {valueBet.bookmaker_odds.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Probability Comparison */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--text-muted)]">Our Probability</span>
          <span className="text-[var(--accent-primary)] font-medium">
            {(valueBet.calculated_prob * 100).toFixed(1)}%
          </span>
        </div>
        <div className="stat-bar">
          <div 
            className="stat-bar-fill" 
            style={{ width: `${valueBet.calculated_prob * 100}%` }} 
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[var(--text-muted)]">Implied Probability</span>
          <span className="text-[var(--text-secondary)] font-medium">
            {(valueBet.implied_prob * 100).toFixed(1)}%
          </span>
        </div>
        <div className="stat-bar">
          <div 
            className="h-full bg-[var(--text-muted)] rounded" 
            style={{ width: `${valueBet.implied_prob * 100}%` }} 
          />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)]">Expected Value</p>
          <p className={`font-semibold ${valueBet.expected_value > 0 ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-danger)]'}`}>
            {valueBet.expected_value > 0 ? '+' : ''}{(valueBet.expected_value * 100).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)]">Kelly Stake</p>
          <p className="font-semibold text-white">
            {(valueBet.kelly_stake * 100).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)]">Match Date</p>
          <p className="font-semibold text-white">
            {valueBet.match?.match_date 
              ? format(new Date(valueBet.match.match_date), 'MMM d')
              : '-'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
