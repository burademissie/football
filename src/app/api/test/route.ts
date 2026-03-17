import { NextResponse } from 'next/server';

/**
 * GET /api/test
 * 
 * Debug endpoint to test API-Football connection
 */
export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const apiHost = process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io';
  
  // Check if key exists
  if (!apiKey) {
    return NextResponse.json({
      error: 'API_FOOTBALL_KEY is not set',
      envVars: {
        API_FOOTBALL_KEY: '❌ Missing',
        API_FOOTBALL_HOST: apiHost,
      }
    });
  }
  
  // Calculate season
  const now = new Date();
  const month = now.getMonth() + 1;
  const calculatedSeason = month < 6 ? now.getFullYear() - 1 : now.getFullYear();
  
  // Test the API - get teams for Premier League
  try {
    // First try calculated season
    let url = `https://${apiHost}/teams?league=39&season=${calculatedSeason}`;
    
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
      },
    });
    
    let data = await response.json();
    
    // If no results, try 2024 season
    if (data.results === 0) {
      url = `https://${apiHost}/teams?league=39&season=2024`;
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-apisports-key': apiKey,
        },
      });
      data = await response.json();
      
      return NextResponse.json({
        status: response.status,
        apiKeySet: `✅ Yes (${apiKey.substring(0, 8)}...)`,
        calculatedSeason: calculatedSeason,
        note: `Season ${calculatedSeason} has no data, tried 2024 instead`,
        teamsFound: data.results,
        apiResponse: data,
      });
    }
    
    return NextResponse.json({
      status: response.status,
      apiKeySet: `✅ Yes (${apiKey.substring(0, 8)}...)`,
      calculatedSeason: calculatedSeason,
      teamsFound: data.results,
      apiResponse: data,
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKeySet: `✅ Yes (${apiKey.substring(0, 8)}...)`,
    });
  }
}
