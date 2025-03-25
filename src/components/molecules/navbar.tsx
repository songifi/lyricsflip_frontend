'use client';

import Link from 'next/link';
import React from 'react';
import { Settings } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
// import { useThemeStore } from "../store/useThemeStore";
// useThemeStore

// Navigation items array
const navItems = [
  { href: '/', label: 'Home' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/profile', label: 'Profile' },
  { href: '/more', label: 'More' },
];
const mobileNavItems = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: '/wallet',
    label: 'Wallet',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    href: '/leaderboard',
    label: 'Leaderboard',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    href: '/more',
    label: 'More',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
  },
];
const Navbar = () => {
  const pathname = usePathname();

  return (
    <div>
      <header className="hidden md:flex max-w-[1440px] top-0 mx-auto px-20 py-7 fixed inset-x-0 justify-center items-center  bg-white border-b-[0.75px] border-[#DBE1E7]">
        <div className="flex-1 flex items-center">
          <div className="flex justify-center items-center  pr-5 border-r border-[#DBE1E7]">
            <Image
              src="/Logo.svg"
              alt="logo"
              width={126}
              height={42}
              priority
              className="object-cover"
            />
          </div>
          <nav className="ml-5 py-2">
            <ul className="flex gap-10">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`text-center font-interv text-base font-normal leading-6 transition-colors ${
                        isActive
                          ? 'text-[#9747FF]'
                          : 'text-[#909090] hover:text-[#9747FF]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex w-10 h-10 p-2 justify-center items-center aspect-square rounded border border-[#DBE2E8] bg-white cursor-pointer">
            <Settings className="h-5 w-5" />
          </div>

          <div className="flex py-2 px-3 justify-center items-center gap-3 rounded border border-[#DBE2E8] bg-white cursor-pointer">
            <div className="flex justify-center gap-2 ">
              <Image
                src="/layer1.svg"
                alt="logo"
                width={22}
                height={20}
                priority
                className="object-cover"
              />
              <span className="text-[#909090] font-interv text-[12px] font-normal leading-[20px]">
                0xg5600134d...55e1
              </span>
            </div>

            <Image
              src="/dropdown.svg"
              alt="logo"
              width={16}
              height={16}
              priority
              className="object-cover"
            />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex items-center justify-around border-t py-3">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center transition-colors ${
              isActive
                ? 'text-[#9747FF]'
                : 'text-[#909090] hover:text-[#9747FF]'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1 font-interv">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
