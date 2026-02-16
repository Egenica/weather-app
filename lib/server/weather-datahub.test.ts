import { sharedCache } from '@/lib/server/cache';

import { DataHubConfigError, getCurrentHourlyForecast } from './weather-datahub';

describe('weather-datahub', () => {
  beforeEach(() => {
    sharedCache.clear();
    jest.resetAllMocks();
    process.env.METOFFICE_API_KEY = 'test-key';
    global.fetch = jest.fn();
  });

  it('maps first hourly record to simplified response', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        features: [
          {
            properties: {
              timeSeries: [
                {
                  feelsLikeTemperature: 3,
                  precipitationProbabilityInPercent: 20,
                  screenRelativeHumidity: 88,
                  screenTemperature: 5,
                  significantWeatherCode: 7,
                  time: '2026-02-16T11:00:00Z',
                  windDirectionFrom10m: 'NW',
                  windGustSpeed10m: 22,
                  windSpeed10m: 12,
                },
                {
                  feelsLikeTemperature: 5,
                  screenTemperature: 8,
                  significantWeatherCode: 3,
                  time: '2026-02-16T13:00:00Z',
                },
                {
                  feelsLikeTemperature: 1,
                  screenTemperature: 2,
                  significantWeatherCode: 5,
                  time: '2026-02-17T12:00:00Z',
                },
              ],
            },
          },
        ],
      }),
    });

    const result = await getCurrentHourlyForecast(53.8, -1.5);
    expect(result).toEqual({
      current: {
        feelsLike: 3,
        humidity: 88,
        precipitationChance: 20,
        temperature: 5,
        timestamp: '2026-02-16T11:00:00Z',
        visibility: null,
        weatherCode: 7,
        windDirection: 'NW',
        windGust: 22,
        windSpeed: 12,
      },
      dailyPages: [
        {
          date: '2026-02-16',
          hours: [
            {
              feelsLike: 3,
              humidity: 88,
              precipitationChance: 20,
              temperature: 5,
              timestamp: '2026-02-16T11:00:00Z',
              visibility: null,
              weatherCode: 7,
              windDirection: 'NW',
              windGust: 22,
              windSpeed: 12,
            },
            {
              feelsLike: 5,
              humidity: null,
              precipitationChance: null,
              temperature: 8,
              timestamp: '2026-02-16T13:00:00Z',
              visibility: null,
              weatherCode: 3,
              windDirection: null,
              windGust: null,
              windSpeed: null,
            },
          ],
        },
        {
          date: '2026-02-17',
          hours: [
            {
              feelsLike: 1,
              humidity: null,
              precipitationChance: null,
              temperature: 2,
              timestamp: '2026-02-17T12:00:00Z',
              visibility: null,
              weatherCode: 5,
              windDirection: null,
              windGust: null,
              windSpeed: null,
            },
          ],
        },
      ],
    });
  });

  it('returns cached values for same rounded coordinates', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        features: [{ properties: { timeSeries: [{ time: '2026-02-16T12:00:00Z' }] } }],
      }),
    });

    await getCurrentHourlyForecast(53.80004, -1.50004);
    await getCurrentHourlyForecast(53.80003, -1.50003);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('throws config error when API key is missing', async () => {
    delete process.env.METOFFICE_API_KEY;

    await expect(getCurrentHourlyForecast(53, -1)).rejects.toBeInstanceOf(DataHubConfigError);
  });
});
