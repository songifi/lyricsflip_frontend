import { useState, useCallback } from 'react';
import { useSystemCalls } from '../useSystemCalls';
import { useDojoSDK, useModels } from '@dojoengine/sdk/react';
import { useAccount } from '@starknet-react/core';
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { RoundEventType } from '../events/types';
import { useRoundEventBus } from '../events/eventBus';
import { ModelsMapping } from '../typescript/models.gen';
import { validateRound } from '../utils/roundValidation';

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
  const { subscribe } = useRoundEventBus();
  
  // Subscribe to network models
  const roundModels = useModels(ModelsMapping.Rounds);

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
      // Execute the start transaction
      console.log('[useStartRound] Executing start transaction for round:', roundId.toString());
      await startRoundCall(roundId);
      
      // Since the contract call succeeded, we can proceed
      console.log('[useStartRound] Contract call successful, proceeding with UI update');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
      }));

      // Emit a local event to update UI
      subscribe({
        type: RoundEventType.ROUND,
        handler: (event) => {
          if (event.type === RoundEventType.ROUND && 
              event.roundId === roundId.toString()) {
            console.log('[useStartRound] Received round update:', event);
          }
        },
      });

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
  }, [account?.address, subscribe, startRoundCall]);

  return {
    ...state,
    startRound,
    reset,
  };
}; 