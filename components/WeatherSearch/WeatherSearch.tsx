'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

export type SearchLocation = {
  adminArea: string | null;
  country: string;
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

  useEffect(() => {
    const trimmed = search.trim();

    if (!trimmed) {
      setLocations([]);
      setLoading(false);
      setUnknownLocation(false);
      return;
    }

    if (trimmed.length < 2) {
      setLocations([]);
      setLoading(false);
      setUnknownLocation(false);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      setUnknownLocation(false);
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
          className="ring-offset-background:none rounded-3xl p-8 text-center text-xl font-light placeholder:text-slate-400"
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
          className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-slate-400"
          onClick={() => {
            setSearch('');
            setLocations([]);
            setUnknownLocation(false);
          }}
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
                  <Button
                    variant={'link'}
                    className="block h-auto w-full text-xl font-light text-white hover:bg-slate-100 hover:text-black"
                    onClick={() => {
                      setLocation(location);
                      localStorage.setItem('location', JSON.stringify(location));
                    }}
                    title={location.name}
                  >
                    {isTabletOrMobile && location.name.length > 20 ? `${location.name.slice(0, 20)}...` : location.name}
                    <span className="block text-xs opacity-70">
                      {[location.adminArea, location.country].filter(Boolean).join(', ')}
                    </span>
                  </Button>
                  {i !== locations.length - 1 && <Separator className="my-3 opacity-20" />}
                </li>
              ))}
            </ul>
            {loading && <p className="p-3 text-xs text-white opacity-70">Searching...</p>}
          </div>
        </ScrollArea>
      )}
      {!loading && unknownLocation && <p className="mt-3 text-sm text-red-200">Unknown location</p>}
    </div>
  );
}
