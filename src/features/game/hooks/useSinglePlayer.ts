import { GENRE_LYRICS } from '@/lib/utils';
import { LyricData, SongOption } from '@/store';
import { useGameStore } from '@/store/game';
import { useEffect, useState } from 'react';


export const useSinglePlayer = (genre: string) => {
  const gameStore = useGameStore();

  const [currentLyric, setCurrentLyric] = useState<LyricData | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SongOption | null>(null);
  const [correctOption, setCorrectOption] = useState<SongOption | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [gameResult, setGameResult] = useState<{
    isWin: boolean;
    isMultiplayer: boolean;
  } | null>(null);

  useEffect(() => {
    if (genre) {
      startNewRound();
      setIsGameStarted(true);
    }
  }, [genre]);

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
      setWrongAttempts(0); 
    } else {
      setWrongAttempts((prev) => prev + 1); 

      // End the game if max wrong attempts are reached
      if (wrongAttempts >= gameStore.gameConfig.odds) {
        gameStore.endGame();
        endGame(false);
        return;
      }
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
    setGameResult({
      isWin: didWin,
      isMultiplayer: false,
    });
  };

  const resetGame = () => {
    gameStore.resetGame();
    setIsGameStarted(false);
    setCurrentLyric(null);
    setGameResult(null);
  };

  return {
    currentLyric,
    isGameStarted,
    selectedOption,
    correctOption,
    handleSongSelect,
    gameResult,
    resetGame,
  };
};
