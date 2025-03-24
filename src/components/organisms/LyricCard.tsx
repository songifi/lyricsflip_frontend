'use client';

import { useState, useEffect } from 'react';

export const LyricCard = ({
  lyrics,
}: {
  lyrics: { text: string; title: string; artist: string }[];
}) => {
  // Start with the shape-only side (isFlipped = true)
  const [isFlipped, setIsFlipped] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use lyrics from props instead of hardcoded values
  const currentLyric =
    lyrics && lyrics.length > 0
      ? lyrics[currentIndex]
      : {
          text: '"All I know is that when I dey cock, I hit and go\nAll I know is that when I been shoot, I hit their own"',
          title: 'Sungba Remix',
          artist: 'Asake ft. Burna Boy',
        };

  // Toggle flip state on card click
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Auto flip back after 10 seconds if showing the lyrics side
  useEffect(() => {
    let flipBackTimer: NodeJS.Timeout | undefined;

    // If showing lyrics (not flipped), set timer to go back to shape
    if (!isFlipped) {
      flipBackTimer = setTimeout(() => {
        setIsFlipped(true);
      }, 10000); // 10 seconds
    }

    return () => {
      if (flipBackTimer) clearTimeout(flipBackTimer);
    };
  }, [isFlipped]);

  // CSS for the noise overlay 
  const noiseOverlayStyle = {
    backgroundImage: "url('/Noise.png')",
    backgroundSize: 'cover',
    backgroundBlendMode: 'overlay',
    opacity: 0.4,
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  };

  // Content style to ensure it's above the overlay
  const contentStyle = {
    position: 'relative' as 'relative',
    zIndex: 2,
  };

  return (
    // Container with perspective
    <div className="perspective-1000 w-full max-w-[24rem] mx-auto h-[500px]">
      {/* Flipping container - includes both card and border */}
      <div
        onClick={handleFlip}
        className={`relative w-full h-full transition-transform duration-300 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of Card (Shape Only) - This will be visible after rotation */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#F5F5F5] rounded-4xl">
          {/* Border that flips with the card */}
          <div className="absolute inset-0 rounded-4xl border border-[#DBE2E7] p-4">
            {/* Card content */}
            <div className="bg-white rounded-3xl shadow-md overflow-hidden h-full">
              <div className="rounded-xl overflow-hidden h-full flex flex-col relative">
                <div className="bg-purplePrimary3 p-lg flex-1 flex flex-col relative">
                  
                  {/* Content container */}
                  <div style={contentStyle} className="flex-1 flex flex-col">
                    {/* Large Centered Teal geometric shape */}
                    <div className="flex-grow flex items-center justify-center">
                      <img src="/Frame.png" alt="" className="w-48 h-48" />
                    </div>

                    {/* Footer */}
                    <p className="text-center text-sm2 pb-2 font-medium text-tealPrimary2">
                      Tap to reveal lyrics!✨
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card (Lyrics) - This will be visible initially */}
        <div className="absolute w-full h-full backface-hidden bg-[#F5F5F5] rounded-4xl">
          {/* Border that flips with the card */}
          <div className="absolute inset-0 rounded-4xl border border-[#DBE2E7] p-4">
            {/* Card content */}
            <div className="bg-white rounded-3xl shadow-md overflow-hidden h-full">
              <div className="rounded-xl overflow-hidden h-full flex flex-col relative">
                <div className="bg-tealPrimary1 p-lg flex-1 flex flex-col relative">
                  
                  {/* Content container */}
                  <div style={contentStyle} className="flex-1 flex flex-col">
                    {/* Top right icon */}
                    <div className="absolute top-0 right-0 bg-white rounded-full p-2 w-8 h-8 flex items-center justify-center z-10">
                      <img src="/rot.png" alt="" />
                    </div>

                    {/* Small Purple geometric shape */}
                    <div className="self-center mt-6 mb-4">
                      <img src="/Frame.png" alt="" className="w-20 h-20" />
                    </div>

                    {/* Lyric text */}
                    <p className="text-purpleSecondary1 text-center text-md font-medium mb-8 flex-grow flex items-center justify-center whitespace-pre-line">
                      {currentLyric.text}
                    </p>

                    {/* Footer */}
                    <p className="text-center text-sm2 pb-2 font-medium text-purplePrimary1">
                      LyricFlip...join the fun🎶🩵
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
