import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { BigNumberish } from 'starknet';

// Type definition for `lyricsflip::models::card::ArtistCards` struct
export interface ArtistCards {
	artist: BigNumberish;
	cards: Array<BigNumberish>;
}

// Type definition for `lyricsflip::models::card::ArtistCardsValue` struct
export interface ArtistCardsValue {
	cards: Array<BigNumberish>;
}

// Type definition for `lyricsflip::models::card::LyricsCard` struct
export interface LyricsCard {
	card_id: BigNumberish;
	genre: BigNumberish;
	artist: BigNumberish;
	title: BigNumberish;
	year: BigNumberish;
	lyrics: string;
}

// Type definition for `lyricsflip::models::card::LyricsCardCount` struct
export interface LyricsCardCount {
	id: BigNumberish;
	count: BigNumberish;
}

// Type definition for `lyricsflip::models::card::LyricsCardCountValue` struct
export interface LyricsCardCountValue {
	count: BigNumberish;
}

// Type definition for `lyricsflip::models::card::LyricsCardValue` struct
export interface LyricsCardValue {
	genre: BigNumberish;
	artist: BigNumberish;
	title: BigNumberish;
	year: BigNumberish;
	lyrics: string;
}

// Type definition for `lyricsflip::models::card::YearCards` struct
export interface YearCards {
	year: BigNumberish;
	cards: Array<BigNumberish>;
}

// Type definition for `lyricsflip::models::card::YearCardsValue` struct
export interface YearCardsValue {
	cards: Array<BigNumberish>;
}

// Type definition for `lyricsflip::models::config::GameConfig` struct
export interface GameConfig {
	id: BigNumberish;
	cards_per_round: BigNumberish;
	admin_address: string;
}

// Type definition for `lyricsflip::models::config::GameConfigValue` struct
export interface GameConfigValue {
	cards_per_round: BigNumberish;
	admin_address: string;
}

// Type definition for `lyricsflip::models::round::PlayerStats` struct
export interface PlayerStats {
	player: string;
	total_rounds: BigNumberish;
	rounds_won: BigNumberish;
	current_streak: BigNumberish;
	max_streak: BigNumberish;
}

// Type definition for `lyricsflip::models::round::PlayerStatsValue` struct
export interface PlayerStatsValue {
	total_rounds: BigNumberish;
	rounds_won: BigNumberish;
	current_streak: BigNumberish;
	max_streak: BigNumberish;
}

// Type definition for `lyricsflip::models::round::Round` struct
export interface Round {
	creator: string;
	genre: BigNumberish;
	wager_amount: BigNumberish;
	start_time: BigNumberish;
	state: BigNumberish;
	end_time: BigNumberish;
	next_card_index: BigNumberish;
	players_count: BigNumberish;
	ready_players_count: BigNumberish;
}

// Type definition for `lyricsflip::models::round::RoundPlayer` struct
export interface RoundPlayer {
	player_to_round_id: [string, BigNumberish];
	joined: boolean;
	ready_state: boolean;
}

// Type definition for `lyricsflip::models::round::RoundPlayerValue` struct
export interface RoundPlayerValue {
	joined: boolean;
	ready_state: boolean;
}

// Type definition for `lyricsflip::models::round::Rounds` struct
export interface Rounds {
	round_id: BigNumberish;
	round: Round;
}

// Type definition for `lyricsflip::models::round::RoundsCount` struct
export interface RoundsCount {
	id: BigNumberish;
	count: BigNumberish;
}

// Type definition for `lyricsflip::models::round::RoundsCountValue` struct
export interface RoundsCountValue {
	count: BigNumberish;
}

// Type definition for `lyricsflip::models::round::RoundsValue` struct
export interface RoundsValue {
	round: Round;
}

// Type definition for `lyricsflip::systems::actions::actions::PlayerReady` struct
export interface PlayerReady {
	round_id: BigNumberish;
	player: string;
	ready_time: BigNumberish;
}

// Type definition for `lyricsflip::systems::actions::actions::PlayerReadyValue` struct
export interface PlayerReadyValue {
	ready_time: BigNumberish;
}

// Type definition for `lyricsflip::systems::actions::actions::RoundCreated` struct
export interface RoundCreated {
	round_id: BigNumberish;
	creator: string;
}

// Type definition for `lyricsflip::systems::actions::actions::RoundCreatedValue` struct
export interface RoundCreatedValue {
	creator: string;
}

// Type definition for `lyricsflip::systems::actions::actions::RoundJoined` struct
export interface RoundJoined {
	round_id: BigNumberish;
	player: string;
}

// Type definition for `lyricsflip::systems::actions::actions::RoundJoinedValue` struct
export interface RoundJoinedValue {
	player: string;
}

export interface SchemaType extends ISchemaType {
	lyricsflip: {
		ArtistCards: ArtistCards,
		ArtistCardsValue: ArtistCardsValue,
		LyricsCard: LyricsCard,
		LyricsCardCount: LyricsCardCount,
		LyricsCardCountValue: LyricsCardCountValue,
		LyricsCardValue: LyricsCardValue,
		YearCards: YearCards,
		YearCardsValue: YearCardsValue,
		GameConfig: GameConfig,
		GameConfigValue: GameConfigValue,
		PlayerStats: PlayerStats,
		PlayerStatsValue: PlayerStatsValue,
		Round: Round,
		RoundPlayer: RoundPlayer,
		RoundPlayerValue: RoundPlayerValue,
		Rounds: Rounds,
		RoundsCount: RoundsCount,
		RoundsCountValue: RoundsCountValue,
		RoundsValue: RoundsValue,
		PlayerReady: PlayerReady,
		PlayerReadyValue: PlayerReadyValue,
		RoundCreated: RoundCreated,
		RoundCreatedValue: RoundCreatedValue,
		RoundJoined: RoundJoined,
		RoundJoinedValue: RoundJoinedValue,
	},
}
export const schema: SchemaType = {
	lyricsflip: {
		ArtistCards: {
			artist: 0,
			cards: [0],
		},
		ArtistCardsValue: {
			cards: [0],
		},
		LyricsCard: {
		card_id: 0,
			genre: 0,
			artist: 0,
			title: 0,
			year: 0,
		lyrics: "",
		},
		LyricsCardCount: {
			id: 0,
		count: 0,
		},
		LyricsCardCountValue: {
		count: 0,
		},
		LyricsCardValue: {
			genre: 0,
			artist: 0,
			title: 0,
			year: 0,
		lyrics: "",
		},
		YearCards: {
			year: 0,
			cards: [0],
		},
		YearCardsValue: {
			cards: [0],
		},
		GameConfig: {
			id: 0,
			cards_per_round: 0,
			admin_address: "",
		},
		GameConfigValue: {
			cards_per_round: 0,
			admin_address: "",
		},
		PlayerStats: {
			player: "",
			total_rounds: 0,
			rounds_won: 0,
			current_streak: 0,
			max_streak: 0,
		},
		PlayerStatsValue: {
			total_rounds: 0,
			rounds_won: 0,
			current_streak: 0,
			max_streak: 0,
		},
		Round: {
			creator: "",
			genre: 0,
		wager_amount: 0,
			start_time: 0,
			state: 0,
			end_time: 0,
			next_card_index: 0,
		players_count: 0,
		ready_players_count: 0,
		},
		RoundPlayer: {
			player_to_round_id: ["", 0],
			joined: false,
			ready_state: false,
		},
		RoundPlayerValue: {
			joined: false,
			ready_state: false,
		},
		Rounds: {
		round_id: 0,
		round: { creator: "", genre: 0, wager_amount: 0, start_time: 0, state: 0, end_time: 0, next_card_index: 0, players_count: 0, ready_players_count: 0, },
		},
		RoundsCount: {
			id: 0,
		count: 0,
		},
		RoundsCountValue: {
		count: 0,
		},
		RoundsValue: {
		round: { creator: "", genre: 0, wager_amount: 0, start_time: 0, state: 0, end_time: 0, next_card_index: 0, players_count: 0, ready_players_count: 0, },
		},
		PlayerReady: {
		round_id: 0,
			player: "",
			ready_time: 0,
		},
		PlayerReadyValue: {
			ready_time: 0,
		},
		RoundCreated: {
		round_id: 0,
			creator: "",
		},
		RoundCreatedValue: {
			creator: "",
		},
		RoundJoined: {
		round_id: 0,
			player: "",
		},
		RoundJoinedValue: {
			player: "",
		},
	},
};
export enum ModelsMapping {
	ArtistCards = 'lyricsflip-ArtistCards',
	ArtistCardsValue = 'lyricsflip-ArtistCardsValue',
	LyricsCard = 'lyricsflip-LyricsCard',
	LyricsCardCount = 'lyricsflip-LyricsCardCount',
	LyricsCardCountValue = 'lyricsflip-LyricsCardCountValue',
	LyricsCardValue = 'lyricsflip-LyricsCardValue',
	YearCards = 'lyricsflip-YearCards',
	YearCardsValue = 'lyricsflip-YearCardsValue',
	GameConfig = 'lyricsflip-GameConfig',
	GameConfigValue = 'lyricsflip-GameConfigValue',
	PlayerStats = 'lyricsflip-PlayerStats',
	PlayerStatsValue = 'lyricsflip-PlayerStatsValue',
	Round = 'lyricsflip-Round',
	RoundPlayer = 'lyricsflip-RoundPlayer',
	RoundPlayerValue = 'lyricsflip-RoundPlayerValue',
	Rounds = 'lyricsflip-Rounds',
	RoundsCount = 'lyricsflip-RoundsCount',
	RoundsCountValue = 'lyricsflip-RoundsCountValue',
	RoundsValue = 'lyricsflip-RoundsValue',
	PlayerReady = 'lyricsflip-PlayerReady',
	PlayerReadyValue = 'lyricsflip-PlayerReadyValue',
	RoundCreated = 'lyricsflip-RoundCreated',
	RoundCreatedValue = 'lyricsflip-RoundCreatedValue',
	RoundJoined = 'lyricsflip-RoundJoined',
	RoundJoinedValue = 'lyricsflip-RoundJoinedValue',
}