import { create } from 'zustand';
import { BigNumberish } from 'starknet';

interface GameState {
  roundId: BigNumberish | null;
  setRoundId: (roundId: BigNumberish) => void;
}

export const useGameStore = create<GameState>((set) => ({
  roundId: null,
  setRoundId: (roundId) => set({ roundId }),
}));
