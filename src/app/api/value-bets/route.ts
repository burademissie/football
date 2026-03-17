import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * GET /api/value-bets
 * 
 * Fetch value bets from Supabase database.
 * Returns bets where our calculated probability exceeds implied probability.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const minEdge = parseFloat(searchParams.get('minEdge') || '5');
    const betType = searchParams.get('betType');
    const confidence = searchParams.get('confidence');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('value_bets')
      .select(`
        *,
        match:matches!inner(
          id,
          match_date,
          status,
          home_team:teams!matches_home_team_id_fkey(name, logo),
          away_team:teams!matches_away_team_id_fkey(name, logo),
          league:leagues(name, logo)
        )
      `)
      .eq('is_value', true)
      .eq('match.status', 'NS')
      .gte('match.match_date', new Date().toISOString())
      .gte('edge_percentage', minEdge)
      .order('edge_percentage', { ascending: false })
      .limit(limit);

    // Apply filters
    if (betType && betType !== 'all') {
      query = query.eq('bet_type', betType);
    }

    if (confidence && confidence !== 'all') {
      if (confidence === 'high') {
        query = query.eq('confidence', 'high');
      } else if (confidence === 'medium') {
        query = query.in('confidence', ['high', 'medium']);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate summary stats
    const valueBets = data || [];
    const totalEV = valueBets.reduce((sum, bet) => sum + bet.expected_value, 0);
    const avgEdge = valueBets.length > 0 
      ? valueBets.reduce((sum, bet) => sum + bet.edge_percentage, 0) / valueBets.length 
      : 0;

    return NextResponse.json({
      success: true,
      count: valueBets.length,
      summary: {
        totalExpectedValue: totalEV,
        averageEdge: avgEdge,
        highConfidence: valueBets.filter(b => b.confidence === 'high').length,
      },
      valueBets,
    });

  } catch (error) {
    console.error('Value bets API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch value bets' 
      },
      { status: 500 }
    );
  }
}
