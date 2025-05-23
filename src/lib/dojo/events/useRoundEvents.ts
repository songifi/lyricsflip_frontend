import { useEffect, useState, useRef, useCallback } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { ModelsMapping } from '../typescript/models.gen';
import { 
  RoundEventType, 
  RoundEvent, 
  PlayerEvent, 
  RoundStatus,
  EventHandler
} from './types';
import { useRoundStore } from './roundStore';
import { roundEventBus } from './eventBus';

interface DojoModel {
  subscribe: (callback: (model: any) => void) => { unsubscribe: () => void };
}

export const useRoundEvents = () => {
  const { useDojoStore } = useDojoSDK();
  const storeHook = useDojoStore as unknown as {
    subscribe: (selector: (state: any) => any, listener: (sel: any, prev: any) => void) => () => void;
  };
  
  // Get entities at the top level (following Rules of Hooks)
  const entities = useDojoStore ? useDojoStore((state: any) => state.entities) : {};
  
  console.log('🔧 useRoundEvents - Setting up store hook:', {
    useDojoStore: !!useDojoStore,
    storeHook: !!storeHook,
    subscribe: !!storeHook?.subscribe,
    storeHookType: typeof storeHook
  });
  
  const { 
    addRound, 
    updateRound, 
    removeRound, 
    setError 
  } = useRoundStore();

  // expose the latest RoundCreated event for consumers that still rely on
  // the old API (e.g. CreateChallenge modal)
  const [latestCreatedEvent, setLatestCreatedEvent] = useState<RoundEvent | null>(null);
  
  // Use ref instead of state to avoid re-renders
  const processedEntitiesRef = useRef<Set<string>>(new Set());
  const hasProcessedInitialRef = useRef<boolean>(false);

  // Handle round creation
  const handleRoundCreated: EventHandler = useCallback((event) => {
    console.log('🔥 handleRoundCreated called with event:', event);
    if (event.type !== RoundEventType.ROUND_CREATED) return;
    const roundEvent = event as RoundEvent;
    
    try {
      const { data } = roundEvent;
      console.log('📦 Raw round creation data:', data);
      const roundId = (data as any).roundId || (data as any).round_id;
      console.log('🆔 Extracted round ID:', roundId);

      // update local state so components can react
      const newEvent = {
        round_id: roundId.toString(),
        creator: (data as any).creator?.toString() || '',
      } as any;
      console.log('✨ Setting latest created event:', newEvent);
      setLatestCreatedEvent(newEvent);
      
      addRound(roundId.toString(), {
        id: roundId.toString(),
        status: RoundStatus.CREATING,
        genre: (data as any).genre ? (data as any).genre.toString() : '0',
        wagerAmount: (data as any).wagerAmount ? (data as any).wagerAmount.toString() : '0',
        nextCardIndex: (data as any).nextCardIndex ? Number((data as any).nextCardIndex) : 0,
        playersCount: (data as any).playersCount ? Number((data as any).playersCount) : 0,
        readyPlayersCount: (data as any).readyPlayersCount ? Number((data as any).readyPlayersCount) : 0,
        players: []
      });
    } catch (error) {
      console.error('❌ Error in handleRoundCreated:', error);
      setError(`Error handling round creation: ${error}`);
    }
  }, [addRound, setError]);

  // Handle round updates
  const handleRoundUpdate: EventHandler = useCallback((event) => {
    if (event.type !== RoundEventType.ROUND) return;
    const roundEvent = event as RoundEvent;
    
    try {
      const { data } = roundEvent;
      updateRound(data.roundId, {
        status: Number(data.state) === 0 ? RoundStatus.WAITING : 
                Number(data.state) === 1 ? RoundStatus.STARTED :
                Number(data.state) === 2 ? RoundStatus.ENDED :
                RoundStatus.CANCELLED,
        nextCardIndex: Number(data.nextCardIndex),
        playersCount: Number(data.playersCount),
        readyPlayersCount: Number(data.readyPlayersCount)
      });
    } catch (error) {
      setError(`Error handling round update: ${error}`);
    }
  }, [updateRound, setError]);

  // Handle player events
  const handlePlayerEvent: EventHandler = useCallback((event) => {
    if (event.type !== RoundEventType.ROUND_PLAYER) return;
    const playerEvent = event as PlayerEvent;
    
    try {
      const { data } = playerEvent;
      const [playerAddress, roundId] = data.playerToRoundId;
      
      const currentRound = useRoundStore.getState().rounds.get(roundId.toString());
      if (!currentRound) return;

      const playerIndex = currentRound.players.findIndex(
        (p: { address: string }) => p.address === playerAddress
      );

      const updatedRound = {
        ...currentRound,
        players: playerIndex === -1
          ? [...currentRound.players, {
              address: playerAddress,
              joined: data.joined,
              readyState: data.readyState
            }]
          : currentRound.players.map((p: { address: string; joined: boolean; readyState: boolean }, i: number) => 
              i === playerIndex
                ? { ...p, joined: data.joined, readyState: data.readyState }
                : p
            )
      };

      updateRound(roundId.toString(), updatedRound);
    } catch (error) {
      setError(`Error handling player event: ${error}`);
    }
  }, [updateRound, setError]);

  // Process entities function - memoized to prevent recreation on every render
  const processEntities = useCallback((entities: any, context: string = '') => {
    console.log(`🔄 Processing entities from ${context}:`, Object.keys(entities || {}));
    
    Object.entries(entities || {}).forEach(([entityId, entity]: [string, any]) => {
      // Skip if already processed
      if (processedEntitiesRef.current.has(entityId)) {
        console.log(`⏭️ Skipping already processed entity: ${entityId}`);
        return;
      }
      
      console.log('🧩 Processing new entity:', {
        entityId,
        entity,
        entityKeys: Object.keys(entity || {}),
        models: entity?.models,
        modelsKeys: entity?.models ? Object.keys(entity.models) : null,
        lyricsflipModels: entity?.models?.lyricsflip,
        lyricsflipKeys: entity?.models?.lyricsflip ? Object.keys(entity.models.lyricsflip) : null
      });
      
      const roundModel = entity.models?.lyricsflip?.Rounds;
      if (roundModel) {
        console.log('🎯 Found Rounds model:', roundModel);
        roundEventBus.emit({
          type: RoundEventType.ROUND,
          timestamp: Date.now(),
          roundId: roundModel.round_id.toString(),
          data: roundModel,
        });
      }
      
      const playerModel = entity.models?.lyricsflip?.RoundPlayer;
      if (playerModel) {
        console.log('👤 Found RoundPlayer model:', playerModel);
        roundEventBus.emit({
          type: RoundEventType.ROUND_PLAYER,
          timestamp: Date.now(),
          roundId: playerModel.player_to_round_id[1].toString(),
          data: playerModel,
        });
      }
      
      const createdModel = entity.models?.lyricsflip?.RoundCreated;
      if (createdModel) {
        console.log('🎉 Found RoundCreated model:', createdModel);
        roundEventBus.emit({
          type: RoundEventType.ROUND_CREATED,
          timestamp: Date.now(),
          roundId: createdModel.round_id.toString(),
          data: createdModel,
        });
      }
      
      // Mark entity as processed using ref (no state update)
      processedEntitiesRef.current.add(entityId);
    });
  }, []); // No dependencies since we use refs

  // Subscribe to events
  useEffect(() => {
    const subscriptions = [
      roundEventBus.subscribe({
        type: RoundEventType.ROUND_CREATED,
        handler: handleRoundCreated
      }),
      roundEventBus.subscribe({
        type: RoundEventType.ROUND,
        handler: handleRoundUpdate
      }),
      roundEventBus.subscribe({
        type: RoundEventType.ROUND_PLAYER,
        handler: handlePlayerEvent
      })
    ];

    // Cleanup subscriptions
    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
    };
  }, [handleRoundCreated, handleRoundUpdate, handlePlayerEvent]);

  // Process initial entities when they change
  useEffect(() => {
    console.log('🚀 Processing existing entities on subscription setup:', Object.keys(entities || {}));
    
    if (entities && Object.keys(entities).length > 0 && !hasProcessedInitialRef.current) {
      processEntities(entities, 'initial load');
      hasProcessedInitialRef.current = true;
    }
  }, [entities, processEntities]);

  // Set up store subscription for future updates  
  useEffect(() => {
    console.log('🔧 Setting up store subscription...');
    
    // Set up subscription for future updates
    const unsubscribeRound = storeHook?.subscribe ? storeHook.subscribe(
      (state: any) => {
        console.log('🔧 Store selector called - state:', state);
        return state.entities;
      },
      (entities: any, prevEntities: any) => {
        console.log('🔄 Store subscription callback triggered!');
        console.log('🔄 Previous entities keys:', Object.keys(prevEntities || {}));
        console.log('🔄 Current entities keys:', Object.keys(entities || {}));
        
        // Only process if entities actually changed
        if (entities !== prevEntities) {
          processEntities(entities, 'subscription update');
        } else {
          console.log('🔄 Entities unchanged, skipping processing');
        }
      }
    ) : (() => {
      console.log('❌ No subscribe function available on storeHook');
      return () => {};
    })();
    
    console.log('🔧 Store subscription result:', {
      unsubscribeRound: !!unsubscribeRound,
      unsubscribeType: typeof unsubscribeRound
    });

    return () => {
      unsubscribeRound && unsubscribeRound();
    };
  }, [storeHook, processEntities]); // Added processEntities to dependencies

  return {
    latestEvent: latestCreatedEvent as any,
    error: useRoundStore.getState().error,
    isSubscribed: true
  };
}; 