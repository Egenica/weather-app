import { MiniNav } from '@/components/MiniNav/MiniNav';
import WeatherSearch from '@/components/WeatherSearch/WeatherSearch';

export const metadata = {
  title: 'Weather App',
  description: 'Dynamic Weather App',
};

export default function Page() {
  return (
    <>
      <MiniNav data-testid="mini-nav" />
      <div className="container">
        <h1 className="mb-10 mt-10 text-center text-4xl font-thin text-teal-600">Find your weather location</h1>
        <WeatherSearch data-testid="weather-search" />
      </div>
    </>
  );
}
