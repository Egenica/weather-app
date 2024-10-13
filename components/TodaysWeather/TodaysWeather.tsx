import { WeatherReportNow } from 'app/types/types';
import { WiRainMix, WiStrongWind, WiWindy } from 'weather-icons-react';

import { weatherType } from '../TodaysWeather/weatherType';
import { WindDirection } from '../WeatherDirection/WeatherDirection';

export const TodaysWeather = ({ weatherNow }: { weatherNow: WeatherReportNow | null }) => {
  return (
    <div className="flex flex-col items-center justify-center ">
      <span className="rounded-t bg-white px-2 text-xs font-light text-black">Now at a glance</span>
      <div className="flex items-center justify-center rounded border border-solid border-white bg-white bg-opacity-10 align-top backdrop-blur-xl">
        <div className="relative top-[-0.5rem] flex">
          <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
            {weatherType(weatherNow?.W as string)[1]({ size: 60, color: '#fff' })}
            <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
              {weatherType(weatherNow?.W as string)[0]}
            </span>
          </div>
          <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
            <span className="items-center p-4 pl-10 text-center text-4xl font-light text-white">
              {weatherNow?.F}
              <span>°</span>
            </span>

            <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
              Feels Like
            </span>
          </div>
          <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
            <WiRainMix size={60} color="#fff" />
            <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-xs font-light text-black">
              {weatherNow?.Pp}% Rain
            </span>
          </div>
          <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
            <WiWindy size={80} color="#fff" />
            <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-center text-xs font-light text-black">
              Wind {weatherNow?.S}mph
            </span>
          </div>
          <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
            <WiStrongWind size={80} color="#fff" />
            <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-center text-xs font-light text-black">
              Gust {weatherNow?.G}mph
            </span>
          </div>
          <div className="relative flex aspect-square min-w-[120px] flex-col items-center justify-center p-2 pt-0">
            <WindDirection direction={weatherNow?.D} size={80} />
            <span className="absolute bottom-3 mt-1 rounded bg-white px-2 text-center text-xs font-light text-black">
              Dirction {weatherNow?.D}
            </span>
          </div>
          {/* {Number(weatherNow?.Pp) >= 51 && Number(weatherNow?.Pp) < 100 && (
          <WiNightAltRainWind size={100} color="#fff" />
        )} */}
        </div>
      </div>
    </div>
  );
};
