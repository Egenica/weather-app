import { ButtonClient } from '@/components/ButtonClient/ButtonClient';
import WeatherLocations from '@/components/WeatherLocations/WeatherLocations';
import WeatherSearch from '@/components/WeatherSearch/WeatherSearch';

export const metadata = {
  title: 'Weather App',
};

//

export default function Page() {
  return (
    <>
      <div className="container">
        <h1 className="text-center">Weather App </h1>
        <div className="rounded bg-blue-950 p-4 text-center text-white">This is a box</div>
        {/* <WeatherLocations /> */}
        <WeatherSearch />
        <ButtonClient />
      </div>
    </>
  );
}
