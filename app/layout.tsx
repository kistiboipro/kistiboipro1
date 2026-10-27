import type { Metadata } from 'next';
import { Inter, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'কিস্তিভাই | KistiBoi - Bismillah Electronics and Furniture',
  description: 'Bismillah Electronics and Furniture management dashboard powered by KistiBoi.',
  openGraph: {
    title: 'কিস্তিভাই | KistiBoi - Bismillah Electronics and Furniture',
    description: 'Bismillah Electronics and Furniture management dashboard powered by KistiBoi.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'কিস্তিভাই | KistiBoi - Bismillah Electronics and Furniture',
    description: 'Bismillah Electronics and Furniture management dashboard powered by KistiBoi.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansBengali.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
