'use client';

import { MiniNav } from '@/components/MiniNav/MiniNav';
import { WeatherLocation } from '@/components/WeatherLocation/WeatherLocation';
import WeatherSearch from '@/components/WeatherSearch/WeatherSearch';
import { WeatherLocationT } from '@/components/server/weather.server';
import { useEffect, useState } from 'react';
import PullToRefresh from 'react-pull-to-refresh';

export default function Home() {
  const handleRefresh = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        window.location.reload(); // Refresh the page
        resolve();
      }, 500);
    });
  };

  const [location, setLocation] = useState<WeatherLocationT | null>(null);

  useEffect(() => {
    // get location from local storage
    const LocalLocation = localStorage.getItem('location');
    if (LocalLocation) {
      setLocation(JSON.parse(LocalLocation));
    }
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh} style={{ height: '100vh', overflow: 'auto' }}>
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
              <h1 className="mb-10 mt-10 text-center text-4xl font-thin text-teal-600">{location.name}</h1>
              <WeatherLocation id={location.id} />
            </>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
