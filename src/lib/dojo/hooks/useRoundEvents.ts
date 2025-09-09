import { useDojoSDK, useModels } from "@dojoengine/sdk/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { ModelsMapping, type Round, type RoundPlayer } from "../typescript/models.gen";
import { useAccount } from "@starknet-react/core";
import { getModel } from "../utils/modelAccess";

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

const transformEventData = (roundModel: Round, roundId: string, accountAddress: string): RoundEvent => {
  return {
    round_id: roundId,
    creator: String(roundModel.creator || accountAddress),
    // No explicit genre field on Round; keep placeholder for UI compatibility
    genre: 'unknown',
    timestamp: Date.now(),
    status: String(roundModel.state?.toString() ?? 'unknown'),
    players_count: Number(roundModel.players_count ?? 0),
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
  const roundModels = useModels(ModelsMapping.Round);
  const playerModels = useModels(ModelsMapping.RoundPlayer);

  const processLatestEvent = useCallback(() => {
    try {
      if (!roundModels || Object.keys(roundModels).length === 0) {
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

      // Extract all Round models from the object store
      const containers = Object.values(roundModels as Record<string, any>);
      const extracted: Array<{ entityId: string; model: Round }> = [];
      for (const container of containers) {
        const keys = Object.keys(container);
        if (keys.length === 0) continue;
        const entityId = keys[0];
        const entity = container[entityId];
        const roundModel = getModel<Round>(entity, 'Round');
        if (roundModel) extracted.push({ entityId, model: roundModel });
      }
      if (extracted.length === 0) {
        console.log('[RoundID Flow] No extractable Round models present');
        return;
      }

      // Pick the latest round by highest round_id
      extracted.sort((a, b) => Number(BigInt(a.model.round_id) - BigInt(b.model.round_id)));
      const latest = extracted[extracted.length - 1];
      const roundData = latest.model;
      const roundIdDec = BigInt(roundData.round_id).toString();
      const actualRoundId = `0x${BigInt(roundData.round_id).toString(16)}`;
      console.log('[RoundID Flow] Latest round selected:', { entityId: latest.entityId, roundIdDec, actualRoundId });

      // Create a data hash to check for actual changes (round fields + player count)
      const dataHash = JSON.stringify({
        round_id: roundIdDec,
        state: String(roundData.state),
        players_count: Number(roundData.players_count ?? 0),
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
        setRoundStatus(String(roundData.state?.toString() ?? 'unknown'));
        setPlayersCount(Number(roundData.players_count ?? 0));
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