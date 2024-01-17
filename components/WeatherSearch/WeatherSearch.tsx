'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { WeatherLocation, getWeatherLocations } from '@/components/weather.server';
import { useEffect, useState } from 'react';

export default function WeatherSearch({ ...props }) {
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<WeatherLocation[] | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<WeatherLocation[] | null>(null);
  const [placeholder, setPlaceholder] = useState('Search locations...');
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    getWeatherLocations().then((data) => setLocations(data));
  }, []);

  useEffect(() => {
    // if (search.length >= 3) {
    //   setFilteredLocations(
    //     locations ? locations.filter((location) => location.name.toLowerCase().includes(search.toLowerCase())) : null,
    //   );
    // } else {
    //   setFilteredLocations(null);
    // }
    if (search.length >= 3) {
      if (locations) {
        setFilteredLocations(
          locations.filter((location) => location.name.toLowerCase().includes(search.toLowerCase())),
        );
      }
    } else {
      setFilteredLocations(null);
    }
  }, [search, locations]);

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
        />
        <Button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-slate-400"
          onClick={() => {
            setFilteredLocations(null);
            setSearch('');
          }}
        >
          X
        </Button>
      </div>
      {filteredLocations && showScroll && (
        <ScrollArea
          className={
            filteredLocations.length >= 6
              ? 'mx-80 mt-2 h-96 w-auto rounded-md border border-white/20 bg-white bg-opacity-10 backdrop-blur'
              : 'mx-80 mt-2 h-auto w-auto rounded-md border border-white/20 bg-white bg-opacity-10 backdrop-blur'
          }
        >
          <div className="p-4">
            <ul className="m-0">
              {filteredLocations.map((location, i) => (
                <li key={location.id}>
                  <Button
                    variant={'link'}
                    className="block h-auto w-full text-xl font-light text-white hover:bg-slate-100 hover:text-black"
                  >
                    {location.name}
                  </Button>
                  {i !== filteredLocations.length - 1 && <Separator className="my-3 opacity-20" />}
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
