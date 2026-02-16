import { TtlCache } from '@/lib/server/cache';

const backgroundCache = new TtlCache(24 * 60 * 60 * 1000);

export class BackgroundImageUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackgroundImageUpstreamError';
  }
}

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
  0: 'clear night sky with visible stars or moonlight, dark blue tones, calm atmosphere',
  1: 'strong sunlight, bright sky, crisp shadows, clear visibility',
  2: 'night scene with broken cloud, partial moonlight, cool tones',
  3: 'day scene with broken cloud and sunlight patches',
  5: 'mist hanging low over landscape, soft contrast, reduced visibility',
  6: 'dense fog banks, very low visibility, muted color palette',
  7: 'cloud-dominant sky, subdued daylight, no direct sun beams',
  8: 'fully overcast sky with heavy grey cloud cover, flat cool light',
  9: 'light rain visible as fine streaks, wet ground reflections',
  10: 'light rain visible as fine streaks in daylight, wet surfaces',
  11: 'drizzle texture in the air, damp landscape, low contrast',
  12: 'steady rain, clearly wet terrain, reflective puddles',
  13: 'heavy rain curtains, darker storm cloud base, wind-driven rain',
  14: 'heavy rain in daylight, dramatic cloud texture and wet ground',
  15: 'intense rainfall, stormy atmosphere, strong moisture haze',
  16: 'mixed sleet and rain, icy wet ground, cold grey sky',
  17: 'daylight sleet showers, icy precipitation visible in air',
  18: 'persistent sleet conditions with slushy, wet terrain',
  19: 'hail shower scene with icy pellets and storm cloud',
  20: 'day hail shower scene with turbulent cloud and wet ground',
  21: 'hail conditions with scattered ice pellets and harsh cold light',
  22: 'light night snow shower with visible flakes and wintry atmosphere',
  23: 'light day snow shower with visible flakes and pale sky',
  24: 'light snowfall settling across landscape, cold muted light',
  25: 'heavy night snow shower with dense flakes and blustery scene',
  26: 'heavy day snow shower with blowing flakes and reduced visibility',
  27: 'heavy snow cover and active snowfall, severe winter conditions',
  28: 'thunder shower atmosphere with dark convective clouds and rain',
  29: 'day thunder shower with dramatic cloud towers and rain shafts',
  30: 'thunderstorm mood with storm shelf cloud and lightning glow',
};

const WEATHER_NEGATIVE_RULES: Record<number, string> = {
  0: 'no daylight sun, no rain',
  1: 'no rain, no snow, no fog',
  8: 'no direct blue-sky sunshine',
  12: 'no dry ground',
  15: 'no clear sky',
  24: 'no rain-only scene, include snow',
  27: 'no clear sky, no dry terrain',
};

const MODEL_ID = 'black-forest-labs/FLUX.1-schnell';

function cacheKey(input: GenerateBackgroundInput): string {
  return [
    'bg:v5',
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
  const weatherNegative =
    typeof input.weatherCode === 'number'
      ? WEATHER_NEGATIVE_RULES[input.weatherCode] ?? 'no contradictory weather'
      : 'no contradictory weather';
  const area = input.adminArea ? `${input.adminArea}, ${input.country}` : input.country;
  const conditionBits = [
    typeof input.temperature === 'number' ? `temperature around ${Math.round(input.temperature)}C` : null,
    typeof input.feelsLike === 'number' ? `feels like ${Math.round(input.feelsLike)}C` : null,
    typeof input.humidity === 'number' ? `humidity about ${Math.round(input.humidity)}%` : null,
    typeof input.windSpeed === 'number' ? `wind around ${Math.round(input.windSpeed)} mph` : null,
  ].filter(Boolean);
  const variantCue = input.variantKey
    ? `Scene variation key: ${input.variantKey}. Use a distinct composition from previous variations.`
    : null;

  return [
    `Beautiful atmospheric landscape inspired by ${input.locationName}, ${area}.`,
    `Current conditions: ${weatherLabel}.`,
    `The weather must be visually obvious: ${weatherRule}.`,
    conditionBits.length > 0 ? `Condition cues: ${conditionBits.join(', ')}.` : null,
    variantCue,
    'Painterly-cinematic style, rich color grading, layered clouds, dramatic but natural lighting.',
    'No people, no text, no logos, no signage, no watermark.',
    `Avoid: ${weatherNegative}.`,
  ]
    .filter(Boolean)
    .join(' ');
}

function toDataUrl(contentType: string, imageBytes: ArrayBuffer): string {
  const base64 = Buffer.from(imageBytes).toString('base64');
  return `data:${contentType};base64,${base64}`;
}

async function requestHuggingFaceImage(prompt: string): Promise<string> {
  const token = process.env.HF_API_KEY;
  if (!token) {
    throw new BackgroundImageUpstreamError('Missing HF_API_KEY for Hugging Face image generation');
  }

  const headers: Record<string, string> = {
    Accept: 'image/png',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(`https://router.huggingface.co/hf-inference/models/${MODEL_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inputs: prompt,
      options: {
        wait_for_model: true,
        use_cache: false,
      },
      parameters: {
        guidance_scale: 7,
        num_inference_steps: 10,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => 'Unknown Hugging Face error');
    throw new BackgroundImageUpstreamError(`Hugging Face image generation failed (${response.status}): ${message}`);
  }

  const contentType = response.headers.get('content-type') ?? 'image/png';
  if (!contentType.startsWith('image/')) {
    const message = await response.text().catch(() => 'Unknown Hugging Face response');
    throw new BackgroundImageUpstreamError(`Hugging Face did not return an image: ${message}`);
  }

  return toDataUrl(contentType, await response.arrayBuffer());
}

export async function generateBackgroundImage(input: GenerateBackgroundInput): Promise<string> {
  const key = cacheKey(input);
  const cached = backgroundCache.get<string>(key);
  if (cached) {
    return cached;
  }

  const prompt = buildPrompt(input);
  const imageUrl = await requestHuggingFaceImage(prompt);

  backgroundCache.set(key, imageUrl);
  return imageUrl;
}
