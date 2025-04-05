import { MOCK_LYRICS } from '@/mock/mock'; // Replace GENRE_LYRICS with mock data
import { LyricData, SongOption } from '@/store';
import { useGameStore } from '@/store/game';
import { useEffect, useState } from 'react';

export const useSinglePlayer = (genre: string) => {
  const gameStore = useGameStore();
  const [currentLyric, setCurrentLyric] = useState<LyricData | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SongOption | null>(null);
  const [correctOption, setCorrectOption] = useState<SongOption | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [gameResult, setGameResult] = useState<{
    isWin: boolean;
    isMultiplayer: boolean;
  } | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false); // New: Control card flip

  useEffect(() => {
    if (genre && gameStore.gameStatus === 'playing') {
      startNewRound();
      setIsGameStarted(true);
      setIsCardFlipped(true); // Flip card to show lyrics when game starts
    }
  }, [genre, gameStore.gameStatus]);

  useEffect(() => {
    if (gameStore.timeLeft <= 0 || gameStore.gameStatus === 'ended') {
      endGame(false);
    }
  }, [gameStore.timeLeft, gameStore.gameStatus]);

  const startNewRound = () => {
    const randomLyric =
      MOCK_LYRICS[Math.floor(Math.random() * MOCK_LYRICS.length)];
    setCurrentLyric(randomLyric);
    setSelectedOption(null);
    setCorrectOption(null);
    setIsCardFlipped(true); // Show lyrics for new round
  };

  const handleSongSelect = (option: SongOption) => {
    if (!currentLyric || selectedOption) return;

    setSelectedOption(option);
    setCorrectOption({
      title: currentLyric.title,
      artist: currentLyric.artist,
    });

    const isCorrect = option.title === currentLyric.title;
    const newWrongAttempts = isCorrect ? 0 : wrongAttempts + 1;

    if (isCorrect) {
      gameStore.increaseScore();
      gameStore.setGuessResult('correct');
      setWrongAttempts(0);
    } else {
      gameStore.setGuessResult('incorrect');
      setWrongAttempts(newWrongAttempts);
      if (newWrongAttempts >= gameStore.gameConfig.odds) {
        gameStore.endGame();
        endGame(false);
        return;
      }
    }

    // Flip card back and move to next question after feedback
    setTimeout(() => {
      setIsCardFlipped(false); // Flip back to shape
      setTimeout(() => {
        if (gameStore.currentRound >= gameStore.maxRounds) {
          endGame(true);
        } else {
          startNewRound(); // Load next question and flip card again
        }
      }, 500); // Short delay before next question
    }, 1000); // 1s feedback delay
  };

  const endGame = (didWin: boolean) => {
    setGameResult({
      isWin: didWin,
      isMultiplayer: false,
    });
    gameStore.endGame();
  };

  const resetGame = () => {
    gameStore.resetGame();
    setIsGameStarted(false);
    setCurrentLyric(null);
    setGameResult(null);
    setWrongAttempts(0);
    setIsCardFlipped(false);
  };

  return {
    currentLyric,
    isGameStarted,
    selectedOption,
    correctOption,
    handleSongSelect,
    gameResult,
    resetGame,
    isCardFlipped, // Expose flip state
  };
};