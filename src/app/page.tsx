"use client"
import { LyricCard } from "@/components/organisms/LyricCard";
import React from 'react';
import SamplePage from './samplePage';
import GameResultPopup from "@/components/organisms/GameResultPopup";
import { LyricCard } from '@/components/organisms/LyricCard';
import React from 'react';
import SamplePage from './samplePage';
import GameResultModal from '@/components/organisms/GameResultModal';
import GameResultPopup from '@/components/organisms/GameResultPopup';
import { useRouter } from "next/navigation";
import BadgeModal from '@/components/NewBadgeModal/newbadgemodal';

const Home = () => {
  const router = useRouter()

  const handleJoinRoom = () => {
    router.push("/multiplayer")
  }
  return (
    <>
      <main className="flex items-center justify-center h-screen bg-background1">
        {/* Call Card */}
        <div className="bg-purplePrimary2 text-purplePrimary4 shadow-lg rounded-2xl p-xl w-3/4 md:w-1/2 text-center border-4 border-purplePrimary1">
          {/* Title */}
          <h1 className="text-lg3 font-bold text-tealPrimary1">
            Welcome to LyricsFlip 🎵😁
          </h1>
          {/* <BadgeModal onClose={() => {}} /> */}
          {/* Subtitle */}
          <p className="text-lg text-greySecondary1 mt-lg">
            Discover and flip through your favorite lyrics with ease.
          </p>
<div className="pt-6">
  <button
    onClick={handleJoinRoom}
    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-lg"
  >
    Join Multiplayer Room
  </button>
</div>

{/* Colorful Text Section */}
<div className="mt-xl p-lg bg-purplePrimary3 rounded-lg">
  <p className="text-md text-purplePrimary1 italic mt-md">
    "All I know is that when I been shoot, I hit their own"
  </p>
</div>

{/* Additional Content */}
<div className="mt-xl">
  <h2 className="text-lg2 font-bold text-tealPrimary2">
    Why Choose LyricsFlip?
  </h2>
  <ul className="text-md text-greySecondary2 mt-md list-disc list-inside">
    <li className="mt-sm2">Explore thousands of lyrics</li>
    <li className="mt-sm2">Create and share your own flips</li>
    <li className="mt-sm2">Connect with music lovers worldwide</li>
  </ul>
</div>


          {/* Call-to-Action Button */}
          <button className="mt-2xl bg-tealPrimary1 text-whitePrimary1 px-2xl py-lg rounded-lg shadow-md hover:bg-tealPrimary2 transition transform hover:scale-105 text-lg2 font-bold">
            Get Started
          </button>

          {/* Additional Info */}
          <p className="text-sm2 text-greySecondary2 mt-xl">
            Join the fun and share your favorite lyrics! ♪♡
          </p>
        </div>
        <SamplePage />
      </main>
      <LyricCard
        lyrics={[
          {
            text: 'First song lyrics here',
            title: 'Song Title',
            artist: 'Artist Name',
          },
          {
            text: 'Second song lyrics here',
            title: 'Another Song',
            artist: 'Another Artist',
          },
        ]}
      />
    </>

    
  );
};

export default Home;
