import type { Metadata } from 'next';
import { Bricolage_Grotesque, Fraunces, JetBrains_Mono } from 'next/font/google';
import { Announcement } from '@/components/site/Announcement';
import { PromoBar } from '@/components/site/PromoBar';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { StructuredData } from '@/components/site/StructuredData';
import { FirstVisitPopup } from '@/components/site/FirstVisitPopup';
import './globals.css';

const sans = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-sans-family',
  display: 'swap',
});

const serif = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif-family',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-family',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AcrylixCo — Custom acrylic decor',
  description: 'Custom-made multi-layered acrylic pieces for life events. Designed in Sydney.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'AcrylixCo',
            url: 'https://acrylixco-production.up.railway.app',
            description:
              'Custom-made multi-layered acrylic pieces for life events. Designed in Sydney.',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Sydney',
              addressCountry: 'AU',
            },
          }}
        />
        <PromoBar />
        <Announcement />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <FirstVisitPopup />
      </body>
    </html>
  );
}
