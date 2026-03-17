import { NextRequest, NextResponse } from 'next/server';
import { dataSyncService } from '@/lib/sync/data-sync';
import { probabilityEngine } from '@/lib/analytics/probability-engine';

/**
 * GET /api/cron/daily-sync
 * 
 * Scheduled daily sync endpoint.
 * This should be called by a cron service (e.g., Vercel Cron, GitHub Actions).
 * 
 * Schedule: Daily at 6:00 AM UTC
 * 
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-sync",
 *     "schedule": "0 6 * * *"
 *   }]
 * }
 * 
 * The cron job performs:
 * 1. Sync upcoming fixtures (next 14 days)
 * 2. Update team statistics
 * 3. Generate predictions for new matches
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has valid secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Vercel Cron sends a specific header
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    
    if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting daily sync...');
    const startTime = Date.now();

    // Step 1: Sync upcoming fixtures
    console.log('Step 1: Syncing upcoming fixtures...');
    const syncResult = await dataSyncService.syncUpcoming(14);

    // Step 2: Generate predictions for new matches
    console.log('Step 2: Generating predictions...');
    const predictionsGenerated = await probabilityEngine.generateAllPredictions();

    const duration = Date.now() - startTime;

    const result = {
      success: syncResult.success,
      message: `Daily sync completed in ${duration}ms`,
      sync: syncResult.synced,
      predictions: predictionsGenerated,
      timestamp: new Date().toISOString(),
    };

    console.log('Daily sync completed:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Daily sync error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
