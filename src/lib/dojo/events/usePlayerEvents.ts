import { useEffect } from 'react';
import { useModels } from '@dojoengine/sdk/react';
import { ModelsMapping } from '../typescript/models.gen';
import { roundEventBus } from './eventBus';
import { RoundEventType, PlayerEvent, EventHandler } from './types';
import { useRoundStore } from './roundStore';

interface DojoModel {
  subscribe: (callback: (model: any) => void) => { unsubscribe: () => void };
}

export interface UsePlayerEventsReturn {
  playerModels: DojoModel | null;
}

/**
 * Dedicated hook for listening to RoundPlayer model updates and updating the
 * Zustand roundStore via the event bus. Keeps player-specific logic out of
 * useRoundEvents.
 */
export const usePlayerEvents = (): UsePlayerEventsReturn => {
  const playerModels = useModels(ModelsMapping.RoundPlayer) as unknown as DojoModel;
  const { updateRound, setError } = useRoundStore();

  const handlePlayerEvent: EventHandler = (event) => {
    if (event.type !== RoundEventType.ROUND_PLAYER) return;
    const playerEvent = event as PlayerEvent;

    try {
      const { data } = playerEvent;
      const [playerAddress, roundId] = data.playerToRoundId;

      const currentRound = useRoundStore.getState().rounds.get(roundId.toString());
      if (!currentRound) return;

      const playerIndex = currentRound.players.findIndex((p) => p.address === playerAddress);

      const updatedRound = {
        ...currentRound,
        players:
          playerIndex === -1
            ? [
                ...currentRound.players,
                {
                  address: playerAddress,
                  joined: data.joined,
                  readyState: data.readyState,
                },
              ]
            : currentRound.players.map((p, i) =>
                i === playerIndex ? { ...p, joined: data.joined, readyState: data.readyState } : p
              ),
      };

      updateRound(roundId.toString(), updatedRound);
    } catch (error) {
      setError(`Error handling player event: ${error}`);
    }
  };

  // Subscribe to RoundEventBus events
  useEffect(() => {
    const unsubscribeBus = roundEventBus.subscribe({
      type: RoundEventType.ROUND_PLAYER,
      handler: handlePlayerEvent,
    });

    return () => unsubscribeBus();
  }, []);

  // Subscribe to Dojo model updates
  useEffect(() => {
    if (!playerModels?.subscribe) return;

    const playerSubscription = playerModels.subscribe((model: any) => {
      if (!model) return;

      roundEventBus.emit({
        type: RoundEventType.ROUND_PLAYER,
        timestamp: Date.now(),
        roundId: model.playerToRoundId[1].toString(),
        data: model,
      });
    });

    return () => playerSubscription.unsubscribe();
  }, [playerModels]);

  return { playerModels };
}; 