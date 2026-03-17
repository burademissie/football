// API-Football response types
// Documentation: https://www.api-football.com/documentation-v3

export interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: string[] | Record<string, string>;
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

export interface ApiLeague {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string;
  };
  country: {
    name: string;
    code: string;
    flag: string;
  };
  seasons: ApiSeason[];
}

export interface ApiSeason {
  year: number;
  start: string;
  end: string;
  current: boolean;
  coverage: {
    fixtures: {
      events: boolean;
      lineups: boolean;
      statistics_fixtures: boolean;
      statistics_players: boolean;
    };
    standings: boolean;
    players: boolean;
    top_scorers: boolean;
    top_assists: boolean;
    top_cards: boolean;
    injuries: boolean;
    predictions: boolean;
    odds: boolean;
  };
}

export interface ApiFixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: ApiTeam;
    away: ApiTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface ApiTeam {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

export interface ApiTeamInfo {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string;
    founded: number | null;
    national: boolean;
    logo: string;
  };
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

export interface ApiStanding {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: ApiStandingRow[][];
  };
}

export interface ApiStandingRow {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string | null;
  all: ApiStandingStats;
  home: ApiStandingStats;
  away: ApiStandingStats;
  update: string;
}

export interface ApiStandingStats {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
}

export interface ApiOdds {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };
  fixture: {
    id: number;
    timezone: string;
    date: string;
    timestamp: number;
  };
  update: string;
  bookmakers: ApiBookmaker[];
}

export interface ApiBookmaker {
  id: number;
  name: string;
  bets: ApiBet[];
}

export interface ApiBet {
  id: number;
  name: string;
  values: ApiBetValue[];
}

export interface ApiBetValue {
  value: string;
  odd: string;
}

// English leagues we support
export const SUPPORTED_LEAGUES = {
  PREMIER_LEAGUE: 39,
  CHAMPIONSHIP: 40,
  LEAGUE_ONE: 41,
  LEAGUE_TWO: 42,
} as const;

export type SupportedLeagueId = typeof SUPPORTED_LEAGUES[keyof typeof SUPPORTED_LEAGUES];

export const LEAGUE_NAMES: Record<SupportedLeagueId, string> = {
  [SUPPORTED_LEAGUES.PREMIER_LEAGUE]: 'Premier League',
  [SUPPORTED_LEAGUES.CHAMPIONSHIP]: 'Championship',
  [SUPPORTED_LEAGUES.LEAGUE_ONE]: 'League One',
  [SUPPORTED_LEAGUES.LEAGUE_TWO]: 'League Two',
};
