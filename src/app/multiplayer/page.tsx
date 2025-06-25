'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LyricCard } from '@/components/organisms/LyricCard';
import { StatisticsPanel } from '@/components/molecules/statistics-panel';
import { SongOptions } from '@/components/molecules/song-options';
import { useEffect, useState } from 'react';
import { useModalStore } from '@/store/modal-store';
import WaitingForOpponent from '@/components/organisms/waiting-for-opponent';
import { useMultiplayerGame } from '@/lib/dojo/hooks/useMultiplayerGame';
import { useGameplaySubscriptions } from '@/lib/dojo/hooks/useGameplaySubscriptions';
import { Answer } from '@/lib/dojo/useSystemCalls';
import LoadingSpinner from '@/components/atoms/loading-spinner';

// Define the SongOption type
interface SongOption {
  title: string;
  artist: string;
}

export default function MultiplayerPage() {
  const router = useRouter();
  const { modalPayload } = useModalStore();
  
  // Get round ID from modal payload or URL params
  const roundId = modalPayload?.roundId ? BigInt(modalPayload.roundId) : null;
  
  // Use contract-based multiplayer game instead of mock
  const {
    gamePhase,
    currentCard,
    timeRemaining,
    round,
    playersCount,
    getNextCard,
    submitAnswer,
    canAnswer,
    myScore,
    correctAnswers,
    totalAnswers,
    isLoading,
    error
  } = useMultiplayerGame(roundId!);

  // Set up real-time subscriptions
  const { subscribeToGameplay, unsubscribeFromGameplay, isSubscribed } = useGameplaySubscriptions();

  // Local state for UI
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [lastAnswerResult, setLastAnswerResult] = useState<{ isCorrect: boolean; option: number } | null>(null);

  // Validate round ID
  useEffect(() => {
    if (!roundId) {
      console.error('No round ID provided, redirecting to home');
      router.push('/');
      return;
    }
  }, [roundId, router]);

  // Set up subscriptions when component mounts
  useEffect(() => {
    if (roundId) {
      subscribeToGameplay(roundId, {
        onRoundStateChange: (roundData) => {
          console.log('[MultiplayerPage] Round state changed:', roundData);
          // The useMultiplayerGame hook will handle state updates automatically
        }
      });

      return () => {
        unsubscribeFromGameplay();
      };
    }
  }, [roundId, subscribeToGameplay, unsubscribeFromGameplay]);

  // Auto-start game when round state changes to IN_PROGRESS
  useEffect(() => {
    if (round?.state === 1 && gamePhase === 'starting') {
      console.log('[MultiplayerPage] Round started, getting first card...');
      getNextCard();
    }
  }, [round?.state, gamePhase, getNextCard]);

  // Handle back button
  const handleBack = () => {
    unsubscribeFromGameplay();
    router.push('/');
  };

  // Handle song selection
  const handleSongSelect = async (option: SongOption, index: number) => {
    if (!canAnswer || selectedOption !== null) {
      console.log('[MultiplayerPage] Cannot answer at this time');
      return;
    }

    console.log('[MultiplayerPage] Selected option:', { option, index });
    setSelectedOption(index);

    try {
      await submitAnswer(index as Answer);
      
      // Show result feedback
      // Note: The actual correctness will be determined by the contract
      // For now, we'll just show that an answer was submitted
      setLastAnswerResult({ isCorrect: false, option: index }); // Will be updated by contract response
      
      // Reset selection after delay
      setTimeout(() => {
        setSelectedOption(null);
        setLastAnswerResult(null);
      }, 3000);
      
    } catch (err) {
      console.error('[MultiplayerPage] Failed to submit answer:', err);
      setSelectedOption(null);
    }
  };

  // Handle loading state
  if (!roundId) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">No round ID provided</h2>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <h2 className="text-xl font-bold mb-4 mt-4">Loading game...</h2>
          <p className="text-sm text-gray-500 mt-2">Connecting to round {roundId.toString()}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Error</h2>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'waiting' || round?.state === 0) {
    return <WaitingForOpponent onStart={() => {
      console.log('[MultiplayerPage] Game started from waiting screen');
      // The useMultiplayerGame hook will handle the transition automatically
    }} />;
  }

  if (gamePhase === 'completed') {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Game Completed!</h2>
          <p className="text-lg mb-2">Final Score: {myScore}</p>
          <p className="text-sm text-gray-600 mb-4">
            Correct Answers: {correctAnswers} / {totalAnswers}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Extract options from the current card
  const songOptions: SongOption[] = currentCard ? [
    { title: `Option 1`, artist: 'Artist 1' },
    { title: `Option 2`, artist: 'Artist 2' },
    { title: `Option 3`, artist: 'Artist 3' },
    { title: `Option 4`, artist: 'Artist 4' },
  ] : [];

  // Render actual gameplay UI
  return (
    <div className="container mt-4 mx-auto h-fit w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
      <div className="mb-6">
        <button onClick={handleBack} className="flex items-center text-gray-600 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Multiplayer Game</h1>
        <p className="text-gray-600 text-sm">
          Round ID: {roundId.toString()} | Players: {playersCount} | Score: {myScore}
        </p>
        {!isSubscribed && (
          <p className="text-yellow-600 text-sm">⚠️ Not connected to real-time updates</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-start-2 lg:col-span-1 order-1 lg:order-2">
          {currentCard ? (
            <LyricCard
              lyrics={[{
                text: currentCard.lyric,
                title: "Guess the Song",
                artist: "Multiple Choice",
              }]}
              isFlipped={false}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <div className="text-center">
                {gamePhase === 'loading_card' ? (
                  <>
                    <LoadingSpinner />
                    <p className="mt-2">Loading next card...</p>
                  </>
                ) : (
                  <p>Waiting for next card...</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-start-3 lg:col-span-1 order-2 lg:order-3">
          <StatisticsPanel
            time={`${timeRemaining}s`}
            potWin={`Score: ${myScore}`}
            scores={`${correctAnswers}/${totalAnswers} correct`}
            multiplayer={true}
          />
          
          {gamePhase === 'card_results' && lastAnswerResult && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium">Answer submitted!</p>
              <p className="text-xs text-gray-600">Waiting for results...</p>
            </div>
          )}
        </div>
      </div>

      {currentCard && songOptions.length > 0 && (
        <SongOptions
          options={songOptions}
          onSelect={handleSongSelect}
          selectedOption={selectedOption !== null ? songOptions[selectedOption] : null}
          correctOption={null} // Will be revealed after answer submission
        />
      )}

      {!canAnswer && gamePhase === 'card_active' && (
        <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200 text-center">
          <p className="text-sm text-gray-600">Answer submitted. Waiting for next card...</p>
        </div>
      )}
    </div>
  );
}
