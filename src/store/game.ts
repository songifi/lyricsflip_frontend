import { create } from 'zustand';

interface GameState {
  score: number;
  timeLeft: number;
  potentialWin: number;
  currentRound: number;
  maxRounds: number;
  gameConfig: {
    genre: string;
    difficulty: string;
    duration: string;
    odds: number;
    wagerAmount: number;
  };
  lastGuessResult: 'correct' | 'incorrect' | null;
  increaseScore: () => void;
  setGuessResult: (result: GameState['lastGuessResult']) => void;
  decreaseTime: () => void;
  resetGame: () => void;
  startGame: (config: GameState['gameConfig']) => void;
}


export const useGameStore = create<GameState>((set) => ({
  score: 0,
  timeLeft: 300, // Default 5 minutes
  potentialWin: 0,
  currentRound: 0,
  maxRounds: 5, // Increased rounds
  gameConfig: {
    genre: '',
    difficulty: '',
    duration: '',
    odds: 0,
    wagerAmount: 0,
  },
  lastGuessResult: null,

  increaseScore: () =>
    set((state) => ({
      score: state.score + 1,
      currentRound: state.currentRound + 1,
      lastGuessResult: 'correct',
    })),

  setGuessResult: (result) => set({ lastGuessResult: result }),

  decreaseTime: () =>
    set((state) => ({
      timeLeft: Math.max(0, state.timeLeft - 1),
    })),

  resetGame: () =>
    set({
      score: 0,
      timeLeft: 300,
      potentialWin: 0,
      currentRound: 0,
      lastGuessResult: null,
      gameConfig: {
        genre: '',
        difficulty: '',
        duration: '',
        odds: 0,
        wagerAmount: 0,
      },
    }),

  startGame: (config) =>
    set({
      potentialWin: config.wagerAmount * config.odds,
      timeLeft:
        config.duration === '5 mins'
          ? 300
          : config.duration === '10 mins'
            ? 600
            : 900, // 15 min
      score: 0,
      currentRound: 0,
      lastGuessResult: null,
      gameConfig: config,
    }),
}));
