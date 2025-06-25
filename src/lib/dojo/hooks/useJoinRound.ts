import { useState, useCallback } from 'react';
import { useSystemCalls } from '../useSystemCalls';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { validateRoundId, RoundValidationResult } from '../utils/roundValidation';
import { useAccount } from '@starknet-react/core';
import { getEntityIdFromKeys } from "@dojoengine/utils";

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
  const { account } = useAccount();
  const { useDojoStore } = useDojoSDK();
  const dojoState = useDojoStore((state) => state);

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
    console.log('[useJoinRound] Validating round ID string format:', { roundId });
    const result = validateRoundId(roundId);
    console.log('[useJoinRound] String format validation result:', result);
    setState(prev => ({
      ...prev,
      validation: result,
      error: result.isValid ? null : (result.error || 'Invalid code format'),
    }));
    return result;
  }, []);

  const joinRound = useCallback(async (roundId: bigint) => {
    if (!account?.address) {
      throw new Error('Account not available');
    }

    console.log('[useJoinRound] Starting join round process:', {
      roundId: roundId.toString(),
      accountAddress: account.address
    });

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Execute the join transaction - the useSystemCalls hook now handles
      // all optimistic updates and state waiting automatically
      console.log('[useJoinRound] Executing join transaction');
      await joinRoundCall(roundId.toString());
      
      console.log('[useJoinRound] Join successful - SDK handled state updates automatically');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
        validation: { isValid: true },
      }));

    } catch (error) {
      console.error('[useJoinRound] Error during join process:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to join round',
        isSuccess: false,
      }));
      throw error;
    }
  }, [account?.address, joinRoundCall]);

  return {
    ...state,
    joinRound,
    reset,
    validateRoundId: validateRoundIdString,
  };
}; 