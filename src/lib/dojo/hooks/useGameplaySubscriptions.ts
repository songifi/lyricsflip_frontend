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
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [currentRoundId, setCurrentRoundId] = useState<bigint | null>(null);
  const [callbacks, setCallbacks] = useState<GameplayEvents>({});
  
  // Store callbacks in a ref to avoid dependency issues
  const callbacksRef = useRef<GameplayEvents>({});
  callbacksRef.current = callbacks;
  
  // Store account address in a ref to avoid closure issues
  const accountRef = useRef<string | undefined>(undefined);
  accountRef.current = account?.address;
  
  // Create event query for PlayerAnswer events
  // Based on the manifest: PlayerAnswer has no members (no keys)
  const query = useMemo(() => {
    // Since PlayerAnswer events are global and we filter by player address in the callback,
    // we don't need to recreate the query when the account changes
    console.log('🔔 Creating PlayerAnswer event query');
    
    // PlayerAnswer event has no members/keys, so we query for all events
    // and filter by player address in the processing
    // Using the working example's pattern with undefined keys
    return new ToriiQueryBuilder()
      .withClause(
        KeysClause(
          ["lyricsflip-PlayerAnswer"], // Event name
          [undefined, undefined], // Two undefined keys for events with no members
          "FixedLen"
        ).build()
      )
      .includeHashedKeys();
  }, []); // Remove dependency to prevent excessive re-renders

  // Subscribe to PlayerAnswer events using the imperative subscription approach
  const { sdk } = useDojoSDK();
  
  // Set up imperative subscription
  useEffect(() => {
    console.log('🔔 Setting up imperative subscription - SDK:', !!sdk, 'Query:', !!query);
    if (!sdk || !query) {
      console.log('🔔 Skipping subscription setup - missing SDK or query');
      return;
    }
    
    console.log('🔔 Setting up imperative subscription for PlayerAnswer events');
    console.log('🔔 Query details:', query);
    
    try {
      // Subscribe to events using the SDK with callback
      const subscription = sdk.subscribeEventQuery({
        query,
        callback: (events) => {
          console.log('🔔 Received PlayerAnswer events:', events);
          console.log('🔔 Events data:', events?.data);
          console.log('🔔 Events error:', events?.error);
          
          // 🚀 NEW: Process events directly from callback instead of relying on sdk.models
          if (events?.data && Array.isArray(events.data)) {
            events.data.forEach((event, index) => {
              console.log(`🔔 Event ${index} structure:`, event);
              console.log(`🔔 Event ${index} keys:`, Object.keys(event));
              console.log(`🔔 Event ${index} entityId:`, (event as any).entityId);
              
              // Try different ways to extract PlayerAnswer data based on entityId
              let playerAnswerData = null;
              
              if ((event as any).entityId === '0x0') {
                // For creator account (entityId 0x0), try direct access
                console.log(`🔔 Event ${index} - Creator account detected (entityId 0x0)`);
                console.log(`🔔 Event ${index} - Direct event data:`, event);
                
                // Try to extract data directly from the event
                if (event && typeof event === 'object') {
                  // Look for PlayerAnswer data in different possible locations
                  playerAnswerData = (event as any).data || (event as any).PlayerAnswer || event;
                  console.log(`🔔 Event ${index} - Creator data extraction attempt:`, playerAnswerData);
                }
              } else {
                // For joiner account, use the normal nested structure
                console.log(`🔔 Event ${index} - Joiner account detected (entityId: ${(event as any).entityId})`);
                playerAnswerData = (event as any)?.models?.lyricsflip?.PlayerAnswer;
                console.log(`🔔 Event ${index} - Joiner data extraction:`, playerAnswerData);
              }
              
              console.log(`🔔 Event ${index} - Final extracted PlayerAnswer data:`, playerAnswerData);
              
              if (playerAnswerData && typeof playerAnswerData === 'object' && 'player' in playerAnswerData) {
              const eventPlayer = playerAnswerData.player;
              
              // Validate addresses before padding to prevent BigInt conversion errors
              if (!eventPlayer || typeof eventPlayer !== 'string' || eventPlayer.length < 3) {
                console.log(`🔔 Event ${index} - Invalid event player address:`, eventPlayer);
                return;
              }
              
              const currentAccountAddress = accountRef.current;
              if (!currentAccountAddress || typeof currentAccountAddress !== 'string' || currentAccountAddress.length < 3) {
                console.log(`🔔 Event ${index} - Invalid account address:`, currentAccountAddress);
                return;
              }
              
              try {
                const paddedEventPlayer = addAddressPadding(eventPlayer);
                const paddedAccountAddress = addAddressPadding(currentAccountAddress);
                const isMatch = paddedEventPlayer === paddedAccountAddress;
              
                console.log(`🔔 Event ${index} - Comparing event player to account (padded):`, { 
                  eventPlayer, 
                  paddedEventPlayer, 
                  accountAddress: currentAccountAddress, 
                  paddedAccountAddress, 
                  isMatch 
                });
                
                if (isMatch) {
                  const processedEvent: ProcessedPlayerAnswerEvent = {
                    round_id: playerAnswerData.round_id?.toString() || '0',
                    player: eventPlayer || '',
                    card_id: playerAnswerData.card_id?.toString() || '0',
                    answer: playerAnswerData.answer || '',
                    is_correct: playerAnswerData.is_correct || false,
                    timestamp: Date.now(),
                    entityId: (event as any).entityId || '',
                    raw: playerAnswerData
                  };
                  
                  console.log('🔔 🎯 PROCESSED EVENT - Calling callback:', processedEvent);
                  
                  // Call the callback directly using ref to avoid stale closure
                  if (callbacksRef.current.onPlayerAnswer) {
                    console.log('🔔 🎯 About to call onPlayerAnswer callback with:', processedEvent);
                    try {
                      callbacksRef.current.onPlayerAnswer(processedEvent);
                      console.log('🔔 ✅ Successfully called onPlayerAnswer callback');
                    } catch (error) {
                      console.error('🔔 ❌ Error calling onPlayerAnswer callback:', error);
                    }
                  } else {
                    console.log('🔔 ⚠️ No onPlayerAnswer callback available');
                  }
                }
              } catch (error) {
                console.error(`🔔 Event ${index} - Error processing address padding:`, error);
                console.error(`🔔 Event ${index} - Event player:`, eventPlayer);
                console.error(`🔔 Event ${index} - Account address:`, currentAccountAddress);
              }
            }
          });
        }
        }
      });
      
      console.log('🔔 Imperative subscription set up successfully:', subscription);
      
      return () => {
        console.log('🔔 Cleaning up imperative subscription');
        subscription?.then?.((sub) => {
          if (sub && typeof sub === 'object' && 'unsubscribe' in sub) {
            (sub as any).unsubscribe();
          }
        });
      };
    } catch (error) {
      console.error('🔔 Error setting up imperative subscription:', error);
    }
  }, [sdk, query]); // Remove account from dependencies to prevent re-renders
  
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
  
  // Debug logging for query
  useEffect(() => {
    console.log('🔔 Event query debug:', {
      hasQuery: !!query,
      queryDetails: query,
      accountAddress: accountRef.current,
      hasSDK: !!sdk,
      rawEventsCount: Object.keys(rawEvents).length
    });
  }, [query, accountRef.current, sdk, rawEvents]);
  
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
                answer: playerAnswerData.answer || '',
                is_correct: playerAnswerData.is_correct || false,
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
    roundWinnerEvents: [], // TODO: Implement RoundWinner event processing
    latestRoundWinnerEvent: null
  };
}; 