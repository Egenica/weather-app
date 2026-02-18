import { sharedCache } from '@/lib/server/cache';
import { NextResponse } from 'next/server';

type NominatimResponse = {
  address?: {
    city_district?: string;
    city?: string;
    county?: string;
    hamlet?: string;
    municipality?: string;
    neighbourhood?: string;
    quarter?: string;
    town?: string;
    village?: string;
    state?: string;
    suburb?: string;
  };
  display_name?: string;
  lat?: string;
  lon?: string;
};

function pickName(payload: NominatimResponse): string | null {
  const address = payload.address;
  if (address) {
    const placeName =
      address.town ??
      address.village ??
      address.city ??
      address.suburb ??
      address.neighbourhood ??
      address.quarter ??
      address.hamlet ??
      address.city_district ??
      address.municipality ??
      null;
    if (placeName) {
      return placeName;
    }
  }

  return null;
}

function normalizeCoordinate(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Number(parsed.toFixed(5));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latRaw = searchParams.get('lat');
  const lonRaw = searchParams.get('lon');

  const lat = latRaw ? Number(latRaw) : Number.NaN;
  const lon = lonRaw ? Number(lonRaw) : Number.NaN;

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'lat and lon are required numbers' }, { status: 400 });
  }

  const cacheKey = `reverse-geocode:${lat.toFixed(4)}:${lon.toFixed(4)}`;

  try {
    const location = await sharedCache.getOrSet(cacheKey, async () => {
      const params = new URLSearchParams({
        addressdetails: '1',
        format: 'jsonv2',
        lat: String(lat),
        lon: String(lon),
        zoom: '16',
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'weather-app/1.0 (contact: info@egenica.com)',
        },
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed (${response.status})`);
      }

      const payload = (await response.json()) as NominatimResponse;
      console.log('[reverse-geocode][nominatim]', {
        address: payload.address ?? null,
        displayName: payload.display_name ?? null,
      });

      const name = pickName(payload) ?? 'Current location';
      const adminArea = payload.address?.state ?? payload.address?.county ?? null;

      return {
        adminArea,
        country: 'United Kingdom',
        isRegion: false,
        lat: normalizeCoordinate(payload.lat ?? null, lat),
        lon: normalizeCoordinate(payload.lon ?? null, lon),
        name,
      };
    });

    return NextResponse.json({ location });
  } catch {
    return NextResponse.json({ error: 'Unable to reverse geocode location' }, { status: 502 });
  }
}
