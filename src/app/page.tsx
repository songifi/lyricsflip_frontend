import GameResultPopup from '@/components/GameResultPopup';
import React from 'react';

const Home = () => {
  return (
    <>
    
    <main className="flex items-center justify-center h-screen bg-background1">
      {/* Call Card */}
      <div className="bg-purplePrimary2 text-purplePrimary4 shadow-lg rounded-2xl p-xl w-3/4 md:w-1/2 text-center border-4 border-purplePrimary1">
        {/* Title */}
        <h1 className="text-lg3 font-bold text-tealPrimary1">
          Welcome to LyricsFlip 🎵😁
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-greySecondary1 mt-lg">
          Discover and flip through your favorite lyrics with ease.
        </p>

        {/* Colorful Text Section */}
        <div className="mt-xl p-lg bg-purplePrimary3 rounded-lg">
         
          <p className="text-md text-purplePrimary1 italic mt-md">
            “All I know is that when I been shoot, I hit their own”
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
    </main>
      <GameResultPopup isWin={false} isMultiplayer={true}/>
    </>
  );
};

export default Home;