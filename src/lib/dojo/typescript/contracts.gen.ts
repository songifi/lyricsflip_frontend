import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum, ByteArray } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_actions_addBatchLyricsCard_calldata = (cards: Array<CardData>): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "add_batch_lyrics_card",
			calldata: [cards],
		};
	};

	const actions_addBatchLyricsCard = async (snAccount: Account | AccountInterface, cards: Array<CardData>) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_addBatchLyricsCard_calldata(cards),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_addLyricsCard_calldata = (genre: CairoCustomEnum, artist: BigNumberish, title: BigNumberish, year: BigNumberish, lyrics: ByteArray): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "add_lyrics_card",
			calldata: [genre, artist, title, year, lyrics],
		};
	};

	const actions_addLyricsCard = async (snAccount: Account | AccountInterface, genre: CairoCustomEnum, artist: BigNumberish, title: BigNumberish, year: BigNumberish, lyrics: ByteArray) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_addLyricsCard_calldata(genre, artist, title, year, lyrics),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_createRound_calldata = (mode: CairoCustomEnum, challengeType: CairoOption<CairoCustomEnum>, challengeParam1: CairoOption<CairoCustomEnum>, challengeParam2: CairoOption<CairoCustomEnum>): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "create_round",
			calldata: [mode, challengeType, challengeParam1, challengeParam2],
		};
	};

	const actions_createRound = async (snAccount: Account | AccountInterface, mode: CairoCustomEnum, challengeType: CairoOption<CairoCustomEnum>, challengeParam1: CairoOption<CairoCustomEnum>, challengeParam2: CairoOption<CairoCustomEnum>) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_createRound_calldata(mode, challengeType, challengeParam1, challengeParam2),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_forceStartRound_calldata = (roundId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "force_start_round",
			calldata: [roundId],
		};
	};

	const actions_forceStartRound = async (snAccount: Account | AccountInterface, roundId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_forceStartRound_calldata(roundId),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_isRoundPlayer_calldata = (roundId: BigNumberish, player: string): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "is_round_player",
			calldata: [roundId, player],
		};
	};

	const actions_isRoundPlayer = async (roundId: BigNumberish, player: string) => {
		try {
			return await provider.call("lyricsflip", build_actions_isRoundPlayer_calldata(roundId, player));
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_joinRound_calldata = (roundId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "join_round",
			calldata: [roundId],
		};
	};

	const actions_joinRound = async (snAccount: Account | AccountInterface, roundId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_joinRound_calldata(roundId),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_nextCard_calldata = (roundId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "next_card",
			calldata: [roundId],
		};
	};

	const actions_nextCard = async (snAccount: Account | AccountInterface, roundId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_nextCard_calldata(roundId),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_startRound_calldata = (roundId: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "start_round",
			calldata: [roundId],
		};
	};

	const actions_startRound = async (snAccount: Account | AccountInterface, roundId: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_startRound_calldata(roundId),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_submitAnswer_calldata = (roundId: BigNumberish, answer: CairoCustomEnum): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "submit_answer",
			calldata: [roundId, answer],
		};
	};

	const actions_submitAnswer = async (snAccount: Account | AccountInterface, roundId: BigNumberish, answer: CairoCustomEnum) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_submitAnswer_calldata(roundId, answer),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_config_setAdminAddress_calldata = (adminAddress: string): DojoCall => {
		return {
			contractName: "game_config",
			entrypoint: "set_admin_address",
			calldata: [adminAddress],
		};
	};

	const game_config_setAdminAddress = async (snAccount: Account | AccountInterface, adminAddress: string) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_config_setAdminAddress_calldata(adminAddress),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_config_setCardsPerRound_calldata = (cardsPerRound: BigNumberish): DojoCall => {
		return {
			contractName: "game_config",
			entrypoint: "set_cards_per_round",
			calldata: [cardsPerRound],
		};
	};

	const game_config_setCardsPerRound = async (snAccount: Account | AccountInterface, cardsPerRound: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_config_setCardsPerRound_calldata(cardsPerRound),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_game_config_setGameConfig_calldata = (cardsPerRound: BigNumberish): DojoCall => {
		return {
			contractName: "game_config",
			entrypoint: "set_game_config",
			calldata: [cardsPerRound],
		};
	};

	const game_config_setGameConfig = async (snAccount: Account | AccountInterface, cardsPerRound: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_game_config_setGameConfig_calldata(cardsPerRound),
				"lyricsflip",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		actions: {
			addBatchLyricsCard: actions_addBatchLyricsCard,
			buildAddBatchLyricsCardCalldata: build_actions_addBatchLyricsCard_calldata,
			addLyricsCard: actions_addLyricsCard,
			buildAddLyricsCardCalldata: build_actions_addLyricsCard_calldata,
			createRound: actions_createRound,
			buildCreateRoundCalldata: build_actions_createRound_calldata,
			forceStartRound: actions_forceStartRound,
			buildForceStartRoundCalldata: build_actions_forceStartRound_calldata,
			isRoundPlayer: actions_isRoundPlayer,
			buildIsRoundPlayerCalldata: build_actions_isRoundPlayer_calldata,
			joinRound: actions_joinRound,
			buildJoinRoundCalldata: build_actions_joinRound_calldata,
			nextCard: actions_nextCard,
			buildNextCardCalldata: build_actions_nextCard_calldata,
			startRound: actions_startRound,
			buildStartRoundCalldata: build_actions_startRound_calldata,
			submitAnswer: actions_submitAnswer,
			buildSubmitAnswerCalldata: build_actions_submitAnswer_calldata,
		},
		game_config: {
			setAdminAddress: game_config_setAdminAddress,
			buildSetAdminAddressCalldata: build_game_config_setAdminAddress_calldata,
			setCardsPerRound: game_config_setCardsPerRound,
			buildSetCardsPerRoundCalldata: build_game_config_setCardsPerRound_calldata,
			setGameConfig: game_config_setGameConfig,
			buildSetGameConfigCalldata: build_game_config_setGameConfig_calldata,
		},
	};
}