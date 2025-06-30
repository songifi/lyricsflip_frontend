import { getEntityIdFromKeys } from "@dojoengine/utils";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK, useModels } from "@dojoengine/sdk/react";
import { CairoCustomEnum, CairoOption, BigNumberish, cairo } from "starknet";
import type { Round as ContractRound, RoundPlayer as ContractRoundPlayer, QuestionCard, RoundsCount } from "./typescript/models.gen";
import { ModelsMapping } from "./typescript/models.gen";
import { getModel, ensureNestedModel } from "./utils/modelAccess";
import { useState, useRef, useCallback } from "react";

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
	ENDED = 2,
	PENDING = 3  // State when round is started but not fully in progress yet
}

// Helper function to map raw felt252 round state to readable enum
export const mapRoundStateToEnum = (rawState: string | number | bigint): string => {
	try {
		// Handle hex string states (like "0x...53544152544544" = "STARTED")
		if (typeof rawState === 'string' && rawState.startsWith('0x')) {
			// Check for known hex patterns
			if (rawState.includes('57414954494e47')) { // "WAITING" in hex
				return 'WAITING';
			} else if (rawState.includes('53544152544544') || rawState.includes('494e5f50524f4752455353')) { // "STARTED" or "IN_PROGRESS" in hex
				return 'IN_PROGRESS';
			} else if (rawState.includes('454e444544')) { // "ENDED" in hex
				return 'ENDED';
			} else if (rawState.includes('50454e44494e47')) { // "PENDING" in hex
				return 'PENDING';
			}
			
			// If no pattern matches, try normal BigInt conversion
			try {
				const stateNum = Number(BigInt(rawState));
				switch (stateNum) {
					case RoundStatus.WAITING: return 'WAITING';
					case RoundStatus.IN_PROGRESS: return 'IN_PROGRESS';
					case RoundStatus.ENDED: return 'ENDED';
					case RoundStatus.PENDING: return 'PENDING';
					default: return `UNKNOWN_HEX(${rawState})`;
				}
			} catch {
				return `HEX_PARSE_ERROR(${rawState})`;
			}
		}
		
		// Handle numeric states
		const stateNum = Number(BigInt(rawState));
		switch (stateNum) {
			case RoundStatus.WAITING:
				return 'WAITING';
			case RoundStatus.IN_PROGRESS:
				return 'IN_PROGRESS';
			case RoundStatus.ENDED:
				return 'ENDED';
			case RoundStatus.PENDING:
				return 'PENDING';
			default:
				return `UNKNOWN(${stateNum})`;
		}
	} catch (error) {
		console.warn('[mapRoundStateToEnum] Error parsing state:', error, rawState);
		return `ERROR(${rawState})`;
	}
};

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
		// Replace curly quotes and apostrophes
		.replace(/['']/g, "'")
		.replace(/[""]/g, '"')
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

// Helper function to decode felt252 hex string back to ASCII string
export const felt252ToHexString = (felt252Value: string | BigNumberish): string => {
	try {
		// Convert to hex string if it's not already
		let hexValue: string;
		if (typeof felt252Value === 'string' && felt252Value.startsWith('0x')) {
			hexValue = felt252Value;
		} else {
			hexValue = '0x' + BigInt(felt252Value).toString(16);
		}
		
		// Remove 0x prefix and pad to even length
		const hex = hexValue.slice(2);
		const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
		
		// Convert hex to string
		let result = '';
		for (let i = 0; i < paddedHex.length; i += 2) {
			const hexByte = paddedHex.substr(i, 2);
			const charCode = parseInt(hexByte, 16);
			if (charCode > 0) { // Skip null bytes
				result += String.fromCharCode(charCode);
			}
		}
		
		return result.trim();
	} catch (error) {
		console.warn('Failed to decode felt252 value:', felt252Value, error);
		return felt252Value.toString();
	}
};

// Helper function to parse QuestionCard option (artist, title) from contract format
export const parseQuestionCardOption = (optionData: any): { artist: string; title: string } => {
	try {
		// Handle array format from contract
		if (Array.isArray(optionData) && optionData.length >= 2) {
			let artist = '';
			let title = '';
			
			// Parse first element (artist)
			if (optionData[0]) {
				if (typeof optionData[0] === 'object' && optionData[0].value) {
					artist = felt252ToHexString(optionData[0].value);
				} else {
					artist = felt252ToHexString(optionData[0]);
				}
			}
			
			// Parse second element (title)
			if (optionData[1]) {
				if (typeof optionData[1] === 'object' && optionData[1].value) {
					title = felt252ToHexString(optionData[1].value);
				} else {
					title = felt252ToHexString(optionData[1]);
				}
			}
			
			return { artist, title };
		}
		
		// Handle tuple format [BigNumberish, BigNumberish]
		if (optionData && typeof optionData === 'object' && 'length' in optionData) {
			const artist = felt252ToHexString(optionData[0] || '');
			const title = felt252ToHexString(optionData[1] || '');
			return { artist, title };
		}
		
		console.warn('Unexpected option data format:', optionData);
		return { artist: 'Unknown Artist', title: 'Unknown Title' };
	} catch (error) {
		console.warn('Failed to parse question card option:', optionData, error);
		return { artist: 'Parse Error', title: 'Parse Error' };
	}
};

// Helper function to clean lyrics text for contract submission
export const cleanLyricsForContract = (lyrics: string): string => {
	return lyrics
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
		// Replace curly quotes and apostrophes
		.replace(/['']/g, "'")
		.replace(/[""]/g, '"')
		// Remove any remaining non-ASCII characters
		.replace(/[^\x00-\x7F]/g, '');
};

// Helper function to convert mock lyric data to CardData format
export const mockLyricToCardData = (lyric: any, genreVariant: string): CardData => {
	const genreEnum = new CairoCustomEnum({ [genreVariant]: {} });
	return {
		genre: genreEnum,
		artist: stringToFelt252(lyric.artist),
		title: stringToFelt252(lyric.title),
		year: BigInt(2023), // Default year if not provided
		lyrics: cleanLyricsForContract(lyric.text) // Clean lyrics for contract
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
	
	// Transaction management state
	const [pendingTransactions, setPendingTransactions] = useState<Set<string>>(new Set());
	const transactionQueueRef = useRef<Array<() => Promise<any>>>([]);
	const processingQueueRef = useRef(false);
	
	// Get RoundsCount and Round models using the proper SDK pattern
	const roundsCountModels = useModels(ModelsMapping.RoundsCount);
	const roundModels = useModels(ModelsMapping.Round);
  
	const generateEntityId = () => {
	  if (!account) throw new Error("Account not available");
	  return getEntityIdFromKeys([BigInt(account.address)]);
	};

	// Transaction queue processor
	const processTransactionQueue = useCallback(async () => {
		if (processingQueueRef.current || transactionQueueRef.current.length === 0) {
			return;
		}
		
		processingQueueRef.current = true;
		
		try {
			while (transactionQueueRef.current.length > 0) {
				const nextTransaction = transactionQueueRef.current.shift();
				if (nextTransaction) {
					await nextTransaction();
					// Small delay between transactions to ensure proper nonce sequencing
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			}
		} catch (error) {
			console.error('[processTransactionQueue] Error processing transaction:', error);
			throw error;
		} finally {
			processingQueueRef.current = false;
		}
	}, []);

	// Helper to add transaction to queue
	const queueTransaction = useCallback(async <T>(
		txKey: string, 
		transactionFn: () => Promise<T>
	): Promise<T> => {
		if (pendingTransactions.has(txKey)) {
			throw new Error(`Transaction ${txKey} already in progress`);
		}

		return new Promise<T>((resolve, reject) => {
			const wrappedTransaction = async () => {
				try {
					setPendingTransactions(prev => new Set(prev).add(txKey));
					const result = await transactionFn();
					resolve(result);
				} catch (error) {
					reject(error);
				} finally {
					setPendingTransactions(prev => {
						const newSet = new Set(prev);
						newSet.delete(txKey);
						return newSet;
					});
				}
			};

			transactionQueueRef.current.push(wrappedTransaction);
			processTransactionQueue();
		});
	}, [pendingTransactions, processTransactionQueue]);

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

			// Log the round creation parameters
			console.log('[createRound] Creating round with params:', {
				mode,
				challengeType,
				challengeParam1,
				challengeParam2
			});

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
		await new Promise(resolve => setTimeout(resolve, 5000)); // Increased wait time for state sync
		
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
		
		// Fetch the round entity and log card IDs and QuestionCards
		const roundEntityId = getEntityIdFromKeys([newestRoundId]);
		console.log('[createRound] newestRoundId:', newestRoundId.toString());
		console.log('[createRound] Computed roundEntityId:', roundEntityId);
		const roundEntity = state.entities[roundEntityId];
		console.log('[createRound] Full round entity at computed key:', roundEntity);
		if (roundEntity && roundEntity.models && roundEntity.models['lyricsflip-Round']) {
			const roundModel = roundEntity.models['lyricsflip-Round'];
			console.log('[createRound] RoundModel:', roundModel);
			if (!roundModel.round_cards || roundModel.round_cards.length === 0) {
				console.warn('[createRound] round_cards is missing or empty:', roundModel.round_cards);
			} else {
				console.log('[createRound] Round created. Card IDs:', roundModel.round_cards);
			}
			if (!roundModel.question_cards || roundModel.question_cards.length === 0) {
				console.warn('[createRound] question_cards is missing or empty:', roundModel.question_cards);
			} else {
				console.log('[createRound] Round created. QuestionCards:', JSON.stringify(roundModel.question_cards, null, 2));
			}
		} else {
			console.warn('[createRound] Round entity or model missing at computed key. Full entity:', roundEntity);
		}
		
		console.log('[createRound] All round entities in state:', Object.keys(state.entities));
		for (const [entityId, entity] of Object.entries(state.entities)) {
			if (entity.models && entity.models['lyricsflip-Round']) {
				const roundModel = entity.models['lyricsflip-Round'];
				let roundIdValue = roundModel.round_id;
				let roundIdComparable: string | number | undefined = undefined;
				if (typeof roundIdValue === 'object' && roundIdValue !== null) {
					console.log('[createRound] roundModel.round_id is an object:', roundIdValue);
					if ('low' in roundIdValue && 'high' in roundIdValue) {
						const low = roundIdValue.low;
						const high = roundIdValue.high;
						if (typeof low === 'number' && typeof high === 'number') {
							roundIdComparable = (BigInt(low) + (BigInt(high) << 32n)).toString();
						} else {
							continue;
						}
					} else if ('value' in roundIdValue && (typeof roundIdValue.value === 'string' || typeof roundIdValue.value === 'number')) {
						roundIdComparable = roundIdValue.value;
					} else {
						continue;
					}
				} else if (typeof roundIdValue === 'string' || typeof roundIdValue === 'number') {
					roundIdComparable = roundIdValue;
				}
				if (roundIdComparable === undefined || roundIdComparable === null) continue;
				try {
					if (BigInt(roundIdComparable) === newestRoundId) {
						console.log('[createRound] FOUND round entity for newestRoundId:', entityId, roundModel);
						if (!roundModel.round_cards || roundModel.round_cards.length === 0) {
							console.warn('[createRound] (FOUND) round_cards is missing or empty:', roundModel.round_cards);
						} else {
							console.log('[createRound] (FOUND) Card IDs:', roundModel.round_cards);
						}
						if (!roundModel.question_cards || roundModel.question_cards.length === 0) {
							console.warn('[createRound] (FOUND) question_cards is missing or empty:', roundModel.question_cards);
						} else {
							console.log('[createRound] (FOUND) QuestionCards:', JSON.stringify(roundModel.question_cards, null, 2));
						}
					}
				} catch (e) {
					console.warn('[createRound] Could not convert round_id to BigInt:', roundIdComparable, e);
				}
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
				// Create or update the RoundPlayer model using nested structure
				if (!draft.entities[playerEntityId]) {
					draft.entities[playerEntityId] = { entityId: playerEntityId, models: {} } as any;
				}
				const playerModel = ensureNestedModel(draft.entities[playerEntityId], 'RoundPlayer', () => ({
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
				}));
				playerModel.joined = true;
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

		const txKey = `startRound-${roundId.toString()}`;

		return queueTransaction(txKey, async () => {
			const transactionId = uuidv4();
			const roundEntityId = getEntityIdFromKeys([roundId]);
			
			console.log(`[StartRound] Starting round ${roundId}`, {
				roundId: roundId.toString(),
				accountAddress: account.address
			});
			
			try {
				state.applyOptimisticUpdate(transactionId, (draft: any) => {
					const existingRound = draft.entities[roundEntityId];
					const roundModel = getModel(existingRound, 'Round');
					if (roundModel) {
						roundModel.state = BigInt(RoundStatus.PENDING);
					}
				});
				
				console.log(`[StartRound] Executing start transaction for round ${roundId}`);
				const result = await client.actions.startRound(account, roundId);
				
				console.log(`[StartRound] Transaction sent, hash: ${result.transaction_hash}. Waiting for confirmation...`);
				
				await account.waitForTransaction(result.transaction_hash);
				
				console.log(`[StartRound] Transaction confirmed. Waiting for indexer...`);
				await new Promise(resolve => setTimeout(resolve, 500)); 

				console.log(`[StartRound] Successfully started round ${roundId}`);
			} catch (error) {
				console.error(`[StartRound] Error starting round ${roundId}:`, error);
				state.revertOptimisticUpdate(transactionId);
				throw error;
			} finally {
				state.confirmTransaction(transactionId);
			}
		});
	};

	const nextCard = async (roundId: bigint): Promise<QuestionCard> => {
		if (!account) throw new Error("Account not available");
		
		const txKey = `nextCard-${roundId.toString()}-${account.address}`;
		
		return queueTransaction(txKey, async () => {
			const transactionId = uuidv4();
			const playerEntityId = getEntityIdFromKeys([BigInt(account.address), roundId]);
			const roundEntityId = getEntityIdFromKeys([roundId]);

			console.log(`[NextCard] [${Date.now()}] Starting card retrieval for round ${roundId}`, {
				roundId: roundId.toString(),
				accountAddress: account.address,
				playerEntityId,
				roundEntityId
			});

			// Log full player and round entity before transaction
			console.log(`[NextCard] [${Date.now()}] Pre-transaction full player entity:`, state.entities[playerEntityId]);
			console.log(`[NextCard] [${Date.now()}] Pre-transaction full round entity:`, state.entities[roundEntityId]);
			const prePlayer = getModel(state.entities[playerEntityId], 'RoundPlayer');
			const preRound = getModel(state.entities[roundEntityId], 'Round');
			console.log(`[NextCard] [${Date.now()}] Pre-transaction next_card_index:`, prePlayer ? prePlayer.next_card_index : 'N/A');
			console.log(`[NextCard] [${Date.now()}] Pre-transaction question_cards:`, preRound ? preRound.question_cards : 'N/A');

			try {
				console.log(`[NextCard] [${Date.now()}] Executing blockchain nextCard transaction...`);
				const tx = await client.actions.nextCard(account, roundId);
				console.log(`[NextCard] [${Date.now()}] Transaction result:`, {
					transactionHash: tx.transaction_hash,
					status: tx.status,
					result: tx.result,
					decoded: tx.decoded
				});

				// Try to decode QuestionCard directly from the transaction result
				let immediateCard: QuestionCard | undefined;
				try {
					console.log('[NextCard] Available tx properties:', Object.keys(tx));
					
					// Check for different possible locations of the card data
					if (tx.decoded) {
						console.log('[NextCard] Found decoded data:', tx.decoded);
						immediateCard = tx.decoded as QuestionCard;
					} else if (tx.result) {
						console.log('[NextCard] Found result data (raw):', tx.result);
						// Try to parse the result if it's a string
						if (typeof tx.result === 'string') {
							try {
								const parsed = JSON.parse(tx.result);
								console.log('[NextCard] Parsed result data:', parsed);
								immediateCard = parsed as QuestionCard;
							} catch (e) {
								console.warn('[NextCard] Could not parse result as JSON:', e);
							}
						} else {
							immediateCard = tx.result as QuestionCard;
						}
					}
				} catch (error) {
					console.error('[NextCard] Error processing transaction result:', error);
					// Continue to fallback method
				}

				if (immediateCard) {
					console.log(`[NextCard] [${Date.now()}] Returning card from tx result`);
					return immediateCard;
				}

				// Fallback: wait for the transaction to be processed and entities to update
				console.log(`[NextCard] [${Date.now()}] Waiting for entity state update...`);
				await new Promise(resolve => setTimeout(resolve, 2000));

				// Get updated player and round states
				const updatedPlayer = getModel(state.entities[playerEntityId], 'RoundPlayer');
				const updatedRound = getModel(state.entities[roundEntityId], 'Round');

				console.log(`[NextCard] [${Date.now()}] Updated player state:`, updatedPlayer);
				console.log(`[NextCard] [${Date.now()}] Updated round state:`, updatedRound);

				if (!updatedPlayer) {
					throw new Error("Player entity not found after transaction");
				}
				if (!updatedRound) {
					throw new Error("Round entity not found after transaction");
				}

				// Get the current card index from player
				const currentCardIndex = Number(updatedPlayer.next_card_index);
				console.log(`[NextCard] [${Date.now()}] Current card index:`, currentCardIndex);

				// Safely access question_cards array
				if (!updatedRound.question_cards || !Array.isArray(updatedRound.question_cards)) {
					console.error(`[NextCard] [${Date.now()}] question_cards is not an array:`, updatedRound.question_cards);
					throw new Error("Question cards not properly loaded in round entity");
				}

				// Log all available question cards
				console.log(`[NextCard] [${Date.now()}] Available question cards:`, updatedRound.question_cards);

				// Get the current question card
				const questionCardFromEntity = updatedRound.question_cards[currentCardIndex];

				console.log(`[NextCard] [${Date.now()}] Post-sync entity state:`, {
					hasUpdatedEntity: !!updatedRound,
					hasRoundModel: !!updatedRound,
					questionCardsAvailable: updatedRound.question_cards.length,
					requestedIndex: currentCardIndex,
					hasCardAtIndex: !!questionCardFromEntity
				});

				if (questionCardFromEntity) {
					console.log(`[NextCard] [${Date.now()}] Fetched card from entity:`, JSON.stringify(questionCardFromEntity, null, 2));
					return questionCardFromEntity;
				} else {
					console.error(`[NextCard] [${Date.now()}] No card found in entity state after transaction. Full updated entity:`, JSON.stringify(updatedRound, null, 2));
					throw new Error(`No question card found at index ${currentCardIndex}. Available cards: ${updatedRound.question_cards.length}`);
				}
			} catch (error) {
				console.error(`[NextCard] [${Date.now()}] Error getting next card for round ${roundId}:`, error);
				state.revertOptimisticUpdate(transactionId);
				throw error;
			} finally {
				state.confirmTransaction(transactionId);
			}
		});
	};

	const submitAnswer = async (roundId: bigint, answer: Answer): Promise<boolean> => {
		if (!account) throw new Error("Account not available");
		
		const txKey = `submitAnswer-${roundId.toString()}-${account.address}`;
		
		return queueTransaction(txKey, async () => {
			const transactionId = uuidv4();
			
			console.log(`[SubmitAnswer] Submitting answer for round ${roundId}`, {
				roundId: roundId.toString(),
				answer: Answer[answer],
				accountAddress: account.address
			});

			try {
				// Convert Answer enum to string variant name
				const answerVariant = Answer[answer];
				const answerEnum = new CairoCustomEnum({ [answerVariant]: {} });
				
				console.log(`[SubmitAnswer] Executing submit answer transaction for round ${roundId}`);
				await client.actions.submitAnswer(account, roundId, answerEnum);
				
				console.log(`[SubmitAnswer] Transaction sent. Correctness will be determined by PlayerAnswer event.`);
				
				// The actual correctness is now handled by the useGameplaySubscriptions hook listening for the PlayerAnswer event.
				// We return true here just to satisfy the function signature, but this return value is no longer used for correctness logic.
				return true;

			} catch (error) {
				console.error(`[SubmitAnswer] Error submitting answer for round ${roundId}:`, error);
				state.revertOptimisticUpdate(transactionId);
				throw error;
			} finally {
				state.confirmTransaction(transactionId);
			}
		});
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
				const roundModel = getModel(existingRound, 'Round');
				if (roundModel) {
					roundModel.state = BigInt(RoundStatus.IN_PROGRESS);
				}
			});
			
			await client.actions.forceStartRound(account, roundId);
			
			// Use simple timeout instead of waitForEntityChange to avoid timeout issues
			console.log(`[ForceStartRound] Transaction executed, waiting for entity sync...`);
			await new Promise(resolve => setTimeout(resolve, 1500));

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
			
			// Get round data from state
			const roundEntityId = getEntityIdFromKeys([roundId]);
			const roundEntity = state.entities[roundEntityId];
			const roundModel = getModel(roundEntity, 'Round');
			
			if (!roundModel) {
				console.warn('[CheckAllPlayersAnswered] Round not found in state');
				return false;
			}
			
			const totalPlayers = Number(roundModel.players_count || 0);
			if (totalPlayers === 0) {
				console.warn('[CheckAllPlayersAnswered] No players in round');
				return false;
			}
			
			// Check all round players' ready_state
			let playersReady = 0;
			
			// Iterate through all entities to find RoundPlayer entities for this round
			for (const [entityId, entity] of Object.entries(state.entities)) {
				const playerModel = getModel(entity, 'RoundPlayer');
				if (playerModel && 
					playerModel.player_to_round_id && 
					Array.isArray(playerModel.player_to_round_id) &&
					playerModel.player_to_round_id.length >= 2) {
					
					try {
						// Handle case where array elements might be objects
						let playerRoundId;
						const roundIdElement = playerModel.player_to_round_id[1];
						
						if (typeof roundIdElement === 'object' && roundIdElement !== null) {
							// Handle object format (e.g., {value: "123"} or {low: 123, high: 0})
							if ('value' in roundIdElement) {
								playerRoundId = BigInt(roundIdElement.value);
							} else if ('low' in roundIdElement && 'high' in roundIdElement) {
								playerRoundId = BigInt(roundIdElement.low) + (BigInt(roundIdElement.high) << 32n);
							} else {
								console.warn('[CheckAllPlayersAnswered] Unknown round ID object format:', roundIdElement);
								continue;
							}
						} else {
							// Handle primitive format
							playerRoundId = BigInt(roundIdElement);
						}
						
						if (playerRoundId === roundId && playerModel.ready_state) {
							playersReady++;
						}
					} catch (conversionError) {
						console.warn('[CheckAllPlayersAnswered] Error converting player round ID:', {
							roundIdElement: playerModel.player_to_round_id[1],
							error: conversionError
						});
					}
				}
			}
			
			console.log('[CheckAllPlayersAnswered] Players ready:', playersReady, 'of', totalPlayers);
			return playersReady >= totalPlayers;
			
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
		
		const playerModel = getModel<ContractRoundPlayer>(playerEntity, 'RoundPlayer');
		if (playerModel) {
			return playerModel as unknown as ContractRoundPlayer;
		}
		return null;
	};

	const getCurrentCardIndex = async (roundId: bigint): Promise<number> => {
		if (!account) throw new Error("Account not available");
		const playerEntityId = getEntityIdFromKeys([BigInt(account.address), roundId]);
		const playerEntity = state.entities[playerEntityId];
		const playerModel = getModel(playerEntity, 'RoundPlayer');
		const cardIndex = playerModel?.next_card_index;
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

		const playerModel = getModel<ContractRoundPlayer>(playerEntity, 'RoundPlayer');
		if (playerModel) {
			return playerModel as unknown as ContractRoundPlayer;
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

	const getCardCount = async (): Promise<number> => {
		try {
			console.log('[GetCardCount] Checking total cards in database...');
			// Use the client to get the card count model
			const gameId = "0x4c59524943534744"; // GAME_ID constant 
			
			// For now, we'll check if there are any cards by trying to get a card at index 1
			// This is a workaround until we have a proper card count endpoint
			try {
				// This should be implemented in the contract to return the LyricsCardCount
				// For now we'll use a simple check
				console.log('[GetCardCount] Card count check not implemented in client, assuming cards exist');
				return 1; // Placeholder - we need the contract to expose card count
			} catch (error) {
				console.log('[GetCardCount] No cards found or error checking:', error);
				return 0;
			}
		} catch (error) {
			console.error('[GetCardCount] Error checking card count:', error);
			return 0;
		}
	};

	const addBatchLyricsCard = async (cards: CardData[]): Promise<void> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();

		try {
			console.log(`[AddBatchLyricsCard] Adding ${cards.length} lyrics cards in batch`);

			// Log details of each card being uploaded (full data)
			// Custom replacer function to handle BigInt serialization
			const bigIntReplacer = (key: string, value: any) => {
				if (typeof value === 'bigint') {
					return value.toString();
				}
				return value;
			};

			cards.forEach((card, idx) => {
				console.log(`[AddBatchLyricsCard] FULL CARD DATA #${idx + 1}:`, JSON.stringify(card, bigIntReplacer, 2));
			});

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
		getCardCount,
		client,
		// Transaction state for debugging
		pendingTransactions,
	};
};