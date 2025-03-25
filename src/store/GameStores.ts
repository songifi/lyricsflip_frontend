

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import { createGameSlice } from './slices/GameSlicess';
import { createUserSlice } from './slices/UserSlices';
import { Store } from './Types';

export const useStore = create<Store>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createGameSlice(...a),
        ...createUserSlice(...a),
      })),
      {
        name: 'game-store',
        partialize: (state) => ({
          user: {
            preferences: state.user.preferences,
          },
        }),
      },
    ),
  ),
);