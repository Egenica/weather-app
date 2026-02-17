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
  onDayWeatherChange?: (payload: { date: string; weatherCode: number | null }) => void;
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

function formatRoundedDegrees(value: number | null): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '--';
  }

  return `${Math.round(value)}°`;
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

function isToday(date: string): boolean {
  const value = new Date(date);
  const now = new Date();

  return (
    value.getFullYear() === now.getFullYear() &&
    value.getMonth() === now.getMonth() &&
    value.getDate() === now.getDate()
  );
}

function getClosestHourTimestamp(hours: DailyForecast['hours']): string | null {
  if (hours.length === 0) {
    return null;
  }

  const now = Date.now();
  let closest: { diff: number; timestamp: string } | null = null;

  for (const hour of hours) {
    const hourTime = new Date(hour.timestamp).getTime();
    if (Number.isNaN(hourTime)) {
      continue;
    }

    const diff = Math.abs(hourTime - now);
    if (!closest || diff < closest.diff) {
      closest = { diff, timestamp: hour.timestamp };
    }
  }

  return closest ? closest.timestamp : null;
}

function isSameLocalHour(timestamp: string, referenceDate: Date): boolean {
  const value = new Date(timestamp);

  if (Number.isNaN(value.getTime())) {
    return false;
  }

  return (
    value.getFullYear() === referenceDate.getFullYear() &&
    value.getMonth() === referenceDate.getMonth() &&
    value.getDate() === referenceDate.getDate() &&
    value.getHours() === referenceDate.getHours()
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

function getDayWeatherCode(day: DailyForecast): number | null {
  const midday = day.hours.find((hour) => {
    const value = new Date(hour.timestamp);
    return !Number.isNaN(value.getTime()) && value.getHours() >= 11 && value.getHours() <= 14;
  });

  return midday?.weatherCode ?? day.hours[0]?.weatherCode ?? null;
}

export const WeatherLocation = ({ weatherData, onDayWeatherChange }: WeatherLocationProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const todayPage = weatherData.dailyPages.find((day) => isToday(day.date));
  const now = new Date();
  const highlightedTodayTimestamp = todayPage
    ? todayPage.hours.find((hour) => isSameLocalHour(hour.timestamp, now))?.timestamp ??
      getClosestHourTimestamp(todayPage.hours)
    : null;
  const highlightedCurrentHour = highlightedTodayTimestamp
    ? todayPage?.hours.find((hour) => hour.timestamp === highlightedTodayTimestamp)
    : null;
  const currentSnapshot = highlightedCurrentHour ?? weatherData.current;
  const nowVisual = getWeatherVisual(currentSnapshot.weatherCode);

  React.useEffect(() => {
    if (!api || typeof window === 'undefined') {
      return;
    }

    const applyDayBackground = () => {
      const selectedIndex = api.selectedScrollSnap();
      const selectedDay = weatherData.dailyPages[selectedIndex];
      if (!selectedDay) {
        return;
      }

      const selectedCode = getDayWeatherCode(selectedDay);
      if (selectedCode === null) {
        return;
      }

      localStorage.setItem('weatherNow', JSON.stringify({ W: selectedCode }));
      const hasGeneratedBackground = Boolean(localStorage.getItem('weatherBackgroundImage'));
      if (!hasGeneratedBackground) {
        window.dispatchEvent(new Event('weather-background-update'));
      }
      onDayWeatherChange?.({
        date: selectedDay.date,
        weatherCode: selectedCode,
      });
    };

    applyDayBackground();
    api.on('select', applyDayBackground);
    api.on('reInit', applyDayBackground);

    return () => {
      api.off('select', applyDayBackground);
      api.off('reInit', applyDayBackground);
    };
  }, [api, onDayWeatherChange, weatherData.dailyPages]);

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
                {formatRoundedDegrees(currentSnapshot.feelsLike)}
              </span>
              <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
                Feels Like
              </span>
            </div>
            <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
              <span className="items-center p-4 text-center text-3xl font-light text-white">
                {currentSnapshot.humidity ?? '--'}%
              </span>
              <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
                Humidity
              </span>
            </div>
            <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
              <span className="items-center p-4 text-center text-3xl font-light text-white">
                {currentSnapshot.windSpeed ?? '--'}
              </span>
              <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
                Wind mph
              </span>
            </div>
            <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
              <WindDirection direction={currentSnapshot.windDirection ?? undefined} size={70} />
              <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-center text-xs font-light text-black">
                Direction {currentSnapshot.windDirection ?? '--'}
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
            const now = new Date();
            const highlightedTimestamp = isToday(day.date)
              ? day.hours.find((hour) => isSameLocalHour(hour.timestamp, now))?.timestamp ??
                getClosestHourTimestamp(day.hours)
              : null;

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
                      <TableHead className="py-2 text-center text-white">Weather Type</TableHead>
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
                      const isNow = highlightedTimestamp
                        ? hour.timestamp === highlightedTimestamp
                        : isCurrentHour(hour.timestamp);

                      return (
                        <TableRow
                          key={hour.timestamp}
                          className={
                            isNow ? 'bg-teal-300/30 text-white/95 hover:bg-teal-300/30' : 'hover:bg-transparent'
                          }
                        >
                          <TableCell className="whitespace-nowrap text-white">
                            <span className="inline-flex items-center gap-2">
                              {isNow && <span className="h-2 w-2 rounded-full bg-teal-200" aria-hidden="true" />}
                              <span>{formatHour(hour.timestamp)}</span>
                              {isNow && (
                                <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-black">
                                  Now
                                </span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-white">
                            <div className="mx-auto flex w-full max-w-[120px] flex-col items-center justify-center text-center">
                              {visual.icon ? (
                                visual.icon({ size: 40, color: '#fff' })
                              ) : (
                                <span className="text-white">--</span>
                              )}
                              <span className="block w-full text-center text-xs">{visual.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{formatRoundedDegrees(hour.temperature)}</TableCell>
                          <TableCell className="text-white">{formatRoundedDegrees(hour.feelsLike)}</TableCell>
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
