'use client';

import { MiniNav } from '@/components/MiniNav/MiniNav';
import { WeatherLocation } from '@/components/WeatherLocation/WeatherLocation';
import WeatherSearch, { SearchLocation } from '@/components/WeatherSearch/WeatherSearch';
import { SimplifiedWeather } from '@/lib/server/weather-datahub';
import { useEffect, useState } from 'react';

export default function Home() {
  const [location, setLocation] = useState<SearchLocation | null>(null);
  const [weather, setWeather] = useState<SimplifiedWeather | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    const localLocation = localStorage.getItem('location');
    if (localLocation) {
      try {
        setLocation(JSON.parse(localLocation));
      } catch {
        localStorage.removeItem('location');
      }
    }
  }, []);

  useEffect(() => {
    if (!location) {
      setWeather(null);
      return;
    }

    setLoadingWeather(true);
    setWeatherError(null);

    const params = new URLSearchParams({
      lat: String(location.lat),
      lon: String(location.lon),
    });

    fetch(`/weather?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({ error: 'Unable to load weather data' }));
          throw new Error(payload.error || 'Unable to load weather data');
        }

        return response.json() as Promise<SimplifiedWeather>;
      })
      .then((data) => {
        setWeather(data);
        localStorage.setItem('weatherNow', JSON.stringify({ W: data.current.weatherCode }));
        window.dispatchEvent(new Event('weather-background-update'));
      })
      .catch((error) => {
        setWeather(null);
        setWeatherError(error instanceof Error ? error.message : 'Unable to load weather data');
      })
      .finally(() => {
        setLoadingWeather(false);
      });
  }, [location]);

  return (
    <div data-testid="home">
      <MiniNav
        data-testid="mini-nav"
        location={location}
        setLocation={() => {
          localStorage.removeItem('location');
          localStorage.removeItem('weatherNow');
          window.dispatchEvent(new Event('weather-background-update'));
          setLocation(null);
          setWeather(null);
          setWeatherError(null);
        }}
      />
      <div className="container">
        {!location ? (
          <>
            <h1 className="mb-10 mt-10 text-center text-4xl font-thin text-teal-600">Find your weather location</h1>
            <WeatherSearch data-testid="weather-search" setLocation={setLocation} />
          </>
        ) : (
          <>
            <h1 className="mb-10 mt-10 text-center text-4xl font-thin text-teal-600">{location.name}</h1>
            {location.isRegion && (
              <p className="mb-4 text-center text-xs uppercase tracking-[0.2em] text-teal-100">
                Regional estimate (centroid-based)
              </p>
            )}
            {loadingWeather && <p className="mt-3 text-center text-white">Loading weather...</p>}
            {weatherError && <p className="mt-3 text-center text-red-200">{weatherError}</p>}
            {weather && <WeatherLocation weatherData={weather} />}
          </>
        )}
      </div>
    </div>
  );
}
