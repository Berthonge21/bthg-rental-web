import type { Metadata } from 'next';
import { Bebas_Neue, Outfit } from 'next/font/google';
import { Providers } from './providers';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'BTHG Rental Car',
  description: 'Modern car rental management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable} ${outfit.variable}`} style={{ fontFamily: 'var(--font-body), sans-serif' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
