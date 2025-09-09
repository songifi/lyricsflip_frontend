import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { ToriiQueryBuilder, KeysClause } from '@dojoengine/sdk';
import { useAccount } from '@starknet-react/core';
import { addAddressPadding } from 'starknet';

interface ProcessedPlayerAnswerEvent {
  round_id: string;
  player: string;
  card_id: string;
  answer: string;
  is_correct: boolean;
  timestamp: number;
  entityId: string;
  raw: any;
}

interface ProcessedRoundWinnerEvent {
  round_id: string;
  winner: string;
  score: string;
  timestamp: number;
  entityId: string;
  raw: any;
}

interface GameplayEvents {
  onPlayerAnswer?: (answerData: ProcessedPlayerAnswerEvent) => void;
  onRoundWinner?: (winnerData: ProcessedRoundWinnerEvent) => void;
}

interface UseGameplaySubscriptionsResult {
  subscribeToGameplay: (roundId: bigint, callbacks?: GameplayEvents) => void;
  unsubscribeFromGameplay: () => void;
  isSubscribed: boolean;
  subscriptionError: string | null;
  events: ProcessedPlayerAnswerEvent[];
  latestEvent: ProcessedPlayerAnswerEvent | null;
  roundWinnerEvents: ProcessedRoundWinnerEvent[];
  latestRoundWinnerEvent: ProcessedRoundWinnerEvent | null;
}

export const useGameplaySubscriptions = (): UseGameplaySubscriptionsResult => {
  // Remove the console.log that's causing noise in the logs
  const { account } = useAccount();
  const [, setIsSubscribed] = useState(false);
  
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [currentRoundId, setCurrentRoundId] = useState<bigint | null>(null);
  const [callbacks, setCallbacks] = useState<GameplayEvents>({});
  
  // Store callbacks in a ref to avoid dependency issues
  const callbacksRef = useRef<GameplayEvents>({});
  callbacksRef.current = callbacks;
  
  // Store account address in a ref to avoid closure issues
  const accountRef = useRef<string | undefined>(undefined);
  accountRef.current = account?.address;
  
  // Create event query for PlayerAnswer events (no members/keys)
  const playerAnswerQuery = useMemo(() => {
    // Since PlayerAnswer events are global and we filter by player address in the callback,
    // we don't need to recreate the query when the account changes
    console.log('🔔 Creating PlayerAnswer event query');
    
    // PlayerAnswer event has no members/keys, so we query for all events
    // and filter by player address in the processing
    // Using the working example's pattern with undefined keys
    return new ToriiQueryBuilder()
      .withClause(
        KeysClause(
          ["lyricsflip-PlayerAnswer"],
          [], // no members
          "FixedLen"
        ).build()
      )
      .includeHashedKeys();
  }, []); // Remove dependency to prevent excessive re-renders

  // Create event query for RoundWinner events (no members/keys)
  const roundWinnerQuery = useMemo(() => {
    console.log('🔔 Creating RoundWinner event query');
    return new ToriiQueryBuilder()
      .withClause(
        KeysClause(
          ["lyricsflip-RoundWinner"],
          [], // no members
          "FixedLen"
        ).build()
      )
      .includeHashedKeys();
  }, []);

  // Subscribe to PlayerAnswer events using the imperative subscription approach
  const { sdk } = useDojoSDK();
  
  // Set up imperative subscription
  useEffect(() => {
    console.log('🔔 Setting up imperative subscription - SDK:', !!sdk, 'Queries:', !!playerAnswerQuery, !!roundWinnerQuery);
    if (!sdk || !playerAnswerQuery || !roundWinnerQuery) {
      console.log('🔔 Skipping subscription setup - missing SDK or query');
      return;
    }
    
    console.log('🔔 Setting up imperative subscriptions for PlayerAnswer and RoundWinner events');
    console.log('🔔 PlayerAnswer Query details:', playerAnswerQuery);
    console.log('🔔 RoundWinner Query details:', roundWinnerQuery);
    
    try {
      // Subscribe to PlayerAnswer events
      const subPlayerAnswerPromise = sdk.subscribeEventQuery({
        query: playerAnswerQuery,
        callback: ({ data, error }) => {
          console.log('🔔 Received PlayerAnswer events:', { hasData: !!data, hasError: !!error });
          if (error) return console.error('🔔 PlayerAnswer subscription error:', error);
          if (!data) return;

          const containers = Object.values(data as Record<string, any>);
          containers.forEach((container, index) => {
            for (const entityId of Object.keys(container)) {
              const entity = container[entityId];
              const playerAnswerData = entity?.models?.lyricsflip?.PlayerAnswer;
              if (!playerAnswerData) continue;

              const eventPlayer = playerAnswerData.player;
              const currentAccountAddress = accountRef.current;
              if (!eventPlayer || !currentAccountAddress) continue;

              try {
                const paddedEventPlayer = addAddressPadding(eventPlayer);
                const paddedAccountAddress = addAddressPadding(currentAccountAddress);
                const isMatch = paddedEventPlayer === paddedAccountAddress;
                if (isMatch) {
                  const processedEvent: ProcessedPlayerAnswerEvent = {
                    round_id: playerAnswerData.round_id?.toString() || '0',
                    player: eventPlayer || '',
                    card_id: playerAnswerData.card_id?.toString() || '0',
                    answer: '', // not present in model; keep field for compatibility
                    is_correct: !!playerAnswerData.is_correct,
                    timestamp: Date.now(),
                    entityId,
                    raw: playerAnswerData,
                  };
                  callbacksRef.current.onPlayerAnswer?.(processedEvent);
                }
              } catch (err) {
                console.error('🔔 Error processing PlayerAnswer callback event:', err);
              }
            }
          });
        },
      });

      // Subscribe to RoundWinner events
      const subRoundWinnerPromise = sdk.subscribeEventQuery({
        query: roundWinnerQuery,
        callback: ({ data, error }) => {
          console.log('🔔 Received RoundWinner events:', { hasData: !!data, hasError: !!error });
          if (error) return console.error('🔔 RoundWinner subscription error:', error);
          if (!data) return;

          const containers = Object.values(data as Record<string, any>);
          containers.forEach((container) => {
            for (const entityId of Object.keys(container)) {
              const entity = container[entityId];
              const winnerData = entity?.models?.lyricsflip?.RoundWinner;
              if (!winnerData) continue;

              try {
                const roundIdStr = winnerData.round_id?.toString() || '0';
                const matchesRound = currentRoundId && currentRoundId !== 0n
                  ? roundIdStr === currentRoundId.toString()
                  : true;
                if (!matchesRound) continue;

                const processed: ProcessedRoundWinnerEvent = {
                  round_id: roundIdStr,
                  winner: winnerData.winner || '',
                  score: winnerData.score?.toString() || '0',
                  timestamp: Date.now(),
                  entityId,
                  raw: winnerData,
                };
                callbacksRef.current.onRoundWinner?.(processed);
              } catch (err) {
                console.error('🔔 Error processing RoundWinner callback event:', err);
              }
            }
          });
        },
      });

      console.log('🔔 Imperative subscriptions set up');

      return () => {
        console.log('🔔 Cleaning up imperative subscriptions');
        Promise.all([subPlayerAnswerPromise, subRoundWinnerPromise]).then((subs) => {
          subs.forEach((sub) => {
            if (sub && typeof sub === 'object' && 'unsubscribe' in sub) {
              (sub as any).unsubscribe();
            }
          });
        }).catch((e) => console.error('🔔 Error during subscriptions cleanup', e));
      };
    } catch (error) {
      console.error('🔔 Error setting up imperative subscription:', error);
    }
  }, [sdk, playerAnswerQuery, roundWinnerQuery]); // Remove account from dependencies to prevent re-renders
  
  // Get raw events from the SDK
  const rawEvents = useMemo(() => {
    if (!sdk) {
      console.log('🔔 No SDK available for raw events');
      return {};
    }
    try {
      console.log('🔔 SDK object:', sdk);
      console.log('🔔 SDK models:', (sdk as any).models);
      console.log('🔔 All SDK model keys:', Object.keys((sdk as any).models || {}));
      console.log('🔔 SDK models content:', (sdk as any).models);
      
      const events = (sdk as any).models?.["lyricsflip-PlayerAnswer"] || {};
      console.log('🔔 Raw PlayerAnswer events from SDK:', {
        totalEvents: Object.keys(events).length,
        eventKeys: Object.keys(events).slice(0, 5),
        allModelKeys: Object.keys((sdk as any).models || {})
      });
      return events;
    } catch (error) {
      console.error('🔔 Error getting raw events:', error);
      return {};
    }
  }, [sdk]);

  const rawRoundWinnerEvents = useMemo(() => {
    if (!sdk) return {};
    try {
      const events = (sdk as any).models?.["lyricsflip-RoundWinner"] || {};
      return events;
    } catch (e) {
      console.error('🔔 Error getting raw RoundWinner events:', e);
      return {};
    }
  }, [sdk]);
  
  // Debug logging for query
  useEffect(() => {
    console.log('🔔 Event query debug:', {
      hasPlayerAnswerQuery: !!playerAnswerQuery,
      hasRoundWinnerQuery: !!roundWinnerQuery,
      accountAddress: accountRef.current,
      hasSDK: !!sdk,
      rawEventsCount: Object.keys(rawEvents).length
    });
  }, [playerAnswerQuery, roundWinnerQuery, accountRef.current, sdk, rawEvents]);
  
  // Use ref to track previous events for deep comparison
  const prevEventsRef = useRef<any>(null);
  const processedEventsRef = useRef<ProcessedPlayerAnswerEvent[]>([]);
  
  // Process and transform raw events
  const processedEvents = useMemo(() => {
    // Create a stable string representation for comparison
    const eventsKeys = Object.keys(rawEvents).sort();
    const eventsString = JSON.stringify(eventsKeys.map(key => [key, rawEvents[key]]));
    
    console.log('🔔 Processing PlayerAnswer events - rawEvents changed:', {
      totalRawEvents: eventsKeys.length,
      eventsKeys: eventsKeys.slice(0, 5), // Log first 5 for debugging
      prevEventsString: prevEventsRef.current?.substring(0, 100),
      currentEventsString: eventsString.substring(0, 100)
    });
    
    // Only recalculate if events actually changed
    if (prevEventsRef.current === eventsString) {
      console.log('🔔 Skipping processing - events unchanged');
      return processedEventsRef.current;
    }
    
    const processed: ProcessedPlayerAnswerEvent[] = [];
    
    for (const [entityId, eventData] of Object.entries(rawEvents)) {
      try {
        // Debug: Log event data and account address
        console.log('[useGameplaySubscriptions] Raw PlayerAnswer event:', { eventData, entityId });
        console.log('[useGameplaySubscriptions] Current account address:', account?.address);
        
        // Extract PlayerAnswer data from the nested structure
        const playerAnswerData = (eventData as any)?.models?.lyricsflip?.PlayerAnswer;
        console.log('[useGameplaySubscriptions] Extracted PlayerAnswer data:', playerAnswerData);
        
        if (playerAnswerData && typeof playerAnswerData === 'object' && 'player' in playerAnswerData) {
          const eventPlayer = playerAnswerData.player;
          
          // Validate addresses before padding to prevent BigInt conversion errors
          if (!eventPlayer || typeof eventPlayer !== 'string' || eventPlayer.length < 3) {
            console.log('[useGameplaySubscriptions] Invalid event player address:', eventPlayer);
            continue;
          }
          
          const currentAccountAddress = accountRef.current;
          if (!currentAccountAddress || typeof currentAccountAddress !== 'string' || currentAccountAddress.length < 3) {
            console.log('[useGameplaySubscriptions] Invalid account address:', currentAccountAddress);
            continue;
          }
          
          try {
            const paddedEventPlayer = addAddressPadding(eventPlayer);
            const paddedAccountAddress = addAddressPadding(currentAccountAddress);
            const isMatch = paddedEventPlayer === paddedAccountAddress;
            console.log('[useGameplaySubscriptions] Comparing event player to account (padded):', { eventPlayer, paddedEventPlayer, accountAddress: currentAccountAddress, paddedAccountAddress, isMatch });
            if (isMatch) {
              const processedEvent: ProcessedPlayerAnswerEvent = {
                round_id: playerAnswerData.round_id?.toString() || '0',
                player: eventPlayer || '',
                card_id: playerAnswerData.card_id?.toString() || '0',
                answer: '',
                is_correct: !!playerAnswerData.is_correct,
                timestamp: Date.now(), // Use current timestamp since event doesn't have one
                entityId,
                raw: playerAnswerData
              };
              processed.push(processedEvent);
            }
          } catch (error) {
            console.error('[useGameplaySubscriptions] Error processing address padding:', error);
            console.error('[useGameplaySubscriptions] Event player:', eventPlayer);
            console.error('[useGameplaySubscriptions] Account address:', currentAccountAddress);
          }
        }
      } catch (error) {
        console.error('🔔 Error processing PlayerAnswer event:', error, eventData);
      }
    }
    
    // Sort by timestamp (newest first)
    processed.sort((a, b) => b.timestamp - a.timestamp);
    
    // Update refs for next comparison
    prevEventsRef.current = eventsString;
    processedEventsRef.current = processed;
    
    console.log('🔔 Processed PlayerAnswer events:', {
      totalProcessed: processed.length,
      latestEvent: processed[0] || null
    });
    
    return processed;
  }, [rawEvents, accountRef.current]);
  
  // Get latest event
  const latestEvent = useMemo(() => {
    return processedEvents.length > 0 ? processedEvents[0] : null;
  }, [processedEvents]);

  // Process RoundWinner events
  const processedRoundWinnerEvents = useMemo(() => {
    const processed: ProcessedRoundWinnerEvent[] = [];
    for (const [entityId, eventData] of Object.entries(rawRoundWinnerEvents)) {
      try {
        const winnerData = (eventData as any)?.models?.lyricsflip?.RoundWinner;
        if (!winnerData) continue;
        const roundIdStr = winnerData.round_id?.toString() || '0';
        // Filter to current round if available (0n = wildcard)
        if (currentRoundId && currentRoundId !== 0n && roundIdStr !== currentRoundId.toString()) continue;
        processed.push({
          round_id: roundIdStr,
          winner: winnerData.winner || '',
          score: winnerData.score?.toString() || '0',
          timestamp: Date.now(),
          entityId,
          raw: winnerData,
        });
      } catch (e) {
        console.error('🔔 Error processing RoundWinner event:', e, eventData);
      }
    }
    // Newest first
    processed.sort((a, b) => b.timestamp - a.timestamp);
    return processed;
  }, [rawRoundWinnerEvents, currentRoundId]);

  const latestRoundWinnerEvent = useMemo(() => {
    return processedRoundWinnerEvents.length > 0 ? processedRoundWinnerEvents[0] : null;
  }, [processedRoundWinnerEvents]);
  
  // Call callback when new event arrives
  useEffect(() => {
    if (latestEvent && callbacks.onPlayerAnswer) {
      console.log('🔔 Calling onPlayerAnswer callback with latest event:', latestEvent);
      callbacks.onPlayerAnswer(latestEvent);
    }
  }, [latestEvent, callbacks.onPlayerAnswer]);

  const subscribeToGameplay = useCallback(async (roundId: bigint, newCallbacks: GameplayEvents = {}) => {
    console.log('[useGameplaySubscriptions] *** STARTING subscribeToGameplay for round:', roundId.toString(), 'callbacks:', Object.keys(newCallbacks));
    
    try {
      setSubscriptionError(null);
      setCurrentRoundId(roundId);
      setCallbacks(newCallbacks);
      setIsSubscribed(true);
      
      console.log('[useGameplaySubscriptions] Subscriptions set up successfully for round:', roundId.toString());
    } catch (error) {
      console.error('[useGameplaySubscriptions] Setup error:', error);
      setSubscriptionError(error instanceof Error ? error.message : 'Failed to setup subscriptions');
      setIsSubscribed(false);
    }
  }, []);

  const unsubscribeFromGameplay = useCallback(() => {
    console.log('[useGameplaySubscriptions] Unsubscribing from all gameplay events...');
    
    setCurrentRoundId(null);
    setCallbacks({});
    setIsSubscribed(false);
    setSubscriptionError(null);
    
    console.log('[useGameplaySubscriptions] All subscriptions cancelled');
  }, []);

  // Debug logging for subscription status
  useEffect(() => {
    console.log('🔔 PlayerAnswer Events Hook Status:', {
      isSubscribed: !!accountRef.current && !!currentRoundId,
      playerAddress: accountRef.current,
      roundId: currentRoundId?.toString(),
      totalEvents: processedEvents.length,
      latestEventTimestamp: latestEvent?.timestamp || 0,
      rawEventsKeys: Object.keys(rawEvents)
    });
  }, [accountRef.current, currentRoundId, processedEvents.length, latestEvent?.timestamp, rawEvents]);

  return {
    subscribeToGameplay,
    unsubscribeFromGameplay,
    isSubscribed: !!accountRef.current && !!currentRoundId,
    subscriptionError,
    events: processedEvents,
    latestEvent,
    roundWinnerEvents: processedRoundWinnerEvents,
    latestRoundWinnerEvent
  };
}; 