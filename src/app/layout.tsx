import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import localFont from 'next/font/local';
import Navbar, { MobileNav } from '@/components/molecules/navbar';
import { metadata } from "./metadata";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/react-query';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
const interV = localFont({
  src: '../fonts/inter-v.ttf',
  // display: 'swap',
  variable: '--font-interv',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${interV.variable} antialiased`}
      >
        <QueryClientProvider client={queryClient}>
        <Navbar />
          {children}
        <MobileNav />
        </QueryClientProvider>
      </body>
    </html>
  );
}
