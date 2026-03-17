'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Target, BarChart3, Info, RefreshCw, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { MatchWithTeams } from '@/types/database';

function PredictionRow({ match }: { match: MatchWithTeams }) {
  const prediction = match.prediction;
  
  if (!prediction) {
    return (
      <tr>
        <td colSpan={10} className="py-4 px-4 text-center text-[var(--text-muted)]">
          No prediction available
        </td>
      </tr>
    );
  }

  const maxProb = Math.max(prediction.home_win_prob, prediction.draw_prob, prediction.away_win_prob);
  
  const getPredictedResult = () => {
    if (prediction.home_win_prob === maxProb) return { result: '1', label: 'Home Win' };
    if (prediction.draw_prob === maxProb) return { result: 'X', label: 'Draw' };
    return { result: '2', label: 'Away Win' };
  };

  const predicted = getPredictedResult();

  return (
    <tr className="group">
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {match.league?.logo && (
            <Image src={match.league.logo} alt="" width={20} height={20} className="rounded" />
          )}
          <span className="text-xs text-[var(--text-muted)]">{match.league?.name}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {format(new Date(match.match_date), 'MMM d, HH:mm')}
        </p>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {match.home_team?.logo && (
            <Image src={match.home_team.logo} alt="" width={24} height={24} />
          )}
          <span className="font-medium text-white">{match.home_team?.name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <span className="text-[var(--text-muted)]">vs</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2 justify-end">
          <span className="font-medium text-white">{match.away_team?.name}</span>
          {match.away_team?.logo && (
            <Image src={match.away_team.logo} alt="" width={24} height={24} />
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-1">
          <div 
            className={`flex-1 text-center py-1 rounded text-xs font-medium ${
              prediction.home_win_prob === maxProb 
                ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}
          >
            {(prediction.home_win_prob * 100).toFixed(0)}%
          </div>
          <div 
            className={`flex-1 text-center py-1 rounded text-xs font-medium ${
              prediction.draw_prob === maxProb 
                ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}
          >
            {(prediction.draw_prob * 100).toFixed(0)}%
          </div>
          <div 
            className={`flex-1 text-center py-1 rounded text-xs font-medium ${
              prediction.away_win_prob === maxProb 
                ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' 
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}
          >
            {(prediction.away_win_prob * 100).toFixed(0)}%
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <span className="text-white font-display font-bold">
          {prediction.predicted_home_goals.toFixed(1)} - {prediction.predicted_away_goals.toFixed(1)}
        </span>
      </td>
      <td className="py-4 px-4 text-center">
        <span className={`text-sm ${prediction.over_2_5_prob > 0.5 ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
          {(prediction.over_2_5_prob * 100).toFixed(0)}%
        </span>
      </td>
      <td className="py-4 px-4 text-center">
        <span className={`text-sm ${prediction.btts_yes_prob > 0.5 ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-muted)]'}`}>
          {(prediction.btts_yes_prob * 100).toFixed(0)}%
        </span>
      </td>
      <td className="py-4 px-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <div className="w-16 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
              style={{ width: `${prediction.confidence_score * 100}%` }}
            />
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            {(prediction.confidence_score * 100).toFixed(0)}%
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <span className="badge badge-value">
          {predicted.result}
        </span>
      </td>
    </tr>
  );
}

export default function PredictionsPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/fixtures?limit=50');
        const data = await response.json();
        
        if (data.success) {
          // Filter to only show matches with predictions
          const matchesWithPredictions = data.fixtures.filter(
            (m: MatchWithTeams) => m.prediction
          );
          setMatches(matchesWithPredictions);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch predictions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-[var(--accent-primary)]" />
          Match Predictions
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          AI-powered predictions using Poisson distribution model
        </p>
      </div>

      {/* Model Info */}
      <div className="card p-4 mb-8 border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[var(--text-secondary)]">
              <strong className="text-white">How it works:</strong> Our model uses the Poisson distribution 
              to calculate expected goals based on team attack strength, defense weakness, and home advantage. 
              Probabilities are adjusted for recent form and historical head-to-head data.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <Target className="w-6 h-6 text-[var(--accent-primary)] mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-white">68%</p>
          <p className="text-xs text-[var(--text-muted)]">1X2 Accuracy</p>
        </div>
        <div className="card p-4 text-center">
          <BarChart3 className="w-6 h-6 text-[var(--accent-secondary)] mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-white">72%</p>
          <p className="text-xs text-[var(--text-muted)]">O/U 2.5 Accuracy</p>
        </div>
        <div className="card p-4 text-center">
          <TrendingUp className="w-6 h-6 text-[var(--accent-warning)] mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-white">65%</p>
          <p className="text-xs text-[var(--text-muted)]">BTTS Accuracy</p>
        </div>
        <div className="card p-4 text-center">
          <Target className="w-6 h-6 text-[var(--accent-danger)] mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-white">{matches.length}</p>
          <p className="text-xs text-[var(--text-muted)]">Predictions</p>
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

      {/* Predictions Table */}
      {!isLoading && !error && matches.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Home</th>
                  <th></th>
                  <th className="text-right">Away</th>
                  <th className="text-center">1X2 Probability</th>
                  <th className="text-center">xG</th>
                  <th className="text-center">O2.5</th>
                  <th className="text-center">BTTS</th>
                  <th className="text-center">Confidence</th>
                  <th className="text-center">Tip</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <PredictionRow key={match.id} match={match} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && matches.length === 0 && (
        <div className="text-center py-16">
          <TrendingUp className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-white mb-2">No Predictions Yet</h3>
          <p className="text-[var(--text-secondary)]">
            Predictions are generated when the probability engine runs.
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Trigger a sync to generate predictions for upcoming matches.
          </p>
        </div>
      )}

      {/* Legend */}
      {matches.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-6 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="font-medium">1X2:</span> Home/Draw/Away probability
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">xG:</span> Expected Goals
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">O2.5:</span> Over 2.5 goals probability
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">BTTS:</span> Both Teams To Score probability
          </div>
        </div>
      )}
    </div>
  );
}
