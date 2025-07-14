import { useState, useCallback, useEffect } from 'react';
import { useSystemCalls, Answer } from '../useSystemCalls';
import { useRoundQuery } from './useRoundQuery';
import { useAccount } from '@starknet-react/core';
import type { QuestionCard, Round, RoundPlayer } from '../typescript/models.gen';

type GamePhase = 'waiting' | 'starting' | 'card_active' | 'card_results' | 'completed' | 'loading_card';

interface GameState {
  phase: GamePhase;
  currentCard: QuestionCard | null;
  timeRemaining: number;
  hasAnswered: boolean;
  lastAnswer: Answer | null;
  cardStartTime: number | null;
  myScore: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface UseMultiplayerGameResult {
  // Game State
  gamePhase: GamePhase;
  currentCard: QuestionCard | null;
  timeRemaining: number;
  
  // Round Data
  round: Round | null;
  playersCount: number;
  myPlayerData: RoundPlayer | null;
  
  // Game Actions
  getNextCard: () => Promise<void>;
  submitAnswer: (answer: Answer) => Promise<void>;
  
  // Derived State
  canAnswer: boolean;
  myScore: number;
  correctAnswers: number;
  totalAnswers: number;
  isGameComplete: boolean;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
}

export const useMultiplayerGame = (roundId: bigint): UseMultiplayerGameResult => {
  const { account } = useAccount();
  const { nextCard, submitAnswer: submitAnswerCall, getPlayerProgress } = useSystemCalls();
  
  // Use existing round query system
  const { round, playersCount, isLoading: roundLoading, error: roundError, queryRound } = useRoundQuery();
  
  // Local game state
  const [gameState, setGameState] = useState<GameState>({
    phase: 'waiting',
    currentCard: null,
    timeRemaining: 30,
    hasAnswered: false,
    lastAnswer: null,
    cardStartTime: null,
    myScore: 0,
    correctAnswers: 0,
    totalAnswers: 0,
  });

  const [myPlayerData, setMyPlayerData] = useState<RoundPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize round query
  useEffect(() => {
    if (roundId) {
      queryRound(roundId);
    }
  }, [roundId, queryRound]);

  // Update game phase based on round state
  useEffect(() => {
    if (!round) return;

    const roundState = Number(round.state);
    
    if (roundState === 0) {
      // Round is waiting
      setGameState(prev => ({ ...prev, phase: 'waiting' }));
    } else if (roundState === 1) {
      // Round is in progress
      if (gameState.phase === 'waiting') {
        setGameState(prev => ({ ...prev, phase: 'starting' }));
      }
    } else if (roundState === 2) {
      // Round is completed
      setGameState(prev => ({ ...prev, phase: 'completed' }));
    }
  }, [round?.state, gameState.phase]);

  // Fetch player progress periodically
  useEffect(() => {
    if (!roundId || !account?.address) return;

    const fetchPlayerProgress = async () => {
      try {
        const progress = await getPlayerProgress(roundId);
        if (progress) {
          setMyPlayerData(progress);
          setGameState(prev => ({
            ...prev,
            myScore: Number(progress.total_score),
            correctAnswers: Number(progress.correct_answers),
            totalAnswers: Number(progress.total_answers),
          }));
        }
      } catch (err) {
        console.error('Failed to fetch player progress:', err);
      }
    };

    fetchPlayerProgress();
    const interval = setInterval(fetchPlayerProgress, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [roundId, account?.address, getPlayerProgress]);

  // Game actions
  const handleGetNextCard = useCallback(async () => {
    if (!roundId) {
      setError('No round ID available');
      return;
    }

    try {
      setError(null);
      setGameState(prev => ({ ...prev, phase: 'loading_card' }));
      
      console.log('[useMultiplayerGame] Getting next card for round:', roundId.toString());
      const card = await nextCard(roundId);
      
      setGameState(prev => ({
        ...prev,
        currentCard: card,
        phase: 'card_active',
        hasAnswered: false,
        lastAnswer: null,
        cardStartTime: Date.now(),
        timeRemaining: 30
      }));

      console.log('[useMultiplayerGame] Got next card:', card);
    } catch (err) {
      console.error('[useMultiplayerGame] Failed to get next card:', err);
      setError(err instanceof Error ? err.message : 'Failed to get next card');
      setGameState(prev => ({ ...prev, phase: 'card_active' })); // Reset to previous state
    }
  }, [roundId, nextCard]);

  const handleSubmitAnswer = useCallback(async (answer: Answer) => {
    if (!roundId) {
      setError('No round ID available');
      return;
    }

    if (gameState.hasAnswered) {
      console.log('[useMultiplayerGame] Answer already submitted');
      return;
    }
    
    try {
      setError(null);
      console.log('[useMultiplayerGame] Submitting answer:', Answer[answer]);
      
      setGameState(prev => ({ 
        ...prev, 
        hasAnswered: true, 
        lastAnswer: answer,
        phase: 'card_results'
      }));
      
      const isCorrect = await submitAnswerCall(roundId, answer);
      
      console.log('[useMultiplayerGame] Answer result:', isCorrect);
      
      // The player progress will be updated automatically by the SDK
      // We'll fetch it in the next polling cycle
      
      // Auto-advance to next card after a delay
      setTimeout(() => {
        if (gameState.phase === 'card_results') {
          handleGetNextCard();
        }
      }, 3000);
      
    } catch (err) {
      console.error('[useMultiplayerGame] Failed to submit answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setGameState(prev => ({ 
        ...prev, 
        hasAnswered: false, 
        lastAnswer: null,
        phase: 'card_active'
      }));
    }
  }, [roundId, submitAnswerCall, gameState.hasAnswered, gameState.phase, handleGetNextCard]);

  // Timer management
  useEffect(() => {
    if (gameState.phase !== 'card_active' || gameState.hasAnswered) return;
    
    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          // Auto-submit random answer when time runs out
          console.log('[useMultiplayerGame] Time expired, auto-submitting answer');
          handleSubmitAnswer(Answer.OptionOne);
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.phase, gameState.hasAnswered, handleSubmitAnswer]);

  return {
    // Game State
    gamePhase: gameState.phase,
    currentCard: gameState.currentCard,
    timeRemaining: gameState.timeRemaining,
    
    // Round Data
    round,
    playersCount,
    myPlayerData,
    
    // Game Actions
    getNextCard: handleGetNextCard,
    submitAnswer: handleSubmitAnswer,
    
    // Derived State
    canAnswer: gameState.phase === 'card_active' && !gameState.hasAnswered,
    myScore: gameState.myScore,
    correctAnswers: gameState.correctAnswers,
    totalAnswers: gameState.totalAnswers,
    isGameComplete: gameState.phase === 'completed',
    
    // Loading States
    isLoading: roundLoading || gameState.phase === 'loading_card',
    error: error || roundError,
  };
}; 