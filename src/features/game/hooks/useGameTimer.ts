// src/features/game/hooks/useGameTimer.ts
import { useEffect } from 'react';
import { useStore } from '@/store/GameStores';

interface UseGameTimerReturn {
  timeLeft: number;
  isTimerRunning: boolean;
  startGame: () => void;
  endGame: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: (newTime?: number) => void;
}

export const useGameTimer = (): UseGameTimerReturn => {
  const { 
    timeLeft, 
    isTimerRunning, 
    isPlaying,
    startGame, 
    endGame, 
    startTimer, 
    stopTimer, 
    resetTimer,
    tickTimer,
  } = useStore(state => state.game);

  // Timer countdown logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTimerRunning && isPlaying) {
      intervalId = setInterval(() => {
        tickTimer();
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isTimerRunning, isPlaying, tickTimer]);

  // Optional: Auto-start timer when game starts
  useEffect(() => {
    if (isPlaying) {
      resetTimer();
      startTimer();
    }
  }, [isPlaying, resetTimer, startTimer]);

  return {
    timeLeft,
    isTimerRunning,
    startGame,
    endGame,
    startTimer,
    stopTimer,
    resetTimer,
  };
};