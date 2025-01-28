import { getWeatherLocations } from './weather.server';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        Locations: {
          Location: [
            {
              elevation: '10',
              id: '1',
              latitude: '50.1',
              longitude: '-0.1',
              name: 'Location1',
            },
            {
              elevation: '20',
              id: '2',
              latitude: '51.1',
              longitude: '-0.2',
              name: 'Location2',
            },
          ],
        },
      }),
  }),
) as jest.Mock;

describe('getWeatherLocations', () => {
  it('should return an array of locations', async () => {
    const locations = await getWeatherLocations();
    expect(locations).toBeInstanceOf(Array);
    expect(locations.length).toBeGreaterThan(0);
  });

  it('should return locations with correct properties', async () => {
    const locations = await getWeatherLocations();
    locations.forEach((location) => {
      expect(location).toHaveProperty('elevation');
      expect(location).toHaveProperty('id');
      expect(location).toHaveProperty('latitude');
      expect(location).toHaveProperty('longitude');
      expect(location).toHaveProperty('name');
    });
  });

  it('should handle empty locations array', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            Locations: {
              Location: [],
            },
          }),
      }),
    );

    const locations = await getWeatherLocations();
    expect(locations).toBeInstanceOf(Array);
    expect(locations.length).toBe(0);
  });
});
