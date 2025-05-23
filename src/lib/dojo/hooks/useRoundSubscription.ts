import { useEffect, useState, useRef, useCallback } from 'react';
import { useDojoSDK, useModels } from '@dojoengine/sdk/react';
import { ModelsMapping, Rounds, RoundPlayer } from '../typescript/models.gen';
import { useAccount } from '@starknet-react/core';

interface RoundSubscriptionState {
  round: Rounds | null;
  isPlayer: boolean;
  isReady: boolean;
  playersCount: number;
  error: string | null;
  isLoading: boolean;
}

export const useRoundSubscription = (roundId: bigint | null) => {
  const { account } = useAccount();
  const { useDojoStore } = useDojoSDK();
  const isSubscribed = useRef(false);
  const lastProcessedData = useRef<string | null>(null);
  const isUpdating = useRef(false);
  
  const [state, setState] = useState<RoundSubscriptionState>({
    round: null,
    isPlayer: false,
    isReady: false,
    playersCount: 0,
    error: null,
    isLoading: false,
  });

  // Get store state
  const entities = useDojoStore((state) => state.entities);

  // Subscribe to round models
  const roundModels = useModels(ModelsMapping.Rounds);

  // Update subscription state when roundId or account changes
  useEffect(() => {
    if (!roundId || !account?.address) {
      isSubscribed.current = false;
      setState(prev => ({ ...prev, error: null, isLoading: false }));
      return;
    }
    isSubscribed.current = true;
  }, [roundId, account?.address]);

  // Memoize the update function to prevent unnecessary re-renders
  const updateRoundData = useCallback(() => {
    if (!roundId || !account?.address || !isSubscribed.current || isUpdating.current) {
      return;
    }

    isUpdating.current = true;

    try {
    const roundIdHex = `0x${roundId.toString(16)}`;

    // Get round data from store
    const roundEntity = entities[roundIdHex];
    let roundData = roundEntity?.models?.lyricsflip?.Rounds as Rounds | undefined;

    // If round data doesn't exist in store, try to get it from models
    if (!roundData && roundModels) {
      roundData = roundModels[roundIdHex] as Rounds | undefined;
    }

      // Create a data hash to check for actual changes
      const dataHash = JSON.stringify({
        roundData,
        playerData: entities[`${account.address},${roundIdHex}`]?.models?.lyricsflip?.RoundPlayer
      });

      // Skip if we've already processed this data
      if (dataHash === lastProcessedData.current) {
        return;
      }

    // If round data still doesn't exist, show loading state
    if (!roundData) {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: 'Waiting for round data...'
      }));
      return;
    }

    const playerKey = `${account.address},${roundIdHex}`;
    const playerEntity = entities[playerKey];
    const playerData = playerEntity?.models?.lyricsflip?.RoundPlayer as RoundPlayer | undefined;

      // Update the last processed data
      lastProcessedData.current = dataHash;

    setState(prev => ({
      ...prev,
      round: roundData,
      isPlayer: playerData?.joined || false,
      isReady: playerData?.ready_state || false,
      playersCount: Number(roundData.round.players_count),
      error: null,
      isLoading: false,
    }));
    } finally {
      isUpdating.current = false;
    }
  }, [roundId, account?.address, entities, roundModels]);

  // Update round data when entities or models change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateRoundData();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [updateRoundData]);

  return {
    ...state,
    isSubscribed: isSubscribed.current,
    refresh: updateRoundData,
  };
}; 