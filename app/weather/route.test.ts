import { DataHubConfigError, DataHubUpstreamError, getCurrentHourlyForecast } from '@/lib/server/weather-datahub';

import { GET } from './route';

jest.mock('@/lib/server/weather-datahub', () => ({
  DataHubConfigError: class DataHubConfigError extends Error {},
  DataHubUpstreamError: class DataHubUpstreamError extends Error {},
  getCurrentHourlyForecast: jest.fn(),
}));

describe('GET /weather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 for invalid coordinates', async () => {
    const response = await GET(new Request('http://localhost/weather?lat=abc&lon=-1.2'));
    expect(response.status).toBe(400);
  });

  it('returns weather for valid coordinates', async () => {
    (getCurrentHourlyForecast as jest.Mock).mockResolvedValue({
      current: {
        feelsLike: 3,
        humidity: 80,
        precipitationChance: 20,
        temperature: 4,
        timestamp: '2026-02-16T10:00:00Z',
        visibility: 20000,
        weatherCode: 7,
        windDirection: 'W',
        windGust: 18,
        windSpeed: 12,
      },
      dailyPages: [{ date: '2026-02-16', hours: [] }],
    });

    const response = await GET(new Request('http://localhost/weather?lat=53.8&lon=-1.5'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.current.temperature).toBe(4);
    expect(payload.dailyPages).toHaveLength(1);
  });

  it('returns 502 for upstream errors', async () => {
    (getCurrentHourlyForecast as jest.Mock).mockRejectedValue(new DataHubUpstreamError('upstream failed'));

    const response = await GET(new Request('http://localhost/weather?lat=53.8&lon=-1.5'));
    expect(response.status).toBe(502);
  });

  it('returns 500 for config errors', async () => {
    (getCurrentHourlyForecast as jest.Mock).mockRejectedValue(new DataHubConfigError('missing key'));

    const response = await GET(new Request('http://localhost/weather?lat=53.8&lon=-1.5'));
    expect(response.status).toBe(500);
  });
});
