'use client';

import { useState, useEffect } from 'react';
import { Zap, Filter, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { ValueBetCard } from '@/components/ui/ValueBetCard';
import { ValueBet, BetType } from '@/types/database';

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
  const [valueBets, setValueBets] = useState<(ValueBet & { match?: any })[]>([]);
  const [betTypeFilter, setBetTypeFilter] = useState<BetType | 'all'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [minEdge, setMinEdge] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ totalEV: 0, avgEdge: 0, highConfidence: 0 });

  const fetchValueBets = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('minEdge', String(minEdge));
      if (betTypeFilter !== 'all') params.append('betType', betTypeFilter);
      if (confidenceFilter !== 'all') params.append('confidence', confidenceFilter);
      params.append('limit', '50');
      
      const response = await fetch(`/api/value-bets?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setValueBets(data.valueBets);
        setSummary({
          totalEV: data.summary?.totalExpectedValue || 0,
          avgEdge: data.summary?.averageEdge || 0,
          highConfidence: data.summary?.highConfidence || 0,
        });
      } else {
        setError(data.error || 'Failed to fetch value bets');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValueBets();
  }, [betTypeFilter, confidenceFilter, minEdge]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
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
          <p className="text-3xl font-display font-bold text-[var(--accent-primary)]">
            {isLoading ? '...' : valueBets.length}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-1">Average Edge</p>
          <p className="text-3xl font-display font-bold text-white">
            {isLoading ? '...' : `${summary.avgEdge.toFixed(1)}%`}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-1">Total Expected Value</p>
          <p className="text-3xl font-display font-bold text-[var(--accent-secondary)]">
            {isLoading ? '...' : `+${(summary.totalEV * 100).toFixed(1)}%`}
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
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-12 h-12 text-[var(--accent-primary)] animate-spin" />
        </div>
      )}

      {/* Value Bets Grid */}
      {!isLoading && !error && valueBets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valueBets.map((bet) => (
            <ValueBetCard key={bet.id} valueBet={bet} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && valueBets.length === 0 && (
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-white mb-2">No Value Bets Found</h3>
          <p className="text-[var(--text-secondary)]">
            Value bets are generated when predictions are run against bookmaker odds.
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Try lowering the minimum edge filter or run the prediction engine.
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
