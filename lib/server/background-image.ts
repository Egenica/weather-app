import { TtlCache } from '@/lib/server/cache';
import { access } from 'node:fs/promises';
import path from 'node:path';

const backgroundCache = new TtlCache(24 * 60 * 60 * 1000);
const backgroundAssetBaseUrl = process.env.BACKGROUND_ASSET_BASE_URL?.trim().replace(/\/+$/, '') ?? '';

export class BackgroundImageUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackgroundImageUpstreamError';
  }
}

type BackgroundSource = 'local' | 'cache';

type GenerateBackgroundInput = {
  adminArea?: string | null;
  country: string;
  feelsLike?: number | null;
  humidity?: number | null;
  locationName: string;
  temperature?: number | null;
  variantKey?: string;
  weatherCode: number | null;
  windSpeed?: number | null;
};

const WEATHER_BUCKETS: Record<number, string> = {
  0: 'clear',
  1: 'clear',
  2: 'partly-cloudy',
  3: 'partly-cloudy',
  5: 'mist-fog',
  6: 'mist-fog',
  7: 'cloudy',
  8: 'overcast',
  9: 'drizzle',
  10: 'drizzle',
  11: 'drizzle',
  12: 'rain',
  13: 'heavy-rain',
  14: 'heavy-rain',
  15: 'heavy-rain',
  16: 'sleet',
  17: 'sleet',
  18: 'sleet',
  19: 'hail',
  20: 'hail',
  21: 'hail',
  22: 'light-snow',
  23: 'light-snow',
  24: 'light-snow',
  25: 'heavy-snow',
  26: 'heavy-snow',
  27: 'heavy-snow',
  28: 'thunderstorm',
  29: 'thunderstorm',
  30: 'thunderstorm',
};

function cacheKey(input: GenerateBackgroundInput): string {
  return [
    'bg:v10',
    input.locationName.trim().toLowerCase(),
    (input.adminArea ?? '').trim().toLowerCase(),
    input.country.trim().toLowerCase(),
    String(input.weatherCode ?? 'unknown'),
    (input.variantKey ?? '').trim().toLowerCase(),
  ].join(':');
}

function withAssetBase(pathname: string): string {
  if (!backgroundAssetBaseUrl) {
    return pathname;
  }

  return `${backgroundAssetBaseUrl}${pathname}`;
}

function weatherBucket(weatherCode: number | null): string {
  if (typeof weatherCode !== 'number') {
    return 'cloudy';
  }

  return WEATHER_BUCKETS[weatherCode] ?? 'cloudy';
}

function bucketFallbacks(bucket: string): string[] {
  const fallbackMap: Record<string, string[]> = {
    'partly-cloudy': ['cloudy', 'overcast', 'clear'],
    overcast: ['cloudy', 'partly-cloudy'],
    cloudy: ['overcast', 'partly-cloudy'],
    drizzle: ['rain', 'cloudy'],
    rain: ['heavy-rain', 'drizzle', 'cloudy'],
    'heavy-rain': ['rain', 'overcast'],
    'mist-fog': ['cloudy', 'overcast'],
    sleet: ['light-snow', 'rain', 'cloudy'],
    hail: ['heavy-rain', 'thunderstorm', 'cloudy'],
    'light-snow': ['heavy-snow', 'sleet', 'cloudy'],
    'heavy-snow': ['light-snow', 'sleet', 'cloudy'],
    thunderstorm: ['heavy-rain', 'rain', 'overcast'],
    clear: ['partly-cloudy', 'cloudy'],
  };

  return [bucket, ...(fallbackMap[bucket] ?? [])];
}

function dayPart(weatherCode: number | null): 'day' | 'night' {
  if (weatherCode === 0 || weatherCode === 2) {
    return 'night';
  }

  return 'day';
}

function regionSlug(input: GenerateBackgroundInput): string {
  const target = `${input.locationName} ${input.adminArea ?? ''} ${input.country}`.toLowerCase();

  if (/scotland|aberdeen|inverness|fort william|isle of skye/.test(target)) {
    return 'scotland';
  }
  if (/wales|cardiff|swansea|newport|bangor/.test(target)) {
    return 'wales';
  }
  if (/northern ireland|belfast|derry|armagh/.test(target)) {
    return 'northern-ireland';
  }
  if (/lancashire|blackpool|preston|liverpool|manchester|north west|cumbria/.test(target)) {
    return 'north-west-england';
  }
  if (/newcastle|sunderland|durham|north east/.test(target)) {
    return 'north-east-england';
  }
  if (/yorkshire|leeds|sheffield|hull|york/.test(target)) {
    return 'yorkshire-humber';
  }
  if (/birmingham|coventry|wolverhampton|west midlands/.test(target)) {
    return 'west-midlands';
  }
  if (/nottingham|derby|leicester|east midlands/.test(target)) {
    return 'east-midlands';
  }
  if (/norfolk|suffolk|cambridge|east of england/.test(target)) {
    return 'east-england';
  }
  if (/london|greater london/.test(target)) {
    return 'greater-london';
  }
  if (/kent|surrey|sussex|hampshire|south east/.test(target)) {
    return 'south-east-england';
  }
  if (/cornwall|devon|somerset|bristol|south west/.test(target)) {
    return 'south-west-england';
  }

  return 'uk';
}

async function fileExists(absolutePath: string): Promise<boolean> {
  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveLocalBackgroundImage(input: GenerateBackgroundInput): Promise<string | null> {
  const region = regionSlug(input);
  const bucket = weatherBucket(input.weatherCode);
  const time = dayPart(input.weatherCode);
  const buckets = bucketFallbacks(bucket);

  const candidates: string[] = [];

  for (const candidateBucket of buckets) {
    candidates.push(
      `/backgrounds/uk/${region}/${candidateBucket}/${time}/v1.jpg`,
      `/backgrounds/uk/${region}/${candidateBucket}/${time}/v1.webp`,
      `/backgrounds/uk/${region}/${candidateBucket}/${time}/v1.png`,
      `/backgrounds/uk/${region}/${candidateBucket}/v1.jpg`,
      `/backgrounds/uk/${region}/${candidateBucket}/v1.webp`,
      `/backgrounds/uk/${region}/${candidateBucket}/v1.png`,
      `/backgrounds/${region}/${candidateBucket}/${time}/v1.jpg`,
      `/backgrounds/${region}/${candidateBucket}/${time}/v1.webp`,
      `/backgrounds/${region}/${candidateBucket}/${time}/v1.png`,
      `/backgrounds/${region}/${candidateBucket}/v1.jpg`,
      `/backgrounds/${region}/${candidateBucket}/v1.webp`,
      `/backgrounds/${region}/${candidateBucket}/v1.png`,
      `/backgrounds/uk/${candidateBucket}/${time}/v1.jpg`,
      `/backgrounds/uk/${candidateBucket}/${time}/v1.webp`,
      `/backgrounds/uk/${candidateBucket}/${time}/v1.png`,
    );
  }

  if (backgroundAssetBaseUrl) {
    return withAssetBase(candidates[0]);
  }

  for (const candidate of candidates) {
    const absolute = path.join(process.cwd(), 'public', candidate.replace(/^\//, ''));
    if (await fileExists(absolute)) {
      return withAssetBase(candidate);
    }
  }

  return null;
}

export async function generateBackgroundImage(
  input: GenerateBackgroundInput,
): Promise<{ imageUrl: string; source: BackgroundSource }> {
  const key = cacheKey(input);
  const cached = backgroundCache.get<string>(key);
  if (cached) {
    return { imageUrl: cached, source: 'cache' };
  }

  const localImagePath = await resolveLocalBackgroundImage(input);
  if (localImagePath) {
    backgroundCache.set(key, localImagePath);
    return { imageUrl: localImagePath, source: 'local' };
  }

  throw new BackgroundImageUpstreamError(
    `No local background image found for region '${regionSlug(input)}', condition '${weatherBucket(input.weatherCode)}', and time '${dayPart(input.weatherCode)}'.`,
  );
}
