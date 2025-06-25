import { getEntityIdFromKeys } from "@dojoengine/utils";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK, useModels } from "@dojoengine/sdk/react";
import { CairoCustomEnum, CairoOption, BigNumberish, cairo } from "starknet";
import type { Round as ContractRound, RoundPlayer as ContractRoundPlayer, QuestionCard, RoundsCount } from "./typescript/models.gen";
import { ModelsMapping } from "./typescript/models.gen";

// Define game mode enum
export enum GameMode {
	Solo = 0,
	MultiPlayer = 1,
	WagerMultiPlayer = 2,
	Challenge = 3
}

// Define challenge type enum
export enum ChallengeType {
	Random = 0,
	Year = 1,
	Artist = 2,
	Genre = 3,
	Decade = 4,
	GenreAndDecade = 5
}

// Define genre enum matching the contract
export enum Genre {
	HipHop = 0,
	Pop = 1,
	Rock = 2,
	RnB = 3,
	Electronic = 4,
	Classical = 5,
	Jazz = 6,
	Country = 7,
	Blues = 8,
	Reggae = 9,
	Afrobeat = 10,
	Gospel = 11,
	Folk = 12
}

// Helper function to convert genre string to felt252 value
export const genreToFelt252 = (genreVariant: string): string => {
	const genreMap: Record<string, number> = {
		"HipHop": Genre.HipHop,
		"Pop": Genre.Pop,
		"Rock": Genre.Rock,
		"RnB": Genre.RnB,
		"Electronic": Genre.Electronic,
		"Classical": Genre.Classical,
		"Jazz": Genre.Jazz,
		"Country": Genre.Country,
		"Blues": Genre.Blues,
		"Reggae": Genre.Reggae,
		"Afrobeat": Genre.Afrobeat,
		"Gospel": Genre.Gospel,
		"Folk": Genre.Folk
	};
	
	const genreValue = genreMap[genreVariant];
	if (genreValue === undefined) {
		throw new Error(`Unknown genre variant: ${genreVariant}`);
	}
	
	return genreValue.toString();
};

// Define answer enum
export enum Answer {
	OptionOne = 0,
	OptionTwo = 1,
	OptionThree = 2,
	OptionFour = 3
}

// Define round status enum (replacing the imported one)
export enum RoundStatus {
	WAITING = 0,
	IN_PROGRESS = 1,
	ENDED = 2
}

// Define CardData interface for adding lyrics (matching contract expectations)
export interface CardData {
	genre: CairoCustomEnum;
	artist: BigNumberish;
	title: BigNumberish;
	year: BigNumberish;
	lyrics: string;
}

// Helper function to convert string to felt252 (max 31 chars, ASCII only)
export const stringToFelt252 = (str: string): string => {
	// First, convert non-ASCII characters to ASCII equivalents
	const asciiStr = str
		// Replace common accented characters
		.replace(/[àáâãäå]/g, 'a')
		.replace(/[èéêë]/g, 'e')
		.replace(/[ìíîï]/g, 'i')
		.replace(/[òóôõö]/g, 'o')
		.replace(/[ùúûü]/g, 'u')
		.replace(/[ýÿ]/g, 'y')
		.replace(/[ñ]/g, 'n')
		.replace(/[ç]/g, 'c')
		.replace(/[ÀÁÂÃÄÅ]/g, 'A')
		.replace(/[ÈÉÊË]/g, 'E')
		.replace(/[ÌÍÎÏ]/g, 'I')
		.replace(/[ÒÓÔÕÖ]/g, 'O')
		.replace(/[ÙÚÛÜ]/g, 'U')
		.replace(/[ÝŸ]/g, 'Y')
		.replace(/[Ñ]/g, 'N')
		.replace(/[Ç]/g, 'C')
		// Remove any remaining non-ASCII characters
		.replace(/[^\x00-\x7F]/g, '');
	
	// StarkNet felt252 has a 31 character limit
	if (asciiStr.length <= 31) {
		return cairo.felt(asciiStr);
	}
	
	// Smart truncation for long strings
	let truncated = asciiStr;
	
	// For artist names with "ft." - try to shorten collaborations
	if (asciiStr.includes(' ft. ')) {
		const parts = asciiStr.split(' ft. ');
		truncated = parts[0]; // Just use the main artist
	}
	// For other long strings, truncate intelligently
	else if (asciiStr.length > 31) {
		// Try to break at word boundaries if possible
		const words = asciiStr.split(' ');
		truncated = words[0];
		for (let i = 1; i < words.length; i++) {
			if ((truncated + ' ' + words[i]).length <= 31) {
				truncated += ' ' + words[i];
			} else {
				break;
			}
		}
		
		// If still too long, just truncate
		if (truncated.length > 31) {
			truncated = asciiStr.substring(0, 31);
		}
	}
	
	return cairo.felt(truncated);
};



// Helper function to convert mock lyric data to CardData format
export const mockLyricToCardData = (lyric: any, genreVariant: string): CardData => {
	const genreEnum = new CairoCustomEnum({ [genreVariant]: {} });
	return {
		genre: genreEnum,
		artist: stringToFelt252(lyric.artist),
		title: stringToFelt252(lyric.title),
		year: BigInt(2023), // Default year if not provided
		lyrics: lyric.text // Contract expects string, not ByteArray
	};
};

/**
 * Modern hook to handle system calls using Dojo SDK patterns.
 * Uses built-in optimistic updates and automatic state management.
 */
export const useSystemCalls = () => {
	const { account } = useAccount();
	const { useDojoStore, client } = useDojoSDK();
	const state = useDojoStore((state) => state);
	
	// Get RoundsCount and Round models using the proper SDK pattern
	const roundsCountModels = useModels(ModelsMapping.RoundsCount);
	const roundModels = useModels(ModelsMapping.Round);
  
	const generateEntityId = () => {
	  if (!account) throw new Error("Account not available");
	  return getEntityIdFromKeys([BigInt(account.address)]);
	};
  
	const createRound = async (
		mode: GameMode,
		challengeType?: ChallengeType,
		challengeParam1?: string,
		challengeParam2?: string
	): Promise<bigint> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();
		
		try {
			// Prepare contract call types
			const modeVariant = GameMode[mode];
			const modeEnum = new CairoCustomEnum({ [modeVariant]: {} });
			const challengeTypeOption = challengeType !== undefined
				? new CairoOption<CairoCustomEnum>(0, new CairoCustomEnum({ [ChallengeType[challengeType]]: {} }))
				: new CairoOption<CairoCustomEnum>(1);
			
			// Convert challenge parameters to felt252 values
			const challengeParam1Option = challengeParam1 !== undefined
				? new CairoOption<string>(0, challengeParam1)
				: new CairoOption<string>(1);
			const challengeParam2Option = challengeParam2 !== undefined
				? new CairoOption<string>(0, challengeParam2)
				: new CairoOption<string>(1);

			// Execute the create round transaction
			const txResult = await client.actions.createRound(
				account,
				modeEnum,
				challengeTypeOption,
				challengeParam1Option,
				challengeParam2Option
			);
		
		// WAIT FOR THE ACTUAL ROUND TO BE CREATED AND GET ITS REAL ID
		// Wait for the transaction to be processed and entities to update
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		// Helper function to normalize addresses for comparison
		const normalizeAddress = (address: string): string => {
			// Remove 0x prefix, remove leading zeros, then add 0x back
			const cleaned = address.replace(/^0x/, '').replace(/^0+/, '');
			return '0x' + cleaned;
		};
		
		// Find the newest round by looking through all rounds and finding the one with highest ID
		// that was created by the current account, also consider creation timestamp
		let newestRoundId = BigInt(0);
		let foundNewRound = false;
		const creationTimestamp = Date.now();
		
		if (roundModels && account?.address) {
			const normalizedCurrentAccount = normalizeAddress(account.address);
			
			// Collect all rounds created by current account
			const candidateRounds: Array<{id: bigint, timestamp: number}> = [];
			
			// Iterate through all round entities
			for (const [entityKey, roundEntity] of Object.entries(roundModels)) {
				const entityKeys = Object.keys(roundEntity as any);
				if (entityKeys.length > 0) {
					const roundData = (roundEntity as any)[entityKeys[0]];
					if (roundData && roundData.round_id && roundData.creator) {
						const roundId = BigInt(roundData.round_id);
						const creator = roundData.creator;
						const normalizedCreator = normalizeAddress(creator);
						const isCreatedByCurrentAccount = normalizedCreator === normalizedCurrentAccount;
						const roundCreationTime = roundData.creation_time ? Number(roundData.creation_time) * 1000 : 0; // Convert to milliseconds
						
						// Collect rounds created by current account
						if (isCreatedByCurrentAccount) {
							candidateRounds.push({
								id: roundId,
								timestamp: roundCreationTime
							});
						}
					}
				}
			}
			
			// Sort by timestamp (most recent first) and then by ID (highest first)
			candidateRounds.sort((a, b) => {
				const timeDiff = b.timestamp - a.timestamp;
				if (Math.abs(timeDiff) < 5000) { // If within 5 seconds, sort by ID
					return Number(b.id - a.id);
				}
				return timeDiff;
			});
			
			// Take the most likely candidate (most recent or highest ID if created recently)
			if (candidateRounds.length > 0) {
				newestRoundId = candidateRounds[0].id;
				foundNewRound = true;
			}
		}
		
		if (!foundNewRound) {
			// Try to find the highest round ID from all rounds (regardless of creator)
			let highestRoundId = BigInt(0);
			if (roundModels) {
				for (const [entityKey, roundEntity] of Object.entries(roundModels)) {
					const entityKeys = Object.keys(roundEntity as any);
					if (entityKeys.length > 0) {
						const roundData = (roundEntity as any)[entityKeys[0]];
						if (roundData && roundData.round_id) {
							const roundId = BigInt(roundData.round_id);
							if (roundId > highestRoundId) {
								highestRoundId = roundId;
							}
						}
					}
				}
			}
			
			// If we found rounds, the new round should be the highest ID + 1
			if (highestRoundId > 0) {
				newestRoundId = highestRoundId;
			} else {
				// Last resort: try rounds count method
				const getCurrentRoundsCount = () => {
					return roundsCountModels ? 
						Object.values(roundsCountModels).find((rc: any) => 
							rc.id && BigInt(rc.id) === BigInt(0)
						) as RoundsCount | null : null;
				};
				
				const updatedRoundsCount = getCurrentRoundsCount();
				newestRoundId = updatedRoundsCount?.count ? BigInt(updatedRoundsCount.count) : BigInt(1);
			}
		}
		
		return newestRoundId;
			
		} catch (error) {
			state.revertOptimisticUpdate(transactionId);
			throw error;
		} finally {
			state.confirmTransaction(transactionId);
		}
	};

	const joinRound = async (roundId: string) => {
		if (!account?.address) {
			throw new Error('Account not available');
		}

		const transactionId = uuidv4();
		const roundIdBigInt = BigInt(roundId);
		const playerEntityId = getEntityIdFromKeys([BigInt(account.address), roundIdBigInt]);

		try {
			// Optimistic update - mark player as joined
			state.applyOptimisticUpdate(transactionId, (draft: any) => {
				// Simple optimistic update for the player entity
				if (!draft.entities[playerEntityId]) {
					draft.entities[playerEntityId] = {
						entityId: playerEntityId,
						models: {
							'lyricsflip-RoundPlayer': {
								player_to_round_id: [account.address, roundIdBigInt],
								joined: true,
								ready_state: false,
								next_card_index: BigInt(0),
								round_completed: false,
								current_card_start_time: BigInt(0),
								card_timeout: BigInt(0),
								correct_answers: BigInt(0),
								total_answers: BigInt(0),
								total_score: BigInt(0),
								best_time: BigInt(0)
							}
						},
					};
				} else {
					draft.entities[playerEntityId].models['lyricsflip-RoundPlayer'].joined = true;
				}
			});

			// Execute the transaction
			const tx = await client.actions.joinRound(account, roundIdBigInt);

			// Wait for the transaction to be processed and entities to update
			await new Promise(resolve => setTimeout(resolve, 1500));

			return tx;
		} catch (error) {
			// Revert the optimistic update if an error occurs
			state.revertOptimisticUpdate(transactionId);
			throw error;
		} finally {
			// Confirm the transaction if successful
			state.confirmTransaction(transactionId);
		}
	};

	const startRound = async (roundId: bigint): Promise<void> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();
		const roundEntityId = getEntityIdFromKeys([roundId]);

		console.log(`[StartRound] Starting round ${roundId}`, {
			roundId: roundId.toString(),
			accountAddress: account.address
		});

		try {
			// Apply optimistic update
			state.applyOptimisticUpdate(transactionId, (draft: any) => {
				const existingRound = draft.entities[roundEntityId];
				if (existingRound?.models?.['lyricsflip-Round']) {
					existingRound.models['lyricsflip-Round'].state = BigInt(RoundStatus.IN_PROGRESS);
					existingRound.models['lyricsflip-Round'].start_time = BigInt(Date.now());
				}
			});

			console.log(`[StartRound] Executing start transaction for round ${roundId}`);
			await client.actions.startRound(account, roundId);

			// Wait for the entity to be updated with the new state
			await state.waitForEntityChange(roundEntityId, (entity) => {
				return entity?.models?.['lyricsflip-Round']?.state?.toString() === RoundStatus.IN_PROGRESS.toString();
			});

			console.log(`[StartRound] Successfully started round ${roundId}`);
		} catch (error) {
			console.error(`[StartRound] Error starting round ${roundId}:`, error);
			state.revertOptimisticUpdate(transactionId);
			throw error;
		} finally {
			state.confirmTransaction(transactionId);
		}
	};

	const nextCard = async (roundId: bigint): Promise<QuestionCard> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();
		const playerEntityId = getEntityIdFromKeys([BigInt(account.address), roundId]);
		const roundEntityId = getEntityIdFromKeys([roundId]);
		
		console.log(`[NextCard] Getting next card for round ${roundId}`, {
			roundId: roundId.toString(),
			accountAddress: account.address
		});

		try {
			// Apply optimistic update - increment card index
			state.applyOptimisticUpdate(transactionId, (draft: any) => {
				const existingPlayer = draft.entities[playerEntityId];
				if (existingPlayer?.models?.['lyricsflip-RoundPlayer']) {
					const currentIndex = existingPlayer.models['lyricsflip-RoundPlayer'].next_card_index;
					existingPlayer.models['lyricsflip-RoundPlayer'].next_card_index = BigInt(Number(currentIndex) + 1);
					existingPlayer.models['lyricsflip-RoundPlayer'].current_card_start_time = BigInt(Date.now());
				}
			});

			console.log(`[NextCard] Executing next card transaction for round ${roundId}`);
			const questionCard = await client.actions.nextCard(account, roundId);
			
			// Wait for the entity to be updated with the new card index
			await state.waitForEntityChange(playerEntityId, (entity) => {
				const player = entity?.models?.['lyricsflip-RoundPlayer'];
				return !!(player && player.next_card_index !== undefined);
			});

			// Get the question card from the updated entity
			const updatedEntity = state.entities[roundEntityId];
			const questionCardFromEntity = updatedEntity?.models?.['lyricsflip-Round']?.question_cards?.[
				Number(state.entities[playerEntityId]?.models?.['lyricsflip-RoundPlayer']?.next_card_index)
			];

			if (!questionCardFromEntity) {
				throw new Error("Failed to get next card from entity state");
			}

			console.log(`[NextCard] Successfully got next card for round ${roundId}:`, questionCardFromEntity);
			return questionCardFromEntity;
		} catch (error) {
			console.error(`[NextCard] Error getting next card for round ${roundId}:`, error);
			state.revertOptimisticUpdate(transactionId);
			throw error;
		} finally {
			state.confirmTransaction(transactionId);
		}
	};

	const submitAnswer = async (roundId: bigint, answer: Answer): Promise<boolean> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();
		const playerEntityId = getEntityIdFromKeys([BigInt(account.address), roundId]);
		
		console.log(`[SubmitAnswer] Submitting answer for round ${roundId}`, {
			roundId: roundId.toString(),
			answer: Answer[answer],
			accountAddress: account.address
		});

		try {
			// Apply optimistic update - increment total answers
			state.applyOptimisticUpdate(transactionId, (draft: any) => {
				const existingPlayer = draft.entities[playerEntityId];
				if (existingPlayer?.models?.['lyricsflip-RoundPlayer']) {
					const currentTotal = existingPlayer.models['lyricsflip-RoundPlayer'].total_answers;
					existingPlayer.models['lyricsflip-RoundPlayer'].total_answers = BigInt(Number(currentTotal) + 1);
					// We'll update correct_answers and total_score after we get the result
				}
			});

			// Convert Answer enum to string variant name
			const answerVariant = Answer[answer];
			const answerEnum = new CairoCustomEnum({ [answerVariant]: {} });
			
			console.log(`[SubmitAnswer] Executing submit answer transaction for round ${roundId}`);
			const result = await client.actions.submitAnswer(account, roundId, answerEnum);
			
			// Wait for the PlayerAnswer event to be emitted
			// The result should indicate if the answer was correct
			console.log(`[SubmitAnswer] Answer submitted, result:`, result);
			
			// Wait for the entity to be updated to confirm the answer was processed
			await state.waitForEntityChange(playerEntityId, (entity) => {
				const player = entity?.models?.['lyricsflip-RoundPlayer'];
				return !!(player?.total_answers && Number(player.total_answers) > 0);
			});

			// The submitAnswer action now returns a boolean
			const isCorrect = Array.isArray(result) && result.length > 0 ? result[0] : false;
			
			// Update optimistic state with the result
			state.applyOptimisticUpdate(transactionId, (draft: any) => {
				const existingPlayer = draft.entities[playerEntityId];
				if (existingPlayer?.models?.['lyricsflip-RoundPlayer'] && isCorrect) {
					const currentCorrect = existingPlayer.models['lyricsflip-RoundPlayer'].correct_answers;
					const currentScore = existingPlayer.models['lyricsflip-RoundPlayer'].total_score;
					existingPlayer.models['lyricsflip-RoundPlayer'].correct_answers = BigInt(Number(currentCorrect) + 1);
					existingPlayer.models['lyricsflip-RoundPlayer'].total_score = BigInt(Number(currentScore) + 10); // Assuming 10 points per correct answer
				}
			});

			console.log(`[SubmitAnswer] Successfully submitted answer for round ${roundId}, isCorrect: ${isCorrect}`);
			return isCorrect;
		} catch (error) {
			console.error(`[SubmitAnswer] Error submitting answer for round ${roundId}:`, error);
			state.revertOptimisticUpdate(transactionId);
			throw error;
		} finally {
			state.confirmTransaction(transactionId);
		}
	};

	const forceStartRound = async (roundId: bigint) => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();
		const roundEntityId = getEntityIdFromKeys([roundId]);
		
		console.log(`[ForceStartRound] Force starting round ${roundId}`);
		try {
			// Apply optimistic update
			state.applyOptimisticUpdate(transactionId, (draft: any) => {
				const existingRound = draft.entities[roundEntityId];
				if (existingRound?.models?.['lyricsflip-Round']) {
					existingRound.models['lyricsflip-Round'].state = BigInt(RoundStatus.IN_PROGRESS);
				}
			});
			
			await client.actions.forceStartRound(account, roundId);
			
			// Wait for the entity to be updated with the new state
			await state.waitForEntityChange(roundEntityId, (entity) => {
				return entity?.models?.['lyricsflip-Round']?.state?.toString() === RoundStatus.IN_PROGRESS.toString();
			});

			console.log(`[ForceStartRound] Successfully started round ${roundId}`);
		} catch (error) {
			state.revertOptimisticUpdate(transactionId);
			console.error('[ForceStartRound] Error force starting round:', error);
			throw error;
		} finally {
			state.confirmTransaction(transactionId);
		}
	};

	const isRoundPlayer = async (roundId: bigint, playerAddress: string): Promise<boolean> => {
		if (!account) throw new Error("Account not available");

		try {
			console.log('[IsRoundPlayer] Checking if player is in round...', {
				roundId: roundId.toString(),
				playerAddress
			});

			const result = await client.actions.isRoundPlayer(roundId, playerAddress);
			console.log('[IsRoundPlayer] Result:', result);
			return result;
		} catch (error) {
			console.error('[IsRoundPlayer] Error checking player:', error);
			throw error;
		}
	};

	// Additional utility functions for multiplayer gameplay
	const checkAllPlayersAnswered = async (roundId: bigint): Promise<boolean> => {
		if (!account) throw new Error("Account not available");

		try {
			console.log('[CheckAllPlayersAnswered] Checking if all players answered for round:', roundId.toString());
			
			// This would need to be implemented on the contract side
			// For now, we'll use a placeholder that always returns false
			// TODO: Implement contract function to check if all players answered current card
			
			return false; // Placeholder
		} catch (error) {
			console.error('[CheckAllPlayersAnswered] Error checking players:', error);
			throw error;
		}
	};

	const getPlayerProgress = async (roundId: bigint, playerAddress?: string): Promise<ContractRoundPlayer | null> => {
		if (!playerAddress) {
			if (!account) return null;
			playerAddress = account.address;
		}
		const playerEntityId = getEntityIdFromKeys([BigInt(playerAddress), roundId]);
		const playerEntity = state.entities[playerEntityId];
		
		if (playerEntity && playerEntity.models['lyricsflip-RoundPlayer']) {
			return playerEntity.models['lyricsflip-RoundPlayer'] as unknown as ContractRoundPlayer;
		}
		return null;
	};

	const getCurrentCardIndex = async (roundId: bigint): Promise<number> => {
		if (!account) throw new Error("Account not available");
		const playerEntityId = getEntityIdFromKeys([BigInt(account.address), roundId]);
		const playerEntity = state.entities[playerEntityId];
		const cardIndex = playerEntity?.models?.['lyricsflip-RoundPlayer']?.next_card_index;
		return cardIndex ? Number(cardIndex) : 0;
	};

	const getRound = async (roundId: bigint): Promise<ContractRound | null> => {
		const roundEntityId = getEntityIdFromKeys([roundId]);
		const roundEntity = state.entities[roundEntityId];

		if (roundEntity && roundEntity.models['lyricsflip-Round']) {
			return roundEntity.models['lyricsflip-Round'] as unknown as ContractRound;
		}
		return null;
	};

	const getRoundPlayer = async (roundId: bigint, playerAddress: string): Promise<ContractRoundPlayer | null> => {
		const playerEntityId = getEntityIdFromKeys([BigInt(playerAddress), roundId]);
		const playerEntity = state.entities[playerEntityId];

		if (playerEntity && playerEntity.models['lyricsflip-RoundPlayer']) {
			return playerEntity.models['lyricsflip-RoundPlayer'] as unknown as ContractRoundPlayer;
		}
		return null;
	};

	const addLyricsCard = async (
		genre: CairoCustomEnum,
		artist: BigNumberish,
		title: BigNumberish,
		year: BigNumberish,
		lyrics: string
	): Promise<void> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();

		try {
			console.log('[AddLyricsCard] Adding lyrics card:', {
				genre: Object.keys(genre.variant)[0],
				artist: artist.toString(),
				title: title.toString(),
				year: year.toString(),
				lyricsLength: lyrics.length
			});

			await client.actions.addLyricsCard(account, genre, artist, title, year, lyrics);
			console.log('[AddLyricsCard] Successfully added lyrics card');
		} catch (error) {
			console.error('[AddLyricsCard] Error adding lyrics card:', error);
			throw error;
		}
	};

	const addBatchLyricsCard = async (cards: CardData[]): Promise<void> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();

		try {
			console.log(`[AddBatchLyricsCard] Adding ${cards.length} lyrics cards in batch`);
			
			await client.actions.addBatchLyricsCard(account, cards);
			console.log(`[AddBatchLyricsCard] Successfully added ${cards.length} lyrics cards`);
		} catch (error) {
			console.error('[AddBatchLyricsCard] Error adding batch lyrics cards:', error);
			throw error;
		}
	};

	return {
		createRound,
		joinRound,
		startRound,
		nextCard,
		submitAnswer,
		forceStartRound,
		isRoundPlayer,
		checkAllPlayersAnswered,
		getPlayerProgress,
		getCurrentCardIndex,
		getRound,
		getRoundPlayer,
		addLyricsCard,
		addBatchLyricsCard,
		client,
	};
};