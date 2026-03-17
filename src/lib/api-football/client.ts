import {
  ApiFootballResponse,
  ApiFixture,
  ApiLeague,
  ApiTeamInfo,
  ApiStanding,
  ApiOdds,
  SUPPORTED_LEAGUES,
  SupportedLeagueId,
} from '@/types/api-football';

/**
 * API-Football Client
 * 
 * Authentication: API-Football uses the x-apisports-key header for authentication.
 * This is the correct HTTP header required to authenticate requests.
 * 
 * Rate Limits:
 * - Free plan: 100 requests/day
 * - Pro plans: Higher limits based on subscription
 */
class ApiFootballClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = `https://${process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'}`;
    this.apiKey = process.env.API_FOOTBALL_KEY || '';
  }

  private async request<T>(endpoint: string, params?: Record<string, string | number>): Promise<ApiFootballResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        // x-apisports-key is the correct authentication header for API-Football
        'x-apisports-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`API-Football request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get league information
   */
  async getLeague(leagueId: SupportedLeagueId): Promise<ApiFootballResponse<ApiLeague>> {
    return this.request<ApiLeague>('/leagues', { id: leagueId });
  }

  /**
   * Get all supported English leagues
   */
  async getSupportedLeagues(): Promise<ApiFootballResponse<ApiLeague>> {
    const leagueIds = Object.values(SUPPORTED_LEAGUES).join('-');
    return this.request<ApiLeague>('/leagues', { id: leagueIds, country: 'England' });
  }

  /**
   * Get fixtures for a specific league and season
   */
  async getFixtures(
    leagueId: SupportedLeagueId,
    season: number,
    options?: {
      from?: string; // YYYY-MM-DD
      to?: string;   // YYYY-MM-DD
      status?: string;
      round?: string;
    }
  ): Promise<ApiFootballResponse<ApiFixture>> {
    const params: Record<string, string | number> = {
      league: leagueId,
      season,
    };

    if (options?.from) params.from = options.from;
    if (options?.to) params.to = options.to;
    if (options?.status) params.status = options.status;
    if (options?.round) params.round = options.round;

    return this.request<ApiFixture>('/fixtures', params);
  }

  /**
   * Get upcoming fixtures for all supported leagues
   */
  async getUpcomingFixtures(days: number = 7): Promise<ApiFixture[]> {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + days);

    const from = today.toISOString().split('T')[0];
    const to = endDate.toISOString().split('T')[0];
    const season = this.getCurrentSeason();

    const allFixtures: ApiFixture[] = [];

    for (const leagueId of Object.values(SUPPORTED_LEAGUES)) {
      try {
        const response = await this.getFixtures(leagueId, season, { from, to });
        if (response.response) {
          allFixtures.push(...response.response);
        }
      } catch (error) {
        console.error(`Failed to fetch fixtures for league ${leagueId}:`, error);
      }
    }

    // Sort by date
    return allFixtures.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);
  }

  /**
   * Get live fixtures
   */
  async getLiveFixtures(): Promise<ApiFootballResponse<ApiFixture>> {
    return this.request<ApiFixture>('/fixtures', { live: 'all' });
  }

  /**
   * Get team information
   */
  async getTeam(teamId: number): Promise<ApiFootballResponse<ApiTeamInfo>> {
    return this.request<ApiTeamInfo>('/teams', { id: teamId });
  }

  /**
   * Get teams for a league
   */
  async getTeamsByLeague(leagueId: SupportedLeagueId, season: number): Promise<ApiFootballResponse<ApiTeamInfo>> {
    return this.request<ApiTeamInfo>('/teams', { league: leagueId, season });
  }

  /**
   * Get league standings
   */
  async getStandings(leagueId: SupportedLeagueId, season: number): Promise<ApiFootballResponse<ApiStanding>> {
    return this.request<ApiStanding>('/standings', { league: leagueId, season });
  }

  /**
   * Get odds for a fixture
   */
  async getOdds(fixtureId: number): Promise<ApiFootballResponse<ApiOdds>> {
    return this.request<ApiOdds>('/odds', { fixture: fixtureId });
  }

  /**
   * Get odds for upcoming fixtures in a league
   */
  async getLeagueOdds(leagueId: SupportedLeagueId, season: number): Promise<ApiFootballResponse<ApiOdds>> {
    return this.request<ApiOdds>('/odds', { league: leagueId, season });
  }

  /**
   * Get head-to-head history between two teams
   */
  async getHeadToHead(team1Id: number, team2Id: number, last: number = 10): Promise<ApiFootballResponse<ApiFixture>> {
    return this.request<ApiFixture>('/fixtures/headtohead', {
      h2h: `${team1Id}-${team2Id}`,
      last,
    });
  }

  /**
   * Get current football season (August to May)
   */
  getCurrentSeason(): number {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0-indexed
    
    // If we're in Jan-May, we're in the season that started last year
    // If we're in Aug-Dec, we're in the season that started this year
    // Jun-Jul is off-season, default to upcoming season
    return month < 6 ? year - 1 : year;
  }
}

// Export singleton instance
export const apiFootball = new ApiFootballClient();
