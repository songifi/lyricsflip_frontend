'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { useModalStore } from '@/store/modal-store';
import { Info } from 'lucide-react';
import { Modal } from './modal';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/game';
import { useSystemCalls, GameMode } from '@/lib/dojo/useSystemCalls';
import { useAccount } from '@starknet-react/core';

export function GameModal() {
  const { isOpen, closeModal, modalType } = useModalStore();
  const [genre, setGenre] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const isModalOpen = isOpen && modalType === 'game';
  const router = useRouter();
  const { startGame } = useGameStore();
  const { createRound } = useSystemCalls();
  const { account } = useAccount();

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!genre) errors.genre = 'Genre is required';
    if (!difficulty) errors.difficulty = 'Difficulty is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartGame = async () => {
    if (!validateForm()) return;
    if (!account?.address) {
      setFormErrors({ account: 'Please connect your wallet to start a game' });
      return;
    }

    setIsLoading(true);
    setFormErrors({});

    try {
      console.log('[GameModal] Starting solo game with params:', {
        genre,
        difficulty
      });

      // Create a solo round (no wager, no multiplayer)
      const roundId = await createRound(GameMode.Solo);
      
      console.log('[GameModal] Solo round created with ID:', roundId.toString());

      // Update game store with the game configuration
      startGame({
        genre,
        difficulty,
        duration: '5 mins', // Default duration
        odds: 3, // Default odds for quick game
        wagerAmount: 0, // No wager for quick game
      }, roundId);

      closeModal();
      router.push('/single-player');
      
    } catch (error) {
      console.error('[GameModal] Failed to create solo round:', error);
      setFormErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to start game. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Quick Game"
      description="Start a solo game to test your music knowledge!"
      primaryActionLabel={isLoading ? "Starting..." : "Start Game"}
      onPrimaryAction={handleStartGame}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <label htmlFor="genre" className="text-sm font-medium">
            Genre
          </label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className={formErrors.genre ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pop">Pop</SelectItem>
              <SelectItem value="rock">Rock</SelectItem>
              <SelectItem value="hiphop">Hip Hop</SelectItem>
              <SelectItem value="rnb">R&B</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.genre && (
            <p className="text-red-500 text-xs">{formErrors.genre}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label htmlFor="difficulty" className="text-sm font-medium">
            Difficulty Level
          </label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className={formErrors.difficulty ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.difficulty && (
            <p className="text-red-500 text-xs">{formErrors.difficulty}</p>
          )}
        </div>



        {formErrors.account && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {formErrors.account}
          </div>
        )}

        {formErrors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {formErrors.submit}
          </div>
        )}

        <div className="bg-purple-50 p-4 rounded-lg flex gap-3">
          <div className="bg-purple-100 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0">
            <Info className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-sm">
            <h4 className="font-medium text-purple-700 mb-1">INSTRUCTION</h4>
            <p className="text-gray-700">
              A card displaying a lyric from a song will appear along with a list of possible answers. Your goal is to
              select the correct answer as quickly as possible.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
