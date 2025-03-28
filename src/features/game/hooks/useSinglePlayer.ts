import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/game';
import { useModalStore } from '@/store/modal-store';
import { LyricData, SongOption } from '@/store';
import { GENRE_LYRICS } from '@/lib/utils';

export const useSinglePlayer = (genre: string) => {
  const gameStore = useGameStore();
  const { openModal } = useModalStore();

  const [currentLyric, setCurrentLyric] = useState<LyricData | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SongOption | null>(null);
  const [correctOption, setCorrectOption] = useState<SongOption | null>(null);

  useEffect(() => {
    if (genre) {
      startNewRound();
      setIsGameStarted(true);
    }
  }, [genre]);

  useEffect(() => {
    if (!isGameStarted) return;

    const timer = setInterval(() => {
      if (gameStore.timeLeft > 0) {
        gameStore.decreaseTime();
      } else {
        endGame(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStore.timeLeft, isGameStarted]);

  const startNewRound = () => {
    const genreLyricList = GENRE_LYRICS[genre as keyof typeof GENRE_LYRICS];
    const randomLyric =
      genreLyricList[Math.floor(Math.random() * genreLyricList.length)];

    setCurrentLyric(randomLyric);
    setSelectedOption(null);
    setCorrectOption(null);
  };

  const handleSongSelect = (option: SongOption) => {
    setSelectedOption(option);
    setCorrectOption({
      title: currentLyric?.title || '',
      artist: currentLyric?.artist || '',
    });

    const isCorrect = option.title === currentLyric?.title;

    if (isCorrect) {
      gameStore.increaseScore();
    } else {
      endGame(false);
      return;
    }

    setTimeout(() => {
      if (gameStore.currentRound >= gameStore.maxRounds - 1) {
        endGame(true);
      } else {
        startNewRound();
      }
    }, 1000);
  };

  const endGame = (didWin: boolean) => {
    const modalType = didWin ? 'won' : 'lost';
    openModal(modalType);
  };

  return {
    currentLyric,
    isGameStarted,
    selectedOption,
    correctOption,
    handleSongSelect,
  };
};
