'use client';

import { LyricCard } from '@/components/organisms/LyricCard';
import React from 'react';
import SamplePage from './samplePage';
import Navbar from '@/components/molecules/navbar';

const Home = () => {
  return (
    <div className={`bg-background1 dark:bg-gray-900 `}>
      <Navbar />
      <main className="flex items-center justify-center h-screen mt-12">
        {/* Call Card */}
        <div className="bg-purplePrimary2 text-purplePrimary4 shadow-lg rounded-2xl p-xl w-3/4 md:w-1/2 text-center border-4 border-purplePrimary1">
          {/* Title */}
          <h1 className="text-lg3 font-bold text-tealPrimary1">
            Welcome to LyricsFlip 🎵😁
          </h1>
        </div>
      </main>
    </div>
  );
};

export default Home;
