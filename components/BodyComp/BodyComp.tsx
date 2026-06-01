'use client';

import { cn } from '@/lib/utils';
import {
  createWeatherEffectsEngine,
  getDebugWeatherScene,
  getEffectsMode,
  isEffectsEnabled,
  isHtmlInCanvasRequested,
  resolveSceneFromWeatherCode,
} from '@/lib/canvas/weather-effects';
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectsEngineRef = useRef<ReturnType<typeof createWeatherEffectsEngine> | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const currentBackgroundRef = useRef(defaultBackground);

  const getStoredWeatherCode = (): number | null => {
    try {
      const weatherNowRaw = localStorage.getItem('weatherNow');
      if (!weatherNowRaw) {
        return null;
      }

      const weatherNow = JSON.parse(weatherNowRaw) as { W?: number | string } | null;
      const parsed = Number(weatherNow?.W);
      if (!Number.isFinite(parsed)) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  };

  const logBackgroundSource = (source: string, details?: Record<string, unknown>) => {
    console.log('[background] resolved image source', {
      source,
      ...details,
    });
  };

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
          logBackgroundSource('default', { reason: 'missing weatherNow' });
          transitionToBackground(defaultBackground);
          return;
        }

        const weatherNow = JSON.parse(weatherNowRaw) as { W?: number | string } | null;
        const weather = weatherType(String(weatherNow?.W ?? ''));

        if (Array.isArray(weather) && typeof weather[2] === 'string' && weather[2].length > 0) {
          logBackgroundSource('weather-code-fallback', {
            weatherCode: weatherNow?.W ?? 'unknown',
            imagePath: weather[2],
          });
          transitionToBackground(weather[2]);
          return;
        }

        logBackgroundSource('default', {
          reason: 'weather mapping unavailable',
          weatherCode: weatherNow?.W ?? 'unknown',
        });
        transitionToBackground(defaultBackground);
      } catch {
        logBackgroundSource('default', { reason: 'weather parsing failed' });
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
        logBackgroundSource('generated', {
          imageKind: generatedBackground.startsWith('data:') ? 'data-url' : 'url',
        });
        transitionToBackground(generatedBackground);
      };
      testImage.onerror = () => {
        logBackgroundSource('generated-invalid', { reason: 'image failed to load' });
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!isEffectsEnabled(window.location.search)) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const engine = createWeatherEffectsEngine({
      canvas,
      intensity: getEffectsMode(window.location.search) === 'storm' ? 'storm' : 'default',
      scene: getDebugWeatherScene(window.location.search) ?? resolveSceneFromWeatherCode(getStoredWeatherCode()),
      useHtmlInCanvas: isHtmlInCanvasRequested(window.location.search),
    });
    effectsEngineRef.current = engine;

    const syncSceneFromStorage = () => {
      const nextScene = getDebugWeatherScene(window.location.search) ?? resolveSceneFromWeatherCode(getStoredWeatherCode());
      engine.updateScene(nextScene);
    };

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'weatherNow') {
        syncSceneFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('weather-background-update', syncSceneFromStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('weather-background-update', syncSceneFromStorage);
      effectsEngineRef.current?.destroy();
      effectsEngineRef.current = null;
    };
  }, []);

  return (
    <div className={cn('relative min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
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
      <canvas className="pointer-events-none fixed inset-0 z-50 block h-screen w-screen" ref={canvasRef} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
