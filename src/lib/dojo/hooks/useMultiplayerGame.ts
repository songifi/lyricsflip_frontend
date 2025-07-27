import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSystemCalls, Answer } from '../useSystemCalls';
import { useRoundQuery } from './useRoundQuery';
import { useAccount } from '@starknet-react/core';
import type { QuestionCard, Round, RoundPlayer } from '../typescript/models.gen';
import { parseLyricsCard, parseQuestionCardOption } from '../useSystemCalls';
import type { LyricsCard } from '../typescript/models.gen';
import { useGameplaySubscriptions } from './useGameplaySubscriptions';
import { addAddressPadding } from 'starknet';

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
  
  // 🚀 NEW: Event subscription status
  isEventSubscribed: boolean;
  playerAnswerEvents: any[];
}

export const useMultiplayerGame = (roundId: bigint): UseMultiplayerGameResult => {
  const { account } = useAccount();
  const { nextCard, submitAnswer: submitAnswerCall, getPlayerProgress, getCardCount, checkAllPlayersAnswered, getLyricsCard } = useSystemCalls();
  
  // CRITICAL: Add refs to prevent excessive submissions and manage state
  const submitInProgressRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmissionTime = useRef<number>(0);
  const gameStateRef = useRef<GameState | null>(null);
  const handleSubmitAnswerRef = useRef<((answer: Answer) => Promise<void>) | null>(null);
  const roundQueryInitialized = useRef<boolean>(false);
  const getLyricsCardRef = useRef<typeof getLyricsCard | null>(null);
  
  // 🚀 NEW: Event subscription system
  const {
    subscribeToGameplay,
    unsubscribeFromGameplay,
    isSubscribed: isEventSubscribed,
    subscriptionError: eventSubscriptionError,
    events: playerAnswerEvents,
    latestEvent: latestPlayerAnswerEvent,
    roundWinnerEvents,
    latestRoundWinnerEvent
  } = useGameplaySubscriptions();
  
  // Store the subscription functions in refs to avoid dependency issues
  useEffect(() => {
    getLyricsCardRef.current = getLyricsCard;
  }, [getLyricsCard]);
  
  // Cleanup function to clear timer
  const clearGameTimer = useCallback(() => {
    if (timerRef.current) {
      console.log('[useMultiplayerGame] Clearing game timer');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
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

  // 🚀 NEW: Subscribe to gameplay events when round is active
  useEffect(() => {
    if (!roundId || !account?.address) {
      console.log('[useMultiplayerGame] Skipping event subscription - missing roundId or account');
      return;
    }

    const setupEventSubscriptions = async () => {
      try {
        console.log('[useMultiplayerGame] Setting up event subscriptions for round:', roundId.toString());
        console.log('[useMultiplayerGame] Account address:', account.address);
        
        await subscribeToGameplay(roundId, {
          onPlayerAnswer: (answerData) => {
            console.log('[useMultiplayerGame] 🎯 PlayerAnswer event received:', answerData);
            
            // Only process events for the current player (with address padding)
            const paddedEventPlayer = addAddressPadding(answerData.player);
            const paddedAccountAddress = addAddressPadding(account?.address || '');
            const isMatch = paddedEventPlayer === paddedAccountAddress;
            
            console.log('[useMultiplayerGame] Address comparison:', {
              eventPlayer: answerData.player,
              paddedEventPlayer,
              accountAddress: account?.address,
              paddedAccountAddress,
              isMatch
            });
            
            if (isMatch) {
              // Update correctness feedback
              setGameState(prev => ({
                ...prev,
                lastAnswerCorrectness: answerData.is_correct
              }));
              
              // Update scores based on correctness
              if (answerData.is_correct) {
                setGameState(prev => ({
                  ...prev,
                  correctAnswers: prev.correctAnswers + 1,
                  myScore: prev.myScore + 10 // Add points for correct answer
                }));
              }
              
              // Update total answers
              setGameState(prev => ({
                ...prev,
                totalAnswers: prev.totalAnswers + 1
              }));
              
              console.log('[useMultiplayerGame] ✅ Updated game state from PlayerAnswer event:', {
                isCorrect: answerData.is_correct,
                newScore: gameState.myScore + (answerData.is_correct ? 10 : 0),
                correctAnswers: gameState.correctAnswers + (answerData.is_correct ? 1 : 0),
                totalAnswers: gameState.totalAnswers + 1
              });
            }
          },
          onRoundWinner: (winnerData) => {
            console.log('[useMultiplayerGame] 🏆 RoundWinner event received:', winnerData);
            
            // Check if current player is the winner
            if (winnerData.winner === account?.address) {
              console.log('[useMultiplayerGame] 🎉 Current player is the winner!');
              // Could add special UI feedback here
            }
            
            // Mark game as completed
            setGameState(prev => ({ ...prev, phase: 'completed' }));
            clearGameTimer();
          }
        });
        
        console.log('[useMultiplayerGame] ✅ Event subscriptions set up successfully');
      } catch (error) {
        console.error('[useMultiplayerGame] ❌ Failed to set up event subscriptions:', error);
        setError('Failed to set up real-time game updates');
      }
    };

    setupEventSubscriptions();

    // Cleanup subscriptions when component unmounts or roundId changes
    return () => {
      console.log('[useMultiplayerGame] Cleaning up event subscriptions');
      unsubscribeFromGameplay();
    };
  }, [roundId, account?.address]); // Remove unstable function dependencies

  // 🚀 NEW: Check for game completion when all cards are answered
  useEffect(() => {
    if (!roundId || !account?.address) return;

    const checkGameCompletion = async () => {
      try {
        // Check if all players have answered all cards
        const allPlayersAnswered = await checkAllPlayersAnswered(roundId);
        
        if (allPlayersAnswered) {
          console.log('[useMultiplayerGame] 🏁 All players have answered all cards - game complete!');
          setGameState(prev => ({ ...prev, phase: 'completed' }));
          clearGameTimer(); // Ensure timer is cleared
        }
      } catch (error) {
        console.error('[useMultiplayerGame] Error checking game completion:', error);
      }
    };

    // Check completion when we receive a PlayerAnswer event
    if (latestPlayerAnswerEvent) {
      checkGameCompletion();
    }
  }, [roundId, account?.address, latestPlayerAnswerEvent]); // Remove unstable dependencies

  // Initialize round query - only once per roundId
  useEffect(() => {
    if (roundId && account?.address && !roundQueryInitialized.current) {
      queryRound(roundId);
      roundQueryInitialized.current = true;
      
      // Log initial setup (only once per roundId)
      console.log('[useMultiplayerGame] Initializing for round:', roundId.toString());
      console.log('[useMultiplayerGame] Account:', account?.address || 'Not connected');
    }
    
    // Reset flag when roundId changes
    return () => {
      if (roundQueryInitialized.current) {
        roundQueryInitialized.current = false;
      }
    };
  }, [roundId, account?.address]); // Remove queryRound from dependencies

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
  }, [round?.state]); // Remove clearGameTimer from dependencies

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

  // 🚀 UPDATED: Answer submission with event-based feedback
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
      
      // Submit answer - correctness will come from PlayerAnswer event
      await submitAnswerCall(roundId, answer);

      // Update state to show submission - correctness will be set by event
      setGameState(prev => ({ 
        ...prev, 
        hasAnswered: true, 
        lastAnswer: answer,
        lastAnswerCorrectness: null, // Will be updated by PlayerAnswer event
        phase: 'card_results'
      }));
      
      console.log('[useMultiplayerGame] ✅ Answer submitted, waiting for PlayerAnswer event...');
      
      // 🚀 NEW: Wait for PlayerAnswer event instead of auto-advancing
      // The event will trigger the callback and update correctness
      // We'll let the event system handle the next card progression
      
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
  }, [roundId, submitAnswerCall, gameState.hasAnswered, gameState.phase, clearGameTimer]);

  // 🚀 NEW: Auto-advance to next card after showing feedback
  useEffect(() => {
    if (gameState.lastAnswerCorrectness !== null && gameState.hasAnswered) {
      console.log('[useMultiplayerGame] 🎯 Showing feedback for:', gameState.lastAnswerCorrectness ? 'correct' : 'incorrect');
      
      // Show feedback for 2 seconds, then advance to next card
      const feedbackTimer = setTimeout(async () => {
        try {
          console.log('[useMultiplayerGame] 🚀 Advancing to next card after feedback...');
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
          
          console.log('[useMultiplayerGame] ✅ Successfully advanced to next card');
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
      }, 2000);
      
      return () => clearTimeout(feedbackTimer);
    }
  }, [gameState.lastAnswerCorrectness, gameState.hasAnswered, roundId]); // Remove nextCard from dependencies

  // Store handleSubmitAnswer in ref to prevent timer effect from recreating
  useEffect(() => {
    handleSubmitAnswerRef.current = handleSubmitAnswer;
  }, []); // Remove handleSubmitAnswer from dependencies to prevent re-renders

  // Timer management - optimized to reduce re-renders
  useEffect(() => {
    // Clear any existing timer first
    clearGameTimer();
    
    // Only start timer if we have an active card AND haven't answered yet
    if (gameState.phase !== 'card_active' || gameState.hasAnswered || !gameState.currentCard) {
      return;
    }
    
    const cardId = gameState.currentCard.lyric; // Use lyric as unique identifier
    console.log('[useMultiplayerGame] Starting NEW timer for card:', cardId?.substring(0, 50));
    
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
  }, [gameState.phase, gameState.hasAnswered, gameState.currentCard?.lyric]); // Remove clearGameTimer from dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearGameTimer();
      submitInProgressRef.current = false;
      unsubscribeFromGameplay(); // Ensure event subscriptions are cleaned up
    };
  }, []); // Empty dependency array for cleanup effect

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
    error: error || roundError || eventSubscriptionError,
    
    // 🚀 NEW: Event subscription status
    isEventSubscribed,
    playerAnswerEvents
  };
}; 