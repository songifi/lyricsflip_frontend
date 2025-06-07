import { useState, useCallback } from 'react';
import { useSystemCalls } from '../useSystemCalls';
import { useDojoSDK, useModels } from '@dojoengine/sdk/react';
import { validateRoundId, RoundValidationResult } from '../utils/roundValidation';
import { useAccount } from '@starknet-react/core';
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { RoundEventType, PlayerEvent, RoundJoinedEvent, RoundEvent } from '../events/types';
import { useRoundEventBus } from '../events/eventBus';
import { ModelsMapping } from '../typescript/models.gen';

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
  const { subscribe } = useRoundEventBus();
  
  // Subscribe to network models
  const roundModels = useModels(ModelsMapping.Rounds);
  const playerModels = useModels(ModelsMapping.RoundPlayer);

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

    // Subscribe to events
    const eventConfirmation = new Promise<void>((resolve, reject) => {
      const unsubscribe = subscribe({
        type: RoundEventType.ROUND_JOINED,
        handler: (event: RoundEvent | PlayerEvent | RoundJoinedEvent) => {
          console.log('[useJoinRound] Received ROUND_JOINED event:', event);
          
          if (event.type !== RoundEventType.ROUND_JOINED) return;
          const joinedEvent = event as RoundJoinedEvent;
          
          // Check if this is the event we're waiting for
          console.log('[useJoinRound] Checking ROUND_JOINED event:', {
            eventRoundId: joinedEvent.data.round_id.toString(),
            eventPlayer: joinedEvent.data.player,
            expectedRoundId: roundId.toString(),
            accountAddress: account.address
          });
          
          if (joinedEvent.data.round_id.toString() === roundId.toString() && 
              joinedEvent.data.player === account.address) {
            console.log('[useJoinRound] Matching ROUND_JOINED event found');
            unsubscribe();
            resolve();
          }
        }
      });
    });

    try {
      // 1. Execute the join transaction
      console.log('[useJoinRound] Executing join transaction');
      await joinRoundCall(roundId);
      
      // 2. Wait for event confirmation
      console.log('[useJoinRound] Waiting for event confirmation');
      await eventConfirmation;
      
      // 3. No manual verification loop - rely on subscription
      console.log('[useJoinRound] Event confirmed, join successful');
      
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
  }, [account?.address, state.validation, subscribe, roundModels, playerModels, joinRoundCall]);

  return {
    ...state,
    joinRound,
    reset,
    validateRoundId: validateRoundIdString,
  };
}; 