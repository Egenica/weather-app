import { DataHubConfigError, DataHubUpstreamError, getCurrentHourlyForecast } from '@/lib/server/weather-datahub';
import { NextResponse } from 'next/server';

function parseCoordinate(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseCoordinate(searchParams.get('lat'));
  const lon = parseCoordinate(searchParams.get('lon'));

  if (lat === null || lon === null) {
    return NextResponse.json({ error: 'lat and lon are required numeric values' }, { status: 400 });
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'lat/lon are out of allowed range' }, { status: 400 });
  }

  try {
    const weather = await getCurrentHourlyForecast(lat, lon);
    return NextResponse.json(weather);
  } catch (error) {
    if (error instanceof DataHubUpstreamError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    if (error instanceof DataHubConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
