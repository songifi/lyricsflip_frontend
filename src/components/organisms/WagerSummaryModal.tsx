'use client';

import { Modal } from './modal';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { useModalStore } from '@/store/modal-store';

export function WagerSummaryModal() {
  const { isOpen, modalType, closeModal } = useModalStore();
  const [genre] = useState('Hip Hop');
  const [difficultyLevel] = useState('Expert');
  const [duration] = useState('10 Mins');
  const [odds] = useState('10 odds (get everything right)');
  const [wagerAmount] = useState('10,000 STRK (100 USD)');
  const [winAmount] = useState('80,000 STRK (800 USD)');

  const handleStartGame = () => {
    closeModal();
    // Start game logic would go here
    console.log('Starting wager game...');
  };

  const isModalOpen = isOpen && modalType === 'wager' as ModalType;

  const modalContent = (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum.
      </p>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Genre</span>
          <span className="font-medium">{genre}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Difficulty Level</span>
          <span className="font-medium">{difficultyLevel}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Duration</span>
          <span className="font-medium">{duration}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Odds</span>
          <span className="font-medium">{odds}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Wager Amount</span>
          <span className="font-medium">{wagerAmount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">You Win</span>
          <span className="font-medium text-purple-600">{winAmount}</span>
        </div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg flex gap-3">
        <div className="bg-purple-100 rounded-full p-1 h-6 w-6 flex items-center justify-center flex-shrink-0 text-purple-600">
          <InfoIcon />
        </div>
        <div className="text-sm">
          <h4 className="font-medium text-purple-700 mb-1">INSTRUCTION</h4>
          <p className="text-gray-700">
            A card displaying a lyric from a song will appear along with a list of possible answers. Your goal according to the odd you picked is to get 80% of the lyrics presented you.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Wager Summary"
      primaryActionLabel="Start Game"
      onPrimaryAction={handleStartGame}
    >
      {modalContent}
    </Modal>
  );
} 