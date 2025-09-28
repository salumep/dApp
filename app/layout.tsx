import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './_components/Header';
import Footer from './_components/Footer/Index';
import Providers from './providers';
import '@rainbow-me/rainbowkit/styles.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'dApp',
  description: "It's a DEX App",
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['nextjs', 'next14', 'pwa', 'next-pwa'],
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#fff' }],
  authors: [
    {
      name: 'dApp',
      url: '#',
    },
  ],
  viewport:
    'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover',
  icons: [
    { rel: 'apple-touch-icon', url: 'icons/Website-Fav-Icon-300x300.webp' },
    { rel: 'icon', url: 'icons/Website-Fav-Icon-300x300.webp' },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script id="test">{`globalThis.Browser = { T: () => {} };`}</Script>

      <body className={`${inter.className} bg-dark-background`}>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
