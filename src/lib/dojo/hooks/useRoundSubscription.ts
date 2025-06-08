import { useEffect, useState } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { ModelsMapping } from '../typescript/models.gen';
import { ToriiQueryBuilder, MemberClause } from '@dojoengine/sdk';

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
            MemberClause(ModelsMapping.Rounds, "round_id", "Eq", roundIdBigInt).build()
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
              const allEntities = Object.values(data);
              const roundEntity = allEntities.find(entity => {
                const roundIdValue = entity.models?.lyricsflip?.Rounds?.round_id;
                return roundIdValue && roundIdValue.toString() === roundId;
              });

              if (roundEntity) {
                const roundData = roundEntity.models?.lyricsflip?.Rounds;
                const newPlayersCount = Number(roundData?.round.players_count ?? 0);
                setPlayersCount(newPlayersCount);
              }
            }
          }
        });

        // Cleanup subscription on unmount
        return () => {
          if (subscription) {
            (subscription as any).cancel?.();
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