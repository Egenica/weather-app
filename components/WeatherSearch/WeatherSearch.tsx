'use client';

import { WeatherLocation, getWeatherLocations } from '@/components/server/weather.server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

type WeatherSearchProps = {
  setLocation: (location: WeatherLocation) => void;
};

export default function WeatherSearch({ setLocation, ...props }: WeatherSearchProps) {
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<WeatherLocation[] | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<WeatherLocation[] | null>(null);
  const [placeholder, setPlaceholder] = useState('Search locations...');
  const [showScroll, setShowScroll] = useState(false);
  // const [location, setLocation] = useState<WeatherLocation | null>(null);

  useEffect(() => {
    getWeatherLocations().then((data) => setLocations(data));
  }, []);

  useEffect(() => {
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

  //console.log(JSON.stringify(filteredLocations));

  // console.log('location', location);

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
            setFilteredLocations(null);
            setSearch('');
          }}
        >
          X
        </Button>
      </div>
      {filteredLocations && (
        <ScrollArea
          className={
            filteredLocations.length >= 6
              ? 'mx-auto mt-2 h-96 w-auto rounded-md border border-white/20 bg-white bg-opacity-10 backdrop-blur md:w-2/4'
              : 'mx-auto mt-2 h-auto w-auto rounded-md border border-white/20 bg-white bg-opacity-10 backdrop-blur md:w-2/4'
          }
          data-testid="scroll-area"
        >
          <div className="p-4">
            <ul className="m-0">
              {filteredLocations.map((location, i) => (
                <li key={location.id}>
                  <Button
                    variant={'link'}
                    className="block h-auto w-full text-xl font-light text-white hover:bg-slate-100 hover:text-black"
                    onClick={() => setLocation(location)}
                  >
                    {location?.name.length > 20 ? location?.name.slice(0, 20) + '...' : location?.name}
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
