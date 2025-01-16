'use client';

import { cn } from '@/lib/utils';
import { Inter as FontSans } from 'next/font/google';
import PullToRefresh from 'react-pull-to-refresh';

import { weatherType } from '../TodaysWeather/weatherType';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function BodyComp({ children }: { children: React.ReactNode }) {
  const handleRefresh = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        window.location.reload(); // Refresh the page
        resolve();
      }, 500);
    });
  };
  const weatherNow = JSON.parse(localStorage.getItem('weatherNow') as string);

  // console.log(weatherNow);

  return (
    <PullToRefresh onRefresh={handleRefresh} style={{ height: '100vh', overflow: 'auto' }}>
      <div
        className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}
        style={{
          background: weatherNow
            ? `url(${weatherType(weatherNow.W)[2]})`
            : 'url(/_fcf1d22e-7641-4978-ba2a-02aa3218c2ab.jpeg)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" />
        <div className="relative z-10">{children}</div>
      </div>
    </PullToRefresh>
  );
}
