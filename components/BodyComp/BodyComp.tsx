'use client';

import { cn } from '@/lib/utils';
import { Inter as FontSans } from 'next/font/google';
import { useEffect, useState } from 'react';

import { weatherType } from '../TodaysWeather/weatherType';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function BodyComp({ children }: { children: React.ReactNode }) {
  const defaultBackground = '/_fcf1d22e-7641-4978-ba2a-02aa3218c2ab.jpeg';
  const [backgroundImage, setBackgroundImage] = useState(defaultBackground);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.hostname === 'localhost') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    const applyWeatherBackground = () => {
      try {
        const weatherNowRaw = localStorage.getItem('weatherNow');
        if (!weatherNowRaw) {
          setBackgroundImage(defaultBackground);
          return;
        }

        const weatherNow = JSON.parse(weatherNowRaw) as { W?: number | string } | null;
        const weather = weatherType(String(weatherNow?.W ?? ''));

        if (Array.isArray(weather) && typeof weather[2] === 'string' && weather[2].length > 0) {
          setBackgroundImage(weather[2]);
          return;
        }

        setBackgroundImage(defaultBackground);
      } catch {
        setBackgroundImage(defaultBackground);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'weatherNow') {
        applyWeatherBackground();
      }
    };

    const handleWeatherBackgroundUpdate = () => {
      applyWeatherBackground();
    };

    applyWeatherBackground();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('weather-background-update', handleWeatherBackgroundUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('weather-background-update', handleWeatherBackgroundUpdate);
    };
  }, []);

  return (
    <div
      className={cn('min-h-screen bg-background  font-sans antialiased', fontSans.variable)}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
