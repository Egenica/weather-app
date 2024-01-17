'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { WeatherLocation, getWeatherLocations } from '@/components/weather.server';
import { useEffect, useState } from 'react';

export default function WeatherSearch() {
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState<WeatherLocation[] | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<WeatherLocation[] | null>(null);

  useEffect(() => {
    getWeatherLocations().then((data) => setLocations(data));
  }, []);

  useEffect(() => {
    if (search.length >= 3) {
      setFilteredLocations(
        locations ? locations.filter((location) => location.name.toLowerCase().includes(search.toLowerCase())) : null,
      );
    } else {
      setFilteredLocations(null);
    }
  }, [search, locations]);

  return (
    <div className="mt-4">
      <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search locations..." />
      {filteredLocations && (
        <ScrollArea className="mt-2 h-72 w-auto rounded-md border">
          <div className="p-4">
            <ul className="m-0">
              {filteredLocations.map((location) => (
                <li key={location.id}>
                  <Button variant={'link'} className="block w-full">
                    {location.name}
                  </Button>
                  <Separator className="my-2" />
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
