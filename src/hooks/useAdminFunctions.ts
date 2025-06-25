import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";

export const useAdminFunctions = () => {
  const { account } = useAccount();
  const { client } = useDojoSDK();

  const setAdminAddress = async (adminAddress: string) => {
    if (!account) throw new Error("Account not available");
    
    try {
      await client.game_config.setAdminAddress(account, adminAddress);
    } catch (error) {
      console.error('[SetAdminAddress] Error:', error);
      throw error;
    }
  };

  const setCardsPerRound = async (cardsPerRound: number) => {
    if (!account) throw new Error("Account not available");
    
    try {
      await client.game_config.setCardsPerRound(account, cardsPerRound);
    } catch (error) {
      console.error('[SetCardsPerRound] Error:', error);
      throw error;
    }
  };

  const setGameConfig = async (adminAddress: string) => {
    if (!account) throw new Error("Account not available");
    
    try {
      await client.game_config.setGameConfig(account, 10); // Default to 10 cards per round
      await client.game_config.setAdminAddress(account, adminAddress);
    } catch (error) {
      console.error('[SetGameConfig] Error:', error);
      throw error;
    }
  };

  return {
    setAdminAddress,
    setCardsPerRound,
    setGameConfig
  };
}; 