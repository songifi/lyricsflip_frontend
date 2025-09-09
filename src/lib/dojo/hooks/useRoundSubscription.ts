import { useEffect, useState } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { ModelsMapping, type Round } from '../typescript/models.gen';
import { ToriiQueryBuilder, MemberClause } from '@dojoengine/sdk';
import { getModel } from '../utils/modelAccess';

export const useRoundSubscription = (roundId: string) => {
  const { sdk } = useDojoSDK();
  const [playersCount, setPlayersCount] = useState(0);

  useEffect(() => {
    if (!roundId || !sdk) return;

    const setupSubscription = async () => {
      try {
        // Convert roundId to BigInt for the query
        const roundIdBigInt = BigInt(roundId);
        
        // Simple query for the round
        const roundQuery = new ToriiQueryBuilder()
          .withClause(
            MemberClause(ModelsMapping.Round, "round_id", "Eq", roundIdBigInt).build()
          )
          .includeHashedKeys();

        const [_, subscription] = await sdk.subscribeEventQuery({
          query: roundQuery,
          callback: ({ data, error }) => {
            if (error) {
              console.error('Subscription error:', error);
              return;
            }
            
            if (data) {
              const allEntities = Object.values(data as Record<string, any>);
              // Each value is an object keyed by entityId -> entity
              for (const container of allEntities) {
                const innerKeys = Object.keys(container);
                if (innerKeys.length === 0) continue;
                const inner = container[innerKeys[0]]; // entity snapshot with models
                const roundModel = getModel<Round>(inner, 'Round');
                if (!roundModel) continue;

                const idMatches = BigInt(roundModel.round_id).toString() === roundId;
                if (!idMatches) continue;

                const newPlayersCount = Number(roundModel.players_count ?? 0);
                setPlayersCount(newPlayersCount);
                break;
              }
            }
          }
        });

        // Cleanup subscription on unmount
        return () => {
          if (subscription) {
            (subscription as any).cancel?.();
            (subscription as any).unsubscribe?.();
          }
        };
      } catch (error) {
        console.error('Setup error:', error);
      }
    };

    setupSubscription();
  }, [roundId, sdk]);

  return { playersCount };
}; 