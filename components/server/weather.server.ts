'use server';

export type WeatherLocationT = {
  elevation: string;
  id: string;
  latitude: string;
  longitude: string;
  name: string;
  nationalPark?: string;
  obsSource?: string;
  region?: string;
  unitaryAuthArea?: string;
};

type WeatherLocationsResponse = {
  Locations: {
    Location: WeatherLocationT[];
  };
};

export async function getWeatherLocations() {
  const res = await fetch(
    'http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist/?key=5df7f8b3-a40e-4294-8e05-ce08618aca19',
  );

  const data: WeatherLocationsResponse = await res.json();

  return data.Locations.Location;
}
