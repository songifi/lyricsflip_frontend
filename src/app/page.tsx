'use client';

import Welcome from '@/components/atoms/welcome';
import { GameModal } from '@/components/organisms/game-modal';
import { GameOptions } from '@/components/organisms/game-mode-selection';
import { WagerModal } from '@/components/organisms/WagerModal';
import { useModalStore } from '@/store/modal-store';
import CreateChallenge from '@/components/organisms/create-challange';
import WaitingForOpponent from '@/components/organisms/waiting-for-opponent';
import { Modal } from '@/components/organisms/modal';
import { ChallengeModal } from '@/components/organisms/challengeModal';

export default function Home() {
  const { openModal } = useModalStore();
  const { modalType, isOpen, closeModal } = useModalStore();

  const handleGameSelect = (gameId: string) => {
    if (gameId === 'quick-game') {
      openModal('game');
    } else if (gameId === 'single-player') {
      openModal('single-wager');
    } else if (gameId === 'multi-player') {
      openModal('create-challenge');
    } else if (gameId === 'challenge') {
      openModal('challenge');
    }
  };

  return (
    <main className="lg:max-w-[53rem] mt-4 mx-auto h-fit w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
      <Welcome />
      <GameOptions onSelectGame={handleGameSelect} />

      {/* Modals */}
      <GameModal />
      <WagerModal />
      {modalType === 'create-challenge' && isOpen && (
        <Modal isOpen={isOpen} onClose={closeModal} title="Wager (Multi Player)" description="Create a new multiplayer wager challenge." showHeader={false} showFooter={false}>
          <CreateChallenge />
        </Modal>
      )}
      {modalType === 'waiting-for-opponent' && isOpen && (
        <Modal isOpen={isOpen} onClose={closeModal} title="Waiting for Opponent" description="Waiting for other players to join your challenge." showHeader={false} showFooter={false}>
          <WaitingForOpponent />
        </Modal>
      )}
      {modalType === 'challenge' && isOpen && (
        <Modal isOpen={isOpen} onClose={closeModal} title="Join a Challenge" description="Enter a challenge code to join an existing game." showHeader={false} showFooter={false}>
          <ChallengeModal />
        </Modal>
      )}
    </main>
  );
}
