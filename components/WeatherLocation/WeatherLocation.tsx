import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DailyForecast, SimplifiedWeather } from '@/lib/server/weather-datahub';
import React from 'react';

import { weatherType } from '../TodaysWeather/weatherType';
import { WindDirection } from '../WeatherDirection/WeatherDirection';

type WeatherLocationProps = {
  weatherData: SimplifiedWeather;
};

function displayDate(date: string): string {
  const periodDate = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (periodDate.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (periodDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return periodDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', weekday: 'short' });
}

function getWeatherVisual(code: number | null) {
  const weather = weatherType(String(code ?? ''));
  if (Array.isArray(weather)) {
    return {
      icon: weather[1],
      label: weather[0],
    };
  }

  return {
    icon: null,
    label: 'Unknown',
  };
}

function formatHour(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-GB', {
    hour: 'numeric',
    hour12: true,
    minute: '2-digit',
    weekday: 'short',
  });
}

function isCurrentHour(timestamp: string): boolean {
  const rowDate = new Date(timestamp);
  const now = new Date();

  return (
    rowDate.getFullYear() === now.getFullYear() &&
    rowDate.getMonth() === now.getMonth() &&
    rowDate.getDate() === now.getDate() &&
    rowDate.getHours() === now.getHours()
  );
}

function rangeForDay(day: DailyForecast): { max: number | null; min: number | null } {
  const temps = day.hours.map((hour) => hour.temperature).filter((value): value is number => value !== null);
  if (temps.length === 0) {
    return { max: null, min: null };
  }

  return {
    max: Math.max(...temps),
    min: Math.min(...temps),
  };
}

export const WeatherLocation = ({ weatherData }: WeatherLocationProps) => {
  const [, setApi] = React.useState<CarouselApi>();
  const nowVisual = getWeatherVisual(weatherData.current.weatherCode);

  return (
    <div className="mx-0 md:mx-10">
      <div className="flex flex-col items-center justify-center">
        <span className="rounded-t bg-white px-2 text-xs font-light text-black">Now at a glance</span>
        <div className="flex w-full items-center overflow-x-scroll rounded border border-solid border-white bg-white bg-opacity-10 align-top backdrop-blur-xl md:w-auto md:justify-center">
          <div className="relative top-[-0.8rem] flex">
            <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
              {nowVisual.icon ? nowVisual.icon({ size: 60, color: '#fff' }) : <span className="text-white">--</span>}
              <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
                {nowVisual.label}
              </span>
            </div>
            <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
              <span className="items-center p-4 pl-10 text-center text-4xl font-light text-white">
                {weatherData.current.feelsLike ?? '--'}
                <span>°</span>
              </span>
              <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
                Feels Like
              </span>
            </div>
            <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
              <span className="items-center p-4 text-center text-3xl font-light text-white">
                {weatherData.current.humidity ?? '--'}%
              </span>
              <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
                Humidity
              </span>
            </div>
            <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
              <span className="items-center p-4 text-center text-3xl font-light text-white">
                {weatherData.current.windSpeed ?? '--'}
              </span>
              <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
                Wind mph
              </span>
            </div>
            <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
              <WindDirection direction={weatherData.current.windDirection ?? undefined} size={70} />
              <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-center text-xs font-light text-black">
                Direction {weatherData.current.windDirection ?? '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-left text-xl font-bold text-white">5 Day Forecast</h2>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
          watchDrag: false,
        }}
        setApi={setApi}
      >
        <CarouselContent>
          {weatherData.dailyPages.map((day) => {
            const tempRange = rangeForDay(day);

            return (
              <CarouselItem key={day.date}>
                <h3 className="mb-5 mt-5 flex flex-row items-center justify-center rounded bg-white p-3 py-2 text-center text-base font-light md:inline-block md:text-left md:text-xl">
                  <CarouselPrevious className="relative mr-auto" />
                  <span className="mx-3 inline-block">
                    {displayDate(day.date)}
                    <span className="ml-2 text-sm opacity-70">
                      (Min {tempRange.min ?? '--'}C / Max {tempRange.max ?? '--'}C)
                    </span>
                  </span>
                  <CarouselNext className="relative ml-auto" />
                </h3>

                <Table className="bg-blur mb-5 rounded bg-white bg-opacity-10 backdrop-blur-xl">
                  <TableHeader className="bg-white bg-opacity-10">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="py-2 text-white">Date & Time</TableHead>
                      <TableHead className="py-2 text-white">Weather Type</TableHead>
                      <TableHead className="py-2 text-white">Temp</TableHead>
                      <TableHead className="py-2 text-white">Feels</TableHead>
                      <TableHead className="py-2 text-white">Humidity</TableHead>
                      <TableHead className="py-2 text-white">Wind</TableHead>
                      <TableHead className="py-2 text-white">Gust</TableHead>
                      <TableHead className="py-2 text-white">Direction</TableHead>
                      <TableHead className="py-2 text-white">Rain %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {day.hours.map((hour) => {
                      const visual = getWeatherVisual(hour.weatherCode);
                      const isNow = isCurrentHour(hour.timestamp);

                      return (
                        <TableRow
                          key={hour.timestamp}
                          className={isNow ? 'bg-teal-300/15 hover:bg-teal-300/15' : 'hover:bg-transparent'}
                        >
                          <TableCell className="whitespace-nowrap text-white">{formatHour(hour.timestamp)}</TableCell>
                          <TableCell className="text-white">
                            <div className="relative left-[-0.5rem] flex flex-col items-center justify-center text-center">
                              {visual.icon ? (
                                visual.icon({ size: 40, color: '#fff' })
                              ) : (
                                <span className="text-white">--</span>
                              )}
                              <span className="text-xs">{visual.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{hour.temperature ?? '--'}C</TableCell>
                          <TableCell className="text-white">{hour.feelsLike ?? '--'}C</TableCell>
                          <TableCell className="text-white">{hour.humidity ?? '--'}%</TableCell>
                          <TableCell className="text-white">{hour.windSpeed ?? '--'} mph</TableCell>
                          <TableCell className="text-white">{hour.windGust ?? '--'} mph</TableCell>
                          <TableCell className="text-white">
                            <div className="flex items-center gap-2">
                              <WindDirection direction={hour.windDirection ?? undefined} size={30} />
                              <span>{hour.windDirection ?? '--'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{hour.precipitationChance ?? '--'}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CarouselItem>
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
        <a href="https://www.metoffice.gov.uk/services/data" target="_blank" rel="noreferrer" className="underline">
          Met Office
        </a>
      </p>
    </div>
  );
};
