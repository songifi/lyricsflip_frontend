import { getEntityIdFromKeys } from "@dojoengine/utils";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { CairoCustomEnum, ByteArray } from "starknet";
import { roundEventBus } from "./events/eventBus";
import { RoundEventType, RoundStatus } from "./events/types";
import { useRoundStore } from './events/roundStore';

/**
 * Custom hook to handle system calls and state management in the Dojo application.
 * Provides functionality for creating a round and handling optimistic updates.
 */
export const useSystemCalls = () => {
	const { account } = useAccount();
	const { useDojoStore, client } = useDojoSDK();
	const state = useDojoStore((state) => state);
	const roundStore = useRoundStore();
  
	const generateEntityId = () => {
	  if (!account) throw new Error("Account not available");
	  return getEntityIdFromKeys([BigInt(account.address)]);
	};
  
	const createRound = async (genre: CairoCustomEnum): Promise<bigint> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();
	  
		try {
			console.log('[CreateRound] Starting round creation...');
			
			// 1. Execute the create round transaction
			const txResult = await client.actions.createRound(account, genre);
			console.log('[CreateRound] Transaction result:', txResult);
			
			// 2. Wait for transaction to be confirmed (give some time for mining)
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// 3. Get the actual round ID from the contract using getRoundId
			console.log('[CreateRound] Fetching round ID from contract...');
			const roundIdResult = await client.actions.getRoundId();
			console.log('[CreateRound] Round ID result:', roundIdResult);
			
			// 4. Extract the actual round ID and subtract 1 to get the correct round ID
			const actualRoundId = BigInt(roundIdResult[0] || roundIdResult.toString()) - BigInt(1);
			console.log('[CreateRound] Actual round ID:', actualRoundId.toString());
			
			// 5. Update optimistic state with real ID
			state.applyOptimisticUpdate(transactionId, (draft: any) => {
				// Use Dojo's entity ID format to match network storage (Torii)
				const roundsEntityId = getEntityIdFromKeys([actualRoundId]);
				if (!draft.entities[roundsEntityId]) {
					draft.entities[roundsEntityId] = {
						entityId: roundsEntityId,
						models: {
							lyricsflip: {
								Rounds: {
									round_id: actualRoundId,
									round: {
										creator: account?.address || "",
										genre: genre.activeVariant(), 
										wager_amount: 0,
										start_time: BigInt(Date.now()),
										state: 0, // WAITING state
										end_time: 0,
										next_card_index: 0,
										players_count: 1, // Creator joins automatically
										ready_players_count: 0,
									}
								},
							},
						},
					};
				}
				
				// Create the RoundPlayer entity for the creator
				const playerEntityId = getEntityIdFromKeys([BigInt(account.address), actualRoundId]);
				if (!draft.entities[playerEntityId]) {
					draft.entities[playerEntityId] = {
						entityId: playerEntityId,
						models: {
							lyricsflip: {
								RoundPlayer: {
									player_to_round_id: [account.address, actualRoundId],
									joined: true,
									ready_state: false,
								},
							},
						},
					};
				}
				
				// Create the RoundCreated event entity
				const eventEntityId = getEntityIdFromKeys([actualRoundId, BigInt(Date.now())]);
				if (!draft.entities[eventEntityId]) {
					draft.entities[eventEntityId] = {
						entityId: eventEntityId,
						models: {
							lyricsflip: {
								RoundCreated: {
									round_id: actualRoundId,
									creator: account?.address || "",
								},
							},
						},
					};
				}
			});
			
			return actualRoundId; // Return the real round ID!
			
		} catch (error) {
			state.revertOptimisticUpdate(transactionId);
			console.error("Error creating round:", error);
			throw error;
		} finally {
			state.confirmTransaction(transactionId);
		}
	};

	const joinRound = async (roundId: string) => {
		if (!account?.address) {
			throw new Error('Account not available');
		}

		try {
			const roundIdHex = `0x${BigInt(roundId).toString(16)}`;
			console.log('[JoinRound] Starting join operation for round', roundId, {
				roundId,
				roundIdHex,
				accountAddress: account.address,
			});

			// Execute the transaction
			console.log('[JoinRound] Executing join transaction for round', roundId, {
				roundId,
				roundIdHex,
				accountAddress: account.address,
			});
			const tx = await client.actions.joinRound(account, BigInt(roundId));
			console.log('[JoinRound] Successfully joined round', roundId);

			// Update round store
			const currentRound = roundStore.rounds.get(roundId);
			if (currentRound) {
				roundStore.updateRound(roundId, {
					...currentRound,
					players: [
						...currentRound.players,
						{
							address: account.address,
							joined: true,
							readyState: false
						}
					],
					playersCount: currentRound.playersCount + 1
				});
			} else {
				// If round doesn't exist in store, add it
				roundStore.addRound(roundId, {
					id: roundId,
					status: RoundStatus.WAITING,
					genre: '0',
					wagerAmount: '0',
					nextCardIndex: 0,
					playersCount: 1,
					readyPlayersCount: 0,
					players: [{
						address: account.address,
						joined: true,
						readyState: false
					}]
				});
			}

			// Emit event
			roundEventBus.emit({
				type: RoundEventType.ROUND_JOINED,
				timestamp: Date.now(),
				roundId: roundId,
				data: {
					round_id: BigInt(roundId),
					player: account.address,
				}
			});
			console.log('[JoinRound] Emitted ROUND_JOINED event for round', roundId);

			return tx;
		} catch (error) {
			console.error('[JoinRound] Error joining round:', error);
			throw error;
		}
	};

	const startRound = async (roundId: bigint): Promise<void> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();

		console.log(`[StartRound] Starting round ${roundId}`, {
			roundId: roundId.toString(),
			roundIdHex: `0x${roundId.toString(16)}`,
			accountAddress: account.address
		});

		// Apply optimistic update
		state.applyOptimisticUpdate(transactionId, (draft: any) => {
			// Use Dojo's entity ID format to match network storage
			const roundsEntityId = getEntityIdFromKeys([roundId]);
			const existingRound = draft.entities[roundsEntityId];
			
			if (existingRound?.models?.lyricsflip?.Rounds) {
				existingRound.models.lyricsflip.Rounds.round.state = 1; // STARTED state
				existingRound.models.lyricsflip.Rounds.round.start_time = BigInt(Date.now());
			}
		});

		try {
			console.log(`[StartRound] Executing start transaction for round ${roundId}`);
			await client.actions.startRound(account, roundId);
			console.log(`[StartRound] Successfully started round ${roundId}`);
		} catch (error) {
			console.error(`[StartRound] Error starting round ${roundId}:`, error);
			state.revertOptimisticUpdate(transactionId);
			throw error;
		} finally {
			state.confirmTransaction(transactionId);
		}
	};

	const addLyricsCard = async (genre: CairoCustomEnum, artist: string, title: string, year: number, lyrics: string): Promise<void> => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();

		try {
			console.log('[AddLyricsCard] Adding new lyrics card...', {
				genre: genre.activeVariant(),
				artist,
				title,
				year,
				lyricsLength: lyrics.length
			});

			// Convert lyrics to bytes using TextEncoder
			const encoder = new TextEncoder();
			const lyricsBytes = encoder.encode(lyrics);
			
			await client.actions.addLyricsCard(account, genre, artist, title, year, lyricsBytes);
			console.log('[AddLyricsCard] Successfully added lyrics card');
		} catch (error) {
			console.error('[AddLyricsCard] Error adding lyrics card:', error);
			throw error;
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

	const getRoundId = async (): Promise<bigint> => {
		if (!account) throw new Error("Account not available");

		try {
			console.log('[GetRoundId] Fetching current round ID...');
			const result = await client.actions.getRoundId();
			console.log('[GetRoundId] Result:', result);
			return BigInt(result[0] || result.toString());
		} catch (error) {
			console.error('[GetRoundId] Error fetching round ID:', error);
			throw error;
		}
	};

	return {
		createRound,
		joinRound,
		startRound,
		addLyricsCard,
		isRoundPlayer,
		getRoundId,
		client,
	};
};