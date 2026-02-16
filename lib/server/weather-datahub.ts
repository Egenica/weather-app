import { sharedCache } from '@/lib/server/cache';

export type SimplifiedWeather = {
  current: HourlyForecast;
  dailyPages: DailyForecast[];
};

export type DailyForecast = {
  date: string;
  hours: HourlyForecast[];
};

export type HourlyForecast = {
  feelsLike: number | null;
  humidity: number | null;
  precipitationChance: number | null;
  temperature: number | null;
  timestamp: string;
  visibility: number | null;
  weatherCode: number | null;
  windDirection: string | null;
  windGust: number | null;
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

const DATAHUB_HOURLY_ENDPOINT = 'https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/hourly';
const DATAHUB_THREE_HOURLY_ENDPOINT = 'https://data.hub.api.metoffice.gov.uk/sitespecific/v0/point/three-hourly';

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

function degreesToCompass(value: number): string {
  const normalized = ((value % 360) + 360) % 360;
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

function pickSeries(payload: DataHubResponse): Array<Record<string, unknown>> {
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
      return series;
    }
  }

  return [];
}

function toTimestamp(value: Record<string, unknown>): string {
  return (
    asString(value.time) ??
    asString(value.timeUtc) ??
    asString(value.timestamp) ??
    asString(value.referenceTime) ??
    new Date().toISOString()
  );
}

function toDayKey(value: unknown): string | null {
  const timestamp = asString(value);
  if (!timestamp) {
    return null;
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function mapHour(hour: Record<string, unknown>): HourlyForecast {
  const maxTemp = asNumber(hour.maxScreenAirTemp);
  const minTemp = asNumber(hour.minScreenAirTemp);
  const fallbackTemp =
    maxTemp !== null && minTemp !== null ? Number(((maxTemp + minTemp) / 2).toFixed(2)) : maxTemp ?? minTemp;

  const rawDirection = hour.windDirectionFrom10m ?? hour.windDirection ?? hour.windDirectionFrom;
  const windDirection =
    asString(rawDirection) ??
    (typeof rawDirection === 'number' && Number.isFinite(rawDirection) ? degreesToCompass(rawDirection) : null);

  return {
    feelsLike:
      asNumber(hour.feelsLikeTemperature) ??
      asNumber(hour.feelsLikeTemp) ??
      asNumber(hour.feelsLike) ??
      asNumber(hour.screenTemperature),
    humidity: asNumber(hour.screenRelativeHumidity) ?? asNumber(hour.humidity) ?? asNumber(hour.relativeHumidity),
    precipitationChance:
      asNumber(hour.probOfPrecipitation) ??
      asNumber(hour.precipitationProbabilityInPercent) ??
      asNumber(hour.precipitationProbability),
    temperature:
      asNumber(hour.screenTemperature) ?? asNumber(hour.temperature) ?? asNumber(hour.airTemperature) ?? fallbackTemp,
    timestamp: toTimestamp(hour),
    visibility: asNumber(hour.visibility) ?? asNumber(hour.visibilityInMetres) ?? asNumber(hour.visibilityDm),
    weatherCode: asNumber(hour.significantWeatherCode) ?? asNumber(hour.weatherCode),
    windDirection,
    windGust: asNumber(hour.windGustSpeed10m) ?? asNumber(hour.windGustSpeed),
    windSpeed: asNumber(hour.windSpeed10m) ?? asNumber(hour.windSpeed),
  };
}

function mapDailyPages(series: Array<Record<string, unknown>>): DailyForecast[] {
  const grouped = new Map<string, HourlyForecast[]>();

  for (const hour of series) {
    const day = toDayKey(hour.time ?? hour.timeUtc ?? hour.timestamp);
    if (!day) {
      continue;
    }

    const mappedHour = mapHour(hour);
    const existing = grouped.get(day);
    if (existing) {
      existing.push(mappedHour);
    } else {
      grouped.set(day, [mappedHour]);
    }
  }

  return Array.from(grouped.entries())
    .sort(([dayA], [dayB]) => dayA.localeCompare(dayB))
    .slice(0, 5)
    .map(([date, hours]) => ({ date, hours }));
}

function dayKeyFromTimestamp(timestamp: string): string {
  return timestamp.slice(0, 10);
}

function mergeCurrentDayWithHourly(
  dailyPages: DailyForecast[],
  hourlySeries: Array<Record<string, unknown>>,
  currentTimestamp: string,
): DailyForecast[] {
  const currentDay = dayKeyFromTimestamp(currentTimestamp);
  const hourlyCurrentDay = hourlySeries
    .map(mapHour)
    .filter((hour) => dayKeyFromTimestamp(hour.timestamp) === currentDay)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (hourlyCurrentDay.length === 0) {
    return dailyPages;
  }

  return dailyPages.map((day) => {
    if (day.date !== currentDay) {
      return day;
    }

    return {
      ...day,
      hours: hourlyCurrentDay,
    };
  });
}

function cacheKey(lat: number, lon: number): string {
  return `weather:v2:${lat.toFixed(4)},${lon.toFixed(4)}`;
}

export async function getCurrentHourlyForecast(lat: number, lon: number): Promise<SimplifiedWeather> {
  const key = cacheKey(lat, lon);

  return sharedCache.getOrSet(key, async () => {
    const apiKey = process.env.METOFFICE_API_KEY;
    if (!apiKey) {
      throw new DataHubConfigError('Missing METOFFICE_API_KEY');
    }

    const params = new URLSearchParams({ latitude: String(lat), longitude: String(lon) });
    const headers = {
      Accept: 'application/json',
      apikey: apiKey,
    };

    const hourlyResponse = await fetch(`${DATAHUB_HOURLY_ENDPOINT}?${params.toString()}`, {
      headers,
      method: 'GET',
    });

    if (!hourlyResponse.ok) {
      throw new DataHubUpstreamError(`DataHub hourly request failed with status ${hourlyResponse.status}`);
    }

    const hourlyPayload = (await hourlyResponse.json()) as DataHubResponse;
    const hourlySeries = pickSeries(hourlyPayload);
    if (hourlySeries.length === 0) {
      throw new DataHubUpstreamError('DataHub response did not contain hourly time series');
    }

    const threeHourlyResponse = await fetch(`${DATAHUB_THREE_HOURLY_ENDPOINT}?${params.toString()}`, {
      headers,
      method: 'GET',
    });

    const pageSeries =
      threeHourlyResponse.ok && threeHourlyResponse.status < 500
        ? pickSeries(((await threeHourlyResponse.json()) as DataHubResponse) ?? {})
        : hourlySeries;

    const current = mapHour(hourlySeries[0]);
    const baseDailyPages = mapDailyPages(pageSeries.length > 0 ? pageSeries : hourlySeries);
    const dailyPages = mergeCurrentDayWithHourly(baseDailyPages, hourlySeries, current.timestamp);

    return {
      current,
      dailyPages,
    };
  });
}
