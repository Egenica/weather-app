import { sharedCache } from '@/lib/server/cache';

export type GeocodeLocation = {
  adminArea: string | null;
  country: string;
  lat: number;
  lon: number;
  name: string;
};

type OpenMeteoResult = {
  admin1?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
};

type OpenMeteoResponse = {
  results?: OpenMeteoResult[];
};

const GEOCODE_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

const POPULAR_UK_LOCATIONS: GeocodeLocation[] = [
  { name: 'London', adminArea: 'England', country: 'United Kingdom', lat: 51.5072, lon: -0.1276 },
  { name: 'Birmingham', adminArea: 'England', country: 'United Kingdom', lat: 52.4862, lon: -1.8904 },
  { name: 'Manchester', adminArea: 'England', country: 'United Kingdom', lat: 53.4808, lon: -2.2426 },
  { name: 'Leeds', adminArea: 'England', country: 'United Kingdom', lat: 53.8008, lon: -1.5491 },
  { name: 'Glasgow', adminArea: 'Scotland', country: 'United Kingdom', lat: 55.8642, lon: -4.2518 },
  { name: 'Liverpool', adminArea: 'England', country: 'United Kingdom', lat: 53.4084, lon: -2.9916 },
  { name: 'Bristol', adminArea: 'England', country: 'United Kingdom', lat: 51.4545, lon: -2.5879 },
  { name: 'Edinburgh', adminArea: 'Scotland', country: 'United Kingdom', lat: 55.9533, lon: -3.1883 },
  { name: 'Cardiff', adminArea: 'Wales', country: 'United Kingdom', lat: 51.4816, lon: -3.1791 },
  { name: 'Belfast', adminArea: 'Northern Ireland', country: 'United Kingdom', lat: 54.5973, lon: -5.9301 },
];

export class GeocodeUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeocodeUpstreamError';
  }
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

function mapResult(result: OpenMeteoResult): GeocodeLocation | null {
  if (
    typeof result.name !== 'string' ||
    typeof result.country !== 'string' ||
    typeof result.latitude !== 'number' ||
    typeof result.longitude !== 'number'
  ) {
    return null;
  }

  return {
    adminArea: typeof result.admin1 === 'string' ? result.admin1 : null,
    country: result.country,
    lat: result.latitude,
    lon: result.longitude,
    name: result.name,
  };
}

export function getPopularUkLocations(): GeocodeLocation[] {
  return POPULAR_UK_LOCATIONS;
}

export async function searchUkLocations(query: string): Promise<GeocodeLocation[]> {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const cacheKey = `geocode:${normalizedQuery}`;

  return sharedCache.getOrSet(cacheKey, async () => {
    const params = new URLSearchParams({
      count: '12',
      country: 'GB',
      language: 'en',
      name: normalizedQuery,
    });

    const response = await fetch(`${GEOCODE_ENDPOINT}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      method: 'GET',
    });

    if (!response.ok) {
      throw new GeocodeUpstreamError(`Open-Meteo geocoding failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenMeteoResponse;
    const results = Array.isArray(payload.results) ? payload.results : [];

    return results
      .map(mapResult)
      .filter((location): location is GeocodeLocation => location !== null)
      .slice(0, 10);
  });
}
