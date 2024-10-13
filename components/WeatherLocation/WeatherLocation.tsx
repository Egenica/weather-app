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
import React, { Fragment, useEffect, useState } from 'react';

import { TodaysWeather } from '../TodaysWeather/TodaysWeather';
import { weatherType } from '../TodaysWeather/weatherType';
import { WindDirection } from '../WeatherDirection/WeatherDirection';
import { Location, getWeatherLocationData } from './../server/weather.location.server';

type WeatherLocationProps = {
  id: string | null;
};

export const WeatherLocation = ({ id }: WeatherLocationProps) => {
  const [locationData, setLocationData] = useState<Location | null>(null);
  const [weatherNow, setWeatherNow] = useState<WeatherReportNow | null>(null);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (id) {
      getWeatherLocationData({ id }).then((data) => {
        if (Array.isArray(data)) {
          console.error('Expected Location object but received array');
        } else {
          setLocationData(data);
          setWeatherNow(data.SiteRep.DV.Location.Period[0].Rep[0]);
          // console.log('data', data);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

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

  // console.log('locationData', locationData);

  return (
    <>
      {locationData && (
        <div className="mx-0 md:mx-10">
          <TodaysWeather weatherNow={weatherNow} />
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            setApi={setApi}
          >
            <CarouselContent>
              {locationData.SiteRep.DV.Location.Period.map((period, periodIndex) => {
                return (
                  <Fragment key={periodIndex}>
                    <CarouselItem>
                      <h3 className="mb-5 mt-5 rounded bg-white p-3 py-2 text-center text-xl font-light md:inline-block md:text-left">
                        {displayDate(period.value)} - Day {current} of {count}
                      </h3>
                      <Table className="bg-blur mb-5 rounded bg-white bg-opacity-10 backdrop-blur-xl">
                        <TableHeader className=" bg-white bg-opacity-10 ">
                          <TableRow className="hover:bg-transparent">
                            {locationData.SiteRep.Wx.Param.map((param, index) => (
                              <TableHead key={index} className="py-2 text-white">
                                {param.$}
                                {/* <span className="font-bold">{`(${param.name})`}</span> */}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {period.Rep.map((rep: Record<string, unknown>, repIndex) => (
                            <TableRow key={`${periodIndex}-${repIndex}`} className="hover:bg-transparent">
                              {locationData.SiteRep.Wx.Param.map((param, index) => (
                                <TableCell className="text-white" key={index}>
                                  {param.name === 'D' ? (
                                    <WindDirection direction={String(rep[param.name])} size={50} />
                                  ) : param.name === 'W' ? (
                                    <div className="flex flex-col items-center justify-center text-center">
                                      {weatherType(rep[param.name] as string)[1]({ size: 40, color: '#fff' })}
                                      <span className="text-xs" title={rep[param.name] as string}>
                                        {weatherType(rep[param.name] as string)[0]}
                                      </span>
                                    </div>
                                  ) : (
                                    <>
                                      <span>{`${String(rep[param.name])}`}</span>
                                      <span className="text-xs">{param.units}</span>
                                    </>
                                  )}
                                </TableCell>
                              ))}
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
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
          <p className="m-4 mt-0 block text-center text-xs text-white">
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
