import BodyComp from '@/components/BodyComp/BodyComp';
import '@/styles/globals.css';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning style={{ background: '#000' }}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/iOs-Icon.png" />
      </head>
      <body style={{ background: '#000' }}>
        <BodyComp>{children}</BodyComp>
      </body>
    </html>
  );
}
