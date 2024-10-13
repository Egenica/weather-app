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

// export async function getWeatherLocations() {
//   // Try to get the data from session storage
//   const storedData = sessionStorage.getItem('weatherLocations');
//   // const storedData = null;

//   if (storedData) {
//     // If the data is in session storage, parse it and return it
//     // console.log(JSON.stringify(JSON.parse(storedData).splice(0, 10)));
//     console.log('Data from session storage');
//     return JSON.parse(storedData) as WeatherLocationT[];
//   } else {
//     // If the data is not in session storage, fetch it
//     const res = await fetch(
//       'http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist/?key=5df7f8b3-a40e-4294-8e05-ce08618aca19',
//     );

//     const data: WeatherLocationsResponse = await res.json();

//     // Store the fetched data in session storage
//     sessionStorage.setItem('weatherLocations', JSON.stringify(data.Locations.Location));

//     // console.log(data.Locations.Location);

//     return data.Locations.Location;
//   }
// }

export async function getWeatherLocations() {
  const res = await fetch(
    'http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/sitelist/?key=5df7f8b3-a40e-4294-8e05-ce08618aca19',
  );

  const data: WeatherLocationsResponse = await res.json();

  //console.log(data.Locations.Location);

  return data.Locations.Location;
}
