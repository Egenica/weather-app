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
import {
  WiDirectionDown,
  WiDirectionDownLeft,
  WiDirectionDownRight,
  WiDirectionLeft,
  WiDirectionRight,
  WiDirectionUp,
  WiDirectionUpLeft,
  WiDirectionUpRight,
  WiNightAltRainMix,
  WiNightAltRainWind,
  WiRain,
  WiRainMix,
  WiStrongWind,
  WiWindy,
} from 'weather-icons-react';

import { Location, getWeatherLocationData } from './../server/weather.location.server';

type WeatherLocationProps = {
  id: string | null;
};

type WeatherReportNow = {
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

  console.log('locationData', locationData);

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

  // console.log('locationData', locationData);

  return (
    <>
      {locationData && (
        <div className="mx-10">
          <div className="flex flex-col items-center justify-center ">
            <span className="rounded-t bg-white px-2 text-xs font-light text-black">Now at a glance</span>
            <div className="flex items-center justify-center rounded border border-solid border-white  bg-white bg-opacity-10 backdrop-blur-xl">
              <span className="p-4 pl-10 text-4xl font-light text-white">
                {weatherNow?.F}
                <span>°</span>
              </span>
              {Number(weatherNow?.Pp) >= 20 && Number(weatherNow?.Pp) < 50 && <WiRainMix size={100} color="#fff" />}
              {Number(weatherNow?.Pp) >= 50 && Number(weatherNow?.Pp) < 100 && <WiRain size={100} color="#fff" />}
              {Number(weatherNow?.G) >= 20 && Number(weatherNow?.G) < 50 && <WiWindy size={100} color="#fff" />}
              {Number(weatherNow?.G) >= 50 && Number(weatherNow?.G) < 100 && <WiStrongWind size={100} color="#fff" />}
              {weatherNow?.D === 'N' && <WiDirectionUp size={100} color="#fff" />}
              {weatherNow?.D === 'NE' && <WiDirectionUpRight size={100} color="#fff" />}
              {weatherNow?.D === 'NW' && <WiDirectionUpLeft size={100} color="#fff" />}
              {weatherNow?.D === 'W' && <WiDirectionLeft size={100} color="#fff" />}
              {weatherNow?.D === 'WSW' && <WiDirectionDownLeft size={100} color="#fff" />}
              {weatherNow?.D === 'S' && <WiDirectionDown size={100} color="#fff" />}
              {weatherNow?.D === 'SE' && <WiDirectionDownRight size={100} color="#fff" />}
              {weatherNow?.D === 'E' && <WiDirectionRight size={100} color="#fff" />}
              {/* {Number(weatherNow?.Pp) >= 51 && Number(weatherNow?.Pp) < 100 && (
                <WiNightAltRainWind size={100} color="#fff" />
              )} */}
            </div>
          </div>
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
