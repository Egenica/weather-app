import { WeatherLocation } from '../server/weather.server';
import { Button } from '../ui/button';

type MiniNavProps = {
  location: WeatherLocation | null;
};

export const MiniNav = ({ location, ...props }: MiniNavProps) => {
  return (
    <>
      <nav {...props} className="flex flex-row items-center justify-between p-2 pl-3 pr-3">
        <Button variant={'link'} className="text-sm font-normal text-white opacity-50 hover:opacity-100">
          Change Location
        </Button>
        {location?.name && (
          <div className="mr-5">
            <span className="text-sm font-normal text-white opacity-50">
              <span className="hidden md:inline-flex">Your Selected </span>Location:
            </span>{' '}
            <span className="inline-flex text-sm font-normal text-white">
              {location?.name.length > 12 ? location?.name.slice(0, 10) + '...' : location?.name}
            </span>
          </div>
        )}
      </nav>
    </>
  );
};
