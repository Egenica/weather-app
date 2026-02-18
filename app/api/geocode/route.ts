import { GeocodeUpstreamError, searchUkLocations } from '@/lib/server/geocode';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('[env-check][geocode]', {
    amplifyBranch: process.env.AWS_BRANCH ?? process.env.AMPLIFY_BRANCH ?? null,
    backgroundAssetBaseUrl: process.env.BACKGROUND_ASSET_BASE_URL ?? null,
    hasMetOfficeApiKey: Boolean(process.env.METOFFICE_API_KEY),
    nodeEnv: process.env.NODE_ENV,
  });

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ locations: [] });
  }

  try {
    const locations = await searchUkLocations(query);
    return NextResponse.json({ locations });
  } catch (error) {
    if (error instanceof GeocodeUpstreamError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
