'use server';
export type Location = {
  SiteRep: {
    DV: {
      Location: {
        Period: Array<{
          Rep: Array<{
            $: string;
            D: string;
            F: string;
            G: string;
            H: string;
            Pp: string;
            S: string;
            T: string;
            U: string;
            V: string;
            W: string;
            date?: string;
          }>;
          type: string;
          value: string;
        }>;
        continent: string;
        country: string;
        elevation: string;
        i: string;
        lat: string;
        lon: string;
        name: string;
      };
      dataDate: string;
      type: string;
    };
    Wx: {
      Param: Array<{
        $: string;
        name: string;
        units: string;
      }>;
    };
  };
};

type WeatherLocationDataProps = {
  id: string | null;
};

// type TimeStampsDataProps = {
//   Resource: {
//     dataData: string;
//     res: string;
//     type: string;
//     TimeSteps: {
//       TS: string[];
//     };
//   };
// };

export type TimeStampsDataProps = {
  Resource: {
    TimeSteps: {
      TS: Array<string>;
    };
    dataDate: string;
    res: string;
    type: string;
  };
};

// export async function getWeatherLocationData({ id }: WeatherLocationDataProps) {
//   // Try to get the data from session storage
//   // const storedData = sessionStorage.getItem('location');
//   const storedData = null;

//   if (storedData) {
//     // If the data is in session storage, parse it and return it
//     // console.log(JSON.stringify(JSON.parse(storedData).splice(0, 10)));
//     return JSON.parse(storedData) as Location[];
//   } else {
//     // If the data is not in session storage, fetch it
//     const res = await fetch(
//       `http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/${id}?res=3hourly&key=5df7f8b3-a40e-4294-8e05-ce08618aca19`,
//     );

//     const data: Location = await res.json();

//     // Store the fetched data in session storage
//     sessionStorage.setItem('location', JSON.stringify(data));

//     // console.log(data.Locations.Location);

//     return data;
//   }
// }

export async function getWeatherLocationData({ id }: WeatherLocationDataProps) {
  // Try to get the data from session storage
  // const storedData = sessionStorage.getItem('location');
  // const storedData = null;

  // If the data is not in session storage, fetch it
  const res = await fetch(
    `http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/${id}?res=3hourly&key=5df7f8b3-a40e-4294-8e05-ce08618aca19`,
    {
      cache: 'no-store',
    },
  );

  const data: Location = await res.json();

  //console.log(data);

  return data;
}

export async function getTimeStampsData() {
  const res = await fetch(
    `http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/capabilities?res=3hourly&key=5df7f8b3-a40e-4294-8e05-ce08618aca19`,
    {
      cache: 'no-store',
    },
  );

  const data: TimeStampsDataProps = await res.json();

  //console.log(data);

  return data;
}
