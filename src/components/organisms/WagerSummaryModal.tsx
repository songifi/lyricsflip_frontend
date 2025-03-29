'use client';

import { Modal } from './modal';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { useModalStore } from '@/store/modal-store';
import { WagerDetails } from '@/store';

export function WagerSummaryContent({
  genre,
  difficulty,
  duration,
  odds,
  wagerAmount,
  potentialWin,
}: WagerDetails) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate
        libero et velit interdum.
      </p>

      <div className="space-y-3">
        <div className="flex justify-between items-center border-b py-[12px]">
          <span className="text-gray-600">Genre</span>
          <span className="font-medium">{genre}</span>
        </div>

        <div className="flex justify-between items-center border-b py-[12px]">
          <span className="text-gray-600">Difficulty Level</span>
          <span className="font-medium">{difficulty}</span>
        </div>

        <div className="flex justify-between items-center border-b py-[12px]">
          <span className="text-gray-600">Duration</span>
          <span className="font-medium">{duration}</span>
        </div>

        <div className="flex justify-between items-center border-b py-[12px]">
          <span className="text-gray-600">Odds</span>
          <span className="font-medium">{odds} odds (get everything right)</span>
        </div>

        <div className="flex justify-between items-center border-b py-[12px]">
          <span className="text-gray-600">Wager Amount</span>
          <span className="font-medium">{wagerAmount} STRK</span>
        </div>
        <div className="flex justify-between items-center border-b py-[12px]">
          <span className="text-gray-600">You Win</span>
          <span className="font-medium text-[#9747FF]">{potentialWin}</span>
        </div>
      </div>

      <div className="bg-[#F0F0F0] p-4 rounded-lg gap-3 flex flex-col">
        <div className="flex items-center **:flex-shrink-0 text-[#9747FF] text-xs">
          <InfoIcon className="w-3 h-3 mr-2" /> <span>INSTRUCTION</span>
        </div>
        <div className="text-sm bg-white p-4 rounded-[8px]">
          <p className="text-gray-700">
            A card displaying a lyric from a song will appear along with a list
            of possible answers. Your goal according to the odd you picked is to
            get 80% of the lyrics presented you.
          </p>
        </div>
      </div>
    </div>
  );
}

export function WagerSummaryModal() {
  const { isOpen, modalType, closeModal } = useModalStore();
  const [summary] = useState({
    genre: 'Hip Hop',
    difficulty: 'Expert',
    duration: '10 Mins',
    odds: '10 odds (get everything right)',
    wagerAmount: '10,000 STRK (100 USD)',
    potentialWin: '80,000 STRK (800 USD)',
  });

  const handleStartGame = () => {
    closeModal();
    // Start game logic would go here
    console.log('Starting wager game...');
  };

  const isModalOpen = isOpen && modalType === 'wager-summary';

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Wager Summary"
      primaryActionLabel="Start Game"
      onPrimaryAction={handleStartGame}
    >
      <WagerSummaryContent {...summary} />
    </Modal>
  );
}
