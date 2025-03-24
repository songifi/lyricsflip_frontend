import { create } from 'zustand';

// Define game state types
export type GameState = 'idle' | 'playing' | 'ended';

// Define the store state interface
interface GameStore {
  // State
  state: GameState;
  score: number;
  timeElapsed: number;
  highScore: number;

  // Actions
  startGame: () => void;
  endGame: () => void;
  incrementScore: (points: number) => void;
  resetGame: () => void;
  updateTime: (seconds: number) => void;
}

// Create the store
export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  state: 'idle',
  score: 0,
  timeElapsed: 0,
  highScore: 0,

  // Actions
  startGame: () => set({ state: 'playing', score: 0, timeElapsed: 0 }),

  endGame: () =>
    set((state) => ({
      state: 'ended',
      highScore: state.score > state.highScore ? state.score : state.highScore,
    })),

  incrementScore: (points) =>
    set((state) => ({
      score: state.score + points,
    })),

  resetGame: () =>
    set({
      state: 'idle',
      score: 0,
      timeElapsed: 0,
    }),

  updateTime: (seconds) =>
    set({
      timeElapsed: seconds,
    }),
}));
