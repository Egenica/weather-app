import { GeocodeUpstreamError, searchUkLocations } from '@/lib/server/geocode';

import { GET } from './route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init: { status?: number } = {}) => ({
      json: async () => body,
      status: init.status ?? 200,
    }),
  },
}));

jest.mock('@/lib/server/geocode', () => ({
  GeocodeUpstreamError: class GeocodeUpstreamError extends Error {},
  searchUkLocations: jest.fn(),
}));

describe('GET /api/geocode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty locations when q is not provided', async () => {
    const response = await GET(new Request('http://localhost/api/geocode'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.locations.length).toBe(0);
  });

  it('returns empty locations for short query', async () => {
    const response = await GET(new Request('http://localhost/api/geocode?q=l'));
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.locations).toEqual([]);
  });

  it('returns upstream locations', async () => {
    (searchUkLocations as jest.Mock).mockResolvedValue([
      { country: 'United Kingdom', lat: 51.5, lon: -0.12, name: 'London' },
    ]);

    const response = await GET(new Request('http://localhost/api/geocode?q=london'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.locations[0].name).toBe('London');
  });

  it('returns 502 when upstream fails', async () => {
    (searchUkLocations as jest.Mock).mockRejectedValue(new GeocodeUpstreamError('failed'));

    const response = await GET(new Request('http://localhost/api/geocode?q=london'));
    expect(response.status).toBe(502);
  });
});
