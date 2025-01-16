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
      <Home data-testid="home" />
    </>
  );
}
