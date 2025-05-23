import { BigNumberish } from "starknet";

// Event Types Enum - matches ModelsMapping from models.gen.ts
export enum RoundEventType {
  ROUND_CREATED = "lyricsflip-RoundCreated",
  ROUND_JOINED = "lyricsflip-RoundJoined",
  ROUND_PLAYER = "lyricsflip-RoundPlayer",
  ROUND = "lyricsflip-Round"
}

// Round State - matches actual state values from useRoundEvents.ts
export enum RoundStatus {
  CREATING = "creating",
  WAITING = "waiting",
  STARTED = "started",
  ENDED = "ended",
  CANCELLED = "cancelled"
}

// Base Event Interface
export interface BaseEvent {
  type: RoundEventType;
  timestamp: number;
  roundId: string;
}

// Round Event Interface - matches actual Round interface from models.gen.ts
export interface RoundEvent extends BaseEvent {
  data: {
    roundId: string;
    creator: string;
    genre: BigNumberish;
    wagerAmount: BigNumberish;
    startTime: BigNumberish;
    state: BigNumberish;
    endTime: BigNumberish;
    nextCardIndex: BigNumberish;
    playersCount: BigNumberish;
    readyPlayersCount: BigNumberish;
  };
}

// Player Event Interface - matches RoundPlayer from models.gen.ts
export interface PlayerEvent extends BaseEvent {
  data: {
    playerToRoundId: [string, BigNumberish];
    joined: boolean;
    readyState: boolean;
  };
}

// Event Handler Type
export type EventHandler = (event: RoundEvent | PlayerEvent) => void;

// Event Subscription Type
export interface EventSubscription {
  type: RoundEventType;
  handler: EventHandler;
}

// Round State Interface - matches actual round state from useRoundEvents.ts
export interface RoundState {
  id: string;
  status: RoundStatus;
  genre: string;
  wagerAmount: string;
  nextCardIndex: number;
  playersCount: number;
  readyPlayersCount: number;
  players: Array<{
    address: string;
    joined: boolean;
    readyState: boolean;
  }>;
}

// Event Bus Options
export interface EventBusOptions {
  debug?: boolean;
  maxListeners?: number;
  retryAttempts?: number;
  retryDelay?: number;
} 