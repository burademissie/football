import { NextRequest, NextResponse } from 'next/server';
import { dataSyncService } from '@/lib/sync/data-sync';

/**
 * POST /api/sync
 * 
 * Triggers a full data sync from API-Football to Supabase.
 * This endpoint should be protected in production.
 * 
 * Data Pipeline:
 * 1. API-Football (source) → Fetch fixtures, teams, leagues
 * 2. Transform → Convert API responses to database schema
 * 3. Supabase (destination) → Upsert into PostgreSQL tables
 * 4. Predictions → Generate probability calculations
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization (in production, use proper auth)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get sync type from query params
    const { searchParams } = new URL(request.url);
    const syncType = searchParams.get('type') || 'full';

    let result;

    if (syncType === 'upcoming') {
      // Only sync upcoming fixtures (faster, for daily updates)
      const days = parseInt(searchParams.get('days') || '14');
      result = await dataSyncService.syncUpcoming(days);
    } else {
      // Full sync of all data
      result = await dataSyncService.syncAll();
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync
 * 
 * Also triggers sync (for easy browser access).
 * Add ?status=true to just get status without syncing.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // If ?status=true, just return status
  if (searchParams.get('status') === 'true') {
    return NextResponse.json({
      status: 'ready',
      lastSync: new Date().toISOString(),
      nextScheduledSync: new Date(Date.now() + 86400000).toISOString(),
      supportedLeagues: [
        { id: 39, name: 'Premier League' },
        { id: 40, name: 'Championship' },
        { id: 41, name: 'League One' },
        { id: 42, name: 'League Two' },
      ],
    });
  }
  
  // Otherwise, trigger sync
  try {
    const syncType = searchParams.get('type') || 'full';
    
    let result;
    if (syncType === 'upcoming') {
      const days = parseInt(searchParams.get('days') || '14');
      result = await dataSyncService.syncUpcoming(days);
    } else {
      result = await dataSyncService.syncAll();
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
