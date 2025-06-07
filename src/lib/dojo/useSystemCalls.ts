import { getEntityIdFromKeys } from "@dojoengine/utils";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { CairoCustomEnum } from "starknet";
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

	const joinRound = async (roundId: bigint) => {
		if (!account) throw new Error("Account not available");
		const transactionId = uuidv4();

		console.log(`[JoinRound] Starting join operation for round ${roundId}`, {
			roundId: roundId.toString(),
			roundIdHex: `0x${roundId.toString(16)}`,
			accountAddress: account.address
		});
		
		// Apply optimistic update
		state.applyOptimisticUpdate(transactionId, (draft: any) => {
			// Only update players_count if the round entity exists
			const roundEntityId = getEntityIdFromKeys([roundId]);
			const existingRound = draft.entities[roundEntityId];
			
			console.log('[JoinRound] Current store state:', {
				roundEntityId,
				existingRound,
				allEntities: Object.keys(draft.entities)
			});
			
			if (existingRound?.models?.lyricsflip?.Rounds) {
				const currentCount = Number(existingRound.models.lyricsflip.Rounds.round.players_count);
				existingRound.models.lyricsflip.Rounds.round.players_count = BigInt(currentCount + 1);
				console.log(`[JoinRound] Updated round ${roundId} players_count to ${currentCount + 1}`);
			} else {
				// Create the round entity if it doesn't exist
				draft.entities[roundEntityId] = {
					entityId: roundEntityId,
					models: {
						lyricsflip: {
							Rounds: {
								round_id: roundId,
								round: {
									creator: account.address,
									genre: 0,
									wager_amount: 0,
									start_time: BigInt(Date.now()),
									state: 0,
									end_time: 0,
									next_card_index: 0,
									players_count: 1,
									ready_players_count: 0,
								}
							}
						}
					}
				};
				console.log(`[JoinRound] Created new round entity ${roundEntityId}`);
			}

			// Create the RoundPlayer entity for the joining player
			const playerEntityId = getEntityIdFromKeys([BigInt(account.address), roundId]);
			if (!draft.entities[playerEntityId]) {
				console.log(`[JoinRound] Creating player entity ${playerEntityId}`);
				draft.entities[playerEntityId] = {
					entityId: playerEntityId,
					models: {
						lyricsflip: {
							RoundPlayer: {
								player_to_round_id: [account.address, roundId],
								joined: true,
								ready_state: false,
							},
						},
					},
				};
			}

			// Create the RoundJoined event entity
			const eventEntityId = getEntityIdFromKeys([roundId, BigInt(Date.now())]);
			if (!draft.entities[eventEntityId]) {
				console.log(`[JoinRound] Creating RoundJoined event entity ${eventEntityId}`);
				draft.entities[eventEntityId] = {
					entityId: eventEntityId,
					models: {
						lyricsflip: {
							RoundJoined: {
								round_id: roundId,
								player: account.address,
							},
						},
					},
				};
			}

			// Log the state after updates
			console.log(`[JoinRound] Updated store state:`, {
				roundEntity: draft.entities[roundEntityId],
				playerEntity: draft.entities[playerEntityId],
				eventEntity: draft.entities[eventEntityId],
				allEntities: Object.keys(draft.entities)
			});

			// Sync with our custom round store
			const roundData = draft.entities[roundEntityId]?.models?.lyricsflip?.Rounds;
			const playerData = draft.entities[playerEntityId]?.models?.lyricsflip?.RoundPlayer;
			
			if (roundData && playerData) {
				roundStore.updateRound(roundId.toString(), {
					players: [{
						address: account.address,
						joined: playerData.joined,
						readyState: playerData.ready_state
					}],
					playersCount: Number(roundData.round.players_count),
					status: roundData.round.state as unknown as RoundStatus
				});
				console.log(`[JoinRound] Synced with round store for round ${roundId}`);
			}
		});

		// Store entity IDs for later use
		const roundEntityId = getEntityIdFromKeys([roundId]);
		const playerEntityId = getEntityIdFromKeys([BigInt(account.address), roundId]);

		try {
			console.log(`[JoinRound] Executing join transaction for round ${roundId}`, {
				roundId: roundId.toString(),
				roundIdHex: `0x${roundId.toString(16)}`,
				accountAddress: account.address
			});
			await client.actions.joinRound(account, roundId);
			console.log(`[JoinRound] Successfully joined round ${roundId}`);

			// Emit the RoundJoined event
			roundEventBus.emit({
				type: RoundEventType.ROUND_JOINED,
				timestamp: Date.now(),
				roundId: roundId.toString(),
				data: {
					round_id: roundId,
					player: account.address
				}
			});
			console.log(`[JoinRound] Emitted ROUND_JOINED event for round ${roundId}`);

			// Confirm the optimistic update
			state.confirmTransaction(transactionId);
			console.log(`[JoinRound] Confirmed optimistic update for transaction ${transactionId}`);

			// Ensure the entities are still in the store after confirmation
			state.applyOptimisticUpdate(transactionId, (draft: any) => {
				// Re-apply the entities to ensure they persist
				if (!draft.entities[roundEntityId]) {
					draft.entities[roundEntityId] = {
						entityId: roundEntityId,
						models: {
							lyricsflip: {
								Rounds: {
									round_id: roundId,
									round: {
										creator: account.address,
										genre: 0,
										wager_amount: 0,
										start_time: BigInt(Date.now()),
										state: 0,
										end_time: 0,
										next_card_index: 0,
										players_count: 1,
										ready_players_count: 0,
									}
								}
							}
						}
					};
				}

				if (!draft.entities[playerEntityId]) {
					draft.entities[playerEntityId] = {
						entityId: playerEntityId,
						models: {
							lyricsflip: {
								RoundPlayer: {
									player_to_round_id: [account.address, roundId],
									joined: true,
									ready_state: false,
								},
							},
						},
					};
				}
			});

			// Verify the entities exist in the store after confirmation
			const roundEntity = state.entities[roundEntityId];
			const playerEntity = state.entities[playerEntityId];
			
			console.log(`[JoinRound] Verified store state after confirmation:`, {
				roundEntity,
				playerEntity,
				allEntities: Object.keys(state.entities)
			});

			// Sync with our custom round store
			if (roundEntity?.models?.lyricsflip?.Rounds && playerEntity?.models?.lyricsflip?.RoundPlayer) {
				roundStore.updateRound(roundId.toString(), {
					players: [{
						address: account.address,
						joined: playerEntity.models.lyricsflip.RoundPlayer.joined,
						readyState: playerEntity.models.lyricsflip.RoundPlayer.ready_state
					}],
					playersCount: Number(roundEntity.models.lyricsflip.Rounds.round.players_count),
					status: roundEntity.models.lyricsflip.Rounds.round.state as unknown as RoundStatus
				});
				console.log(`[JoinRound] Synced with round store for round ${roundId}`);
			}

		} catch (error) {
			console.error(`[JoinRound] Error joining round ${roundId}:`, {
				error,
				roundId: roundId.toString(),
				roundIdHex: `0x${roundId.toString(16)}`,
				accountAddress: account.address
			});
			state.revertOptimisticUpdate(transactionId);
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
  
	return {
		createRound,
		joinRound,
		startRound,
	};
};