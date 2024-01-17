import { ButtonClient } from '@/components/ButtonClient/ButtonClient';
import { MiniNav } from '@/components/MiniNav/MiniNav';
import WeatherLocations from '@/components/WeatherLocations/WeatherLocations';
import WeatherSearch from '@/components/WeatherSearch/WeatherSearch';

export const metadata = {
  title: 'Weather App',
  description: 'Weather App',
};

//

export default function Page() {
  return (
    <>
      <MiniNav />
      <div className="container">
        <h1 className="mb-6 mt-10 text-center text-4xl font-thin text-teal-600">Find your Weather location</h1>

        {/* <WeatherLocations /> */}
        <WeatherSearch />
        {/* <ButtonClient /> */}
      </div>
    </>
  );
}
