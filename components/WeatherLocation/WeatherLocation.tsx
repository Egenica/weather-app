import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WeatherReportNow } from 'app/types/types';
import React, { Fragment, useEffect, useRef, useState } from 'react';

import { TodaysWeather } from '../TodaysWeather/TodaysWeather';
import { weatherType } from '../TodaysWeather/weatherType';
import { WindDirection } from '../WeatherDirection/WeatherDirection';
import {
  Location,
  TimeStampsDataProps,
  getTimeStampsData,
  getWeatherLocationData,
} from './../server/weather.location.server';

type WeatherLocationProps = {
  id: string | null;
};

function mapDatesToData(data: Location['SiteRep']['DV']['Location']['Period'], dates: string[]) {
  // Flatten all "Rep" arrays from the dataset
  const flattenedData: Location['SiteRep']['DV']['Location']['Period'][0]['Rep'] = [];
  data.forEach((dayData) => {
    dayData.Rep.forEach((rep) => {
      flattenedData.push(rep);
    });
  });

  // get length of flattened data and remove dates that are not needed
  const flattenedDataLength = flattenedData.length;
  const datesLength = dates.length;
  const diff = datesLength - flattenedDataLength;
  if (diff > 0) {
    dates.splice(flattenedDataLength, diff);
  }

  // Check if the length of the data matches the dates array
  if (flattenedData.length !== dates.length) {
    throw new Error("The length of the 'Rep' objects doesn't match the length of the dates array.");
  }

  // Add corresponding dates to each object in the flattened data
  for (let i = 0; i < flattenedData.length; i++) {
    flattenedData[i].date = dates[i];
  }

  // Replace dayData.Rep with flattenedData by length of each dayData.Rep
  let index = 0;
  for (let i = 0; i < data.length; i++) {
    const repLength = data[i].Rep.length;
    data[i].Rep = flattenedData.slice(index, index + repLength);
    index += repLength;
  }

  return data;
}

export const WeatherLocation = ({ id }: WeatherLocationProps) => {
  const [locationData, setLocationData] = useState<Location | null>(null);
  const [timeStampsData, setTimeStampsData] = useState<TimeStampsDataProps | null>(null);
  const [weatherNow, setWeatherNow] = useState<WeatherReportNow | null>(null);
  const [, setApi] = React.useState<CarouselApi>();

  const dataTracker = useRef(false);

  useEffect(() => {
    if (id) {
      getWeatherLocationData({ id }).then((data) => {
        if (Array.isArray(data)) {
          console.error('Expected Location object but received array');
        } else {
          data.SiteRep.Wx.Param.push({
            $: 'date',
            name: 'date',
            units: 'date',
          });

          setLocationData(data);

          // set the weather now based on the date
          // set data to local storage
          localStorage.setItem('weatherNow', JSON.stringify(data.SiteRep.DV.Location.Period[0].Rep[0]));
          // console.log('data', data.SiteRep.DV.Location.Period[0].Rep[0]);
          setWeatherNow(data.SiteRep.DV.Location.Period[0].Rep[0]);
        }
      });

      // get time stamps for the weather data
      getTimeStampsData().then((data) => {
        if (Array.isArray(data)) {
          console.error('Expected Location object but received array');
        } else {
          setTimeStampsData(data);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (
      timeStampsData &&
      timeStampsData.Resource.TimeSteps.TS.length > 0 &&
      locationData &&
      locationData.SiteRep.DV.Location.Period.length > 0 &&
      !dataTracker.current // Only run the mapping logic once
    ) {
      const mappedData = mapDatesToData(locationData.SiteRep.DV.Location.Period, timeStampsData.Resource.TimeSteps.TS);

      setLocationData((prev) => {
        if (prev) {
          return {
            ...prev,
            SiteRep: {
              ...prev.SiteRep,
              DV: {
                ...prev.SiteRep.DV,
                Location: {
                  ...prev.SiteRep.DV.Location,
                  Period: mappedData,
                },
              },
            },
          };
        }
        return prev;
      });

      dataTracker.current = true; // Set ref to true after the data has been processed
    }
  }, [timeStampsData, locationData]);

  // console.log('locationData', locationData);

  const displayDate = (period: string) => {
    const dateFix = period.replace(/Z/g, '');
    const periodDate = new Date(dateFix);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return periodDate.toDateString() === today.toDateString()
      ? 'Today'
      : periodDate.toDateString() === tomorrow.toDateString()
        ? 'Tomorrow'
        : periodDate.toDateString();
  };

  if (!locationData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {locationData && (
        <div className="mx-0 md:mx-10">
          <TodaysWeather weatherNow={weatherNow} />
          <h2 className="mt-8 text-left text-xl font-bold text-white">5 Day Forcast</h2>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
              watchDrag: false,
            }}
            setApi={setApi}
          >
            <CarouselContent>
              {locationData.SiteRep.DV.Location.Period.map((period, periodIndex) => {
                return (
                  <Fragment key={periodIndex}>
                    <CarouselItem>
                      <h3 className="mb-5 mt-5 flex flex-row items-center justify-center rounded bg-white p-3 py-2 text-center text-base font-light md:inline-block md:text-left md:text-xl ">
                        <CarouselPrevious className="relative mr-auto" />
                        <span className="mx-3 inline-block">{displayDate(period.value)}</span>
                        <CarouselNext className="relative ml-auto" />
                      </h3>

                      <Table className="bg-blur mb-5 rounded bg-white bg-opacity-10 backdrop-blur-xl">
                        <TableHeader className="bg-white bg-opacity-10">
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="py-2 text-white">Date & Time</TableHead>
                            <TableHead className="py-2 text-white">Weather Type</TableHead>
                            {locationData.SiteRep.Wx.Param.map(
                              (param, index) =>
                                param.name !== 'date' &&
                                param.name !== 'W' && (
                                  <TableHead key={index} className="py-2 text-white">
                                    {param.$}
                                  </TableHead>
                                ),
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {period.Rep.map((rep: Record<string, unknown>, repIndex) => (
                            <TableRow key={`${periodIndex}-${repIndex}`} className="hover:bg-transparent">
                              <TableCell className="whitespace-nowrap text-white">
                                {new Date(rep.date as string).toLocaleString('en-GB', {
                                  weekday: 'short',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true,
                                })}
                              </TableCell>
                              <TableCell className="text-white">
                                <div className="relative left-[-0.5rem] flex flex-col items-center justify-center text-center">
                                  {weatherType(rep['W'] as string)[1]({ size: 40, color: '#fff' })}
                                  <span className="text-xs" title={rep['W'] as string}>
                                    {weatherType(rep['W'] as string)[0]}
                                  </span>
                                </div>
                              </TableCell>
                              {locationData.SiteRep.Wx.Param.map(
                                (param, index) =>
                                  param.name !== 'date' &&
                                  param.name !== 'W' && (
                                    <TableCell className="text-white" key={index}>
                                      {param.name === 'D' ? (
                                        <WindDirection direction={String(rep[param.name])} size={50} />
                                      ) : (
                                        <>
                                          <span>{`${String(rep[param.name])}`}</span>
                                          <span className="text-xs">{param.units}</span>
                                        </>
                                      )}
                                    </TableCell>
                                  ),
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CarouselItem>
                  </Fragment>
                );
              })}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="absolute -left-12 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full" />
              <CarouselNext className="absolute -right-12 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full" />
            </div>
          </Carousel>
          <p className="block p-4 pt-0 text-center text-xs text-white">
            Data provided by{' '}
            <a href="https://www.metoffice.gov.uk/services/data" target="_blank" className="underline">
              Met Office
            </a>
          </p>
        </div>
      )}
    </>
  );
};
