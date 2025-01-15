import Home from './pages/Home/Home';

// import { MiniNav } from '@/components/MiniNav/MiniNav';
// import WeatherSearch from '@/components/WeatherSearch/WeatherSearch';

export const metadata = {
  title: '5 Day forcast - Weather App',
  description: 'Dynamic Weather App',
};

export default function Page() {
  return (
    <>
      {/* <MiniNav data-testid="mini-nav" location={location} />
      <div className="container">
        <h1 className="mb-10 mt-10 text-center text-4xl font-thin text-teal-600">Find your weather location</h1>
        <WeatherSearch data-testid="weather-search" setLocation={setLocation} />
      </div> */}
      <Home data-testid="home" />
    </>
  );
}
