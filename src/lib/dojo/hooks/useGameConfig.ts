import { useState, useCallback } from 'react';
import { useSystemCalls } from '../useSystemCalls';
import { useAccount } from '@starknet-react/core';

interface GameConfigState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const useGameConfig = () => {
  const [state, setState] = useState<GameConfigState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const { client } = useSystemCalls();
  const { account } = useAccount();

  const setAdminAddress = useCallback(async (adminAddress: string) => {
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
      await client.game_config.setAdminAddress(account, adminAddress);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
      }));
    } catch (error) {
      console.error('[useGameConfig] Error setting admin address:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to set admin address',
        isSuccess: false,
      }));
      throw error;
    }
  }, [account?.address, client.game_config]);

  const setCardsPerRound = useCallback(async (cardsPerRound: number) => {
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
      await client.game_config.setCardsPerRound(account, cardsPerRound);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
      }));
    } catch (error) {
      console.error('[useGameConfig] Error setting cards per round:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to set cards per round',
        isSuccess: false,
      }));
      throw error;
    }
  }, [account?.address, client.game_config]);

  const setGameConfig = useCallback(async (adminAddress: string) => {
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
      await client.game_config.setGameConfig(account, adminAddress);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
      }));
    } catch (error) {
      console.error('[useGameConfig] Error setting game config:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to set game config',
        isSuccess: false,
      }));
      throw error;
    }
  }, [account?.address, client.game_config]);

  return {
    ...state,
    setAdminAddress,
    setCardsPerRound,
    setGameConfig,
  };
}; 