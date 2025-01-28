import { Location, TimeStampsDataProps, getTimeStampsData, getWeatherLocationData } from './weather.location.server';

global.fetch = jest.fn();

describe('weather.location.server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch weather location data', async () => {
    const mockData: Location = {
      SiteRep: {
        DV: {
          Location: {
            Period: [
              {
                Rep: [
                  {
                    $: '0',
                    D: 'N',
                    F: '5',
                    G: '10',
                    H: '80',
                    Pp: '20',
                    S: '5',
                    T: '15',
                    U: '1',
                    V: 'VG',
                    W: '1',
                  },
                ],
                type: 'Day',
                value: '2023-10-01Z',
              },
            ],
            continent: 'Europe',
            country: 'UK',
            elevation: '10',
            i: '12345',
            lat: '51.5074',
            lon: '-0.1278',
            name: 'London',
          },
          dataDate: '2023-10-01T00:00:00Z',
          type: 'Forecast',
        },
        Wx: {
          Param: [
            {
              $: 'T',
              name: 'Temperature',
              units: 'C',
            },
          ],
        },
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockData),
    });

    const data = await getWeatherLocationData({ id: '12345' });
    expect(data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      'http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/12345?res=3hourly&key=5df7f8b3-a40e-4294-8e05-ce08618aca19',
      { cache: 'no-store' },
    );
  });

  it('should fetch timestamps data', async () => {
    const mockData: TimeStampsDataProps = {
      Resource: {
        TimeSteps: {
          TS: ['2023-10-01T00:00:00Z', '2023-10-01T03:00:00Z'],
        },
        dataDate: '2023-10-01T00:00:00Z',
        res: '3hourly',
        type: 'Forecast',
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockData),
    });

    const data = await getTimeStampsData();
    expect(data).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      'http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/capabilities?res=3hourly&key=5df7f8b3-a40e-4294-8e05-ce08618aca19',
      { cache: 'no-store' },
    );
  });
});
