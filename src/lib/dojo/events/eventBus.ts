import { useDojoSDK, useModels } from "@dojoengine/sdk/react";
import { ModelsMapping } from "../typescript/models.gen";
import { 
  RoundEventType, 
  RoundEvent, 
  PlayerEvent, 
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
      debug: false,
      maxListeners: 10,
      retryAttempts: 5,
      retryDelay: 1000,
      ...options
    };
    this.debug = this.options.debug || false;
  }

  public static getInstance(options?: EventBusOptions): RoundEventBus {
    if (!RoundEventBus.instance) {
      RoundEventBus.instance = new RoundEventBus(options);
    }
    return RoundEventBus.instance;
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log('[RoundEventBus]', ...args);
    }
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
    this.log(`Subscribed to ${type} events`);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        this.log(`Unsubscribed from ${type} events`);
      }
    };
  }

  public emit(event: RoundEvent | PlayerEvent): void {
    const { type } = event;
    const handlers = this.handlers.get(type);

    if (!handlers) {
      this.log(`No handlers for event type: ${type}`);
      return;
    }

    this.log(`Emitting ${type} event:`, event);
    handlers.forEach(handler => {
      try {
        handler(event);
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