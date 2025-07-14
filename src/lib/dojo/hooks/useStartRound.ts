import { useState, useCallback } from 'react';
import { useSystemCalls } from '../useSystemCalls';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { useAccount } from '@starknet-react/core';

interface StartRoundState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

interface UseStartRoundReturn {
  startRound: (roundId: bigint) => Promise<void>;
  reset: () => void;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const useStartRound = (): UseStartRoundReturn => {
  const [state, setState] = useState<StartRoundState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const { startRound: startRoundCall } = useSystemCalls();
  const { account } = useAccount();

  const reset = useCallback(() => {
    console.log('[useStartRound] Resetting state');
    setState({
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  const startRound = useCallback(async (roundId: bigint) => {
    if (!account?.address) {
      throw new Error('Account not available');
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isSuccess: false,
    }));

    try {
      // Execute the start transaction - the useSystemCalls hook now handles
      // all optimistic updates and state waiting automatically
      console.log('[useStartRound] Executing start transaction for round:', roundId.toString());
      await startRoundCall(roundId);
      
      console.log('[useStartRound] Start successful - SDK handled state updates automatically');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
      }));

    } catch (error) {
      console.error('[useStartRound] Error during start process:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start round',
        isSuccess: false,
      }));
      throw error;
    }
  }, [account?.address, startRoundCall]);

  return {
    ...state,
    startRound,
    reset,
  };
}; 