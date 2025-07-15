import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSystemCalls, Answer } from '../useSystemCalls';
import { useRoundQuery } from './useRoundQuery';
import { useAccount } from '@starknet-react/core';
import type { QuestionCard, Round, RoundPlayer } from '../typescript/models.gen';
import { useGameplaySubscriptions } from './useGameplaySubscriptions';

type GamePhase = 'waiting' | 'starting' | 'card_active' | 'card_results' | 'completed' | 'loading_card';

interface GameState {
  phase: GamePhase;
  currentCard: QuestionCard | null;
  timeRemaining: number;
  hasAnswered: boolean;
  lastAnswer: Answer | null;
  lastAnswerCorrectness: boolean | null;
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
  lastAnswerCorrectness: boolean | null;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
}

export const useMultiplayerGame = (roundId: bigint): UseMultiplayerGameResult => {
  const { account } = useAccount();
  const { nextCard, submitAnswer: submitAnswerCall, getPlayerProgress, getCardCount, checkAllPlayersAnswered } = useSystemCalls();
  const { subscribeToGameplay, unsubscribeFromGameplay, subscriptionError } = useGameplaySubscriptions();
  
  // CRITICAL: Add refs to prevent excessive submissions and manage state
  const submitInProgressRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmissionTime = useRef<number>(0);
  const gameStateRef = useRef<GameState | null>(null);
  const handleSubmitAnswerRef = useRef<((answer: Answer) => Promise<void>) | null>(null);
  
  // Use existing round query system
  const { round, playersCount, isLoading: roundLoading, error: roundError, queryRound } = useRoundQuery();
  
  // Local game state
  const [gameState, setGameState] = useState<GameState>({
    phase: 'waiting',
    currentCard: null,
    timeRemaining: 30,
    hasAnswered: false,
    lastAnswer: null,
    lastAnswerCorrectness: null,
    cardStartTime: null,
    myScore: 0,
    correctAnswers: 0,
    totalAnswers: 0,
  });

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const [myPlayerData, setMyPlayerData] = useState<RoundPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Propagate subscription errors to the main error state
  useEffect(() => {
    if (subscriptionError) {
      setError(prevError => {
        const newError = `Real-time connection failed: ${subscriptionError}`;
        // Avoid duplicate error messages
        if (prevError?.includes(newError)) {
          return prevError;
        }
        return prevError ? `${prevError}; ${newError}` : newError;
      });
    }
  }, [subscriptionError]);

  // Gameplay subscriptions
  useEffect(() => {
    if (roundId && account?.address) {
      console.log('[useMultiplayerGame] Subscribing to gameplay events for round:', roundId.toString());
      subscribeToGameplay(roundId, {
        onPlayerStateChange: (playerData) => {
          // Check if the update is for the current player
          if (playerData.player_to_round_id && BigInt(playerData.player_to_round_id[0]) === BigInt(account.address)) {
            console.log('[useMultiplayerGame] Received real-time player state update:', playerData);
            setMyPlayerData(playerData as RoundPlayer);
            setGameState(prev => ({
              ...prev,
              myScore: Number(playerData.total_score),
              correctAnswers: Number(playerData.correct_answers),
              totalAnswers: Number(playerData.total_answers),
            }));
          }
        },
      });
    }

    return () => {
      if (roundId) {
        console.log('[useMultiplayerGame] Unsubscribing from gameplay events for round:', roundId.toString());
        unsubscribeFromGameplay();
      }
    };
  }, [roundId, account?.address, subscribeToGameplay, unsubscribeFromGameplay]);

  // Cleanup function to clear timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current) {
      console.log('[useMultiplayerGame] Clearing game timer');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize round query
  useEffect(() => {
    if (roundId && account?.address) {
      queryRound(roundId);
      
      // Log initial setup (only once per roundId)
      console.log('[useMultiplayerGame] Initializing for round:', roundId.toString());
      console.log('[useMultiplayerGame] Account:', account?.address || 'Not connected');
    }
  }, [roundId, account?.address]);

  // Check card count and database verification (run only once per round)
  useEffect(() => {
    const verifyDatabase = async () => {
      try {
        const cardCount = await getCardCount();
        console.log('[useMultiplayerGame] Database card verification:', {
          cardCount,
          hasCards: cardCount > 0
        });
      } catch (err) {
        console.error('[useMultiplayerGame] Database verification failed:', err);
      }
    };

    if (roundId && account?.address) {
      verifyDatabase();
    }
  }, [roundId, account?.address]); // Removed getCardCount from dependencies

  // Update game phase based on round state
  useEffect(() => {
    if (!round?.state) return;
    
    const roundState = Number(BigInt(round.state));
    
    if (roundState === 0) {
      // Round is waiting
      setGameState(prev => ({ ...prev, phase: 'waiting' }));
    } else if (roundState === 1 || roundState === 3) {
      // Round is IN_PROGRESS (1) or PENDING (3) - both mean game can start
      if (gameState.phase === 'waiting') {
        setGameState(prev => ({ ...prev, phase: 'starting' }));
      }
    } else if (roundState === 2) {
      // Round is completed
      setGameState(prev => ({ ...prev, phase: 'completed' }));
      clearGameTimer(); // Ensure timer is cleared on completion
    }
  }, [round?.state, clearGameTimer]);

  // Fetch initial player progress ONCE
  useEffect(() => {
    if (!roundId || !account?.address) return;

    const fetchInitialPlayerProgress = async () => {
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
        console.error('Failed to fetch initial player progress:', err);
      }
    };

    fetchInitialPlayerProgress();
  }, [roundId, account?.address]);

  // Game actions - memoize to prevent re-renders
  const handleGetNextCard = useCallback(async () => {
    if (!roundId) {
      setError('No round ID available');
      return;
    }

    try {
      setError(null);
      setGameState(prev => ({ ...prev, phase: 'loading_card' }));
      
      // Add verification before requesting card
      console.log('[useMultiplayerGame] Initiating card request for round:', roundId.toString());
      console.log('[useMultiplayerGame] Game state before request:', {
        phase: gameState.phase,
        hasCurrentCard: !!gameState.currentCard,
        hasAnswered: gameState.hasAnswered
      });
      
      const card = await nextCard(roundId);
      
      setGameState(prev => ({
        ...prev,
        currentCard: card,
        phase: 'card_active',
        hasAnswered: false,
        lastAnswer: null,
        lastAnswerCorrectness: null,
        cardStartTime: Date.now(),
        timeRemaining: 30
      }));

      console.log('[useMultiplayerGame] Successfully received card:', {
        hasCard: !!card,
        hasLyric: !!card?.lyric,
        lyricLength: card?.lyric?.length || 0,
        hasAllOptions: !!(card?.option_one && card?.option_two && card?.option_three && card?.option_four)
      });
    } catch (err) {
      console.error('[useMultiplayerGame] Failed to get next card:', err);
      console.error('[useMultiplayerGame] Error context:', {
        roundId: roundId.toString(),
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        errorName: err instanceof Error ? err.name : 'Unknown',
        gamePhase: gameState.phase
      });
      setError(err instanceof Error ? err.message : 'Failed to get next card');
      setGameState(prev => ({ ...prev, phase: 'card_active' })); // Reset to previous state
    }
  }, [roundId, nextCard]);

  // IMPROVED: Properly sequenced answer submission
  const handleSubmitAnswer = useCallback(async (answer: Answer) => {
    if (!roundId) {
      setError('No round ID available');
      return;
    }

    // CRITICAL: Multiple safety checks
    if (gameState.hasAnswered) {
      console.log('[useMultiplayerGame] Answer already submitted');
      return;
    }

    if (submitInProgressRef.current) {
      console.log('[useMultiplayerGame] Submission already in progress');
      return;
    }

    if (gameState.phase !== 'card_active') {
      console.log('[useMultiplayerGame] Cannot submit - wrong phase:', gameState.phase);
      return;
    }

    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime.current;
    
    // Prevent submissions more frequent than 2 seconds
    if (timeSinceLastSubmission < 2000) {
      console.log('[useMultiplayerGame] Submission throttled, too frequent');
      return;
    }
    
    try {
      setError(null);
      submitInProgressRef.current = true;
      lastSubmissionTime.current = now;
      
      console.log('[useMultiplayerGame] Submitting answer:', Answer[answer]);
      
      // Clear timer immediately to prevent auto-submit
      clearGameTimer();
      
      setGameState(prev => ({ 
        ...prev, 
        hasAnswered: true, 
        lastAnswer: answer,
        phase: 'card_results'
      }));
      
      // STEP 1: Submit answer and wait for completion
      const isCorrect = await submitAnswerCall(roundId, answer);
      console.log('[useMultiplayerGame] Answer result:', isCorrect);
      
      // Store the correctness result
      setGameState(prev => ({
        ...prev,
        lastAnswerCorrectness: isCorrect
      }));
      
      // STEP 2: Wait for all players to answer (multiplayer logic)
      let allPlayersReady = false;
      let waitAttempts = 0;
      const maxWaitAttempts = 10; // 5 seconds max wait
      
      while (!allPlayersReady && waitAttempts < maxWaitAttempts) {
        try {
          allPlayersReady = await checkAllPlayersAnswered(roundId);
          if (!allPlayersReady) {
            console.log('[useMultiplayerGame] Waiting for other players to answer...');
            await new Promise(resolve => setTimeout(resolve, 500));
            waitAttempts++;
          }
        } catch (err) {
          console.warn('[useMultiplayerGame] Error checking players, proceeding:', err);
          break;
        }
      }
      
      if (allPlayersReady) {
        console.log('[useMultiplayerGame] All players ready, getting next card');
      } else {
        console.log('[useMultiplayerGame] Timeout waiting for players, proceeding anyway');
      }
      
      // STEP 3: Get next card (only after answer submission is complete)
      try {
        const nextCardData = await nextCard(roundId);
        
        setGameState(prev => ({
          ...prev,
          currentCard: nextCardData,
          phase: 'card_active',
          hasAnswered: false,
          lastAnswer: null,
          lastAnswerCorrectness: null,
          cardStartTime: Date.now(),
          timeRemaining: 30
        }));
        
        console.log('[useMultiplayerGame] Successfully advanced to next card');
      } catch (cardError) {
        console.error('[useMultiplayerGame] Failed to get next card:', cardError);
        // Handle end of game or other errors
        if (cardError instanceof Error && cardError.message.includes('No question card found')) {
          setGameState(prev => ({ ...prev, phase: 'completed' }));
        } else {
          setError(cardError instanceof Error ? cardError.message : 'Failed to get next card');
          setGameState(prev => ({ 
            ...prev, 
            hasAnswered: false, 
            lastAnswer: null,
            lastAnswerCorrectness: null,
            phase: 'card_active'
          }));
        }
      }
      
    } catch (err) {
      console.error('[useMultiplayerGame] Failed to submit answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setGameState(prev => ({ 
        ...prev, 
        hasAnswered: false, 
        lastAnswer: null,
        lastAnswerCorrectness: null,
        phase: 'card_active'
      }));
    } finally {
      submitInProgressRef.current = false;
    }
  }, [roundId, submitAnswerCall, gameState.hasAnswered, gameState.phase, clearGameTimer, nextCard, checkAllPlayersAnswered]);

  // Store handleSubmitAnswer in ref to prevent timer effect from recreating
  useEffect(() => {
    handleSubmitAnswerRef.current = handleSubmitAnswer;
  }, [handleSubmitAnswer]);

  // Timer management - optimized to reduce re-renders
  useEffect(() => {
    // Clear any existing timer first
    clearGameTimer();
    
    // Only start timer if we have an active card AND haven't answered yet
    if (gameState.phase !== 'card_active' || gameState.hasAnswered || !gameState.currentCard) {
      return;
    }
    
    console.log('[useMultiplayerGame] Starting NEW timer for card:', gameState.currentCard.lyric?.substring(0, 50));
    
    timerRef.current = setInterval(() => {
      const currentState = gameStateRef.current;
      if (!currentState) return;
      
      // CRITICAL: Double-check all conditions before making any changes
      if (currentState.phase !== 'card_active' || currentState.hasAnswered || !currentState.currentCard || submitInProgressRef.current) {
        return; // Don't modify if conditions changed or submission in progress
      }
      
      setGameState(prev => {
        const newTime = prev.timeRemaining - 1;
        
        if (newTime <= 0) {
          console.log('[useMultiplayerGame] Time expired - auto-submitting first option');
          
          // Auto-submit first option when time expires
          setTimeout(() => {
            if (!submitInProgressRef.current && gameStateRef.current?.phase === 'card_active' && handleSubmitAnswerRef.current) {
              handleSubmitAnswerRef.current(Answer.OptionOne);
            }
          }, 100);
          
          return { 
            ...prev, 
            timeRemaining: 0
          };
        }
        
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    // Cleanup function
    return clearGameTimer;
  }, [gameState.phase, gameState.hasAnswered, gameState.currentCard?.lyric]); // Removed volatile dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearGameTimer();
      submitInProgressRef.current = false;
    };
  }, [clearGameTimer]);

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
    canAnswer: gameState.phase === 'card_active' && !gameState.hasAnswered && !submitInProgressRef.current,
    myScore: gameState.myScore,
    correctAnswers: gameState.correctAnswers,
    totalAnswers: gameState.totalAnswers,
    isGameComplete: gameState.phase === 'completed',
    lastAnswerCorrectness: gameState.lastAnswerCorrectness,
    
    // Loading States
    isLoading: roundLoading || gameState.phase === 'loading_card',
    error: error || roundError,
  };
}; 