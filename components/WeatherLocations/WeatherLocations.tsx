'use client';

// Import necessary hooks and components from React and Next.js
import { WeatherLocation, getWeatherLocations } from '@/components/server/weather.server';
import { useEffect, useState } from 'react';

export default function WeatherLocations() {
  // Create a state variable to hold the fetched data
  const [locations, setLocations] = useState<WeatherLocation[] | null>(null);

  // Use the useEffect hook to fetch the data when the component mounts
  useEffect(() => {
    getWeatherLocations().then((data) => setLocations(data));
  }, []);

  // Render the fetched data
  return (
    <div>
      {locations ? (
        locations.map((location) => (
          <div key={location.id}>
            <h2>{location.name}</h2>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
