import { useState, useCallback, useEffect } from 'react';
import { useSystemCalls } from '../useSystemCalls';
import { useAccount } from '@starknet-react/core';

interface IsRoundPlayerState {
  isLoading: boolean;
  error: string | null;
  isPlayer: boolean;
}

export const useIsRoundPlayer = (roundId: number) => {
  const [state, setState] = useState<IsRoundPlayerState>({
    isLoading: false,
    error: null,
    isPlayer: false,
  });

  const { isRoundPlayer } = useSystemCalls();
  const { account } = useAccount();

  const checkPlayerStatus = useCallback(async () => {
    if (!account?.address) {
      throw new Error('Account not available');
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const isPlayer = await isRoundPlayer(BigInt(roundId), account.address);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isPlayer,
      }));
    } catch (error) {
      console.error('[useIsRoundPlayer] Error checking player status:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check player status',
      }));
      throw error;
    }
  }, [account?.address, isRoundPlayer, roundId]);

  useEffect(() => {
    if (roundId) {
      checkPlayerStatus();
    }
  }, [roundId, checkPlayerStatus]);

  return {
    ...state,
    checkPlayerStatus,
  };
}; 