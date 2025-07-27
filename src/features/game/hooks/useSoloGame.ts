import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from '@starknet-react/core';
import { useSystemCalls, GameMode, Answer } from '@/lib/dojo/useSystemCalls';
import { useGameStore, stopGameTimer } from '@/store/game';
import { LyricData, SongOption } from '@/store';
import { QuestionCard } from '@/lib/dojo/typescript/models.gen';
import { parseQuestionCardOption } from '@/lib/dojo/useSystemCalls';
import { useGameplaySubscriptions } from '@/lib/dojo/hooks/useGameplaySubscriptions';

interface SoloGameState {
  roundId: bigint | null;
  currentCard: QuestionCard | null;
  isGameStarted: boolean;
  isGameComplete: boolean;
  currentRound: number;
  totalRounds: number;
  score: number;
  timeRemaining: number;
  isLoading: boolean;
  error: string | null;
  lastAnswerCorrectness: boolean | null;
}

export const useSoloGame = (genre: string) => {
  const { account } = useAccount();
  const { createRound, nextCard, submitAnswer, getPlayerProgress, joinRound, startRound, clearTransactionQueue } = useSystemCalls();
  const gameStore = useGameStore();
  
  // Event subscription system
  const {
    subscribeToGameplay,
    unsubscribeFromGameplay,
    isSubscribed: isEventSubscribed,
    subscriptionError: eventSubscriptionError,
    events: playerAnswerEvents,
    latestEvent: latestPlayerAnswerEvent,
  } = useGameplaySubscriptions();
  
  const [gameState, setGameState] = useState<SoloGameState>({
    roundId: null,
    currentCard: null,
    isGameStarted: false,
    isGameComplete: false,
    currentRound: 0,
    totalRounds: gameStore.maxRounds,
    score: 0,
    timeRemaining: gameStore.timeLeft,
    isLoading: false,
    error: null,
    lastAnswerCorrectness: null,
  });

  const [selectedOption, setSelectedOption] = useState<SongOption | null>(null);
  const [correctOption, setCorrectOption] = useState<SongOption | null>(null);
  const [gameResult, setGameResult] = useState<{ won: boolean; score: number; totalRounds: number } | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cardStartTimeRef = useRef<number>(0);
  const submitInProgressRef = useRef<boolean>(false);
  const nextCardInProgressRef = useRef<boolean>(false);
  const lastProcessedEventRef = useRef<string | null>(null);
  const scheduledNextCardRef = useRef<boolean>(false);
  const processingEventRef = useRef<boolean>(false);
  const initialCardLoadedRef = useRef<boolean>(false);
  const eventSubscriptionSetupRef = useRef<string | null>(null);
  const currentCardRef = useRef<QuestionCard | null>(null);

  const getNextCardWithRoundId = async (roundId: bigint) => {
    if (nextCardInProgressRef.current) {
      console.log('[useSoloGame] Skipping getNextCardWithRoundId - already in progress');
      return;
    }

    try {
      nextCardInProgressRef.current = true;
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      console.log('[useSoloGame] Getting next card for round:', roundId.toString());
      
      // DEBUG: Check round state before attempting to start
      console.log('[useSoloGame] 🔍 DEBUG: About to check round state before startRound call');
      console.log('[useSoloGame] 🔍 DEBUG: Round ID:', roundId.toString());
      console.log('[useSoloGame] 🔍 DEBUG: Account address:', account?.address);
      
      // REMOVED: startRound call since the round is already in the correct state
      // The round is created in "STARTED" state, not "PENDING" state
      // So we don't need to call startRound for existing rounds
      console.log('[useSoloGame] 🔍 DEBUG: Skipping startRound call - round is already in correct state');
      
      console.log('[useSoloGame] 🔍 DEBUG: About to call nextCard with roundId:', roundId.toString());
      const card = await nextCard(roundId);
      
      console.log('[useSoloGame] Received card:', card);
      
      setGameState(prev => ({
        ...prev,
        currentCard: card,
        currentRound: prev.currentRound + 1,
        isLoading: false,
      }));

      // Update the ref with the current card
      currentCardRef.current = card;

      // Mark that the initial card has been loaded
      initialCardLoadedRef.current = true;
      console.log('[useSoloGame] ✅ Initial card loaded flag set to true');

      // Reset selection states
      setSelectedOption(null);
      setCorrectOption(null);
      setIsCardFlipped(!isCardFlipped);
      
      // Start timer for this card
      startCardTimer();
    } catch (error) {
      console.error('[useSoloGame] Error getting next card:', error);
      setGameState(prev => ({ ...prev, isLoading: false, error: 'Failed to get next card' }));
    } finally {
      nextCardInProgressRef.current = false;
    }
  };

  // Initialize solo game when component mounts
  useEffect(() => {
    const initializeGame = async () => {
      if (genre && gameStore.gameStatus === 'playing' && account?.address) {
        // Check if we already have a roundId from the game store
        if (gameStore.roundId) {
          console.log('[useSoloGame] Using existing roundId from game store:', gameStore.roundId.toString());
          
          // For solo games, the creator is automatically a participant - no need to join
          setGameState(prev => ({
            ...prev,
            roundId: gameStore.roundId,
            isGameStarted: true,
          }));
          
          // For existing rounds, just proceed to get the first card
          console.log('[useSoloGame] Using existing round, proceeding to get first card');
          
          // Start the game by getting the first card with the roundId from store
          getNextCardWithRoundId(gameStore.roundId);
        } else {
          // No roundId exists, initialize a new solo game
          initializeSoloGame();
        }
      }
    };

    initializeGame();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopGameTimer();
    };
  }, [genre, gameStore.gameStatus, account?.address, gameStore.roundId]);

  // Effect to set up event subscriptions when roundId is available
  useEffect(() => {
    console.log('[useSoloGame] useEffect triggered - roundId:', gameState.roundId, 'account:', account?.address);
    
    if (!gameState.roundId || !account?.address) {
      console.log('[useSoloGame] Skipping - missing roundId or account');
      return;
    }

    // Prevent duplicate subscription setup for the same round
    const subscriptionKey = `${gameState.roundId}-${account.address}`;
    console.log('[useSoloGame] Checking subscription key:', subscriptionKey, 'current:', eventSubscriptionSetupRef.current);
    
    if (eventSubscriptionSetupRef.current === subscriptionKey) {
      console.log('[useSoloGame] Event subscriptions already set up for round:', gameState.roundId.toString());
      return;
    }

    const setupEventSubscriptions = async () => {
      try {
        console.log('[useSoloGame] Setting up event subscriptions for round:', gameState.roundId!.toString());
        
        await subscribeToGameplay(gameState.roundId!, {
          onPlayerAnswer: (answerData) => {
            console.log('[useSoloGame] 🎯 PlayerAnswer event received:', answerData);
            console.log('[useSoloGame] Event handler called - processingEvent:', processingEventRef.current, 'scheduledNextCard:', scheduledNextCardRef.current);
            
            // Prevent concurrent event processing
            if (processingEventRef.current) {
              console.log('[useSoloGame] ⚠️ Skipping event - already processing another event');
              return;
            }
            
            processingEventRef.current = true;
            
            try {
              // Create a unique identifier for this event to prevent duplicate processing
              const eventId = `${answerData.round_id}-${answerData.card_id}-${answerData.player}`;
              
              // Check if we've already processed this event
              if (lastProcessedEventRef.current === eventId) {
                console.log('[useSoloGame] ⚠️ Skipping duplicate event:', eventId);
                return;
              }
              
              // Mark this event as processed
              lastProcessedEventRef.current = eventId;
              
              // Update correctness feedback
              setGameState(prev => ({
                ...prev,
                lastAnswerCorrectness: answerData.is_correct
              }));
              
              // Update scores based on correctness
              if (answerData.is_correct) {
                setGameState(prev => ({
                  ...prev,
                  score: prev.score + 1
                }));
                gameStore.increaseScore();
                gameStore.setGuessResult('correct');
              } else {
                gameStore.setGuessResult('incorrect');
              }
              
              console.log('[useSoloGame] ✅ Updated game state from PlayerAnswer event:', {
                isCorrect: answerData.is_correct,
                newScore: gameState.score + (answerData.is_correct ? 1 : 0)
              });
              
              // Check if game is complete
              const newScore = gameState.score + (answerData.is_correct ? 1 : 0);
              console.log('[useSoloGame] Checking game completion - newScore:', newScore, 'totalRounds:', gameState.totalRounds);
              
              if (newScore >= gameState.totalRounds) {
                console.log('[useSoloGame] 🎉 Game complete! Ending game with win');
                setTimeout(() => endGame(true), 2000);
                return;
              }
              
              // Check if too many wrong attempts
              const wrongAttempts = gameState.currentRound - newScore;
              console.log('[useSoloGame] Checking wrong attempts - wrongAttempts:', wrongAttempts, 'odds:', gameStore.gameConfig.odds);
              
              if (wrongAttempts >= gameStore.gameConfig.odds) {
                console.log('[useSoloGame] 💀 Too many wrong attempts! Ending game with loss');
                setTimeout(() => endGame(false), 2000);
                return;
              }
              
              // Move to next round after delay - only if not already scheduled or in progress
              // Also ensure we're not in the initial game setup phase and have a current card
              console.log('[useSoloGame] Checking conditions for next card:', {
                scheduledNextCard: scheduledNextCardRef.current,
                nextCardInProgress: nextCardInProgressRef.current,
                isGameStarted: gameState.isGameStarted,
                hasCurrentCard: !!currentCardRef.current,
                initialCardLoaded: initialCardLoadedRef.current,
                currentRound: gameState.currentRound,
                totalRounds: gameState.totalRounds
              });
              
              if (!scheduledNextCardRef.current && !nextCardInProgressRef.current && gameState.isGameStarted && currentCardRef.current && initialCardLoadedRef.current) {
                console.log('[useSoloGame] ✅ All conditions met, scheduling next card');
                scheduledNextCardRef.current = true;
                setTimeout(() => {
                  console.log('[useSoloGame] Timeout fired - checking if we should get next card');
                                  if (gameState.currentRound < gameState.totalRounds && !nextCardInProgressRef.current) {
                  console.log('[useSoloGame] Calling getNextCard from event handler timeout');
                  // Clear the transaction queue immediately and get next card
                  clearTransactionQueue();
                  nextCardInProgressRef.current = false;
                  // Add a small delay to ensure the transaction queue is properly cleared
                  setTimeout(() => {
                    getNextCard();
                  }, 100);
                } else {
                  console.log('[useSoloGame] Skipping getNextCard - conditions not met');
                }
                  scheduledNextCardRef.current = false;
                }, 2000);
              } else {
                console.log('[useSoloGame] ❌ Conditions not met for next card');
              }
            } finally {
              processingEventRef.current = false;
            }
          }
        });
        
        // Mark that we've set up subscriptions for this round
        eventSubscriptionSetupRef.current = subscriptionKey;
        
        console.log('[useSoloGame] ✅ Event subscriptions set up successfully');
      } catch (error) {
        console.error('[useSoloGame] ❌ Failed to set up event subscriptions:', error);
        setGameState(prev => ({ ...prev, error: 'Failed to set up real-time game updates' }));
      }
    };

    setupEventSubscriptions();

    // Cleanup subscriptions when component unmounts or roundId changes
    return () => {
      console.log('[useSoloGame] Cleaning up event subscriptions');
      unsubscribeFromGameplay();
      // Reset processed event tracking
      lastProcessedEventRef.current = null;
      scheduledNextCardRef.current = false;
      processingEventRef.current = false;
      // Don't reset initialCardLoaded - it should persist for the game session
      eventSubscriptionSetupRef.current = null;
    };
  }, [gameState.roundId, account?.address]);

  // Monitor timeLeft and end game
  useEffect(() => {
    if (gameStore.timeLeft <= 0 && gameState.isGameStarted && !gameResult) {
      endGame(false);
    }
  }, [gameStore.timeLeft, gameState.isGameStarted, gameResult]);

  const initializeSoloGame = async () => {
    if (!account?.address) {
      setGameState(prev => ({ ...prev, error: 'Account not available' }));
      return;
    }

    setGameState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('[useSoloGame] 🔍 DEBUG: Initializing solo game for genre:', genre);
      console.log('[useSoloGame] 🔍 DEBUG: Account address:', account.address);
      
      // Create a solo round - the creator is automatically a participant
      console.log('[useSoloGame] 🔍 DEBUG: About to call createRound with GameMode.Solo');
      const roundId = await createRound(GameMode.Solo);
      
      console.log('[useSoloGame] 🔍 DEBUG: Solo round created with ID:', roundId.toString());
      console.log('[useSoloGame] 🔍 DEBUG: Round ID type:', typeof roundId);
      
      // For solo games, we need to join the round first (even though we're the creator)
      console.log('[useSoloGame] 🔍 DEBUG: About to join the solo round...');
      await joinRound(roundId.toString());
      console.log('[useSoloGame] 🔍 DEBUG: Successfully joined the solo round');
      
      // REMOVED: startRound call since the round is already created in the correct state
      // The round is created in "STARTED" state, not "PENDING" state
      console.log('[useSoloGame] 🔍 DEBUG: Skipping startRound call - round is already in correct state');
      
      setGameState(prev => ({
        ...prev,
        roundId,
        isGameStarted: true,
        isLoading: false,
      }));

      // Wait a bit for the round to be fully initialized before getting the first card
      // This helps prevent race conditions with event subscriptions
      setTimeout(async () => {
        if (roundId && !nextCardInProgressRef.current) {
          console.log('[useSoloGame] 🔍 DEBUG: Getting first card after round initialization...');
          await getNextCard();
        }
      }, 2000); // Increased wait time to ensure round is fully initialized
      
    } catch (error) {
      console.error('[useSoloGame] 🔍 DEBUG: Failed to initialize solo game:', error);
      console.log('[useSoloGame] 🔍 DEBUG: Error details:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        genre: genre,
        accountAddress: account.address
      });
      setGameState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start solo game',
        isLoading: false,
      }));
    }
  };

  const getNextCard = async () => {
    console.log('[useSoloGame] getNextCard called - roundId:', gameState.roundId, 'nextCardInProgress:', nextCardInProgressRef.current);
    
    if (!gameState.roundId || nextCardInProgressRef.current) {
      console.log('[useSoloGame] Skipping getNextCard - no roundId or already in progress');
      return;
    }

    try {
      nextCardInProgressRef.current = true;
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      console.log('[useSoloGame] Getting next card for round:', gameState.roundId.toString());
      
      const card = await nextCard(gameState.roundId);
      
      console.log('[useSoloGame] Received card:', card);
      
      setGameState(prev => ({
        ...prev,
        currentCard: card,
        currentRound: prev.currentRound + 1,
        isLoading: false,
      }));

      // Reset selection states
      setSelectedOption(null);
      setCorrectOption(null);
      setIsCardFlipped(!isCardFlipped);
      
      // Start timer for this card
      startCardTimer();
    } catch (error) {
      console.error('[useSoloGame] Error getting next card:', error);
      setGameState(prev => ({ ...prev, isLoading: false, error: 'Failed to get next card' }));
    } finally {
      nextCardInProgressRef.current = false;
    }
  };

  const startCardTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - 1);
        
        if (newTimeRemaining <= 0) {
          // Time's up - auto-submit or end game
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return { ...prev, timeRemaining: 0 };
        }
        
        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);
  };

  const handleSongSelect = async (option: SongOption) => {
    if (!gameState.currentCard || selectedOption || gameResult || !gameState.roundId || submitInProgressRef.current) {
      return;
    }

    setSelectedOption(option);
    setCorrectOption({
      title: option.title,
      artist: option.artist,
    });

    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      submitInProgressRef.current = true;
      
      // Convert option to Answer enum
      const options = [
        parseQuestionCardOption(gameState.currentCard.option_one),
        parseQuestionCardOption(gameState.currentCard.option_two),
        parseQuestionCardOption(gameState.currentCard.option_three),
        parseQuestionCardOption(gameState.currentCard.option_four),
      ];

      const answerIndex = options.findIndex(
        opt => opt.title === option.title && opt.artist === option.artist
      );

      if (answerIndex === -1) {
        throw new Error('Selected option not found in card options');
      }

      const answer = answerIndex as Answer;
      
      console.log('[useSoloGame] Submitting answer:', answer, 'for round:', gameState.roundId.toString());
      
      // Submit answer to contract - correctness will come from PlayerAnswer event
      await submitAnswer(gameState.roundId, answer);
      
      console.log('[useSoloGame] ✅ Answer submitted, waiting for PlayerAnswer event...');
      
      // The PlayerAnswer event will handle score updates and next card progression
      
    } catch (error) {
      console.error('[useSoloGame] Failed to submit answer:', error);
      setGameState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit answer',
      }));
      
      // Reset selection states on error
      setSelectedOption(null);
      setCorrectOption(null);
    } finally {
      submitInProgressRef.current = false;
    }
  };

  const endGame = (didWin: boolean) => {
    if (gameResult) return; // Ensure called only once
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setGameResult({
      won: didWin,
      score: gameState.score,
      totalRounds: gameState.totalRounds,
    });
    
    setGameState(prev => ({
      ...prev,
      isGameComplete: true,
    }));
    
    gameStore.endGame();
    stopGameTimer();
  };

  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    gameStore.resetGame();
    gameStore.setRoundId(null); // Clear the roundId
    setGameState({
      roundId: null,
      currentCard: null,
      isGameStarted: false,
      isGameComplete: false,
      currentRound: 0,
      totalRounds: gameStore.maxRounds,
      score: 0,
      timeRemaining: gameStore.timeLeft,
      isLoading: false,
      error: null,
      lastAnswerCorrectness: null,
    });
    setSelectedOption(null);
    setCorrectOption(null);
    setGameResult(null);
    setIsCardFlipped(false);
    
    // Reset all refs
    initialCardLoadedRef.current = false;
    lastProcessedEventRef.current = null;
    scheduledNextCardRef.current = false;
    processingEventRef.current = false;
    nextCardInProgressRef.current = false;
    submitInProgressRef.current = false;
    eventSubscriptionSetupRef.current = null;
    currentCardRef.current = null;
  };

  // Convert QuestionCard to LyricData format for UI compatibility
  const currentLyric: LyricData | null = gameState.currentCard ? {
    text: gameState.currentCard.lyric,
    title: parseQuestionCardOption(gameState.currentCard.option_one).title,
    artist: parseQuestionCardOption(gameState.currentCard.option_one).artist,
    options: [
      parseQuestionCardOption(gameState.currentCard.option_one),
      parseQuestionCardOption(gameState.currentCard.option_two),
      parseQuestionCardOption(gameState.currentCard.option_three),
      parseQuestionCardOption(gameState.currentCard.option_four),
    ],
  } : null;

  return {
    currentLyric,
    isGameStarted: gameState.isGameStarted,
    selectedOption,
    correctOption,
    handleSongSelect,
    gameResult,
    resetGame,
    isCardFlipped,
    isLoading: gameState.isLoading,
    error: gameState.error || eventSubscriptionError,
    score: gameState.score,
    currentRound: gameState.currentRound,
    totalRounds: gameState.totalRounds,
    timeRemaining: gameState.timeRemaining,
    lastAnswerCorrectness: gameState.lastAnswerCorrectness,
    isEventSubscribed,
  };
}; 