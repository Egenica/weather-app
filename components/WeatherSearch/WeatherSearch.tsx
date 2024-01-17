'use client';

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
    <div>
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search locations..." />
      {filteredLocations && (
        <ul>
          {filteredLocations.map((location) => (
            <li key={location.id}>{location.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
