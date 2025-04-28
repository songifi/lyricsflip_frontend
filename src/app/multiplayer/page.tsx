'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LyricCard } from '@/components/organisms/LyricCard';
import { StatisticsPanel } from '@/components/molecules/statistics-panel';
import { SongOptions } from '@/components/molecules/song-options';
import { useMultiplayerRoom, type Player } from '@/hooks/use-multiplayer-room';
import { useEffect, useState } from 'react';
import { useGameService } from "@/hooks/useGameService";
import { useDojo } from "@/lib/dojo/hooks/useDojo";
import { Round, RoundState } from "@/lib/dojo/types";
import { Button } from "@/components/atoms/button";
// Define the SongOption type
interface SongOption {
  title: string;
  artist: string;
}

export default function MultiplayerPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState<string>('Guest');
  const { systemCalls } = useDojo();
  const { joinRound, startRound, isLoading, error } = useGameService();
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [roundId, setRoundId] = useState<string>("");
  const [errorState, setError] = useState<string | null>(null);
  // In a real app, you would get the roomId from the URL or props
  const roomId = 'sample-room-id';

  // Get player name from localStorage on component mount
  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setPlayerName(storedName);
    }
  }, []);

  // Use our custom hook to manage the WebSocket connection and room state
  const { roomData, isConnected, selectSong, leaveRoom } =
    useMultiplayerRoom({
      roomId,
      playerName,
    });

  // Set loading state based on connection and data
  useEffect(() => {
    console.log('Connection status:', isConnected, 'Room data:', !!roomData);
    if (isConnected && roomData) {
      // Add a small delay to ensure UI updates properly
      const timer = setTimeout(() => {
        // Loading state is managed by useGameService
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isConnected, roomData]);

  // Handle back button click
  const handleBack = () => {
    leaveRoom();
    router.push('/');
  };

  // Handle song selection
  const handleSongSelect = (option: SongOption, index: number) => {
    selectSong(index);
  };

  const handleJoinRound = async () => {
    if (!systemCalls) {
      setError('System calls not initialized');
      return;
    }

    try {
      await systemCalls.joinRound(roundId);
      const round = await systemCalls.getRound(roundId);
      setCurrentRound(round);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join round');
    }
  };

  const handleStartRound = async () => {
    if (!systemCalls) {
      setError('System calls not initialized');
      return;
    }

    try {
      await systemCalls.startRound(roundId);
      const round = await systemCalls.getRound(roundId);
      setCurrentRound(round);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start round');
    }
  };

  // Show loading state while connecting or if no room data
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Connecting to game room...</h2>
          {errorState && <p className="text-red-500">{errorState}</p>}
          <p className="text-sm text-gray-500 mt-2">
            This may take a moment...
          </p>
        </div>
      </div>
    );
  }
  // Fallback data in case roomData is incomplete
  const fallbackLyric = {
    text: '"All I know is that when I dey cock, I hit and go\nAll I know is that when I been shoot, I hit their own"',
    title: 'Unknown Song',
    artist: 'Unknown Artist',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Multiplayer Game</h1>
      
      {!currentRound ? (
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <input
              type="text"
              value={roundId}
              onChange={(e) => setRoundId(e.target.value)}
              placeholder="Enter Round ID"
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <Button
            onClick={handleJoinRound}
            disabled={isLoading || !roundId}
            className="w-full"
          >
            Join Round
          </Button>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Current Round</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="mb-2">Creator: {currentRound.creator}</p>
            <p className="mb-2">Genre: {currentRound.genre}</p>
            <p className="mb-2">State: {currentRound.state}</p>
            <p className="mb-2">Players: {currentRound.players_count}</p>
            <p className="mb-2">Ready Players: {currentRound.ready_players_count}</p>
            <p className="mb-2">Wager: {currentRound.wager_amount}</p>
          </div>

          {currentRound.state === RoundState.Pending && (
            <Button
              onClick={handleStartRound}
              disabled={isLoading}
              className="w-full mt-4"
            >
              Start Round
            </Button>
          )}
        </div>
      )}

      {errorState && <p className="text-red-500 mt-4">{errorState}</p>}

      {/* Back button and header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-bold">
          {roomData?.name || 'Multiplayer Room'}
        </h1>
        <p className="text-gray-600 text-sm">{roomData?.description || ''}</p>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lyric card - center column on desktop, full width on mobile */}
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

        {/* Statistics panel - right column */}
        <div className="lg:col-start-3 lg:col-span-1 order-2 lg:order-3">
          <StatisticsPanel
            time={roomData?.timeLeft || '00:00'}
            potWin={roomData?.potWin || '0 STRK'}
            scores={`${roomData?.scores || 0}`}
          />
        </div>
      </div>

      {/* Song options */}
      {roomData?.songOptions && (
        <SongOptions
          options={roomData.songOptions}
          onSelect={handleSongSelect}
        />
      )}
    </div>
  );
}
