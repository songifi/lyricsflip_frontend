"use client";
import { SongOptions } from '@/components/molecules/song-options';
import { StatisticsPanel } from '@/components/molecules/statistics-panel';
import GameResultPopup from '@/components/organisms/GameResultPopup';
import { LyricCard } from '@/components/organisms/LyricCard';
import { useSoloGame } from '@/features/game/hooks/useSoloGame';
import { useGameStore, startGameTimer } from '@/store/game';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/atoms/loading-spinner';

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
    gameResult,
    isCardFlipped,
    isLoading,
    error,
    score,
    currentRound,
    totalRounds,
    timeRemaining,
  } = useSoloGame(genre);



  const handleBack = () => {
    router.push('/');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mt-4 mx-auto h-fit w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner />
            <h2 className="text-xl font-bold mb-4 mt-4">Starting Quick Game...</h2>
            <p className="text-sm text-gray-500">Creating round and loading cards</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mt-4 mx-auto h-fit w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

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
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Quick Game</h1>
        <p className="text-gray-600 text-sm">
          {`${genre} Genre | ${difficulty} Difficulty | Round ${currentRound}/${totalRounds}`}
        </p>
      </div>

      {gameResult && (
        <GameResultPopup
          isWin={gameResult.won}
          isMultiplayer={false}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-start-2 lg:col-span-1 order-1 lg:order-2">
          <LyricCard
            lyrics={[
              {
                text: currentLyric.text,
                title: currentLyric.title,
                artist: currentLyric.artist,
              },
              {
                text: currentLyric.text,
                title: currentLyric.title,
                artist: currentLyric.artist,
              }
            ]}
            isFlipped={isCardFlipped}
          />
        </div>
        <div className="lg:col-start-3 lg:col-span-1 order-2 lg:order-3">
          <StatisticsPanel
            time={`${timeRemaining}`}
            potWin={`${gameStore.potentialWin} STRK`}
            scores={`${score} / ${totalRounds}`}
            multiplayer={false}
          />
        </div>
      </div>

      <SongOptions
        options={currentLyric.options}
        onSelect={handleSongSelect}
        selectedOption={selectedOption}
        isCorrect={selectedOption ? selectedOption.title === correctOption?.title : null}
      />
    </div>
  );
}