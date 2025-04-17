"use client";
import { useState } from 'react';
import Image from 'next/image';

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
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div
        className={`relative aspect-[3/4] w-full transition-transform duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ perspective: '1000px' }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 backface-hidden ${
            isFlipped ? 'hidden' : ''
          }`}
        >
          <div className="relative h-full w-full">
            <Image
              src="/card-front.png"
              alt="Card front"
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0"
              style={noiseOverlayStyle}
            />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="text-lg font-medium text-center text-white">
                {currentLyric.text}
              </p>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={`absolute inset-0 backface-hidden ${
            isFlipped ? '' : 'hidden'
          }`}
        >
          <div className="relative h-full w-full">
            <Image
              src="/card-back.png"
              alt="Card back"
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0"
              style={noiseOverlayStyle}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <h3 className="text-xl font-bold text-center text-white mb-2">
                {currentLyric.title}
              </h3>
              <p className="text-lg text-center text-white">
                {currentLyric.artist}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};