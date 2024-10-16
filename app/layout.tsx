'use server';

import '@/styles/globals.css';
import dynamic from 'next/dynamic';

const BodyComp = dynamic(() => import('@/components/BodyComp/BodyComp'), {
  ssr: false,
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <BodyComp>{children}</BodyComp>
      </body>
    </html>
  );
}
