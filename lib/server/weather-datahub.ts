import { sharedCache } from '@/lib/server/cache';

export type SimplifiedWeather = {
  feelsLike: number | null;
  humidity: number | null;
  temperature: number | null;
  timestamp: string;
  weatherCode: number | null;
  windSpeed: number | null;
};

type DataHubResponse = {
  features?: Array<{
    properties?: {
      timeSeries?: Array<Record<string, unknown>>;
      timeSeriesHourly?: Array<Record<string, unknown>>;
    };
  }>;
  properties?: {
    timeSeries?: Array<Record<string, unknown>>;
    timeSeriesHourly?: Array<Record<string, unknown>>;
  };
  timeSeries?: Array<Record<string, unknown>>;
};

export class DataHubUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataHubUpstreamError';
  }
}

export class DataHubConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataHubConfigError';
  }
}

const DATAHUB_ENDPOINT = 'https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly';

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function pickFirstHour(payload: DataHubResponse): Record<string, unknown> | null {
  const featureSeries = payload.features?.[0]?.properties;
  const candidates = [
    featureSeries?.timeSeries,
    featureSeries?.timeSeriesHourly,
    payload.properties?.timeSeries,
    payload.properties?.timeSeriesHourly,
    payload.timeSeries,
  ];

  for (const series of candidates) {
    if (Array.isArray(series) && series.length > 0) {
      return series[0];
    }
  }

  return null;
}

function mapFirstHour(firstHour: Record<string, unknown>): SimplifiedWeather {
  const timestamp =
    asString(firstHour.time) ??
    asString(firstHour.timeUtc) ??
    asString(firstHour.timestamp) ??
    new Date().toISOString();

  return {
    feelsLike:
      asNumber(firstHour.feelsLikeTemperature) ??
      asNumber(firstHour.feelsLikeTemp) ??
      asNumber(firstHour.feelsLike) ??
      asNumber(firstHour.screenTemperature),
    humidity: asNumber(firstHour.screenRelativeHumidity) ?? asNumber(firstHour.humidity),
    temperature: asNumber(firstHour.screenTemperature) ?? asNumber(firstHour.temperature),
    timestamp,
    weatherCode: asNumber(firstHour.significantWeatherCode) ?? asNumber(firstHour.weatherCode),
    windSpeed: asNumber(firstHour.windSpeed10m) ?? asNumber(firstHour.windSpeed),
  };
}

function cacheKey(lat: number, lon: number): string {
  return `weather:${lat.toFixed(4)},${lon.toFixed(4)}`;
}

export async function getCurrentHourlyForecast(lat: number, lon: number): Promise<SimplifiedWeather> {
  const key = cacheKey(lat, lon);

  return sharedCache.getOrSet(key, async () => {
    const apiKey = process.env.METOFFICE_API_KEY;
    if (!apiKey) {
      throw new DataHubConfigError('Missing METOFFICE_API_KEY');
    }

    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
    });

    const response = await fetch(`${DATAHUB_ENDPOINT}?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        apikey: apiKey,
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new DataHubUpstreamError(`DataHub request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as DataHubResponse;
    const firstHour = pickFirstHour(payload);
    if (!firstHour) {
      throw new DataHubUpstreamError('DataHub response did not contain hourly time series');
    }

    return mapFirstHour(firstHour);
  });
}
