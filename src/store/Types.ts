export interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  lastPlayed: Date | null;
  timeLeft: number;
  isTimerRunning: boolean;
}

export interface WagerDetails {
  genre: string;
  difficulty: string;
  duration: string;
  odds: string;
  wagerAmount: string;
  potentialWin: string;
}

export interface LyricData {
  text: string;
  title: string;
  artist: string;
  options: SongOption[];
}

export interface SongOption {
  title: string;
  artist: string;
}
  
export interface GameActions {
  incrementScore: (by: number) => void;
  incrementLevel: () => void;
  startGame: () => void;
  endGame: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: (newTime?: number) => void;
  tickTimer: () => void; 
}
  
// User slice types
export interface UserPreferences {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}
  
export interface UserState {
  username: string | null;
  isLoggedIn: boolean;
  preferences: UserPreferences;
}
  
export interface UserActions {
  login: (username: string) => void;
  logout: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  toggleTheme: () => void;
  toggleSound: () => void;
  setDifficulty: (difficulty: UserPreferences['difficulty']) => void;
}
  
// Combined store type
export interface StoreState {
  game: GameState;
  user: UserState;
}
  
export interface StoreActions {
  game: GameActions;
  user: UserActions;
}
  
export type Store = StoreState & StoreActions;