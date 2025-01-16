'use server';

import '@/styles/globals.css';
import dynamic from 'next/dynamic';

const BodyComp = dynamic(() => import('@/components/BodyComp/BodyComp'), {
  ssr: false,
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ background: '#000' }}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/iOs-Icon.png" />
      </head>
      <body style={{ background: '#000' }}>
        <BodyComp>{children}</BodyComp>
      </body>
    </html>
  );
}
