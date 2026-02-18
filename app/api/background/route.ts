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
    console.log('[env-check][background]', {
      amplifyBranch: process.env.AWS_BRANCH ?? process.env.AMPLIFY_BRANCH ?? null,
      backgroundAssetBaseUrl: process.env.BACKGROUND_ASSET_BASE_URL ?? null,
      hasMetOfficeApiKey: Boolean(process.env.METOFFICE_API_KEY),
      nodeEnv: process.env.NODE_ENV,
    });

    const body = (await request.json()) as BodyPayload;
    const locationName = (body.locationName ?? '').trim();
    const country = (body.country ?? '').trim();

    if (!locationName || !country) {
      return NextResponse.json({ error: 'locationName and country are required' }, { status: 400 });
    }

    const { imageUrl, source } = await generateBackgroundImage({
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

    return NextResponse.json({ imageUrl, source });
  } catch (error) {
    if (error instanceof BackgroundImageUpstreamError) {
      return NextResponse.json({ imageUrl: null, warning: error.message });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
