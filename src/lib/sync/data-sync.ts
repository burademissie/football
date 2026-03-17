import { createServerClient } from '@/lib/supabase/client';
import { apiFootball } from '@/lib/api-football/client';
import { SUPPORTED_LEAGUES, ApiFixture, ApiTeamInfo, SupportedLeagueId } from '@/types/api-football';
import { League, Team, Match, MatchStatus, SyncResult } from '@/types/database';

/**
 * Data Sync Pipeline
 * 
 * Architecture:
 * 1. API-Football → Fetch raw data (fixtures, teams, leagues)
 * 2. Transform → Convert API responses to database schema
 * 3. Supabase → Upsert data into PostgreSQL tables
 * 4. Calculate → Run probability engine on new matches
 * 
 * This pipeline runs:
 * - Daily via cron job (scheduled sync)
 * - On-demand via admin API endpoint
 */

export class DataSyncService {
  private errors: string[] = [];
  
  private get supabase() {
    return createServerClient();
  }

  /**
   * Full sync of all supported leagues
   */
  async syncAll(): Promise<SyncResult> {
    const startTime = Date.now();
    let leaguesSynced = 0;
    let teamsSynced = 0;
    let matchesSynced = 0;

    try {
      // Log sync start
      await this.logSyncStart();

      const season = apiFootball.getCurrentSeason();

      // Sync each supported league
      for (const [leagueName, leagueId] of Object.entries(SUPPORTED_LEAGUES)) {
        console.log(`Syncing ${leagueName} (ID: ${leagueId})...`);

        try {
          // 1. Sync league info
          const leagueSynced = await this.syncLeague(leagueId, season);
          if (leagueSynced) leaguesSynced++;

          // 2. Sync teams for this league
          const teamsCount = await this.syncTeams(leagueId, season);
          teamsSynced += teamsCount;

          // 3. Sync fixtures
          const matchesCount = await this.syncFixtures(leagueId, season);
          matchesSynced += matchesCount;

        } catch (error) {
          const errorMsg = `Failed to sync ${leagueName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          this.errors.push(errorMsg);
        }
      }

      // Log sync completion
      await this.logSyncComplete(leaguesSynced, teamsSynced, matchesSynced);

      return {
        success: true,
        message: `Sync completed in ${Date.now() - startTime}ms`,
        synced: {
          leagues: leaguesSynced,
          teams: teamsSynced,
          matches: matchesSynced,
        },
        errors: this.errors.length > 0 ? this.errors : undefined,
        warnings: teamsSynced === 0 ? ['No teams synced - check if API_FOOTBALL_KEY is set correctly'] : undefined,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown sync error';
      this.errors.push(errorMsg);
      
      return {
        success: false,
        message: `Sync failed: ${errorMsg}`,
        synced: { leagues: 0, teams: 0, matches: 0 },
        errors: this.errors,
      };
    }
  }

  /**
   * Sync a single league's information
   */
  private async syncLeague(leagueId: SupportedLeagueId, season: number): Promise<boolean> {
    const response = await apiFootball.getLeague(leagueId);
    
    if (!response.response || response.response.length === 0) {
      throw new Error(`No league data returned for ID ${leagueId}`);
    }

    const apiLeague = response.response[0];
    
    const league: Partial<League> = {
      id: apiLeague.league.id,
      name: apiLeague.league.name,
      country: apiLeague.country.name,
      logo: apiLeague.league.logo,
      flag: apiLeague.country.flag,
      season,
    };

    const { error } = await this.supabase
      .from('leagues')
      .upsert(league, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to upsert league: ${error.message}`);
    }

    return true;
  }

  /**
   * Sync teams for a league
   */
  private async syncTeams(leagueId: SupportedLeagueId, season: number): Promise<number> {
    const response = await apiFootball.getTeamsByLeague(leagueId, season);
    
    if (!response.response) {
      return 0;
    }

    const teams: Partial<Team>[] = response.response.map((item: ApiTeamInfo) => ({
      id: item.team.id,
      name: item.team.name,
      code: item.team.code,
      country: item.team.country,
      logo: item.team.logo,
      founded: item.team.founded,
      venue_name: item.venue?.name,
      venue_city: item.venue?.city,
      venue_capacity: item.venue?.capacity,
    }));

    const { error } = await this.supabase
      .from('teams')
      .upsert(teams, { onConflict: 'id' });

    if (error) {
      throw new Error(`Failed to upsert teams: ${error.message}`);
    }

    return teams.length;
  }

  /**
   * Sync fixtures for a league
   */
  private async syncFixtures(leagueId: SupportedLeagueId, season: number): Promise<number> {
    const response = await apiFootball.getFixtures(leagueId, season);
    
    if (!response.response) {
      return 0;
    }

    const matches: Partial<Match>[] = response.response.map((fixture: ApiFixture) => ({
      id: fixture.fixture.id,
      league_id: fixture.league.id,
      season: fixture.league.season,
      round: fixture.league.round,
      home_team_id: fixture.teams.home.id,
      away_team_id: fixture.teams.away.id,
      match_date: fixture.fixture.date,
      match_timestamp: fixture.fixture.timestamp,
      venue: fixture.fixture.venue.name,
      city: fixture.fixture.venue.city,
      status: fixture.fixture.status.short as MatchStatus,
      status_elapsed: fixture.fixture.status.elapsed,
      home_score: fixture.goals.home,
      away_score: fixture.goals.away,
      home_halftime_score: fixture.score.halftime.home,
      away_halftime_score: fixture.score.halftime.away,
      home_fulltime_score: fixture.score.fulltime.home,
      away_fulltime_score: fixture.score.fulltime.away,
    }));

    // Batch upsert in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < matches.length; i += chunkSize) {
      const chunk = matches.slice(i, i + chunkSize);
      const { error } = await this.supabase
        .from('matches')
        .upsert(chunk, { onConflict: 'id' });

      if (error) {
        throw new Error(`Failed to upsert matches: ${error.message}`);
      }
    }

    return matches.length;
  }

  /**
   * Sync only upcoming fixtures (more efficient for daily updates)
   */
  async syncUpcoming(days: number = 14): Promise<SyncResult> {
    const startTime = Date.now();
    let matchesSynced = 0;

    try {
      const fixtures = await apiFootball.getUpcomingFixtures(days);
      
      const matches: Partial<Match>[] = fixtures.map((fixture: ApiFixture) => ({
        id: fixture.fixture.id,
        league_id: fixture.league.id,
        season: fixture.league.season,
        round: fixture.league.round,
        home_team_id: fixture.teams.home.id,
        away_team_id: fixture.teams.away.id,
        match_date: fixture.fixture.date,
        match_timestamp: fixture.fixture.timestamp,
        venue: fixture.fixture.venue.name,
        city: fixture.fixture.venue.city,
        status: fixture.fixture.status.short as MatchStatus,
        status_elapsed: fixture.fixture.status.elapsed,
        home_score: fixture.goals.home,
        away_score: fixture.goals.away,
        home_halftime_score: fixture.score.halftime.home,
        away_halftime_score: fixture.score.halftime.away,
        home_fulltime_score: fixture.score.fulltime.home,
        away_fulltime_score: fixture.score.fulltime.away,
      }));

      if (matches.length > 0) {
        const { error } = await this.supabase
          .from('matches')
          .upsert(matches, { onConflict: 'id' });

        if (error) {
          throw new Error(`Failed to upsert matches: ${error.message}`);
        }
        matchesSynced = matches.length;
      }

      return {
        success: true,
        message: `Upcoming sync completed in ${Date.now() - startTime}ms`,
        synced: { leagues: 0, teams: 0, matches: matchesSynced },
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed',
        synced: { leagues: 0, teams: 0, matches: 0 },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Log sync start to database
   */
  private async logSyncStart(): Promise<void> {
    await this.supabase.from('sync_logs').insert({
      sync_type: 'full',
      status: 'running',
    });
  }

  /**
   * Log sync completion
   */
  private async logSyncComplete(leagues: number, teams: number, matches: number): Promise<void> {
    await this.supabase.from('sync_logs').insert({
      sync_type: 'full',
      status: this.errors.length > 0 ? 'completed_with_errors' : 'completed',
      leagues_synced: leagues,
      teams_synced: teams,
      matches_synced: matches,
      errors: this.errors.length > 0 ? this.errors : null,
      completed_at: new Date().toISOString(),
    });
  }
}

// Export singleton
export const dataSyncService = new DataSyncService();
