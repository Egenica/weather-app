'use client';

import { MiniNav } from '@/components/MiniNav/MiniNav';
import WeatherSearch from '@/components/WeatherSearch/WeatherSearch';
import { WeatherLocation } from '@/components/server/weather.server';
import { useState } from 'react';

export default function Home({ ...props }) {
  const [location, setLocation] = useState<WeatherLocation | null>(null);

  console.log('location', location);

  return (
    <div {...props}>
      <MiniNav data-testid="mini-nav" location={location} setLocation={setLocation} />
      <div className="container">
        {!location ? (
          <>
            <h1 className="mb-10 mt-10 text-center text-4xl font-thin text-teal-600">Find your weather location</h1>
            <WeatherSearch data-testid="weather-search" setLocation={setLocation} />
          </>
        ) : (
          <>
            <h1 className="mb-10 mt-10 text-center text-4xl font-thin text-teal-600">{location.name}</h1>
          </>
        )}
      </div>
    </div>
  );
}
