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
      // Try to set game config - this might fail if already initialized
      await client.game_config.setGameConfig(account, 10); // Default to 10 cards per round
    } catch (error: any) {
      // Check if the error is about game config already being initialized
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('game config initialized')) {
        console.log('[SetGameConfig] Game config already initialized, only setting admin address');
        // Game config is already initialized, just set the admin address
        try {
          await client.game_config.setAdminAddress(account, adminAddress);
          return; // Success - only admin address was set
        } catch (adminError) {
          console.error('[SetGameConfig] Error setting admin address after config already initialized:', adminError);
          throw new Error('Game config already initialized and failed to set admin address');
        }
      } else {
        console.error('[SetGameConfig] Error initializing game config:', error);
        throw error;
      }
    }
    
    // If we reach here, game config was successfully initialized, now set admin
    try {
      await client.game_config.setAdminAddress(account, adminAddress);
    } catch (error) {
      console.error('[SetGameConfig] Error setting admin address after successful config init:', error);
      throw error;
    }
  };

  const checkIsAdmin = async (): Promise<boolean> => {
    if (!account) return false;
    
    try {
      console.log('[CheckIsAdmin] Testing admin status for:', account.address);
      // Try a low-impact admin operation to test if current wallet is admin
      // We'll try to set the cards per round to the current value (essentially a no-op)
      await client.game_config.setCardsPerRound(account, 10);
      console.log('[CheckIsAdmin] Current wallet IS an admin');
      return true;
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('caller not admin')) {
        console.log('[CheckIsAdmin] Current wallet is NOT an admin');
        return false;
      } else {
        // Some other error occurred, assume not admin for safety
        console.error('[CheckIsAdmin] Error checking admin status:', error);
        return false;
      }
    }
  };

  return {
    setAdminAddress,
    setCardsPerRound,
    setGameConfig,
    checkIsAdmin
  };
}; 