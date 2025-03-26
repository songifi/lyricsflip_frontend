import { StateCreator } from 'zustand';
import { GameState, GameActions, Store } from '../Types';

export const initialGameState: GameState = {
  score: 0,
  level: 1,
  isPlaying: false,
  lastPlayed: null,
  timeLeft: 15,
  isTimerRunning: false,
};

export const createGameSlice: StateCreator<
  Store,
  [['zustand/immer', never]],
  [['zustand/immer', never]],
  { game: GameState } & { game: GameActions }
> = (set) => ({
  game: {
    ...initialGameState,

    // Existing Actions
    incrementScore: (by) => {
      set((state) => {
        state.game.score += by;
      });
    },

    incrementLevel: () => {
      set((state) => {
        state.game.level += 1;
      });
    },

    startGame: () => {
      set((state) => {
        state.game.isPlaying = true;
        state.game.score = 0;
        state.game.level = 1;
        state.game.timeLeft = 15; // Reset timer on game start
        state.game.isTimerRunning = false;
      });
    },

    endGame: () => {
      set((state) => {
        state.game.isPlaying = false;
        state.game.lastPlayed = new Date();
        state.game.isTimerRunning = false; // Stop timer on game end
      });
    },

    // New Timer Actions
    startTimer: () => {
      set((state) => {
        if (state.game.timeLeft > 0) {
          state.game.isTimerRunning = true;
          state.game.isPlaying = true;
        }
      });
    },

    stopTimer: () => {
      set((state) => {
        state.game.isTimerRunning = false;
      });
    },

    resetTimer: (newTime = 15) => {
      set((state) => {
        state.game.timeLeft = newTime;
      });
    },

    tickTimer: () => {
      set((state) => {
        if (state.game.isTimerRunning && state.game.timeLeft > 0) {
          state.game.timeLeft -= 1;
          if (state.game.timeLeft <= 0) {
            state.game.isTimerRunning = false;
            state.game.isPlaying = false; // Auto-end game
            state.game.lastPlayed = new Date();
            // Add any other end-game logic here
          }
        }
      });
    },
  },
});
