import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/fixtures
 * 
 * Fetch fixtures from Supabase database.
 * Supports filtering by league, date range, and status.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const league = searchParams.get('league');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*),
        league:leagues(*),
        prediction:match_predictions(*),
        value_bets(*)
      `)
      .order('match_date', { ascending: true })
      .limit(limit);

    // Apply filters
    if (league && league !== 'all') {
      query = query.eq('league_id', parseInt(league));
    }

    if (status) {
      if (status === 'upcoming') {
        query = query.eq('status', 'NS').gte('match_date', new Date().toISOString());
      } else if (status === 'live') {
        query = query.in('status', ['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE']);
      } else if (status === 'finished') {
        query = query.in('status', ['FT', 'AET', 'PEN']);
      } else {
        query = query.eq('status', status);
      }
    }

    if (from) {
      query = query.gte('match_date', from);
    }

    if (to) {
      query = query.lte('match_date', to);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      fixtures: data || [],
    });

  } catch (error) {
    console.error('Fixtures API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch fixtures' 
      },
      { status: 500 }
    );
  }
}
