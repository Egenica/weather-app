import { ButtonClient } from '@/components/ButtonClient/ButtonClient';

export const metadata = {
  title: 'Weather App',
};

export default function Page() {
  return (
    <>
      <h1>Weather App </h1>
      <div className="bg-blue-500 text-white p-4">This is a box</div>
      <ButtonClient />
      <h1>blah bl</h1>
    </>
  );
}
