import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'ArtiSell — Buy & Sell Original Art', template: '%s | ArtiSell' },
  description: 'Discover, collect, and sell original artwork from independent artists worldwide.',
  keywords: ['art', 'buy art', 'sell art', 'original artwork', 'paintings', 'sculpture', 'photography'],
  openGraph: {
    type: 'website',
    siteName: 'ArtiSell',
    title: 'ArtiSell — Buy & Sell Original Art',
    description: 'Discover, collect, and sell original artwork from independent artists worldwide.',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased font-sans">
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
