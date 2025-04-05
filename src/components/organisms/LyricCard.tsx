"use client";
import { useState } from 'react';

interface Lyric {
  text: string;
  title: string;
  artist: string;
}

export const LyricCard = ({
  lyrics,
  isFlipped, // Controlled by parent
}: {
  lyrics: Lyric[];
  isFlipped: boolean;
}) => {
  const currentLyric = lyrics[0];

  const noiseOverlayStyle = {
    backgroundImage: "url('/Noise.png')",
    backgroundSize: 'cover',
    backgroundBlendMode: 'overlay',
    opacity: 0.4,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  };

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 2,
  };

  return (
    <div className="perspective-1000 w-full max-w-[24rem] mx-auto h-[500px]">
      <div
        className={`relative w-full h-full transition-transform duration-300 transform-style-3d ${isFlipped ? '' : 'rotate-y-180'}`}
      >
        {/* Front of Card (Shape Only) - Visible when not flipped */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#F5F5F5] rounded-4xl">
          <div className="absolute inset-0 rounded-4xl border border-[#DBE2E7] p-4">
            <div className="bg-white rounded-3xl shadow-md overflow-hidden h-full">
              <div className="rounded-xl overflow-hidden h-full flex flex-col relative">
                <div className="bg-purplePrimary3 p-lg flex-1 flex flex-col relative">
                  <div style={contentStyle} className="flex-1 flex flex-col">
                    <div className="flex-grow flex items-center justify-center">
                      <img src="/Frame.png" alt="" className="w-48 h-48" />
                    </div>
                    <p className="text-center text-sm2 pb-2 font-medium text-tealPrimary2">
                      Lyrics hidden
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card (Lyrics) - Visible when flipped */}
        <div className="absolute w-full h-full backface-hidden bg-[#F5F5F5] rounded-4xl">
          <div className="absolute inset-0 rounded-4xl border border-[#DBE2E7] p-4">
            <div className="bg-white rounded-3xl shadow-md overflow-hidden h-full">
              <div className="rounded-xl overflow-hidden h-full flex flex-col relative">
                <div className="bg-tealPrimary1 p-lg flex-1 flex flex-col relative">
                  <div style={contentStyle} className="flex-1 flex flex-col">
                    <div className="absolute top-0 right-0 bg-white rounded-full p-2 w-8 h-8 flex items-center justify-center z-10">
                      <img src="/rot.png" alt="" />
                    </div>
                    <div className="self-center mt-6 mb-4">
                      <img src="/Frame.png" alt="" className="w-20 h-20" />
                    </div>
                    <p className="text-purpleSecondary1 text-center text-md font-medium mb-8 flex-grow flex items-center justify-center whitespace-pre-line">
                      {currentLyric.text}
                    </p>
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