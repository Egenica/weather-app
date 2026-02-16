'use client';

import { cn } from '@/lib/utils';
import { Inter as FontSans } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';

import { weatherType } from '../TodaysWeather/weatherType';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function BodyComp({ children }: { children: React.ReactNode }) {
  const defaultBackground = '/_fcf1d22e-7641-4978-ba2a-02aa3218c2ab.jpeg';
  const [backgroundImage, setBackgroundImage] = useState(defaultBackground);
  const [incomingBackground, setIncomingBackground] = useState<string | null>(null);
  const [incomingVisible, setIncomingVisible] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const currentBackgroundRef = useRef(defaultBackground);

  const transitionToBackground = (nextBackground: string) => {
    if (!nextBackground || nextBackground === currentBackgroundRef.current || nextBackground === incomingBackground) {
      return;
    }

    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    setIncomingBackground(nextBackground);
    setIncomingVisible(false);

    requestAnimationFrame(() => {
      setIncomingVisible(true);
    });

    transitionTimeoutRef.current = window.setTimeout(() => {
      setBackgroundImage(nextBackground);
      currentBackgroundRef.current = nextBackground;
      setIncomingBackground(null);
      setIncomingVisible(false);
      transitionTimeoutRef.current = null;
    }, 550);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.hostname === 'localhost') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    const setBackgroundFromWeatherCode = () => {
      try {
        const weatherNowRaw = localStorage.getItem('weatherNow');
        if (!weatherNowRaw) {
          transitionToBackground(defaultBackground);
          return;
        }

        const weatherNow = JSON.parse(weatherNowRaw) as { W?: number | string } | null;
        const weather = weatherType(String(weatherNow?.W ?? ''));

        if (Array.isArray(weather) && typeof weather[2] === 'string' && weather[2].length > 0) {
          transitionToBackground(weather[2]);
          return;
        }

        transitionToBackground(defaultBackground);
      } catch {
        transitionToBackground(defaultBackground);
      }
    };

    const applyWeatherBackground = () => {
      const generatedBackground = localStorage.getItem('weatherBackgroundImage');
      if (!generatedBackground) {
        setBackgroundFromWeatherCode();
        return;
      }

      const testImage = new Image();
      testImage.onload = () => {
        transitionToBackground(generatedBackground);
      };
      testImage.onerror = () => {
        localStorage.removeItem('weatherBackgroundImage');
        setBackgroundFromWeatherCode();
      };
      testImage.src = generatedBackground;
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
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('weather-background-update', handleWeatherBackgroundUpdate);
    };
  }, []);

  return (
    <div className={cn('min-h-screen bg-background  font-sans antialiased', fontSans.variable)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />
      {incomingBackground && (
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500 ease-in-out',
            incomingVisible ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            backgroundImage: `url(${incomingBackground})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
