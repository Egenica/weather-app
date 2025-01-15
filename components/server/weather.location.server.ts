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

export async function getWeatherLocationData({ id }: WeatherLocationDataProps) {
  // If the data is not in session storage, fetch it
  const res = await fetch(
    `http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/${id}?res=3hourly&key=5df7f8b3-a40e-4294-8e05-ce08618aca19`,
    {
      cache: 'no-store',
    },
  );

  const data: Location = await res.json();

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

  return data;
}
