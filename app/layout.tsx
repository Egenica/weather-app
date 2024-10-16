'use client';

import { weatherType } from '@/components/TodaysWeather/weatherType';
import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import { Inter as FontSans } from 'next/font/google';

// import { useEffect } from 'react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const weatherNow = JSON.parse(localStorage.getItem('weatherNow') as string);

  console.log(weatherNow);

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
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
      </body>
    </html>
  );
}
