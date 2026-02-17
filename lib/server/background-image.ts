import { TtlCache } from '@/lib/server/cache';

const backgroundCache = new TtlCache(24 * 60 * 60 * 1000);
const TARGET_IMAGE_WIDTH = 2560;
const TARGET_IMAGE_HEIGHT = 1440;

export class BackgroundImageUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackgroundImageUpstreamError';
  }
}

type BackgroundSource = 'pollinations' | 'unsplash' | 'cache';

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

const WEATHER_LABELS: Record<number, string> = {
  0: 'clear night',
  1: 'sunny day',
  2: 'partly cloudy night',
  3: 'partly cloudy day',
  5: 'misty',
  6: 'foggy',
  7: 'cloudy',
  8: 'overcast',
  9: 'light rain shower',
  10: 'light rain shower',
  11: 'drizzle',
  12: 'light rain',
  13: 'heavy rain shower',
  14: 'heavy rain shower',
  15: 'heavy rain',
  16: 'sleet shower',
  17: 'sleet shower',
  18: 'sleet',
  19: 'hail shower',
  20: 'hail shower',
  21: 'hail',
  22: 'light snow shower',
  23: 'light snow shower',
  24: 'light snow',
  25: 'heavy snow shower',
  26: 'heavy snow shower',
  27: 'heavy snow',
  28: 'thunder shower',
  29: 'thunder shower',
  30: 'thunderstorm',
};

const WEATHER_VISUAL_RULES: Record<number, string> = {
  0: 'clear night sky with visible stars or moonlight, dark blue tones',
  1: 'strong sunlight and clear visibility',
  7: 'cloud-dominant sky and subdued daylight',
  8: 'fully overcast sky with heavy grey cloud cover',
  12: 'steady rain with clearly wet terrain and puddles',
  15: 'heavy rain with stormy atmosphere',
  22: 'light snow shower with visible flakes',
  24: 'light snowfall settling on landscape',
  27: 'heavy snow and severe winter conditions',
  30: 'thunderstorm clouds with dramatic storm light',
};

const LOCATION_STYLE_HINTS: Array<{ match: RegExp; hint: string }> = [
  {
    match: /blackpool|lancashire|merseyside|liverpool/i,
    hint: 'windswept coastal plain, sea air mood, northern shoreline character',
  },
  {
    match: /cardiff|wales|swansea|newport/i,
    hint: 'rolling welsh hills, dramatic valleys, coastal-weather atmosphere',
  },
  { match: /aberdeen|inverness|scotland/i, hint: 'highland-inspired terrain, rugged landforms, cool northern light' },
  { match: /yorkshire|leeds|sheffield/i, hint: 'moorland textures, dry-stone wall patterns, broad northern skies' },
  { match: /london|kent|essex/i, hint: 'southern english countryside palette, softer lowland horizon' },
];

function locationStyleHint(input: GenerateBackgroundInput): string {
  const target = `${input.locationName} ${input.adminArea ?? ''} ${input.country}`;
  const matched = LOCATION_STYLE_HINTS.find((item) => item.match.test(target));
  return matched ? matched.hint : 'regional UK landscape character matching this location';
}

function cacheKey(input: GenerateBackgroundInput): string {
  return [
    'bg:v7',
    input.locationName.trim().toLowerCase(),
    (input.adminArea ?? '').trim().toLowerCase(),
    input.country.trim().toLowerCase(),
    String(input.weatherCode ?? 'unknown'),
    (input.variantKey ?? '').trim().toLowerCase(),
  ].join(':');
}

function buildPrompt(input: GenerateBackgroundInput): string {
  const weatherLabel =
    typeof input.weatherCode === 'number' ? WEATHER_LABELS[input.weatherCode] ?? 'weather' : 'weather';
  const weatherRule =
    typeof input.weatherCode === 'number'
      ? WEATHER_VISUAL_RULES[input.weatherCode] ?? 'weather conditions clearly visible in the scene'
      : 'weather conditions clearly visible in the scene';

  const area = input.adminArea ? `${input.adminArea}, ${input.country}` : input.country;
  const conditionBits = [
    typeof input.temperature === 'number' ? `temperature around ${Math.round(input.temperature)}C` : null,
    typeof input.feelsLike === 'number' ? `feels like ${Math.round(input.feelsLike)}C` : null,
    typeof input.humidity === 'number' ? `humidity about ${Math.round(input.humidity)}%` : null,
    typeof input.windSpeed === 'number' ? `wind around ${Math.round(input.windSpeed)} mph` : null,
  ].filter(Boolean);

  return [
    `Beautiful atmospheric landscape inspired by ${input.locationName}, ${area}.`,
    `Location style cue: ${locationStyleHint(input)}.`,
    `Current conditions: ${weatherLabel}.`,
    `The weather must be visually obvious: ${weatherRule}.`,
    conditionBits.length > 0 ? `Condition cues: ${conditionBits.join(', ')}.` : null,
    input.variantKey ? `Scene variation key: ${input.variantKey}. Use a distinct composition.` : null,
    'Painterly-cinematic style, rich color grading, layered clouds, dramatic but natural lighting.',
    'No people, no text, no logos, no signage, no watermark.',
  ]
    .filter(Boolean)
    .join(' ');
}

function toDataUrl(contentType: string, imageBytes: ArrayBuffer): string {
  const base64 = Buffer.from(imageBytes).toString('base64');
  return `data:${contentType};base64,${base64}`;
}

async function fetchImageAsDataUrl(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl, {
    headers: {
      Accept: 'image/*',
      'User-Agent': 'weather-app/1.0',
    },
  });

  if (!response.ok) {
    throw new BackgroundImageUpstreamError(`Image fetch failed (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new BackgroundImageUpstreamError('Image fetch did not return an image');
  }

  return toDataUrl(contentType, await response.arrayBuffer());
}

function stableSeed(input: GenerateBackgroundInput): number {
  const source = `${input.locationName}:${input.adminArea ?? ''}:${input.country}:${input.weatherCode ?? 'unknown'}:${input.variantKey ?? ''}`;
  return Array.from(source).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 2147483647, 17);
}

async function requestPollinationsImage(prompt: string, seed: number): Promise<string> {
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=${TARGET_IMAGE_WIDTH}&height=${TARGET_IMAGE_HEIGHT}&seed=${seed}&nologo=true&private=true&enhance=true`;

  try {
    return await fetchImageAsDataUrl(imageUrl);
  } catch (error) {
    throw new BackgroundImageUpstreamError(
      `Pollinations image generation failed${error instanceof Error ? `: ${error.message}` : ''}`,
    );
  }
}

async function requestUnsplashSourceImage(input: GenerateBackgroundInput): Promise<string> {
  const weatherLabel =
    typeof input.weatherCode === 'number' ? WEATHER_LABELS[input.weatherCode] ?? 'weather' : 'weather';
  const tags = [input.locationName, input.adminArea ?? '', weatherLabel, 'landscape', 'weather']
    .filter(Boolean)
    .map((value) => value.replace(/\s+/g, '-'))
    .join(',');

  const url = `https://source.unsplash.com/${TARGET_IMAGE_WIDTH}x${TARGET_IMAGE_HEIGHT}/?${encodeURIComponent(tags)}&sig=${stableSeed(input)}`;
  return fetchImageAsDataUrl(url);
}

export async function generateBackgroundImage(
  input: GenerateBackgroundInput,
): Promise<{ imageUrl: string; source: BackgroundSource }> {
  const key = cacheKey(input);
  const cached = backgroundCache.get<string>(key);
  if (cached) {
    return { imageUrl: cached, source: 'cache' };
  }

  const prompt = buildPrompt(input);
  const seed = stableSeed(input);

  let imageDataUrl: string;
  let source: BackgroundSource;
  let pollinationsError = '';
  let unsplashError = '';

  try {
    imageDataUrl = await requestPollinationsImage(prompt, seed);
    source = 'pollinations';
  } catch (error) {
    pollinationsError = error instanceof Error ? error.message : 'unknown pollinations error';
    try {
      imageDataUrl = await requestUnsplashSourceImage(input);
      source = 'unsplash';
    } catch (innerError) {
      unsplashError = innerError instanceof Error ? innerError.message : 'unknown unsplash error';
      throw new BackgroundImageUpstreamError(
        `All background providers failed. Pollinations: ${pollinationsError}. Unsplash: ${unsplashError}.`,
      );
    }
  }

  backgroundCache.set(key, imageDataUrl);
  return { imageUrl: imageDataUrl, source };
}
