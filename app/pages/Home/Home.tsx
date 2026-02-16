'use client';

import { MiniNav } from '@/components/MiniNav/MiniNav';
import WeatherSearch, { SearchLocation } from '@/components/WeatherSearch/WeatherSearch';
import { useEffect, useState } from 'react';

type WeatherResponse = {
  feelsLike: number | null;
  humidity: number | null;
  temperature: number | null;
  timestamp: string;
  weatherCode: number | null;
  windSpeed: number | null;
};

export default function Home() {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App resumed, checking for updates...');
        window.location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const [location, setLocation] = useState<SearchLocation | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
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

        return response.json() as Promise<WeatherResponse>;
      })
      .then((data) => {
        setWeather(data);
      })
      .catch((error) => {
        setWeather(null);
        setWeatherError(error instanceof Error ? error.message : 'Unable to load weather data');
      })
      .finally(() => {
        setLoadingWeather(false);
      });
  }, [location]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-GB', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div data-testid="home">
      <MiniNav
        data-testid="mini-nav"
        location={location}
        setLocation={() => {
          localStorage.removeItem('location');
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
            <section className="mx-auto max-w-2xl rounded-lg border border-white/20 bg-white/10 p-6 text-white backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Forecast (hourly)</p>
              {loadingWeather && <p className="mt-3">Loading weather...</p>}
              {weatherError && <p className="mt-3 text-red-200">{weatherError}</p>}
              {weather && (
                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3" data-testid="current-weather">
                  <p>
                    Temp: <strong>{weather.temperature ?? '--'}C</strong>
                  </p>
                  <p>
                    Feels: <strong>{weather.feelsLike ?? '--'}C</strong>
                  </p>
                  <p>
                    Wind: <strong>{weather.windSpeed ?? '--'} mph</strong>
                  </p>
                  <p>
                    Humidity: <strong>{weather.humidity ?? '--'}%</strong>
                  </p>
                  <p>
                    Weather code: <strong>{weather.weatherCode ?? '--'}</strong>
                  </p>
                  <p>
                    Time: <strong>{formatTimestamp(weather.timestamp)}</strong>
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
