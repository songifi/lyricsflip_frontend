import { useState, useCallback } from 'react';
import { useSystemCalls } from '../useSystemCalls';
import { useDojoSDK, useModels } from '@dojoengine/sdk/react';
import { useAccount } from '@starknet-react/core';
import { CairoCustomEnum } from 'starknet';
import { ModelsMapping } from '../typescript/models.gen';

interface AddLyricsCardState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export const useAddLyricsCard = () => {
  const [state, setState] = useState<AddLyricsCardState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const { addLyricsCard } = useSystemCalls();
  const { account } = useAccount();
  
  // Subscribe to network models
  const lyricModels = useModels(ModelsMapping.LyricsCard);

  const addCard = useCallback(async (
    genre: CairoCustomEnum,
    artist: string,
    title: string,
    year: number,
    lyrics: string
  ) => {
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
      await addLyricsCard(genre, artist, title, year, lyrics);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isSuccess: true,
      }));
    } catch (error) {
      console.error('[useAddLyricsCard] Error adding card:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to add card',
        isSuccess: false,
      }));
      throw error;
    }
  }, [account?.address, addLyricsCard]);

  return {
    ...state,
    addCard,
  };
}; 