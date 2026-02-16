import { sharedCache } from '@/lib/server/cache';

import { getPopularUkLocations, searchUkLocations } from './geocode';

describe('geocode service', () => {
  beforeEach(() => {
    sharedCache.clear();
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  it('returns popular uk locations fallback list', () => {
    const locations = getPopularUkLocations();

    expect(locations.length).toBeGreaterThan(0);
    expect(locations[0]).toHaveProperty('name');
    expect(locations[0]).toHaveProperty('lat');
    expect(locations[0]).toHaveProperty('lon');
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
});
