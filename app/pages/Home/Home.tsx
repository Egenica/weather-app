'use client';

import { MiniNav } from '@/components/MiniNav/MiniNav';
import { WeatherLocation } from '@/components/WeatherLocation/WeatherLocation';
import WeatherSearch, { SearchLocation } from '@/components/WeatherSearch/WeatherSearch';
import { SimplifiedWeather } from '@/lib/server/weather-datahub';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [location, setLocation] = useState<SearchLocation | null>(null);
  const [weather, setWeather] = useState<SimplifiedWeather | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const lastGeneratedBackgroundKey = useRef<string>('');
  const lastLocationKey = useRef<string>('');

  const requestBackgroundImage = (input: {
    feelsLike: number | null;
    humidity: number | null;
    temperature: number | null;
    variantKey: string;
    weatherCode: number | null;
    windSpeed: number | null;
  }) => {
    if (!location) {
      return;
    }

    const dedupeKey = `${location.name}:${location.adminArea ?? ''}:${location.country}:${input.weatherCode ?? 'unknown'}:${input.variantKey}`;
    if (lastGeneratedBackgroundKey.current === dedupeKey) {
      return;
    }

    lastGeneratedBackgroundKey.current = dedupeKey;

    fetch('/api/background', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminArea: location.adminArea,
        country: location.country,
        feelsLike: input.feelsLike,
        humidity: input.humidity,
        locationName: location.name,
        temperature: input.temperature,
        variantKey: input.variantKey,
        weatherCode: input.weatherCode,
        windSpeed: input.windSpeed,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { imageUrl?: string | null; source?: string };
        if (typeof payload.imageUrl === 'string' && payload.imageUrl.length > 0) {
          localStorage.setItem('weatherBackgroundImage', payload.imageUrl);
          window.dispatchEvent(new Event('weather-background-update'));
          console.log('[background] applied generated image', {
            location: location.name,
            source: payload.source ?? 'unknown',
            variantKey: input.variantKey,
            weatherCode: input.weatherCode,
          });
          return;
        }

        console.log('[background] using static fallback', {
          location: location.name,
          variantKey: input.variantKey,
          weatherCode: input.weatherCode,
        });
        if (!localStorage.getItem('weatherBackgroundImage')) {
          window.dispatchEvent(new Event('weather-background-update'));
        }
      })
      .catch(() => {
        console.log('[background] generation request failed, using static fallback', {
          location: location.name,
          variantKey: input.variantKey,
          weatherCode: input.weatherCode,
        });
        if (!localStorage.getItem('weatherBackgroundImage')) {
          window.dispatchEvent(new Event('weather-background-update'));
        }
      });
  };

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

    const locationKey = `${location.name}:${location.adminArea ?? ''}:${location.country}:${location.lat}:${location.lon}`;
    if (lastLocationKey.current !== locationKey) {
      lastLocationKey.current = locationKey;
      lastGeneratedBackgroundKey.current = '';
      localStorage.removeItem('weatherBackgroundImage');
      window.dispatchEvent(new Event('weather-background-update'));
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
        if (!localStorage.getItem('weatherBackgroundImage')) {
          window.dispatchEvent(new Event('weather-background-update'));
        }

        requestBackgroundImage({
          feelsLike: data.current.feelsLike,
          humidity: data.current.humidity,
          temperature: data.current.temperature,
          variantKey: data.current.timestamp,
          weatherCode: data.current.weatherCode,
          windSpeed: data.current.windSpeed,
        });

        const nextDay = data.dailyPages[1];
        if (nextDay) {
          const midday = nextDay.hours.find((hour) => {
            const value = new Date(hour.timestamp);
            return !Number.isNaN(value.getTime()) && value.getHours() >= 11 && value.getHours() <= 14;
          });
          const representative = midday ?? nextDay.hours[0] ?? data.current;

          requestBackgroundImage({
            feelsLike: representative.feelsLike,
            humidity: representative.humidity,
            temperature: representative.temperature,
            variantKey: nextDay.date,
            weatherCode: representative.weatherCode,
            windSpeed: representative.windSpeed,
          });
        }
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
          localStorage.removeItem('weatherBackgroundImage');
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
            {weather && (
              <WeatherLocation
                weatherData={weather}
                onDayWeatherChange={({ date, weatherCode }) => {
                  const day = weather.dailyPages.find((item) => item.date === date);
                  const midday = day?.hours.find((hour) => {
                    const value = new Date(hour.timestamp);
                    return !Number.isNaN(value.getTime()) && value.getHours() >= 11 && value.getHours() <= 14;
                  });
                  const representative = midday ?? day?.hours[0] ?? weather.current;

                  requestBackgroundImage({
                    feelsLike: representative.feelsLike,
                    humidity: representative.humidity,
                    temperature: representative.temperature,
                    variantKey: date,
                    weatherCode,
                    windSpeed: representative.windSpeed,
                  });
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
