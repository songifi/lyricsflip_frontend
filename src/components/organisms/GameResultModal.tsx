import { useGameStore } from '@/store/game';
import { useModalStore } from '@/store/modal-store';
import { Modal } from './modal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

export const GameResultModal = () => {
  const { isOpen, modalType, closeModal } = useModalStore();
  const gameStore = useGameStore();
  const router = useRouter();
  const percent = (gameStore.score / gameStore.maxRounds) * 100;

  const renderResultContent = () => {
    const imageSrc = modalType === 'won' ? '/success.png' : '/failed.png';
    const title =
      modalType === 'won' ? 'You are amazing🔥' : 'Better luck next time🍀';

    return (
      <div className="space-y-4 mt-10">
        <div className="flex flex-col justify-center items-center gap-6">
          <Image width={200} height={200} src={imageSrc} alt="" />
          <p className="font-bold text-[32px]">
            <span className="text-[#70E3C7]">368 Points</span> - {title}
          </p>
        </div>
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
            <span className="font-medium flex items-center gap-1.5">
              {gameStore.gameConfig.odds} odds (Get everything right){' '}
              <span className="bg-[#0AC660] rounded-full w-5 h-5 flex items-center justify-center">
                <Check className="text-white w-3 h-3" />
              </span>
            </span>
          </div>

          <div className="flex justify-between items-center border-b py-[12px]">
            <span className="text-gray-600">Wager Amount</span>
            <span className="font-medium">
              {gameStore.gameConfig.wagerAmount} STRK
            </span>
          </div>
          {modalType === 'won' && (
            <div className="flex justify-between items-center border-b py-[12px]">
              <span className="text-gray-600">You Win</span>
              <span className="font-medium text-[#9747FF]">
                {gameStore.potentialWin} STRK
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    const handleCloseModal = () => {
      gameStore.resetGame();
      closeModal();
      router.push('/');
    };
    return (
      <div className="flex gap-4 justify-center mt-10 w-full">
        <button
          onClick={handleCloseModal}
          className="cursor-pointer border hover:bg-purple-600 hover:text-[#fff] border-purple-600 text-purple-600 px-4 py-4 w-[50%] rounded-full"
        >
          Share
        </button>
        <button
          onClick={handleCloseModal}
          className="cursor-pointer hover:bg-white border border-purple-600 hover:text-purple-600 bg-purple-600 text-white px-6 py-4 rounded-full w-[50%]"
        >
          Play Again
        </button>
      </div>
    );
  };

  const isModalOpen = isOpen && (modalType === 'won' || modalType === 'lost');

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title=""
      footerContent={renderFooter()}
    >
      {renderResultContent()}
    </Modal>
  );
};
