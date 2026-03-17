'use client';

import Image from 'next/image';
import { SUPPORTED_LEAGUES, LEAGUE_NAMES, SupportedLeagueId } from '@/types/api-football';

interface LeagueFilterProps {
  selectedLeague: SupportedLeagueId | 'all';
  onSelect: (league: SupportedLeagueId | 'all') => void;
}

const LEAGUE_LOGOS: Record<SupportedLeagueId, string> = {
  [SUPPORTED_LEAGUES.PREMIER_LEAGUE]: 'https://media.api-sports.io/football/leagues/39.png',
  [SUPPORTED_LEAGUES.CHAMPIONSHIP]: 'https://media.api-sports.io/football/leagues/40.png',
  [SUPPORTED_LEAGUES.LEAGUE_ONE]: 'https://media.api-sports.io/football/leagues/41.png',
  [SUPPORTED_LEAGUES.LEAGUE_TWO]: 'https://media.api-sports.io/football/leagues/42.png',
};

export function LeagueFilter({ selectedLeague, onSelect }: LeagueFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('all')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200
          ${selectedLeague === 'all'
            ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30'
            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
          }
        `}
      >
        All Leagues
      </button>
      
      {Object.entries(SUPPORTED_LEAGUES).map(([key, id]) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200
            ${selectedLeague === id
              ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30'
              : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)]/50'
            }
          `}
        >
          <Image
            src={LEAGUE_LOGOS[id]}
            alt={LEAGUE_NAMES[id]}
            width={20}
            height={20}
            className="rounded"
          />
          <span className="hidden sm:inline">{LEAGUE_NAMES[id]}</span>
        </button>
      ))}
    </div>
  );
}
