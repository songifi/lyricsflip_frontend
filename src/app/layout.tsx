"use client"
import Navbar, { MobileNav } from '@/components/molecules/navbar';
import { QueryClientProvider } from '@tanstack/react-query';
import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { queryClient } from '../lib/react-query';
import './globals.css';

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
