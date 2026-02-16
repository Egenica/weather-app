import { sharedCache } from '@/lib/server/cache';

export type GeocodeLocation = {
  adminArea: string | null;
  country: string;
  isRegion: boolean;
  lat: number;
  lon: number;
  name: string;
};

type OpenMeteoResult = {
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
};

type OpenMeteoResponse = {
  results?: OpenMeteoResult[];
};

const GEOCODE_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

const UK_REGIONS: GeocodeLocation[] = [
  { name: 'Yorkshire', adminArea: 'England', country: 'United Kingdom', isRegion: true, lat: 53.9915, lon: -1.5412 },
  { name: 'Lancashire', adminArea: 'England', country: 'United Kingdom', isRegion: true, lat: 53.7632, lon: -2.7044 },
  {
    name: 'Greater Manchester',
    adminArea: 'England',
    country: 'United Kingdom',
    isRegion: true,
    lat: 53.4808,
    lon: -2.2426,
  },
  { name: 'Merseyside', adminArea: 'England', country: 'United Kingdom', isRegion: true, lat: 53.4084, lon: -2.9916 },
  {
    name: 'West Midlands',
    adminArea: 'England',
    country: 'United Kingdom',
    isRegion: true,
    lat: 52.4862,
    lon: -1.8904,
  },
  {
    name: 'West Yorkshire',
    adminArea: 'England',
    country: 'United Kingdom',
    isRegion: true,
    lat: 53.8008,
    lon: -1.5491,
  },
  {
    name: 'South Yorkshire',
    adminArea: 'England',
    country: 'United Kingdom',
    isRegion: true,
    lat: 53.3811,
    lon: -1.4701,
  },
  {
    name: 'North Yorkshire',
    adminArea: 'England',
    country: 'United Kingdom',
    isRegion: true,
    lat: 54.0913,
    lon: -1.4001,
  },
  { name: 'Cumbria', adminArea: 'England', country: 'United Kingdom', isRegion: true, lat: 54.4609, lon: -3.0886 },
  { name: 'Kent', adminArea: 'England', country: 'United Kingdom', isRegion: true, lat: 51.2787, lon: 0.5217 },
  { name: 'Essex', adminArea: 'England', country: 'United Kingdom', isRegion: true, lat: 51.7356, lon: 0.4685 },
  { name: 'Devon', adminArea: 'England', country: 'United Kingdom', isRegion: true, lat: 50.7156, lon: -3.5309 },
  { name: 'Cornwall', adminArea: 'England', country: 'United Kingdom', isRegion: true, lat: 50.266, lon: -5.0527 },
  { name: 'Wales', adminArea: 'Wales', country: 'United Kingdom', isRegion: true, lat: 52.1307, lon: -3.7837 },
  { name: 'Scotland', adminArea: 'Scotland', country: 'United Kingdom', isRegion: true, lat: 56.4907, lon: -4.2026 },
  {
    name: 'Northern Ireland',
    adminArea: 'Northern Ireland',
    country: 'United Kingdom',
    isRegion: true,
    lat: 54.7877,
    lon: -6.4923,
  },
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
    isRegion: false,
    lat: result.latitude,
    lon: result.longitude,
    name: result.name,
  };
}

function isUkResult(result: OpenMeteoResult): boolean {
  if (typeof result.country_code === 'string') {
    return result.country_code.toUpperCase() === 'GB';
  }

  return typeof result.country === 'string' && result.country.toLowerCase() === 'united kingdom';
}

function dedupeLocations(locations: GeocodeLocation[]): GeocodeLocation[] {
  const seen = new Set<string>();
  const unique: GeocodeLocation[] = [];

  for (const location of locations) {
    const key = `${location.name.toLowerCase()}|${(location.adminArea ?? '').toLowerCase()}|${location.country.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(location);
  }

  return unique;
}

function searchUkRegions(query: string): GeocodeLocation[] {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  return UK_REGIONS.filter((region) => {
    const regionName = region.name.toLowerCase();
    const adminArea = (region.adminArea ?? '').toLowerCase();
    return regionName.includes(normalizedQuery) || adminArea.includes(normalizedQuery);
  });
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

    const providerLocations = results
      .filter(isUkResult)
      .map(mapResult)
      .filter((location): location is GeocodeLocation => location !== null);

    const regionLocations = searchUkRegions(normalizedQuery);

    return dedupeLocations([...providerLocations, ...regionLocations]).slice(0, 10);
  });
}
