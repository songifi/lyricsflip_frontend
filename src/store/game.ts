import { create } from 'zustand';

// Define the structure of the game state
interface GameState {
  score: number;             // Player's current score
  timeLeft: number;          // Remaining time for the current game round
  potentialWin: number;      // Potential win amount based on wager
  currentRound: number;      // Current game round number
  maxRounds: number;         // Maximum number of rounds allowed
  gameStatus: 'idle' | 'playing' | 'ended'; // Status of the game
  gameConfig: {              // Configuration settings for the game
    genre: string;           // Genre of the game
    difficulty: string;      // Difficulty level chosen
    duration: string;        // Game duration (e.g., 5 mins, 10 mins, 15 mins)
    odds: number;            // Multiplier for potential win
    wagerAmount: number;     // Amount of wager placed
  };
  lastGuessResult: 'correct' | 'incorrect' | null; // Result of the last guess
  increaseScore: () => void; // Increase score and advance the round
  setGuessResult: (result: GameState['lastGuessResult']) => void; // Set the result of the last guess
  decreaseTime: () => void;  // Decrement the remaining time by 1
  resetGame: () => void;     // Reset the game to initial state
  startGame: (config: GameState['gameConfig']) => void; // Start a new game with the given config
  endGame: () => void;       // Mark the game as ended
  setGameStatus: (status: GameState['gameStatus']) => void; // Update game status
}

// Create the game store using Zustand
export const useGameStore = create<GameState>((set) => ({
  score: 0,
  timeLeft: 300, // Default 5 minutes
  potentialWin: 0,
  currentRound: 0,
  maxRounds: 5, // Increased rounds
  gameStatus: 'idle',
  gameConfig: {
    genre: '',
    difficulty: '',
    duration: '',
    odds: 0,
    wagerAmount: 0,
  },
  lastGuessResult: null,

  // Increase the player's score and move to the next round
  increaseScore: () =>
    set((state) => ({
      score: state.score + 1,
      currentRound: state.currentRound + 1,
      lastGuessResult: 'correct',
    })),

  // Set the result of the most recent guess
  setGuessResult: (result) => set({ lastGuessResult: result }),

  // Decrease the time left, ensuring it doesn't go below 0
  decreaseTime: () =>
    set((state) => ({
      timeLeft: Math.max(0, state.timeLeft - 1),
    })),

  // Reset the game to its initial state
  resetGame: () =>
    set({
      score: 0,
      timeLeft: 300,
      potentialWin: 0,
      currentRound: 0,
      lastGuessResult: null,
      gameStatus: 'idle',
      gameConfig: {
        genre: '',
        difficulty: '',
        duration: '',
        odds: 0,
        wagerAmount: 0,
      },
    }),

  // Start a new game with the specified configuration
  startGame: (config) =>
    set({
      potentialWin: config.wagerAmount * config.odds,
      timeLeft:
        config.duration === '5 mins'
          ? 300
          : config.duration === '10 mins'
            ? 600
            : 900, // 15 min duration
      score: 0,
      currentRound: 0,
      lastGuessResult: null,
      gameStatus: 'playing',
      gameConfig: config,
    }),

  // Mark the game as ended
  endGame: () => set({ gameStatus: 'ended' }),

  // Update the current game status
  setGameStatus: (status) => set({ gameStatus: status }),
}));
