import { useState, useCallback, useEffect } from 'react';
import { useDojoSDK, useModels } from '@dojoengine/sdk/react';
import { ModelsMapping, Rounds, RoundPlayer } from '../typescript/models.gen';
import { useAccount } from '@starknet-react/core';

interface RoundQueryState {
  round: Rounds | null;
  isPlayer: boolean;
  playersCount: number;
  isLoading: boolean;
  error: string | null;
}

interface UseRoundQueryReturn extends RoundQueryState {
  queryRound: (roundId: bigint) => void;
}

// Helper function to safely stringify objects with BigInt values
const safeStringify = (obj: any) => {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
};

export const useRoundQuery = (): UseRoundQueryReturn => {
  const { account } = useAccount();
  const rounds = useModels(ModelsMapping.Rounds);
  const players = useModels(ModelsMapping.RoundPlayer);
  
  const [state, setState] = useState<RoundQueryState>({
    round: null,
    isPlayer: false,
    playersCount: 0,
    isLoading: false,
    error: null,
  });

  const queryRound = useCallback((roundId: bigint) => {
    console.log('[useRoundQuery] Querying round:', roundId.toString());
    console.log('[useRoundQuery] Available rounds:', safeStringify(rounds));
    console.log('[useRoundQuery] Available players:', safeStringify(players));
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Debug the structure of rounds
    console.log('[useRoundQuery] Rounds structure:', {
      isArray: Array.isArray(rounds),
      keys: Object.keys(rounds),
      firstKey: Object.keys(rounds)[0],
      firstValue: rounds[Object.keys(rounds)[0]]
    });

    // Find the matching round - handle the array structure
    const roundData = Object.entries(rounds[0] || {}).find(([key, value]) => {
      console.log('[useRoundQuery] Checking round:', { key, value: safeStringify(value) });
      return value?.round_id?.toString() === roundId.toString();
    })?.[1] as Rounds | undefined;

    console.log('[useRoundQuery] Found round data:', safeStringify(roundData));

    // Check if player is in the round - handle the array structure
    const isPlayerInRound = account?.address ? (
      Object.entries(players[0] || {}).some(
        ([key, player]) => {
          console.log('[useRoundQuery] Checking player:', { 
            key, 
            player: safeStringify(player),
            accountAddress: account.address,
            playerAddress: player?.player_to_round_id?.[0],
            roundId: roundId.toString(),
            playerRoundId: player?.player_to_round_id?.[1]?.toString()
          });
          const isPlayerInRound = player?.player_to_round_id?.[0]?.toLowerCase() === account.address.toLowerCase() && 
                                player?.player_to_round_id?.[1]?.toString() === roundId.toString();
          console.log('[useRoundQuery] Is player in round:', isPlayerInRound);
          return isPlayerInRound;
        }
      )
    ) : false;

    // If player is in round but round data isn't available yet, set a polling interval
    if (isPlayerInRound && !roundData) {
      console.log('[useRoundQuery] Player is in round but round data not available yet, setting up polling');
      const pollInterval = setInterval(() => {
        console.log('[useRoundQuery] Polling for round data...');
        queryRound(roundId);
      }, 10000); // Poll every second

      // Clear interval after 10 seconds to prevent infinite polling
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 10000);

      setState(prev => ({
        ...prev,
        isLoading: true,
        error: 'Round data is being synced...',
        isPlayer: true, // Set isPlayer to true since we know they're in the round
        playersCount: 0,
      }));
      return;
    }

    // If we have round data, update state
    if (roundData) {
      const isPlayer = isPlayerInRound || 
        (account?.address && roundData.round.creator.toLowerCase() === account.address.toLowerCase());

      setState({
        round: roundData,
        isPlayer: Boolean(isPlayer),
        playersCount: Number(roundData.round.players_count ?? 0),
        isLoading: false,
        error: null,
      });
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'No round found',
        isPlayer: false,
        playersCount: 0,
      }));
    }
  }, [account?.address, rounds, players]);

  // Set up polling to check for round data
  useEffect(() => {
    if (state.isPlayer && !state.round) {
      const pollInterval = setInterval(() => {
        const roundId = state.round?.round_id;
        if (roundId) {
          queryRound(BigInt(roundId.toString()));
        }
      }, 1000); // Poll every second

      return () => clearInterval(pollInterval);
    }
  }, [state.isPlayer, state.round, queryRound]);

  return {
    ...state,
    queryRound,
  };
};