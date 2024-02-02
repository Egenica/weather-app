import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React, { Fragment, useEffect, useState } from 'react';

import { Location, getWeatherLocationData } from './../server/weather.location.server';

type WeatherLocationProps = {
  id: string | null;
};

export const WeatherLocation = ({ id }: WeatherLocationProps) => {
  const [locationData, setLocationData] = useState<Location | null>(null);
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

  const displayDate = (period: string) => {
    const periodDate = new Date(period);
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

  console.log('locationData', locationData);

  return (
    <>
      {locationData && (
        <div className="mx-10">
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
                      <h3 className="mb-5 inline-block rounded bg-white p-3 py-2 text-xl font-light">
                        {displayDate(period.value)}
                      </h3>
                      <Table className="bg-blur mb-5 rounded bg-white bg-opacity-10 backdrop-blur-xl">
                        <TableHeader className=" bg-white bg-opacity-10 ">
                          <TableRow>
                            {locationData.SiteRep.Wx.Param.map((param, index) => (
                              <TableHead key={index} className="py-2 text-white">
                                {param.$} <span className="font-bold">{`(${param.name})`}</span>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {period.Rep.map((rep: Record<string, unknown>, repIndex) => (
                            <TableRow key={`${periodIndex}-${repIndex}`}>
                              {locationData.SiteRep.Wx.Param.map((param, index) => (
                                <TableCell className="text-white" key={index}>
                                  {String(rep[param.name])}
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
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <h5 className="mb-5 inline-block rounded bg-white p-3 py-2 text-center text-xl font-light">
            Day {current} of {count}
          </h5>
        </div>
      )}
    </>
  );
};
