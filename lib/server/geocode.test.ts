import { sharedCache } from '@/lib/server/cache';

import { searchUkLocations } from './geocode';

describe('geocode service', () => {
  beforeEach(() => {
    sharedCache.clear();
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it('maps upstream geocode payload', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        results: [
          {
            admin1: 'England',
            country: 'United Kingdom',
            latitude: 53.8,
            longitude: -1.55,
            name: 'Leeds',
          },
        ],
      }),
    });

    const results = await searchUkLocations('Leeds');
    expect(results).toEqual([
      {
        adminArea: 'England',
        country: 'United Kingdom',
        lat: 53.8,
        lon: -1.55,
        name: 'Leeds',
      },
    ]);
  });

  it('returns built-in UK region for region query', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ results: [] }),
    });

    const results = await searchUkLocations('yorkshire');
    expect(results.some((location) => location.name === 'Yorkshire')).toBe(true);
  });
});
