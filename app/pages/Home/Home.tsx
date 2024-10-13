'use client';

import { MiniNav } from '@/components/MiniNav/MiniNav';
import { WeatherLocation } from '@/components/WeatherLocation/WeatherLocation';
import WeatherSearch from '@/components/WeatherSearch/WeatherSearch';
import { WeatherLocationT } from '@/components/server/weather.server';
import { useState } from 'react';

export default function Home() {
  const [location, setLocation] = useState<WeatherLocationT | null>(null);

  if (location) console.log('location', location);

  return (
    <div>
      <MiniNav data-testid="mini-nav" location={location} setLocation={setLocation} />
      <div className="container">
        {!location ? (
          <>
            <h1 className="mb-10 mt-10 text-center text-4xl font-thin text-teal-600">Find your weather location</h1>
            <WeatherSearch data-testid="weather-search" setLocation={setLocation} />
          </>
        ) : (
          <>
            <h1 className="mb-10 mt-10 text-center text-4xl font-thin text-teal-600">
              {location.name} - 5 Day Forcast
            </h1>
            <WeatherLocation id={location.id} />
          </>
        )}
      </div>
    </div>
  );
}
