import { BigNumberish } from 'starknet';
import { useDojo } from '@/lib/dojo/hooks/useDojo';
import { useModalStore } from '@/store/modal-store';
import { useGameStore } from '@/store/game';

export const useGameService = () => {
  const { systemCalls } = useDojo();
  const { closeModal } = useModalStore();
  const { setRoundId } = useGameStore();

  const createRound = async (genre: BigNumberish) => {
    if (!systemCalls) {
      throw new Error('System not initialized');
    }

    const roundId = await systemCalls.createRound(genre);
    setRoundId(roundId);
    closeModal();
    return roundId;
  };

  return {
    createRound
  };
};