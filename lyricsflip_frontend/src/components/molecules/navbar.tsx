'use client';

import Link from 'next/link';
import React from 'react';
import { Settings } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiHome, FiCreditCard, FiGrid } from 'react-icons/fi';
import { IoTrophyOutline } from 'react-icons/io5';

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
    icon: <FiHome className="h-6 w-6" />,
  },
  {
    href: '/wallet',
    label: 'Wallet',
    icon: <FiCreditCard className="h-6 w-6" />,
  },
  {
    href: '/leaderboard',
    label: 'Leaderboard',
    icon: <IoTrophyOutline className="h-6 w-6" />,
  },
  {
    href: '/more',
    label: 'More',
    icon: <FiGrid className="h-6 w-6" />,
  },
];
const Navbar = () => {
  const pathname = usePathname();

  return (
    <div>
      <header className="hidden md:flex max-w-[1440px] top-0 mx-auto px-20 py-7 fixed inset-x-0 justify-center items-center  bg-white border-b-[0.75px] border-whiteSecondary2 ">
        <div className="flex-1 flex items-center">
          <div className="flex justify-center items-center  pr-5 border-r border-whiteSecondary2 ">
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
            <ul className=" gap-10 md:hidden lg:flex">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`text-center font-interv text-base font-normal leading-6 transition-colors ${
                        isActive
                          ? 'text-purplePrimary5 '
                          : 'text-gray hover:text-purplePrimary5 '
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
    <nav className="md:hidden flex items-center justify-around border-t py-3 fixed bottom-0 z-12 inset-x-0 bg-white">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center transition-colors ${
              isActive
                ? 'text-purplePrimary5 '
                : 'text-[#909090] hover:text-purplePrimary5 '
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
