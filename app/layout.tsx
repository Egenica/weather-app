import { cn } from '@/lib/utils';
import '@/styles/globals.css';
import { Inter as FontSans } from 'next/font/google';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}
        style={{
          background: 'url(/snow_coming_down_from_night_sky_with_stars.jpeg)',
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
