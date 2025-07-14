import { useEffect, useState, useCallback, useRef } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { ToriiQueryBuilder, MemberClause } from '@dojoengine/sdk';
import { ModelsMapping } from '../typescript/models.gen';

interface GameplayEvents {
  onRoundStateChange?: (roundData: any) => void;
  onPlayerJoined?: (playerData: any) => void;
  onPlayerAnswer?: (answerData: any) => void;
  onPlayerStateChange?: (playerData: any) => void;
}

interface UseGameplaySubscriptionsResult {
  subscribeToGameplay: (roundId: bigint, callbacks?: GameplayEvents) => void;
  unsubscribeFromGameplay: () => void;
  isSubscribed: boolean;
  subscriptionError: string | null;
}

export const useGameplaySubscriptions = (): UseGameplaySubscriptionsResult => {
  const { sdk } = useDojoSDK();
  const subscriptionsRef = useRef<any[]>([]); // Use ref instead of state to prevent re-renders
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const subscribeToGameplay = useCallback(async (roundId: bigint, callbacks: GameplayEvents = {}) => {
    if (!sdk || !roundId) {
      setSubscriptionError('SDK not available or invalid round ID');
      return;
    }

    try {
      console.log('[useGameplaySubscriptions] Setting up subscriptions for round:', roundId.toString());
      setSubscriptionError(null);
      
      const subs = [];

      // Subscribe to Round state changes - use subscribeEntityQuery with hashed keys
      const roundQuery = new ToriiQueryBuilder()
        .withClause(
          MemberClause(ModelsMapping.Round, "round_id", "Eq", roundId).build()
        )
        .includeHashedKeys();

      const [_, roundSubscription] = await sdk.subscribeEntityQuery({
        query: roundQuery,
        callback: ({ data, error }: { data?: any; error?: any }) => {
          if (error) {
            console.error('[useGameplaySubscriptions] Round subscription error:', error);
            setSubscriptionError('Subscription to round state failed or channel closed.');
            return;
          }
          
          if (data) {
            console.log('[useGameplaySubscriptions] Round event received:', data);
            const allEntities = Object.values(data);
            const roundEntity = allEntities.find((entity: any) => {
              const roundIdValue = entity?.models?.lyricsflip?.Round?.round_id;
              return roundIdValue && roundIdValue.toString() === roundId.toString();
            });

            if (roundEntity && callbacks.onRoundStateChange) {
              const roundData = (roundEntity as any).models?.lyricsflip?.Round;
              if (roundData) {
                console.log('[useGameplaySubscriptions] Round state changed:', {
                  roundId: roundData.round_id,
                  state: roundData.state,
                  playersCount: roundData.players_count
                });
                callbacks.onRoundStateChange(roundData);
              }
            }
          }
        }
      });
      subs.push(roundSubscription);

      // Subscribe to PlayerAnswer events for this round
      const playerAnswerQuery = new ToriiQueryBuilder()
        .withClause(
          MemberClause(ModelsMapping.PlayerAnswer, "round_id", "Eq", roundId).build()
        )
        .includeHashedKeys();
      
      const [__, playerAnswerSubscription] = await sdk.subscribeEntityQuery({
        query: playerAnswerQuery,
        callback: ({ data, error }: { data?: any; error?: any }) => {
          if (error) {
            console.error('[useGameplaySubscriptions] PlayerAnswer subscription error:', error);
            setSubscriptionError('Subscription to player answers failed or channel closed.');
            return;
          }
          if (data && callbacks.onPlayerAnswer) {
            const answerEntity = Object.values(data).pop(); // Get the most recent answer event
            const answerData = (answerEntity as any)?.models?.lyricsflip?.PlayerAnswer;
            if (answerData) {
              console.log('[useGameplaySubscriptions] PlayerAnswer event received:', answerData);
              callbacks.onPlayerAnswer(answerData);
            }
          }
        }
      });
      subs.push(playerAnswerSubscription);

      // Subscribe to RoundPlayer state changes for this round
      const roundPlayerQuery = new ToriiQueryBuilder()
        .withClause(
          MemberClause(ModelsMapping.RoundPlayer, "player_to_round_id", "Eq", roundId).build()
        )
        .includeHashedKeys();
      
      const [___, roundPlayerSubscription] = await sdk.subscribeEntityQuery({
        query: roundPlayerQuery,
        callback: ({ data, error }: { data?: any; error?: any }) => {
          if (error) {
            console.error('[useGameplaySubscriptions] RoundPlayer subscription error:', error);
            setSubscriptionError('Subscription to player state failed or channel closed.');
            return;
          }
          if (data && callbacks.onPlayerStateChange) {
            const playerEntity = Object.values(data).pop(); // Get the most recent player state change
            const playerData = (playerEntity as any)?.models?.lyricsflip?.RoundPlayer;
            if (playerData) {
              console.log('[useGameplaySubscriptions] RoundPlayer state changed:', playerData);
              callbacks.onPlayerStateChange(playerData);
            }
          }
        }
      });
      subs.push(roundPlayerSubscription);

      subscriptionsRef.current = subs;
      setIsSubscribed(true);
      console.log('[useGameplaySubscriptions] Subscriptions set up successfully for round:', roundId.toString());

    } catch (error) {
      console.error('[useGameplaySubscriptions] Setup error:', error);
      setSubscriptionError(error instanceof Error ? error.message : 'Failed to setup subscriptions');
      setIsSubscribed(false);
    }
  }, [sdk]);

  const unsubscribeFromGameplay = useCallback(() => {
    console.log('[useGameplaySubscriptions] Unsubscribing from all gameplay events...');
    
    subscriptionsRef.current.forEach((sub: any, index: number) => {
      try {
        if (sub && typeof sub.cancel === 'function') {
          sub.cancel();
          console.log(`[useGameplaySubscriptions] Cancelled subscription ${index}`);
        }
      } catch (error) {
        console.error(`[useGameplaySubscriptions] Error cancelling subscription ${index}:`, error);
      }
    });
    
    subscriptionsRef.current = [];
    setIsSubscribed(false);
    setSubscriptionError(null);
    console.log('[useGameplaySubscriptions] All subscriptions cancelled');
  }, []); // Empty dependency array to prevent re-creation

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Call cleanup directly to avoid dependency on unsubscribeFromGameplay
      subscriptionsRef.current.forEach((sub: any) => {
        try {
          if (sub && typeof sub.cancel === 'function') {
            sub.cancel();
          }
        } catch (error) {
          console.error('[useGameplaySubscriptions] Error cancelling subscription on unmount:', error);
        }
      });
      subscriptionsRef.current = [];
    };
  }, []); // Empty dependency array - cleanup only on unmount

  return {
    subscribeToGameplay,
    unsubscribeFromGameplay,
    isSubscribed,
    subscriptionError,
  };
}; 