import { useState, useCallback, useEffect } from 'react';
import { useEntityQuery, useModels, useModel, useEntityId } from '@dojoengine/sdk/react';
import { ToriiQueryBuilder, MemberClause } from '@dojoengine/sdk';
import { ModelsMapping, Round, RoundPlayer } from '../typescript/models.gen';
import { useAccount } from '@starknet-react/core';

interface UseRoundQueryResult {
  round: Round | null;
  playerData: RoundPlayer | null;
  playersCount: number;
  isLoading: boolean;
  error: string | null;
  queryRound: (roundId: bigint) => void;
}

export const useRoundQuery = (): UseRoundQueryResult => {
  const { account } = useAccount();
  const [roundId, setRoundId] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always query all rounds and round players to populate the store
  // This ensures we have data when we need it
  useEntityQuery(
    new ToriiQueryBuilder()
      .withClause(
        MemberClause(ModelsMapping.Round, "round_id", "Gt", "0").build()
      )
      .includeHashedKeys()
  );

  useEntityQuery(
    new ToriiQueryBuilder()
      .withClause(
        MemberClause(ModelsMapping.RoundPlayer, "joined", "Eq", true).build()
      )
      .includeHashedKeys()
  );

  // Get all rounds from the store
  const rounds = useModels(ModelsMapping.Round);
  
  // Get all round players from the store
  const roundPlayers = useModels(ModelsMapping.RoundPlayer);

  // Debug the raw models data
  useEffect(() => {
    console.log('[useRoundQuery] ===== MODELS STRUCTURE TRACE =====');
    if (rounds) {
      const firstRound = Object.values(rounds)[0] as any;
      console.log('[useRoundQuery] 1. First round raw object:', firstRound);
      console.log('[useRoundQuery] 2. First round keys:', Object.keys(firstRound));
      
      // Check if data is nested inside entity IDs
      if (firstRound && typeof firstRound === 'object') {
        const nestedKeys = Object.keys(firstRound);
        console.log('[useRoundQuery] 3. Nested entity keys:', nestedKeys);
        if (nestedKeys.length > 0) {
          const nestedData = firstRound[nestedKeys[0]];
          console.log('[useRoundQuery] 4. Nested data structure:', nestedData);
          console.log('[useRoundQuery] 5. Nested data keys:', Object.keys(nestedData || {}));
        }
      }
    }
    console.log('[useRoundQuery] ===== END MODELS STRUCTURE TRACE =====');
  }, [rounds]);

  // Find our specific round from the store
  const round = roundId && rounds ? (() => {
    // The rounds data is nested inside entity IDs, so we need to extract the actual round data
    for (const roundEntity of Object.values(rounds)) {
      const entityKeys = Object.keys(roundEntity as any);
      if (entityKeys.length > 0) {
        const roundData = (roundEntity as any)[entityKeys[0]];
        if (roundData && roundData.round_id && BigInt(roundData.round_id) === roundId) {
          return roundData as Round;
        }
      }
    }
    return null;
  })() : null;

  // Debug logging for round search
  useEffect(() => {
    if (roundId) {
      console.log('[useRoundQuery] ===== ROUND SEARCH TRACE =====');
      console.log('[useRoundQuery] 1. Looking for roundId:', roundId.toString());
      console.log('[useRoundQuery] 2. Total rounds available:', rounds ? Object.keys(rounds).length : 0);
      
      if (rounds) {
        console.log('[useRoundQuery] 3. Examining each round for match:');
        Object.values(rounds).forEach((roundEntity: any, index) => {
          const entityKeys = Object.keys(roundEntity);
          if (entityKeys.length > 0) {
            const roundData = roundEntity[entityKeys[0]];
            console.log(`[useRoundQuery] Round ${index}:`, {
              hasRoundId: roundData && 'round_id' in roundData,
              roundIdValue: roundData?.round_id,
              roundIdType: typeof roundData?.round_id,
              roundIdString: roundData?.round_id?.toString(),
              matchesTarget: roundData?.round_id && BigInt(roundData.round_id) === roundId,
              allFields: Object.keys(roundData || {}),
              fullData: roundData
            });
          } else {
            console.log(`[useRoundQuery] Round ${index}: No nested data found`);
          }
        });
      }
      
      console.log('[useRoundQuery] 4. Final result - Found round:', round);
      console.log('[useRoundQuery] ===== END ROUND SEARCH TRACE =====');
    }
  }, [roundId, rounds, roundPlayers, round]);

  // Find player data for current account and round with safer access
  const playerData = roundId && account?.address && roundPlayers ? (() => {
    // The roundPlayers data is also nested inside entity IDs
    for (const playerEntity of Object.values(roundPlayers)) {
      const entityKeys = Object.keys(playerEntity as any);
      if (entityKeys.length > 0) {
        const playerData = (playerEntity as any)[entityKeys[0]];
        if (playerData && playerData.player_to_round_id && 
            Array.isArray(playerData.player_to_round_id) &&
            playerData.player_to_round_id.length >= 2 &&
            playerData.player_to_round_id[0] === account.address && 
            BigInt(playerData.player_to_round_id[1]) === roundId) {
          return playerData as RoundPlayer;
        }
      }
    }
    return null;
  })() : null;

  // Query for a specific round
  const queryRound = useCallback((targetRoundId: bigint) => {
    console.log('[useRoundQuery] ===== QUERY INITIATION TRACE =====');
    console.log('[useRoundQuery] 1. Received query request for roundId:', targetRoundId.toString());
    console.log('[useRoundQuery] 2. Setting loading state to true');
    console.log('[useRoundQuery] 3. Clearing any previous errors');
    console.log('[useRoundQuery] 4. Setting roundId state to trigger data fetch');
    console.log('[useRoundQuery] ===== END QUERY INITIATION TRACE =====');
    setIsLoading(true);
    setError(null);
    setRoundId(targetRoundId);
  }, []);

  // Update loading state when data becomes available
  useEffect(() => {
    if (roundId) {
      if (round) {
        setIsLoading(false);
      } else {
        // Set a timeout to handle case where round doesn't exist
        const timer = setTimeout(() => {
          setError('Round not found');
          setIsLoading(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [roundId, round]);

  // Derive playersCount from round data
  const playersCount = round ? Number(round.players_count || 0) : 0;

  return {
    round,
    playerData,
    playersCount,
    isLoading,
    error,
    queryRound
  };
};