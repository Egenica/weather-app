'use server';

import '@/styles/globals.css';
import dynamic from 'next/dynamic';

const BodyComp = dynamic(() => import('@/components/BodyComp/BodyComp'), {
  ssr: false,
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/iOs-Icon.png" />
      </head>
      <body>
        <BodyComp>{children}</BodyComp>
      </body>
    </html>
  );
}
