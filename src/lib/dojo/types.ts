import { IWorld } from "@dojoengine/core";

export enum Genre {
    HipHop = "HipHop",
    Pop = "Pop",
    Rock = "Rock",
    RnB = "RnB",
    Electronic = "Electronic",
    Classical = "Classical",
    Jazz = "Jazz",
    Country = "Country",
    Blues = "Blues",
    Reggae = "Reggae",
    Afrobeat = "Afrobeat",
    Gospel = "Gospel",
    Folk = "Folk"
}

export enum RoundState {
    Pending = "PENDING",
    Started = "STARTED",
    Completed = "COMPLETED"
}

export interface Round {
    creator: string;
    genre: string;
    wager_amount: string;
    start_time: string;
    state: string;
    end_time: string;
    next_card_index: number;
    players_count: string;
    ready_players_count: string;
}

export interface Rounds {
    round_id: string;
    round: Round;
}

export interface RoundPlayer {
    player_to_round_id: [string, string];
    joined: boolean;
    ready_state: boolean;
}

export interface PlayerStats {
    player: string;
    total_rounds: string;
    rounds_won: string;
    current_streak: string;
    max_streak: string;
}

export interface GameConfig {
    id: string;
    cards_per_round: number;
    admin_address: string;
}

export interface LyricsCard {
    card_id: string;
    genre: string;
    artist: string;
    title: string;
    year: string;
    lyrics: string;
}

export interface SystemCalls {
    createRound: (genre: Genre) => Promise<string>;
    joinRound: (roundId: string) => Promise<void>;
    startRound: (roundId: string) => Promise<void>;
    isRoundPlayer: (roundId: string, player: string) => Promise<boolean>;
    addLyricsCard: (
        genre: Genre,
        artist: string,
        title: string,
        year: string,
        lyrics: string
    ) => Promise<string>;
    setCardsPerRound: (cardsPerRound: number) => Promise<void>;
    setAdminAddress: (adminAddress: string) => Promise<void>;
} 