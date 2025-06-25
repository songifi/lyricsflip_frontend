import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoundQuery } from './useRoundQuery';
import { useStartRound } from './useStartRound';
import { RoundStatus, type RoundActivationResult } from '../types';

interface UseRoundActivationOptions {
  roundId: bigint | null;
}

interface UseRoundActivationReturn {
  // Round state
  round: any;
  playersCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Activation state
  isActive: boolean;
  isStarting: boolean;
  
  // Actions
  ensureActive: (roundId: bigint) => Promise<RoundActivationResult>;
  goToGame: (roundId: bigint) => void;
  queryRound: (roundId: bigint) => void;
}

export const useRoundActivation = ({ roundId }: UseRoundActivationOptions): UseRoundActivationReturn => {
  const router = useRouter();
  const redirectedRef = useRef(false);
  const isStartingRef = useRef(false); // Mutex to prevent race conditions
  
  // Wrap existing hooks
  const { round, playersCount, isLoading: isRoundLoading, error: roundError, queryRound } = useRoundQuery();
  const { startRound, isLoading: isStarting, error: startError } = useStartRound();
  
  // Computed state
  const isActive = useMemo(() => {
    if (!round?.state) return false;
    return Number(round.state) === RoundStatus.IN_PROGRESS;
  }, [round?.state]);
  
  const combinedError = roundError || startError;
  const combinedLoading = isRoundLoading || isStarting;
  
  // Navigation helper
  const goToGame = useCallback((targetRoundId: bigint) => {
    if (!redirectedRef.current) {
      redirectedRef.current = true;
      router.push(`/multiplayer?roundId=${targetRoundId}`);
    }
  }, [router]);
  
  // Core activation logic
  const ensureActive = useCallback(async (targetRoundId: bigint): Promise<RoundActivationResult> => {
    // Prevent concurrent start attempts
    if (isStartingRef.current) {
      throw new Error('Round start already in progress');
    }
    
    // First, query the latest round state
    queryRound(targetRoundId);
    
    // Small delay to let the query complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if round is already active
    if (round?.state && Number(round.state) === RoundStatus.IN_PROGRESS) {
      console.log('[useRoundActivation] Round is already active, skipping start');
      return 'alreadyActive';
    }
    
    // Guard against concurrent executions
    isStartingRef.current = true;
    
    try {
      console.log('[useRoundActivation] Starting round:', targetRoundId.toString());
      await startRound(targetRoundId);
      console.log('[useRoundActivation] Round started successfully');
      return 'started';
    } catch (error) {
      console.error('[useRoundActivation] Failed to start round:', error);
      throw error;
    } finally {
      isStartingRef.current = false;
    }
  }, [round?.state, queryRound, startRound]);
  
  // Query round on mount/roundId change - use useEffect to prevent re-render loops
  useEffect(() => {
    if (roundId) {
      queryRound(roundId);
    }
  }, [roundId]); // Remove queryRound from dependencies to prevent excessive re-renders
  
  return {
    // Round state (pass-through)
    round,
    playersCount,
    isLoading: combinedLoading,
    error: combinedError,
    
    // Activation state
    isActive,
    isStarting,
    
    // Actions
    ensureActive,
    goToGame,
    queryRound
  };
}; 