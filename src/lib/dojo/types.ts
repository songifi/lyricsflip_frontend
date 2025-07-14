// Re-export RoundStatus from useSystemCalls for easy imports
export { RoundStatus, GameMode, ChallengeType, Genre, Answer } from './useSystemCalls';

// Navigation helper type
export type RoundActivationResult = 'alreadyActive' | 'started'; 