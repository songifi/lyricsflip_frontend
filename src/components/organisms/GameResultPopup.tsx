'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaCircleCheck } from 'react-icons/fa6';
import { MdCancel } from 'react-icons/md';
import { Button } from '@components/atoms/button';
import { Modal } from './modal';
import { useSinglePlayer } from '@/features/game/hooks/useSinglePlayer';
import { useGameStore } from '@/store/game';
import { useRouter } from 'next/navigation';

interface GameResultPopupProps {
  isWin: boolean;
  isMultiplayer: boolean;
}

const GameResultPopup: React.FC<GameResultPopupProps> = ({
  isWin,
  isMultiplayer,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const gameStore = useGameStore();
  const genre = gameStore.gameConfig.genre;
  const { resetGame } = useSinglePlayer(genre);
  const router = useRouter();
  const percent = (gameStore.score / gameStore.maxRounds) * 100;

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetGame();
    router.push('/');
  };

  const renderResultContent = () => {
    return (
      <div className="space-y-4 mt-10">
        <div className="flex flex-col justify-center items-center gap-6">
          <div className="size-[200px]">
            <Image
              src={isWin ? '/trophy.png' : '/warning.png'}
              alt={isWin ? 'trophy' : 'lost'}
              width={200}
              height={200}
              className="w-full h-full"
            />
          </div>
          <p className="font-bold text-[32px]">
            <span className="text-[#70E3C7]">368 Points</span> -{' '}
            {isWin && isMultiplayer ? (
              <span>You won🥇</span>
            ) : isWin ? (
              <span>You are amazing🔥</span>
            ) : (
              <span>You lost😞</span>
            )}
          </p>
        </div>

        {!isMultiplayer ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b py-[12px]">
              <span className="text-gray-600">Score</span>
              <span className="font-medium">
                {`${gameStore.score} / ${gameStore.maxRounds}`} (
                {percent.toFixed()}%)
              </span>
            </div>
            <div className="flex justify-between items-center border-b py-[12px]">
              <span className="text-gray-600">Odds</span>
              <span className="font-medium flex items-center gap-2">
                {gameStore.gameConfig.odds} odds (Get everything right){' '}
                <span>
                  {isWin ? (
                    <FaCircleCheck className="text-green-600 size-5" />
                  ) : (
                    <MdCancel className="text-red-600 size-5" />
                  )}
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center border-b py-[12px]">
              <span className="text-gray-600">Wager Amount</span>
              <span className="font-medium">
                {gameStore.gameConfig.wagerAmount} STRK
              </span>
            </div>
            {isWin && (
              <div className="flex justify-between items-center border-b py-[12px]">
                <span className="text-gray-600">You Win</span>
                <span className="font-medium text-[#9747FF]">
                  {gameStore.potentialWin} STRK
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b py-[12px]">
              <span className="text-gray-600">Winner</span>
              <span className="font-medium">
                {isWin ? 'You' : 'theXaxxo (678 Pts)'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b py-[12px]">
              <span className="text-gray-600">Prize Won</span>
              <span className="font-medium text-[#9747FF]">
                80,000 STRK (800 USD)
              </span>
            </div>
            <div className="flex justify-between items-center border-b py-[12px]">
              <span className="text-gray-600">Wager Amount</span>
              <span className="font-medium">10,000 STRK (100 USD)</span>
            </div>
            <div className="flex justify-between items-center border-b py-[12px]">
              <span className="text-gray-600">Second Place</span>
              <span className="font-medium">
                {isWin ? 'theXaxxo (345 Pts)' : 'You'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b py-[12px]">
              <span className="text-gray-600">Third Place</span>
              <span className="font-medium">theXaxxo (345 Pts)</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className="flex gap-4 justify-center mt-10 w-full">
        <Button
          variant="outline"
          size="lg"
          className="w-[238px] px-2 py-6 border-[#9747FF] h-[72px] flex justify-center items-center rounded-full font-medium text-md text-[#9747FF]"
        >
          Share
        </Button>
        <Button
          variant="purple"
          size="lg"
          className="w-[238px] px-2 py-6 h-[72px] flex justify-center items-center rounded-full font-medium text-md text-white"
        >
          Claim Earning
        </Button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title=""
      footerContent={renderFooter()}
    >
      {renderResultContent()}
    </Modal>
  );
};

export default GameResultPopup;
