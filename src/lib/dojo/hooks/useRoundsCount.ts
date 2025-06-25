import { useEntityQuery, useModels } from '@dojoengine/sdk/react';
import { ToriiQueryBuilder, KeysClause } from '@dojoengine/sdk';
import { ModelsMapping, RoundsCount } from '../typescript/models.gen';

/**
 * Hook to subscribe to RoundsCount model updates.
 * This ensures the store receives updates when new rounds are created.
 * Should be used at the app level to maintain the subscription.
 */
export const useRoundsCount = () => {
  // Subscribe to RoundsCount entity to receive round creation updates
  useEntityQuery(
    new ToriiQueryBuilder()
      .withClause(
        KeysClause(["lyricsflip-RoundsCount"], ["0"]).build()
      )
      .includeHashedKeys()
  );

  // Get RoundsCount models from the store
  const roundsCountModels = useModels(ModelsMapping.RoundsCount);
  
  // Find the main RoundsCount entity (id: 0)
  const roundsCount = roundsCountModels ? 
    Object.values(roundsCountModels).find((rc: any) => 
      rc.id && BigInt(rc.id) === BigInt(0)
    ) as RoundsCount | null : null;

  return {
    roundsCount,
    currentRoundId: roundsCount?.count ? BigInt(roundsCount.count) : null,
  };
}; 