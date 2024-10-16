'use client';

import { cn } from '@/lib/utils';
import { Inter as FontSans } from 'next/font/google';

import { weatherType } from '../TodaysWeather/weatherType';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});
export default function BodyComp({ children }: { children: React.ReactNode }) {
  const weatherNow = JSON.parse(localStorage.getItem('weatherNow') as string);

  // console.log(weatherNow);

  return (
    <div
      className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}
      style={{
        background: weatherNow
          ? `url(${weatherType(weatherNow.W)[2]})`
          : 'url(/_b4a7eda0-a610-4e40-bf9e-7b17fbafe334.jpeg)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
