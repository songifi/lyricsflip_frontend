"use client";
import { useEffect } from "react";
import { useThemeStore } from "../store/useThemeStore";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { metadata } from "./metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { theme } = useThemeStore();

  useEffect(() => {
   
    const savedTheme = theme === "dark" ? "dark" : "light";
    localStorage.setItem("theme", savedTheme);
  }, [theme]);

  return (
    <html lang="en" className={theme === "dark" ? "dark" : "light"}>
      <head>
        <meta name="title" content={metadata.title} />
        <meta name="description" content={metadata.description} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
