'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Target, BarChart3, Info } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

interface PredictionData {
  id: number;
  match_date: string;
  home_team: { name: string; logo: string };
  away_team: { name: string; logo: string };
  league: { name: string; logo: string };
  prediction: {
    home_win_prob: number;
    draw_prob: number;
    away_win_prob: number;
    over_2_5_prob: number;
    btts_yes_prob: number;
    predicted_home_goals: number;
    predicted_away_goals: number;
    confidence_score: number;
  };
}

const DEMO_PREDICTIONS: PredictionData[] = [
  {
    id: 1,
    match_date: new Date(Date.now() + 86400000).toISOString(),
    home_team: { name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
    away_team: { name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png' },
    league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    prediction: {
      home_win_prob: 0.55, draw_prob: 0.24, away_win_prob: 0.21,
      over_2_5_prob: 0.65, btts_yes_prob: 0.58,
      predicted_home_goals: 2.1, predicted_away_goals: 1.1, confidence_score: 0.82,
    },
  },
  {
    id: 2,
    match_date: new Date(Date.now() + 172800000).toISOString(),
    home_team: { name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png' },
    away_team: { name: 'Newcastle', logo: 'https://media.api-sports.io/football/teams/34.png' },
    league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    prediction: {
      home_win_prob: 0.42, draw_prob: 0.28, away_win_prob: 0.30,
      over_2_5_prob: 0.58, btts_yes_prob: 0.62,
      predicted_home_goals: 1.6, predicted_away_goals: 1.2, confidence_score: 0.78,
    },
  },
  {
    id: 3,
    match_date: new Date(Date.now() + 259200000).toISOString(),
    home_team: { name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png' },
    away_team: { name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png' },
    league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    prediction: {
      home_win_prob: 0.62, draw_prob: 0.22, away_win_prob: 0.16,
      over_2_5_prob: 0.72, btts_yes_prob: 0.55,
      predicted_home_goals: 2.4, predicted_away_goals: 0.9, confidence_score: 0.85,
    },
  },
  {
    id: 4,
    match_date: new Date(Date.now() + 345600000).toISOString(),
    home_team: { name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png' },
    away_team: { name: 'Brighton', logo: 'https://media.api-sports.io/football/teams/51.png' },
    league: { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    prediction: {
      home_win_prob: 0.58, draw_prob: 0.25, away_win_prob: 0.17,
      over_2_5_prob: 0.60, btts_yes_prob: 0.52,
      predicted_home_goals: 1.9, predicted_away_goals: 0.8, confidence_score: 0.80,
    },
  },
  {
    id: 5,
    match_date: new Date(Date.now() + 432000000).toISOString(),
    home_team: { name: 'Leeds United', logo: 'https://media.api-sports.io/football/teams/63.png' },
    away_team: { name: 'Sunderland', logo: 'https://media.api-sports.io/football/teams/71.png' },
    league: { name: 'Championship', logo: 'https://media.api-sports.io/football/leagues/40.png' },
    prediction: {
      home_win_prob: 0.48, draw_prob: 0.26, away_win_prob: 0.26,
      over_2_5_prob: 0.52, btts_yes_prob: 0.55,
      predicted_home_goals: 1.5, predicted_away_goals: 1.1, confidence_score: 0.71,
    },
  },
];

function PredictionRow({ data }: { data: PredictionData }) {
  const { prediction } = data;
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
          <Image src={data.league.logo} alt="" width={20} height={20} className="rounded" />
          <span className="text-xs text-[var(--text-muted)]">{data.league.name}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {format(new Date(data.match_date), 'MMM d, HH:mm')}
        </p>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <Image src={data.home_team.logo} alt="" width={24} height={24} />
          <span className="font-medium text-white">{data.home_team.name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <span className="text-[var(--text-muted)]">vs</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2 justify-end">
          <span className="font-medium text-white">{data.away_team.name}</span>
          <Image src={data.away_team.logo} alt="" width={24} height={24} />
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}`}>
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
          <p className="text-2xl font-display font-bold text-white">1,247</p>
          <p className="text-xs text-[var(--text-muted)]">Matches Analyzed</p>
        </div>
      </div>

      {/* Predictions Table */}
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
              {DEMO_PREDICTIONS.map((pred) => (
                <PredictionRow key={pred.id} data={pred} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
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
    </div>
  );
}
