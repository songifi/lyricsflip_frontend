import { create } from 'zustand';
import { ModelsMapping } from '../typescript/models.gen';
import { RoundState, RoundStatus } from './types';

interface RoundStore {
  // State
  rounds: Map<string, RoundState>;
  currentRoundId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addRound: (roundId: string, round: RoundState) => void;
  updateRound: (roundId: string, updates: Partial<RoundState>) => void;
  removeRound: (roundId: string) => void;
  setCurrentRound: (roundId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearRounds: () => void;
}

export const useRoundStore = create<RoundStore>((set, get) => ({
  // Initial state
  rounds: new Map(),
  currentRoundId: null,
  isLoading: false,
  error: null,

  // Actions
  addRound: (roundId: string, round: RoundState) => {
    set((state) => {
      const newRounds = new Map(state.rounds);
      newRounds.set(roundId, round);
      return { rounds: newRounds };
    });
  },

  updateRound: (roundId: string, updates: Partial<RoundState>) => {
    set((state) => {
      const round = state.rounds.get(roundId);
      if (!round) return state;

      const newRounds = new Map(state.rounds);
      newRounds.set(roundId, { ...round, ...updates });
      return { rounds: newRounds };
    });
  },

  removeRound: (roundId: string) => {
    set((state) => {
      const newRounds = new Map(state.rounds);
      newRounds.delete(roundId);
      return { 
        rounds: newRounds,
        currentRoundId: state.currentRoundId === roundId ? null : state.currentRoundId 
      };
    });
  },

  setCurrentRound: (roundId: string | null) => {
    set({ currentRoundId: roundId });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearRounds: () => {
    set({
      rounds: new Map(),
      currentRoundId: null,
      error: null
    });
  }
}));

// Selector hooks for common state access patterns
export const useCurrentRound = () => {
  const { rounds, currentRoundId } = useRoundStore();
  return currentRoundId ? rounds.get(currentRoundId) : null;
};

export const useRoundById = (roundId: string) => {
  const { rounds } = useRoundStore();
  return rounds.get(roundId);
};

export const useRoundStatus = (roundId: string) => {
  const round = useRoundById(roundId);
  return round?.status;
};

export const useRoundPlayers = (roundId: string) => {
  const round = useRoundById(roundId);
  return round?.players || [];
}; 