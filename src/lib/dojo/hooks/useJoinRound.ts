import { useState, useCallback } from 'react';
import { useSystemCalls } from '../useSystemCalls';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { Rounds } from '../typescript/models.gen';
import { BigNumberish } from 'starknet';
import { validateRound, validateRoundId, RoundValidationResult } from '../utils/roundValidation';
import { useAccount } from '@starknet-react/core';

interface JoinRoundState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  validation: RoundValidationResult | null;
}

interface UseJoinRoundReturn extends JoinRoundState {
  joinRound: (roundId: bigint) => Promise<void>;
  reset: () => void;
  validateRoundId: (roundId: string) => RoundValidationResult;
}

export const useJoinRound = (): UseJoinRoundReturn => {
  const [state, setState] = useState<JoinRoundState>({
    isLoading: false,
    error: null,
    isSuccess: false,
    validation: null,
  });

  const { joinRound: joinRoundCall } = useSystemCalls();
  const { useDojoStore } = useDojoSDK();
  const store = useDojoStore((state) => state);
  const { account } = useAccount();

  const reset = useCallback(() => {
    console.log('[useJoinRound] Resetting state');
    setState({
      isLoading: false,
      error: null,
      isSuccess: false,
      validation: null,
    });
  }, []);

  const validateRoundIdString = useCallback((roundId: string): RoundValidationResult => {
    console.log('[useJoinRound] Validating round ID:', { roundId });
    const result = validateRoundId(roundId);
    console.log('[useJoinRound] Validation result:', result);
    setState(prev => ({ ...prev, validation: result }));
    return result;
  }, []);

  const joinRound = useCallback(async (roundId: bigint) => {
    console.log('[useJoinRound] Starting join round process:', { 
      roundId: roundId.toString(),
      accountAddress: account?.address 
    });

    if (!account?.address) {
      const error = 'Account not available';
      console.error('[useJoinRound] Error:', error);
      throw new Error(error);
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null, isSuccess: false }));

    try {
      // Get round data from store
      const roundIdHex = `0x${roundId.toString(16)}`;
      console.log('[useJoinRound] Looking for round in store:', { roundIdHex });
      
      const round = store.entities[roundIdHex]?.models?.lyricsflip?.Rounds as Rounds | undefined;
      console.log('[useJoinRound] Found round data:', { 
        exists: !!round,
        roundId: roundIdHex,
        roundData: round ? {
          state: round.round.state.toString(),
          playersCount: round.round.players_count.toString(),
          wagerAmount: round.round.wager_amount.toString()
        } : null
      });
      
      // Validate round
      console.log('[useJoinRound] Validating round');
      const validationResult = validateRound(round);
      console.log('[useJoinRound] Round validation result:', validationResult);
      
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // Execute join transaction
      console.log('[useJoinRound] Executing join transaction');
      await joinRoundCall(roundId);
      console.log('[useJoinRound] Join transaction executed successfully');
      
      // Wait for store to update
      console.log('[useJoinRound] Waiting for store update');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify we're now a player
      const playerKey = `${account.address},${roundIdHex}`;
      console.log('[useJoinRound] Verifying player status:', { playerKey });
      
      const playerData = store.entities[playerKey]?.models?.lyricsflip?.RoundPlayer;
      console.log('[useJoinRound] Player data:', { 
        exists: !!playerData,
        joined: playerData?.joined,
        readyState: playerData?.ready_state
      });
      
      if (!playerData?.joined) {
        throw new Error('Failed to verify join status');
      }
      
      console.log('[useJoinRound] Join process completed successfully');
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
        validation: { isValid: true },
      }));

    } catch (error) {
      console.error('[useJoinRound] Error in join process:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to join round',
        validation: { isValid: false, error: error instanceof Error ? error.message : 'Failed to join round' },
      }));
      throw error;
    }
  }, [joinRoundCall, store, account?.address]);

  return {
    ...state,
    joinRound,
    reset,
    validateRoundId: validateRoundIdString,
  };
}; 