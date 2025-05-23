import { create } from 'zustand';

type ModalType =
  | 'game'
  | 'settings'
  | 'profile'
  | 'leaderboard'
  | 'single-wager'
  | 'multi-wager'
  | 'wager-summary'
  | 'won'
  | 'lost'
  | 'create-challenge'
  | 'waiting-for-opponent'
  | 'challenge'
  | null;

interface ModalState {
  isOpen: boolean;
  modalType: ModalType;
  modalPayload?: any;
  openModal: (type: ModalType, payload?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  modalPayload: undefined,
  openModal: (type, payload) => set({ isOpen: true, modalType: type, modalPayload: payload }),
  closeModal: () => set({ isOpen: false, modalType: null, modalPayload: undefined }),
}));
