import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  const lastLoggedRoundRef = useRef<string | null>(null);
  const debugLogCountRef = useRef(0);

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

  // Memoize the extracted rounds data to prevent unnecessary re-computations
  const extractedRounds = useMemo(() => {
    if (!rounds) return [];
    
    return Object.values(rounds).map((roundEntity: any) => {
      const entityKeys = Object.keys(roundEntity);
      if (entityKeys.length > 0) {
        return roundEntity[entityKeys[0]] as Round;
      }
      return null;
    }).filter(Boolean);
  }, [rounds]);

  // Memoize the extracted player data
  const extractedPlayers = useMemo(() => {
    if (!roundPlayers) return [];
    
    return Object.values(roundPlayers).map((playerEntity: any) => {
      const entityKeys = Object.keys(playerEntity);
      if (entityKeys.length > 0) {
        return playerEntity[entityKeys[0]] as RoundPlayer;
      }
      return null;
    }).filter(Boolean);
  }, [roundPlayers]);

  // Debug logging with throttling - only log when data actually changes
  useEffect(() => {
    if (roundId && extractedRounds.length > 0) {
      const currentRoundKey = `${roundId.toString()}-${extractedRounds.length}`;
      
      // Only log if this is a new search or significant change, and limit frequency
      if (lastLoggedRoundRef.current !== currentRoundKey && debugLogCountRef.current % 10 === 0) {
        console.log('[useRoundQuery] ===== ROUND SEARCH (throttled) =====');
        console.log('[useRoundQuery] Looking for roundId:', roundId.toString());
        console.log('[useRoundQuery] Available rounds:', extractedRounds.length);
        console.log('[useRoundQuery] ===== END SEARCH TRACE =====');
        lastLoggedRoundRef.current = currentRoundKey;
      }
      debugLogCountRef.current++;
    }
  }, [roundId, extractedRounds]);

  // Memoize round lookup to prevent unnecessary re-computation
  const round = useMemo(() => {
    if (!roundId || !extractedRounds.length) return null;
    
    return extractedRounds.find(roundData => 
      roundData && roundData.round_id && BigInt(roundData.round_id) === roundId
    ) || null;
  }, [roundId, extractedRounds]);

  // Memoize player data lookup
  const playerData = useMemo(() => {
    if (!roundId || !account?.address || !extractedPlayers.length) return null;
    
    return extractedPlayers.find(playerData => 
      playerData && 
      playerData.player_to_round_id && 
      Array.isArray(playerData.player_to_round_id) &&
      playerData.player_to_round_id.length >= 2 &&
      playerData.player_to_round_id[0] === account.address && 
      BigInt(playerData.player_to_round_id[1]) === roundId
    ) || null;
  }, [roundId, account?.address, extractedPlayers]);

  // Memoize players count
  const playersCount = useMemo(() => {
    return round ? Number(round.players_count || 0) : 0;
  }, [round]);

  // Query for a specific round - memoized to prevent unnecessary re-renders
  const queryRound = useCallback((targetRoundId: bigint) => {
    const roundIdString = targetRoundId.toString();
    
    // Only log occasionally to reduce noise
    if (debugLogCountRef.current % 5 === 0) {
      console.log('[useRoundQuery] Query request for roundId:', roundIdString);
    }
    
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

  return {
    round,
    playerData,
    playersCount,
    isLoading,
    error,
    queryRound
  };
};