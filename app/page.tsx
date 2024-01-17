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
        <h1 className="mt-10 text-center text-4xl font-thin text-slate-500">Find your Weather location</h1>

        {/* <WeatherLocations /> */}
        <WeatherSearch />
        {/* <ButtonClient /> */}
      </div>
    </>
  );
}
