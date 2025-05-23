import { useDojoSDK, useModels } from "@dojoengine/sdk/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { ModelsMapping, RoundCreated, Round, RoundPlayer } from "../typescript/models.gen";
import { useAccount } from "@starknet-react/core";

interface RoundEvent {
  round_id: string;
  creator: string;
  genre: string;
  timestamp: number;
  status: string;
  players_count: number;
}

interface UseRoundEventsReturn {
  latestEvent: RoundEvent | null;
  isSubscribed: boolean;
  error: Error | null;
  roundStatus: string | null;
  playersCount: number;
}

// Genre mapping from Cairo enum to string
const GENRE_ENUM_MAP: Record<string, string> = {
  "Pop": "pop",
  "Rock": "rock",
  "HipHop": "hiphop",
  "Rnb": "rnb",
};

const transformEventData = (roundData: any, roundId: string, accountAddress: string): RoundEvent => {
  return {
    round_id: roundId,
    creator: roundData.round?.creator || accountAddress,
    genre: roundData.round?.genre || 'unknown',
    timestamp: Date.now(),
    status: roundData.round?.state?.toString() || 'unknown',
    players_count: Number(roundData.round?.players_count || 0)
  };
};

export const useRoundEvents = (): UseRoundEventsReturn => {
  const { client } = useDojoSDK();
  const { account } = useAccount();
  const [latestEvent, setLatestEvent] = useState<RoundEvent | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [roundStatus, setRoundStatus] = useState<string | null>(null);
  const [playersCount, setPlayersCount] = useState(0);
  const lastProcessedRoundId = useRef<string | null>(null);
  const lastProcessedData = useRef<string | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 5;
  const retryDelay = 1000; // 1 second

  // Subscribe to both Round and RoundPlayer models
  const roundModels = useModels(ModelsMapping.Rounds);
  const playerModels = useModels(ModelsMapping.RoundPlayer);

  const processLatestEvent = useCallback(() => {
    try {
      if (!roundModels || !Array.isArray(roundModels) || roundModels.length === 0) {
        console.log('[RoundID Flow] No Round models found, attempt:', retryCount.current + 1);
        
        // Implement retry mechanism
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          setTimeout(() => {
            processLatestEvent();
          }, retryDelay);
          return;
        } else {
          console.log('[RoundID Flow] Max retries reached, waiting for models to be available');
          return;
        }
      }

      // Reset retry count when models are found
      retryCount.current = 0;

      // Get the latest round from the array
      const latestRoundEntry = roundModels[roundModels.length - 1];
      console.log('[RoundID Flow] Latest round entry:', {
        entry: latestRoundEntry,
        keys: Object.keys(latestRoundEntry),
        values: Object.values(latestRoundEntry)
      });

      // Extract the round ID and data
      const roundId = Object.keys(latestRoundEntry)[0];
      const roundData = latestRoundEntry[roundId];
      console.log('[RoundID Flow] Initial extraction:', {
        roundId,
        roundData,
        roundDataKeys: roundData ? Object.keys(roundData) : []
      });

      // Get the actual round ID from the event data
      const actualRoundId = roundData?.round_id ? `0x${BigInt(roundData.round_id).toString(16)}` : roundId;
      console.log('[RoundID Flow] Round ID conversion:', {
        originalRoundId: roundId,
        roundDataRoundId: roundData?.round_id,
        actualRoundId,
        isHex: actualRoundId.startsWith('0x')
      });

      // Create a data hash to check for actual changes
      const dataHash = JSON.stringify({
        roundData,
        playerData: playerModels?.[`${account?.address},${actualRoundId}`]
      });
      
      // Skip if we've already processed this round with the same data
      if (actualRoundId === lastProcessedRoundId.current && dataHash === lastProcessedData.current) {
        console.log('[RoundID Flow] Skipping already processed round:', {
          actualRoundId,
          lastProcessedId: lastProcessedRoundId.current,
          dataHash,
          lastDataHash: lastProcessedData.current
        });
        return;
      }

      console.log('[RoundID Flow] Processing new round:', {
        actualRoundId,
        roundData,
        accountAddress: account?.address
      });

      if (roundData && account?.address) {
        const transformedEvent = transformEventData(roundData, actualRoundId, account.address);
        console.log('[RoundID Flow] Event transformation:', {
          input: { roundData, actualRoundId, accountAddress: account.address },
          output: transformedEvent
        });
        
        // Update the last processed round ID and data
        lastProcessedRoundId.current = actualRoundId;
        lastProcessedData.current = dataHash;
        
        // Update state with new data
        setLatestEvent(transformedEvent);
        setRoundStatus(roundData.round?.state?.toString() || 'unknown');
        setPlayersCount(Number(roundData.round?.players_count || 0));
        console.log('[RoundID Flow] State updated with new event:', transformedEvent);
      }
    } catch (err) {
      console.error('[RoundID Flow] Error processing event:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(err instanceof Error ? err : new Error("Failed to process event"));
    }
  }, [roundModels, playerModels, account?.address]);

  // Set up subscription
  useEffect(() => {
    console.log('Setting up subscription');
    setIsSubscribed(true);
    return () => {
      console.log('Cleaning up subscription');
      setIsSubscribed(false);
      lastProcessedRoundId.current = null;
      lastProcessedData.current = null;
    };
  }, []);

  // Process events when models change
  useEffect(() => {
    if (roundModels || playerModels) {
      console.log('Models changed, processing latest event');
      processLatestEvent();
    }
  }, [roundModels, playerModels, processLatestEvent]);

  return {
    latestEvent,
    isSubscribed,
    error,
    roundStatus,
    playersCount
  };
}; 