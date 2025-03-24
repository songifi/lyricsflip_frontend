import { StateCreator } from 'zustand';
import { GameState, GameActions, Store } from '../Types';

export const initialGameState: GameState = {
  score: 0,
  level: 1,
  isPlaying: false,
  lastPlayed: null,
};

// Fixed type signature for the slice creator
export const createGameSlice: StateCreator<
Store, 
[['zustand/immer', never]],
[['zustand/immer', never]],
{ game: GameState } & { game: GameActions }
> = (set) => ({
  game: {
    ...initialGameState,

    // Actions
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
      });
    },

    endGame: () => {
      set((state) => {
        state.game.isPlaying = false;
        state.game.lastPlayed = new Date();
      });
    },
  },
});