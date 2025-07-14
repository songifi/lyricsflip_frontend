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

// Type definition for `lyricsflip::models::card::GenreCards` struct
export interface GenreCards {
	genre: BigNumberish;
	cards: Array<BigNumberish>;
}

// Type definition for `lyricsflip::models::card::GenreCardsValue` struct
export interface GenreCardsValue {
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

// Type definition for `lyricsflip::models::card::QuestionCard` struct
export interface QuestionCard {
	lyric: string;
	option_one: [BigNumberish, BigNumberish];
	option_two: [BigNumberish, BigNumberish];
	option_three: [BigNumberish, BigNumberish];
	option_four: [BigNumberish, BigNumberish];
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
	config_init: boolean;
}

// Type definition for `lyricsflip::models::config::GameConfigValue` struct
export interface GameConfigValue {
	cards_per_round: BigNumberish;
	admin_address: string;
	config_init: boolean;
}

// Type definition for `lyricsflip::models::player::PlayerStats` struct
export interface PlayerStats {
	player: string;
	total_rounds: BigNumberish;
	rounds_won: BigNumberish;
	current_streak: BigNumberish;
	max_streak: BigNumberish;
}

// Type definition for `lyricsflip::models::player::PlayerStatsValue` struct
export interface PlayerStatsValue {
	total_rounds: BigNumberish;
	rounds_won: BigNumberish;
	current_streak: BigNumberish;
	max_streak: BigNumberish;
}

// Type definition for `lyricsflip::models::round::Round` struct
export interface Round {
	round_id: BigNumberish;
	creator: string;
	wager_amount: BigNumberish;
	start_time: BigNumberish;
	state: BigNumberish;
	end_time: BigNumberish;
	players_count: BigNumberish;
	ready_players_count: BigNumberish;
	round_cards: Array<BigNumberish>;
	players: Array<string>;
	question_cards: Array<QuestionCard>;
	mode: BigNumberish;
	challenge_type: BigNumberish;
	creation_time: BigNumberish;
}

// Type definition for `lyricsflip::models::round::RoundPlayer` struct
export interface RoundPlayer {
	player_to_round_id: [string, BigNumberish];
	joined: boolean;
	ready_state: boolean;
	next_card_index: BigNumberish;
	round_completed: boolean;
	current_card_start_time: BigNumberish;
	card_timeout: BigNumberish;
	correct_answers: BigNumberish;
	total_answers: BigNumberish;
	total_score: BigNumberish;
	best_time: BigNumberish;
}

// Type definition for `lyricsflip::models::round::RoundPlayerValue` struct
export interface RoundPlayerValue {
	joined: boolean;
	ready_state: boolean;
	next_card_index: BigNumberish;
	round_completed: boolean;
	current_card_start_time: BigNumberish;
	card_timeout: BigNumberish;
	correct_answers: BigNumberish;
	total_answers: BigNumberish;
	total_score: BigNumberish;
	best_time: BigNumberish;
}

// Type definition for `lyricsflip::models::round::RoundValue` struct
export interface RoundValue {
	creator: string;
	wager_amount: BigNumberish;
	start_time: BigNumberish;
	state: BigNumberish;
	end_time: BigNumberish;
	players_count: BigNumberish;
	ready_players_count: BigNumberish;
	round_cards: Array<BigNumberish>;
	players: Array<string>;
	question_cards: Array<QuestionCard>;
	mode: BigNumberish;
	challenge_type: BigNumberish;
	creation_time: BigNumberish;
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

// Type definition for `lyricsflip::systems::actions::actions::PlayerAnswer` struct
export interface PlayerAnswer {
	round_id: BigNumberish;
	player: string;
	card_id: BigNumberish;
	is_correct: boolean;
	time_taken: BigNumberish;
}

// Type definition for `lyricsflip::systems::actions::actions::PlayerAnswerValue` struct
export interface PlayerAnswerValue {
	card_id: BigNumberish;
	is_correct: boolean;
	time_taken: BigNumberish;
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

// Type definition for `lyricsflip::systems::actions::actions::RoundForceStarted` struct
export interface RoundForceStarted {
	round_id: BigNumberish;
	admin: string;
	timestamp: BigNumberish;
}

// Type definition for `lyricsflip::systems::actions::actions::RoundForceStartedValue` struct
export interface RoundForceStartedValue {
	admin: string;
	timestamp: BigNumberish;
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

// Type definition for `lyricsflip::systems::actions::actions::RoundWinner` struct
export interface RoundWinner {
	round_id: BigNumberish;
	winner: string;
	score: BigNumberish;
}

// Type definition for `lyricsflip::systems::actions::actions::RoundWinnerValue` struct
export interface RoundWinnerValue {
	score: BigNumberish;
}

export interface SchemaType extends ISchemaType {
	lyricsflip: {
		ArtistCards: ArtistCards,
		ArtistCardsValue: ArtistCardsValue,
		GenreCards: GenreCards,
		GenreCardsValue: GenreCardsValue,
		LyricsCard: LyricsCard,
		LyricsCardCount: LyricsCardCount,
		LyricsCardCountValue: LyricsCardCountValue,
		LyricsCardValue: LyricsCardValue,
		QuestionCard: QuestionCard,
		YearCards: YearCards,
		YearCardsValue: YearCardsValue,
		GameConfig: GameConfig,
		GameConfigValue: GameConfigValue,
		PlayerStats: PlayerStats,
		PlayerStatsValue: PlayerStatsValue,
		Round: Round,
		RoundPlayer: RoundPlayer,
		RoundPlayerValue: RoundPlayerValue,
		RoundValue: RoundValue,
		RoundsCount: RoundsCount,
		RoundsCountValue: RoundsCountValue,
		PlayerAnswer: PlayerAnswer,
		PlayerAnswerValue: PlayerAnswerValue,
		PlayerReady: PlayerReady,
		PlayerReadyValue: PlayerReadyValue,
		RoundCreated: RoundCreated,
		RoundCreatedValue: RoundCreatedValue,
		RoundForceStarted: RoundForceStarted,
		RoundForceStartedValue: RoundForceStartedValue,
		RoundJoined: RoundJoined,
		RoundJoinedValue: RoundJoinedValue,
		RoundWinner: RoundWinner,
		RoundWinnerValue: RoundWinnerValue,
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
		GenreCards: {
			genre: 0,
			cards: [0],
		},
		GenreCardsValue: {
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
		QuestionCard: {
		lyric: "",
			option_one: [0, 0],
			option_two: [0, 0],
			option_three: [0, 0],
			option_four: [0, 0],
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
			config_init: false,
		},
		GameConfigValue: {
			cards_per_round: 0,
			admin_address: "",
			config_init: false,
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
			round_id: 0,
			creator: "",
		wager_amount: 0,
			start_time: 0,
			state: 0,
			end_time: 0,
		players_count: 0,
		ready_players_count: 0,
			round_cards: [0],
			players: [""],
			question_cards: [{ lyric: "", option_one: [0, 0], option_two: [0, 0], option_three: [0, 0], option_four: [0, 0], }],
			mode: 0,
			challenge_type: 0,
			creation_time: 0,
		},
		RoundPlayer: {
			player_to_round_id: ["", 0],
			joined: false,
			ready_state: false,
			next_card_index: 0,
			round_completed: false,
			current_card_start_time: 0,
			card_timeout: 0,
			correct_answers: 0,
			total_answers: 0,
			total_score: 0,
			best_time: 0,
		},
		RoundPlayerValue: {
			joined: false,
			ready_state: false,
			next_card_index: 0,
			round_completed: false,
			current_card_start_time: 0,
			card_timeout: 0,
			correct_answers: 0,
			total_answers: 0,
			total_score: 0,
			best_time: 0,
		},
		RoundValue: {
			creator: "",
		wager_amount: 0,
			start_time: 0,
			state: 0,
			end_time: 0,
		players_count: 0,
		ready_players_count: 0,
			round_cards: [0],
			players: [""],
			question_cards: [{ lyric: "", option_one: [0, 0], option_two: [0, 0], option_three: [0, 0], option_four: [0, 0], }],
			mode: 0,
			challenge_type: 0,
			creation_time: 0,
		},
		RoundsCount: {
			id: 0,
			count: 0,
		},
		RoundsCountValue: {
			count: 0,
		},
		PlayerAnswer: {
			round_id: 0,
			player: "",
			card_id: 0,
			is_correct: false,
			time_taken: 0,
		},
		PlayerAnswerValue: {
			card_id: 0,
			is_correct: false,
			time_taken: 0,
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
		RoundForceStarted: {
			round_id: 0,
			admin: "",
			timestamp: 0,
		},
		RoundForceStartedValue: {
			admin: "",
			timestamp: 0,
		},
		RoundJoined: {
			round_id: 0,
			player: "",
		},
		RoundJoinedValue: {
			player: "",
		},
		RoundWinner: {
			round_id: 0,
			winner: "",
			score: 0,
		},
		RoundWinnerValue: {
			score: 0,
		},
	},
};
export enum ModelsMapping {
	ArtistCards = 'lyricsflip-ArtistCards',
	ArtistCardsValue = 'lyricsflip-ArtistCardsValue',
	GenreCards = 'lyricsflip-GenreCards',
	GenreCardsValue = 'lyricsflip-GenreCardsValue',
	LyricsCard = 'lyricsflip-LyricsCard',
	LyricsCardCount = 'lyricsflip-LyricsCardCount',
	LyricsCardCountValue = 'lyricsflip-LyricsCardCountValue',
	LyricsCardValue = 'lyricsflip-LyricsCardValue',
	QuestionCard = 'lyricsflip-QuestionCard',
	YearCards = 'lyricsflip-YearCards',
	YearCardsValue = 'lyricsflip-YearCardsValue',
	GameConfig = 'lyricsflip-GameConfig',
	GameConfigValue = 'lyricsflip-GameConfigValue',
	PlayerStats = 'lyricsflip-PlayerStats',
	PlayerStatsValue = 'lyricsflip-PlayerStatsValue',
	Round = 'lyricsflip-Round',
	RoundPlayer = 'lyricsflip-RoundPlayer',
	RoundPlayerValue = 'lyricsflip-RoundPlayerValue',
	RoundValue = 'lyricsflip-RoundValue',
	RoundsCount = 'lyricsflip-RoundsCount',
	RoundsCountValue = 'lyricsflip-RoundsCountValue',
	PlayerAnswer = 'lyricsflip-PlayerAnswer',
	PlayerAnswerValue = 'lyricsflip-PlayerAnswerValue',
	PlayerReady = 'lyricsflip-PlayerReady',
	PlayerReadyValue = 'lyricsflip-PlayerReadyValue',
	RoundCreated = 'lyricsflip-RoundCreated',
	RoundCreatedValue = 'lyricsflip-RoundCreatedValue',
	RoundForceStarted = 'lyricsflip-RoundForceStarted',
	RoundForceStartedValue = 'lyricsflip-RoundForceStartedValue',
	RoundJoined = 'lyricsflip-RoundJoined',
	RoundJoinedValue = 'lyricsflip-RoundJoinedValue',
	RoundWinner = 'lyricsflip-RoundWinner',
	RoundWinnerValue = 'lyricsflip-RoundWinnerValue',
}