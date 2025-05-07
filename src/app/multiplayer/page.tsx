'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LyricCard } from '@/components/organisms/LyricCard';
import { StatisticsPanel } from '@/components/molecules/statistics-panel';
import { SongOptions } from '@/components/molecules/song-options';
import { useMultiplayerRoom, type Player } from '@/hooks/use-multiplayer-room';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/game';
import WaitingForOpponent from '@/components/organisms/waiting-for-opponent';

// Define the SongOption type
interface SongOption {
  title: string;
  artist: string;
}

export default function MultiplayerPage() {
  const router = useRouter();
  const gameStore = useGameStore();
  const [playerName, setPlayerName] = useState<string>('Guest');
  const [isLoading, setIsLoading] = useState(true);
  const [showWaiting, setShowWaiting] = useState(true);
  const roomId = 'sample-room-id'; // In production this would come from URL or state

  // Check if game is properly initialized
  useEffect(() => {
    if (!gameStore.gameConfig.genre || !gameStore.gameConfig.difficulty) {
      router.push('/');
      return;
    }
  }, [gameStore.gameConfig, router]);

  // Get player name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  // Use multiplayer room hook
  const { roomData, isConnected, error, selectSong, leaveRoom } = useMultiplayerRoom({
    roomId,
    playerName,
  });

  // Handle loading state
  useEffect(() => {
    if (isConnected && roomData) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, roomData]);

  // Hide waiting screen when enough players join
  useEffect(() => {
    if (roomData?.players && roomData.players.length >= 2) { // Fixed type safety
      setShowWaiting(false);
    }
  }, [roomData?.players]);

  // Handle back button
  const handleBack = () => {
    leaveRoom();
    router.push('/');
  };

  // Handle song selection
  const handleSongSelect = (option: SongOption, index: number) => {
    selectSong(index);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Connecting to game room...</h2>
          {error && <p className="text-red-500">{error}</p>}
          <p className="text-sm text-gray-500 mt-2">Please wait while we connect you to the game...</p>
        </div>
      </div>
    );
  }

  if (showWaiting) {
    return <WaitingForOpponent onStart={() => setShowWaiting(false)} />;
  }

  const fallbackLyric = {
    text: "Waiting for game to start...",
    title: "Game Starting Soon",
    artist: "Please wait",
  };

  return (
    <div className="container mt-4 mx-auto h-fit w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
      <div className="mb-6">
        <button onClick={handleBack} className="flex items-center text-gray-600 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Wager (Multi Player)</h1>
        <p className="text-gray-600 text-sm">
          {`${gameStore.gameConfig.genre} Genre | ${gameStore.gameConfig.difficulty} Difficulty`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-start-2 lg:col-span-1 order-1 lg:order-2">
          <LyricCard
            lyrics={[
              {
                text: roomData?.currentLyric?.text || fallbackLyric.text,
                title: roomData?.currentLyric?.title || fallbackLyric.title,
                artist: roomData?.currentLyric?.artist || fallbackLyric.artist,
              },
            ]}
            isFlipped={false}
          />
        </div>

        <div className="lg:col-start-3 lg:col-span-1 order-2 lg:order-3">
          <StatisticsPanel
            time={roomData?.timeLeft || '00:00'}
            potWin={roomData?.potWin || `${gameStore.potentialWin} STRK`}
            scores={`${roomData?.scores || 0}`}
            multiplayer={true}
          />
        </div>
      </div>

      {roomData?.songOptions && (
        <SongOptions
          options={roomData.songOptions}
          onSelect={handleSongSelect}
          selectedOption={null}
          correctOption={null}
        />
      )}
    </div>
  );
}
