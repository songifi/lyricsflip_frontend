import { getEntityIdFromKeys } from "@dojoengine/utils";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { CairoCustomEnum } from "starknet";
/**
 * Custom hook to handle system calls and state management in the Dojo application.
 * Provides functionality for creating a round and handling optimistic updates.
 */
export const useSystemCalls = () => {
	const { account } = useAccount();
	const { useDojoStore, client } = useDojoSDK();
	const state = useDojoStore((state) => state);
  
	const generateEntityId = () => {
	  if (!account) throw new Error("Account not available");
	  return getEntityIdFromKeys([BigInt(account.address)]);
	};
  
	const createRound = async (genre: CairoCustomEnum) => {
		const entityId = generateEntityId();
		const transactionId = uuidv4();
		
		// Generate a round ID (in real transaction this would come from the contract)
		const roundId = BigInt(Date.now()); // Simple ID generation for optimistic update
	  
		state.applyOptimisticUpdate(transactionId, (draft) => {
		  // Create the main Rounds entity (what the UI listens for)
		  const roundsEntityId = getEntityIdFromKeys([roundId]);
		  if (!draft.entities[roundsEntityId]) {
			draft.entities[roundsEntityId] = {
			  entityId: roundsEntityId,
			  models: {
				lyricsflip: {
				  Rounds: {
					round_id: roundId,
					round: {
					  creator: account?.address || "",
					  genre: genre.activeVariant(), 
					  wager_amount: 0,
					  start_time: BigInt(Date.now()),
					  state: 0, // Creating state
					  end_time: 0,
					  next_card_index: 0,
					  players_count: 0,
					  ready_players_count: 0,
					}
				  },
				},
			  },
			};
		  }
		  
		  // Create the RoundCreated event entity
		  const eventEntityId = getEntityIdFromKeys([roundId, BigInt(Date.now())]);
		  if (!draft.entities[eventEntityId]) {
			draft.entities[eventEntityId] = {
			  entityId: eventEntityId,
			  models: {
				lyricsflip: {
				  RoundCreated: {
					round_id: roundId,
					creator: account?.address || "",
				  },
				},
			  },
			};
		  }
		});
	  
		try {
			await client.actions.createRound(account, genre);  
		 
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
		const entityId = generateEntityId();

		console.log(`[JoinRound] Starting join operation for round ${roundId}`, {
			roundId: roundId.toString(),
			roundIdHex: `0x${roundId.toString(16)}`,
			accountAddress: account.address
		});
		
		// Apply optimistic update
		state.applyOptimisticUpdate(transactionId, (draft) => {
			if (!draft.entities[entityId]) {
				draft.entities[entityId] = {
					entityId,
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

		try {
			console.log(`[JoinRound] Executing join transaction for round ${roundId}`, {
				roundId: roundId.toString(),
				roundIdHex: `0x${roundId.toString(16)}`,
				accountAddress: account.address
			});
			await client.actions.joinRound(account, roundId);
			console.log(`[JoinRound] Successfully joined round ${roundId}`);
		} catch (error) {
			console.error(`[JoinRound] Error joining round ${roundId}:`, {
				error,
				roundId: roundId.toString(),
				roundIdHex: `0x${roundId.toString(16)}`,
				accountAddress: account.address
			});
			state.revertOptimisticUpdate(transactionId);
			throw error;
		} finally {
			state.confirmTransaction(transactionId);
		}
	};
  
	return {
		createRound,
		joinRound,
	};
};