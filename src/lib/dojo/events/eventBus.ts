import { useDojoSDK, useModels } from "@dojoengine/sdk/react";
import { ModelsMapping } from "../typescript/models.gen";
import { 
  RoundEventType, 
  RoundEvent, 
  PlayerEvent, 
  RoundJoinedEvent,
  EventHandler, 
  EventSubscription,
  EventBusOptions 
} from "./types";

class RoundEventBus {
  private static instance: RoundEventBus;
  private handlers: Map<RoundEventType, Set<EventHandler>>;
  private options: EventBusOptions;
  private debug: boolean;

  private constructor(options: EventBusOptions = {}) {
    this.handlers = new Map();
    this.options = {
      debug: true,
      maxListeners: 10,
      retryAttempts: 5,
      retryDelay: 1000,
      ...options
    };
    this.debug = true;
  }

  public static getInstance(options?: EventBusOptions): RoundEventBus {
    if (!RoundEventBus.instance) {
      RoundEventBus.instance = new RoundEventBus(options);
    }
    return RoundEventBus.instance;
  }

  private log(...args: any[]) {
    console.log('[RoundEventBus]', ...args);
  }

  public subscribe(subscription: EventSubscription): () => void {
    const { type, handler } = subscription;
    
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }

    const handlers = this.handlers.get(type)!;
    
    if (handlers.size >= (this.options.maxListeners || 10)) {
      console.warn(`[RoundEventBus] Max listeners (${this.options.maxListeners}) reached for event type: ${type}`);
    }

    handlers.add(handler);
    this.log(`Subscribed to ${type} events. Current handler count: ${handlers.size}`);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        this.log(`Unsubscribed from ${type} events. Remaining handlers: ${handlers.size}`);
      }
    };
  }

  public emit(event: RoundEvent | PlayerEvent | RoundJoinedEvent): void {
    const { type } = event;
    const handlers = this.handlers.get(type);

    this.log(`Emitting ${type} event:`, {
      event,
      handlerCount: handlers?.size || 0,
      hasHandlers: !!handlers,
      eventType: type,
      eventData: event.data
    });

    if (!handlers) {
      this.log(`No handlers for event type: ${type}`);
      return;
    }

    handlers.forEach(handler => {
      try {
        this.log(`Calling handler for ${type} event with data:`, event.data);
        handler(event);
        this.log(`Handler for ${type} event completed successfully`);
      } catch (error) {
        console.error(`[RoundEventBus] Error in event handler for ${type}:`, error);
      }
    });
  }

  public clear(): void {
    this.handlers.clear();
    this.log('Cleared all event handlers');
  }

  public getHandlerCount(type: RoundEventType): number {
    return this.handlers.get(type)?.size || 0;
  }
}

// Export singleton instance
export const roundEventBus = RoundEventBus.getInstance();

// Export hook for using the event bus
export const useRoundEventBus = () => {
  const { client } = useDojoSDK();
  const roundModels = useModels(ModelsMapping.Rounds);
  const playerModels = useModels(ModelsMapping.RoundPlayer);

  return {
    subscribe: roundEventBus.subscribe.bind(roundEventBus),
    emit: roundEventBus.emit.bind(roundEventBus),
    clear: roundEventBus.clear.bind(roundEventBus),
    getHandlerCount: roundEventBus.getHandlerCount.bind(roundEventBus)
  };
}; 