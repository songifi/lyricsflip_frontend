import { useState, useCallback } from 'react';
import { useSystemCalls } from '../useSystemCalls';
import { useAccount } from '@starknet-react/core';

interface GetRoundIdState {
  isLoading: boolean;
  error: string | null;
  roundId: bigint | null;
}

export const useGetRoundId = () => {
  const [state, setState] = useState<GetRoundIdState>({
    isLoading: false,
    error: null,
    roundId: null,
  });

  const { getRoundId } = useSystemCalls();
  const { account } = useAccount();

  const fetchRoundId = useCallback(async () => {
    if (!account?.address) {
      throw new Error('Account not available');
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const roundId = await getRoundId();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        roundId,
      }));
    } catch (error) {
      console.error('[useGetRoundId] Error fetching round ID:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch round ID',
      }));
      throw error;
    }
  }, [account?.address, getRoundId]);

  return {
    ...state,
    fetchRoundId,
  };
}; 