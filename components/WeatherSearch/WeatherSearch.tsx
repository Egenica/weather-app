'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, LocateFixed } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

export type SearchLocation = {
  adminArea: string | null;
  country: string;
  isRegion: boolean;
  lat: number;
  lon: number;
  name: string;
};

type WeatherSearchProps = {
  setLocation: (location: SearchLocation) => void;
};

export default function WeatherSearch({ setLocation, ...props }: WeatherSearchProps) {
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1224 });
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<SearchLocation[]>([]);
  const [placeholder, setPlaceholder] = useState('Search locations...');
  const [, setShowScroll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unknownLocation, setUnknownLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    setUnknownLocation(false);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const fallbackLat = Number(position.coords.latitude.toFixed(5));
        const fallbackLon = Number(position.coords.longitude.toFixed(5));

        const fallbackLocation = {
          adminArea: null,
          country: 'United Kingdom',
          isRegion: false,
          lat: fallbackLat,
          lon: fallbackLon,
          name: 'Current location',
        };

        try {
          const response = await fetch(`/api/reverse-geocode?lat=${fallbackLat}&lon=${fallbackLon}`);
          if (!response.ok) {
            throw new Error('Reverse geocode request failed');
          }

          const data = await response.json();
          const resolved = data?.location;
          const nextLocation =
            resolved &&
            typeof resolved.name === 'string' &&
            typeof resolved.lat === 'number' &&
            typeof resolved.lon === 'number'
              ? {
                  adminArea: typeof resolved.adminArea === 'string' ? resolved.adminArea : null,
                  country: typeof resolved.country === 'string' ? resolved.country : 'United Kingdom',
                  isRegion: false,
                  lat: resolved.lat,
                  lon: resolved.lon,
                  name: resolved.name,
                }
              : fallbackLocation;

          console.log('[location][current-location-resolved]', {
            fallbackLocation,
            resolvedLocation: resolved ?? null,
            selectedLocation: nextLocation,
          });

          setLocation(nextLocation);
          localStorage.setItem('location', JSON.stringify(nextLocation));
        } catch {
          console.log('[location][current-location-fallback]', {
            fallbackLocation,
          });
          setLocation(fallbackLocation);
          localStorage.setItem('location', JSON.stringify(fallbackLocation));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationError('Unable to access your current location');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    const trimmed = search.trim();

    if (!trimmed) {
      setLocations([]);
      setLoading(false);
      setUnknownLocation(false);
      setLocationError(null);
      return;
    }

    if (trimmed.length < 2) {
      setLocations([]);
      setLoading(false);
      setUnknownLocation(false);
      setLocationError(null);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      setUnknownLocation(false);
      setLocationError(null);
      fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`)
        .then((response) => response.json())
        .then((data) => {
          const nextLocations = Array.isArray(data.locations) ? data.locations : [];
          setLocations(nextLocations);
          setUnknownLocation(nextLocations.length === 0);
        })
        .catch(() => {
          setLocations([]);
          setUnknownLocation(false);
          setLocationError('Unable to search locations right now');
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  const showLocations = search.trim().length >= 2 && locations.length > 0;

  return (
    <div {...props} className="mt-4 text-center">
      <div className="relative">
        <Input
          type="text"
          value={search}
          className="ring-offset-background:none rounded-3xl p-8 pl-14 pr-14 text-center text-xl font-light placeholder:text-slate-400"
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          onFocus={() => {
            setPlaceholder('');
            setShowScroll(true);
          }}
          onBlur={() => {
            setPlaceholder('Search locations...');
            setShowScroll(false);
          }}
          data-testid="search-input"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          aria-label={locating ? 'Finding your location' : 'Use current location'}
          title={locating ? 'Finding your location...' : 'Use current location'}
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-400"
          onClick={() => {
            setSearch('');
            setLocations([]);
            setUnknownLocation(false);
            setLocationError(null);
          }}
          aria-label="Clear search"
        >
          X
        </Button>
      </div>
      {showLocations && (
        <ScrollArea
          className={
            locations.length >= 6
              ? 'mx-auto mt-2 h-96 w-auto rounded-md border border-white/20 bg-white bg-opacity-10 backdrop-blur md:w-2/4'
              : 'mx-auto mt-2 h-auto w-auto rounded-md border border-white/20 bg-white bg-opacity-10 backdrop-blur md:w-2/4'
          }
          data-testid="scroll-area"
        >
          <div className="p-4">
            <ul className="m-0">
              {locations.map((location, i) => (
                <li key={`${location.name}-${location.lat}-${location.lon}`}>
                  <button
                    type="button"
                    className="group block h-auto w-full rounded-sm p-2 text-left text-xl font-light text-white hover:bg-slate-100 hover:text-black"
                    onClick={() => {
                      setLocation(location);
                      localStorage.setItem('location', JSON.stringify(location));
                    }}
                    title={location.name}
                  >
                    {isTabletOrMobile && location.name.length > 20 ? `${location.name.slice(0, 20)}...` : location.name}
                    <span className="block text-xs opacity-70 group-hover:opacity-90">
                      {[location.adminArea, location.country].filter(Boolean).join(', ')}
                    </span>
                    {location.isRegion && (
                      <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-teal-100/90 group-hover:text-slate-700">
                        Regional estimate
                      </span>
                    )}
                  </button>
                  {i !== locations.length - 1 && <Separator className="my-3 opacity-20" />}
                </li>
              ))}
            </ul>
            {loading && <p className="p-3 text-xs text-white opacity-70">Searching...</p>}
          </div>
        </ScrollArea>
      )}
      {!loading && unknownLocation && <p className="mt-3 text-sm text-red-200">Unknown location</p>}
      {locationError && <p className="mt-3 text-sm text-red-200">{locationError}</p>}
    </div>
  );
}
