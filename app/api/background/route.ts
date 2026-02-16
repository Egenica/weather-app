import { BackgroundImageUpstreamError, generateBackgroundImage } from '@/lib/server/background-image';
import { NextResponse } from 'next/server';

type BodyPayload = {
  adminArea?: string | null;
  country?: string;
  feelsLike?: number | null;
  humidity?: number | null;
  locationName?: string;
  temperature?: number | null;
  variantKey?: string;
  weatherCode?: number | null;
  windSpeed?: number | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BodyPayload;
    const locationName = (body.locationName ?? '').trim();
    const country = (body.country ?? '').trim();

    if (!locationName || !country) {
      return NextResponse.json({ error: 'locationName and country are required' }, { status: 400 });
    }

    const imageUrl = await generateBackgroundImage({
      adminArea: body.adminArea ?? null,
      country,
      feelsLike: typeof body.feelsLike === 'number' ? body.feelsLike : null,
      humidity: typeof body.humidity === 'number' ? body.humidity : null,
      locationName,
      temperature: typeof body.temperature === 'number' ? body.temperature : null,
      variantKey: typeof body.variantKey === 'string' ? body.variantKey : '',
      weatherCode: typeof body.weatherCode === 'number' ? body.weatherCode : null,
      windSpeed: typeof body.windSpeed === 'number' ? body.windSpeed : null,
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    if (error instanceof BackgroundImageUpstreamError) {
      return NextResponse.json({ imageUrl: null, warning: error.message });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
