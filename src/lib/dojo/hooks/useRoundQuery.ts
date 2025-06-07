import { useState, useCallback } from 'react';
import { useDojoSDK, useModels } from '@dojoengine/sdk/react';
import { ModelsMapping, Rounds, RoundPlayer } from '../typescript/models.gen';
import { useAccount } from '@starknet-react/core';
import { BigNumberish } from 'starknet';
import { getEntityIdFromKeys } from "@dojoengine/utils";

interface RoundQueryState {
  round: Rounds | null;
  isPlayer: boolean;
  playersCount: number;
  isLoading: boolean;
  error: string | null;
}

interface UseRoundQueryReturn extends RoundQueryState {
  queryRound: (roundId: bigint) => Promise<void>;
}

export const useRoundQuery = (): UseRoundQueryReturn => {
  const { account } = useAccount();
  
  const [state, setState] = useState<RoundQueryState>({
    round: null,
    isPlayer: false,
    playersCount: 0,
    isLoading: false,
    error: null,
  });

  // Subscribe to round models for network queries (this fetches from blockchain)
  const roundModels = useModels(ModelsMapping.Rounds);
  const playerModels = useModels(ModelsMapping.RoundPlayer);

  const queryRound = useCallback(async (roundId: bigint) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use Dojo's entity ID calculation for network queries (matches how Torii stores data)
      const roundEntityId = getEntityIdFromKeys([roundId]);
      const roundIdHex = `0x${roundId.toString(16)}`;
      
      console.log('[useRoundQuery] Querying round from NETWORK:', { 
        roundId: roundId.toString(), 
        roundIdHex,
        roundEntityId
      });

      // Query from network models using Dojo's entity ID format
      let roundData: Rounds | undefined;
      
      if (roundModels) {
        // Primary: Use Dojo's entity ID (matches Torii storage)
        roundData = roundModels[roundEntityId] as Rounds | undefined;
        console.log('[useRoundQuery] Network query result:', { 
          found: !!roundData,
          entityId: roundEntityId 
        });
        
        // Fallback: Try hex format (for optimistic updates)
        if (!roundData) {
          roundData = roundModels[roundIdHex] as Rounds | undefined;
          console.log('[useRoundQuery] Fallback hex query result:', { 
            found: !!roundData,
            hexKey: roundIdHex 
          });
        }
      }

      // Check if current user is a player in this round
      let isPlayer = false;
      if (account?.address && playerModels) {
        // Use the same key format as useJoinRound
        const playerKey = `${account.address},${roundIdHex}`;
        const playerData = playerModels[playerKey] as RoundPlayer | undefined;
        
        isPlayer = playerData?.joined || false;
      }

      if (!roundData) {
        console.log('[useRoundQuery] Round not found in network models');
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Round not found. Please check the invite code and try again.' 
        }));
        return;
      }

      console.log('[useRoundQuery] Round found successfully:', {
        roundId: roundData.round_id?.toString(),
        state: roundData.round.state?.toString(),
        playersCount: roundData.round.players_count?.toString()
      });

      setState(prev => ({
        ...prev,
        round: roundData,
        isPlayer,
        playersCount: Number(BigInt(roundData.round.players_count.toString())),
        isLoading: false,
        error: null,
      }));

    } catch (error) {
      console.error('[useRoundQuery] Error fetching round:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch round data',
      }));
    }
  }, [roundModels, playerModels, account?.address]);

  return {
    ...state,
    queryRound,
  };
};