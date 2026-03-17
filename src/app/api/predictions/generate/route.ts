import { NextResponse } from 'next/server';
import { probabilityEngine } from '@/lib/analytics/probability-engine';

/**
 * POST /api/predictions/generate
 * 
 * Generates predictions for all upcoming matches
 */
export async function POST() {
  try {
    const startTime = Date.now();
    
    const predictionsGenerated = await probabilityEngine.generateAllPredictions();
    
    return NextResponse.json({
      success: true,
      message: `Generated ${predictionsGenerated} predictions in ${Date.now() - startTime}ms`,
      predictionsGenerated,
    });
    
  } catch (error) {
    console.error('Prediction generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Also support GET for easy browser access
export async function GET() {
  return POST();
}
