'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { useModalStore } from '@/store/modal-store';
import { useEffect, useState } from 'react';
import { Input } from '../atoms/input';
import { Modal } from './modal';
import { WagerSummaryContent } from './WagerSummaryModal';
import { WagerDetails } from '@/store';
import { useGameStore } from '@/store/game';
import { useRouter } from 'next/navigation';
import useSoloGameWithDojo from '@/features/game/hooks/useSoloGameWithDojo';
import { toast } from 'sonner';

export function WagerModal() {
  const router = useRouter();
  const { isOpen, closeModal, modalType } = useModalStore();
  const [stage, setStage] = useState<'form' | 'summary'>('form');
  const [isCreatingRound, setIsCreatingRound] = useState(false);
  const [roundCreationError, setRoundCreationError] = useState<string | null>(
    null,
  );

  const [wagerDetails, setWagerDetails] = useState<WagerDetails>({
    genre: '',
    difficulty: '',
    duration: '',
    odds: '',
    wagerAmount: '',
    potentialWin: '',
  });

  const isModalOpen =
    isOpen && (modalType === 'single-wager' || modalType === 'multi-wager');
  const isMultiplayer = modalType === 'multi-wager';
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const startGame = useGameStore((state) => state.startGame);
  const { handleCreateRound } = useSoloGameWithDojo();

  // Reset stage and form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStage('form');
      setWagerDetails({
        genre: '',
        difficulty: '',
        duration: '',
        odds: '',
        wagerAmount: '',
        potentialWin: '',
      });
      setFormErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    const oddsValue = parseFloat(wagerDetails.odds);
    const wagerValue = parseFloat(wagerDetails.wagerAmount);

    if (!isNaN(oddsValue) && !isNaN(wagerValue)) {
      const calculatedWin = wagerValue * oddsValue;
      setWagerDetails((prev) => ({
        ...prev,
        potentialWin: `${isNaN(calculatedWin) ? 0 : calculatedWin} STRK`,
      }));
    }
  }, [wagerDetails.odds, wagerDetails.wagerAmount]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!wagerDetails.genre) errors.genre = 'Genre is required';
    if (!wagerDetails.difficulty) errors.difficulty = 'Difficulty is required';
    if (!wagerDetails.duration) errors.duration = 'Duration is required';
    if (!wagerDetails.odds) errors.odds = 'Odds are required';
    if (!wagerDetails.wagerAmount)
      errors.wagerAmount = 'Wager amount is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToSummary = () => {
    if (validateForm()) {
      setStage('summary');
      setFormErrors({});
    }
  };

  const handleStartGame = async () => {
    let roundId: number | null = null;
    const isSinglePlayer = modalType === 'single-wager' && !isMultiplayer;

    setIsCreatingRound(true);
    setRoundCreationError(null); // Clear previous errors

    try {
      if (isSinglePlayer) {
        try {
          const createdRound = await handleCreateRound();
          roundId = Number(createdRound);
          console.log(roundId, "round id")
          if (!roundId) throw new Error('Invalid round ID returned');
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : 'Failed to create round';
          console.error('Error creating round:', err);
          setRoundCreationError(errorMsg);
          toast.error('Failed to create round', { description: errorMsg });
          return;
        }
      }

      const { genre, difficulty, duration, odds, wagerAmount } = wagerDetails;

      startGame({
        genre,
        difficulty,
        duration,
        odds: parseFloat(odds),
        wagerAmount: parseFloat(wagerAmount),
        isMultiplayer,
      });

      closeModal();

      const route = isSinglePlayer
        ? `/single-player?round=${roundId}`
        : '/multiplayer';
      router.push(route);

      // Reset form
      setWagerDetails({
        genre: '',
        difficulty: '',
        duration: '',
        odds: '',
        wagerAmount: '',
        potentialWin: '',
      });
      setStage('form');
    } finally {
      setIsCreatingRound(false);
    }
  };

  const renderWagerForm = () => (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label htmlFor="genre" className="text-sm font-medium">
          Genre
        </label>
        <Select
          value={wagerDetails.genre}
          onValueChange={(value) =>
            setWagerDetails((prev) => ({ ...prev, genre: value }))
          }
        >
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
        <Select
          value={wagerDetails.difficulty}
          onValueChange={(value) =>
            setWagerDetails((prev) => ({ ...prev, difficulty: value }))
          }
        >
          <SelectTrigger
            className={formErrors.difficulty ? 'border-red-500' : ''}
          >
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

      <div className="grid gap-2">
        <label htmlFor="duration" className="text-sm font-medium">
          Duration
        </label>
        <Select
          value={wagerDetails.duration}
          onValueChange={(value) =>
            setWagerDetails((prev) => ({ ...prev, duration: value }))
          }
        >
          <SelectTrigger
            className={formErrors.duration ? 'border-red-500' : ''}
          >
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5 mins">5 minutes</SelectItem>
            <SelectItem value="10 mins">10 minutes</SelectItem>
            <SelectItem value="15 mins">15 minutes</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.duration && (
          <p className="text-red-500 text-xs">{formErrors.duration}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="odds" className="text-sm font-medium">
          Odds
        </label>
        <Select
          value={wagerDetails.odds}
          onValueChange={(value) =>
            setWagerDetails((prev) => ({ ...prev, odds: value }))
          }
        >
          <SelectTrigger className={formErrors.odds ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select odds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 odds</SelectItem>
            <SelectItem value="10">10 odds</SelectItem>
            <SelectItem value="15">15 odds</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.odds && (
          <p className="text-red-500 text-xs">{formErrors.odds}</p>
        )}
      </div>

      <div className="bg-[#F0F0F0] p-4 rounded-lg flex flex-col gap-3">
        <p className="text-xs font-medium">
          Wallet Balance:{' '}
          <span className="text-[#9747FF]">18,678 STRK (5,678 USD)</span>
        </p>
        <div className="text-sm flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="your-wager">
            Your Wager
          </label>
          <div className="flex bg-white focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50 p-3 rounded-[4px]">
            <Input
              type="number"
              name="your-wager"
              id="your-wager"
              value={wagerDetails.wagerAmount}
              onChange={(e) =>
                setWagerDetails((prev) => ({
                  ...prev,
                  wagerAmount: e.target.value,
                }))
              }
              className={`border-none shadow-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.wagerAmount ? 'border-red-500' : ''}`}
              placeholder="Enter amount"
            />
            <Select value={'STRK'}>
              <SelectTrigger className="rounded-full w-full max-w-[66px] border-[#DBE2E8] text-[10px] font-light">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STRK">STRK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formErrors.wagerAmount && (
            <p className="text-red-500 text-xs">{formErrors.wagerAmount}</p>
          )}
        </div>
        <div className="text-sm flex flex-col gap-2">
          <label className="text-sm font-medium">You Win</label>
          <Input
            disabled
            value={wagerDetails.potentialWin}
            className="p-4 shadow-none rounded-[4px] bg-[#F5F6F8] border-[#DBE2E8] h-auto"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={
        stage === 'form'
          ? `Wager (${isMultiplayer ? 'Multi' : 'Single'} Player)`
          : 'Wager Summary'
      }
      description={
        stage === 'form'
          ? 'Configure your wager settings for the game.'
          : undefined
      }
      primaryActionLabel={
        stage === 'form' ? 'Proceed to Summary' : 'Start Game'
      }
      onPrimaryAction={
        stage === 'form' ? handleProceedToSummary : handleStartGame
      }
      isLoading={isCreatingRound}
      
    >
      {stage === 'form' ? (
        renderWagerForm()
      ) : (
        <WagerSummaryContent {...wagerDetails} />
      )}
    </Modal>
  );
}
