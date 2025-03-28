'use client';
import { SongOptions } from '@/components/molecules/song-options';
import { StatisticsPanel } from '@/components/molecules/statistics-panel';
import { GameResultModal } from '@/components/organisms/GameResultModal';
import { LyricCard } from '@/components/organisms/LyricCard';
import { useSinglePlayer } from '@/features/game/hooks/useSinglePlayer';
import { formatTime } from '@/lib/utils';
import { useGameStore } from '@/store/game';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SinglePlayerGame() {
  const router = useRouter();
  const gameStore = useGameStore();
  const genre = gameStore.gameConfig.genre;
  const difficulty = gameStore.gameConfig.difficulty;

  const {
    currentLyric,
    isGameStarted,
    selectedOption,
    correctOption,
    handleSongSelect,
  } = useSinglePlayer(genre);

  const handleBack = () => {
    router.push('/');
  };

  // If game is not started, show a placeholder or redirect
  if (!isGameStarted || !currentLyric) {
    return (
      <div className="container mt-4 mx-auto h-fit w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
        <p>Please start a game from the Wager Modal</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-purple-500 text-white rounded"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mx-auto h-fit w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
      {/* Back button and header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Wager (Single Player)</h1>
        <p className="text-gray-600 text-sm">
          {`${genre} Genre | ${difficulty} Difficulty`}
        </p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lyric card - center column on desktop, full width on mobile */}
        <div className="lg:col-start-2 lg:col-span-1 order-1 lg:order-2">
          <LyricCard
            lyrics={[
              {
                text: currentLyric.text,
                title: currentLyric.title,
                artist: currentLyric.artist,
              },
            ]}
          />
        </div>

        {/* Statistics panel - right column */}
        <div className="lg:col-start-3 lg:col-span-1 order-2 lg:order-3">
          <StatisticsPanel
            timeLeft={formatTime(gameStore.timeLeft)}
            potWin={`${gameStore.potentialWin} STRK`}
            scores={`${gameStore.score} / ${gameStore.maxRounds}`}
          />
        </div>
      </div>

      {/* Song options */}
      <SongOptions
        options={currentLyric.options}
        onSelect={handleSongSelect}
        selectedOption={selectedOption}
        correctOption={correctOption}
      />
      <GameResultModal />
    </div>
  );
}
