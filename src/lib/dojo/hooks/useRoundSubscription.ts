import { useEffect, useState, useRef } from 'react';
import { useDojoSDK, useModels } from '@dojoengine/sdk/react';
import { ModelsMapping, Rounds, RoundPlayer } from '../typescript/models.gen';
import { useAccount } from '@starknet-react/core';
import { ToriiQueryBuilder, MemberClause, AndComposeClause } from '@dojoengine/sdk';
import { SchemaType } from '../typescript/models.gen';

type UnsubscribeFn = () => void;

interface RoundSubscriptionState {
  round: Rounds | null;
  isPlayer: boolean;
  isReady: boolean;
  playersCount: number;
  error: string | null;
}

interface ParsedEntity {
  models?: {
    lyricsflip?: {
      Rounds?: Rounds;
      RoundPlayer?: RoundPlayer;
    };
  };
}

export const useRoundSubscription = (roundId: string) => {
  const { sdk } = useDojoSDK();
  const { account } = useAccount();
  const roundModels = useModels(ModelsMapping.Rounds);
  const playerModels = useModels(ModelsMapping.RoundPlayer);
  const [state, setState] = useState<RoundSubscriptionState>({
    round: null,
    isPlayer: false,
    isReady: false,
    playersCount: 0,
    error: null
  });
  const subscriptionRef = useRef<(() => void) | null>(null);
  const isSubscribed = useRef(false);

  useEffect(() => {
    if (!roundId || !account?.address || !sdk) return;

    const setupSubscription = async () => {
      try {
        // First query for the round
        const roundQuery = new ToriiQueryBuilder()
          .withClause(
            MemberClause(ModelsMapping.Rounds, "round_id", "Eq", BigInt(roundId)).build()
          )
          .includeHashedKeys();

        // Then query for the player
        const playerQuery = new ToriiQueryBuilder()
          .withClause(
            MemberClause(ModelsMapping.RoundPlayer, "player_to_round_id", "Eq", [account.address, BigInt(roundId)]).build()
          )
          .includeHashedKeys();

        // Set up subscriptions separately
        console.log('[useRoundSubscription] roundQuery:', JSON.stringify(roundQuery, null, 2));
        const [roundEntities, roundSubscription] = await sdk.subscribeEventQuery({
          query: roundQuery,
          callback: ({ data, error }) => {
            if (error) {
              console.error('[useRoundSubscription] Round subscription error:', error);
              setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Subscription error'
              }));
              return;
            }
            console.log('[useRoundSubscription] Round subscription callback fired. Data:', data);
            if (data) {
              const allEntities = Object.values(data);
              console.log('[useRoundSubscription] All round entities:', allEntities);
              const roundEntity = allEntities.find(entity => {
                const roundIdValue = entity.models?.lyricsflip?.Rounds?.round_id;
                const match = roundIdValue && roundIdValue.toString() === roundId.toString();
                console.log('[useRoundSubscription] Checking round entity:', entity, 'round_id:', roundIdValue, 'match:', match);
                return match;
              });
              if (roundEntity) {
                const roundData = roundEntity.models?.lyricsflip?.Rounds as Rounds | undefined;
                console.log('[useRoundSubscription] Matched round entity:', roundEntity, 'roundData:', roundData);
                setState(prev => ({
                  ...prev,
                  round: roundData || null,
                  playersCount: Number(roundData?.round.players_count ?? 0),
                  error: null
                }));
              } else {
                console.warn('[useRoundSubscription] No matching round entity found for roundId:', roundId);
              }
            } else {
              console.warn('[useRoundSubscription] No data received in round subscription callback');
            }
          }
        });

        console.log('[useRoundSubscription] playerQuery:', JSON.stringify(playerQuery, null, 2));
        const [playerEntities, playerSubscription] = await sdk.subscribeEventQuery({
          query: playerQuery,
          callback: ({ data, error }) => {
            if (error) {
              console.error('[useRoundSubscription] Player subscription error:', error);
              return;
            }
            console.log('[useRoundSubscription] Player subscription callback fired. Data:', data);
            if (data) {
              const allEntities = Object.values(data);
              console.log('[useRoundSubscription] All player entities:', allEntities);
              const playerEntity = allEntities.find(entity => {
                const playerToRoundId = entity.models?.lyricsflip?.RoundPlayer?.player_to_round_id;
                const match = playerToRoundId && playerToRoundId[1]?.toString() === roundId.toString() && playerToRoundId[0] === account.address;
                console.log('[useRoundSubscription] Checking player entity:', entity, 'player_to_round_id:', playerToRoundId, 'match:', match);
                return match;
              });
              if (playerEntity) {
                const playerData = playerEntity.models?.lyricsflip?.RoundPlayer as RoundPlayer | undefined;
                console.log('[useRoundSubscription] Matched player entity:', playerEntity, 'playerData:', playerData);
                setState(prev => ({
                  ...prev,
                  isPlayer: true,
                  isReady: playerData?.ready_state || false,
                  error: null
                }));
              } else {
                console.warn('[useRoundSubscription] No matching player entity found for roundId:', roundId, 'account:', account.address);
              }
            } else {
              console.warn('[useRoundSubscription] No data received in player subscription callback');
            }
          }
        });

        // Store both subscriptions for cleanup
        subscriptionRef.current = () => {
          // The subscription objects are callable functions
          (roundSubscription as unknown as UnsubscribeFn)();
          (playerSubscription as unknown as UnsubscribeFn)();
        };

        isSubscribed.current = true;
      } catch (error) {
        console.error('[useRoundSubscription] Setup error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to set up subscription'
        }));
      }
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
      isSubscribed.current = false;
    };
  }, [roundId, account?.address, sdk]);

  return {
    ...state,
    isSubscribed: isSubscribed.current
  };
}; 