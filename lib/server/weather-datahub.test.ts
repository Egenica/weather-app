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
                  screenRelativeHumidity: 88,
                  screenTemperature: 5,
                  significantWeatherCode: 7,
                  time: '2026-02-16T11:00:00Z',
                  windSpeed10m: 12,
                },
              ],
            },
          },
        ],
      }),
    });

    const result = await getCurrentHourlyForecast(53.8, -1.5);
    expect(result).toEqual({
      feelsLike: 3,
      humidity: 88,
      temperature: 5,
      timestamp: '2026-02-16T11:00:00Z',
      weatherCode: 7,
      windSpeed: 12,
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
