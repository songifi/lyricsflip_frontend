import { Account } from "starknet";
import { DojoConfig, DojoProvider } from "@dojoengine/core";
import { setupBurnerManager } from "@dojoengine/create-burner";
import { setupWorld } from "./typescript/contracts.gen";

export interface DojoSetup {
  config: {
    actions: any; // Temporary for backward compatibility, ideally typed from contracts.gen.ts
    game_config: any; // Temporary for backward compatibility
  };
  account: Account | null;
  world: ReturnType<typeof setupWorld>;
}

export type SetupResult = DojoSetup;

async function checkServices(config: DojoConfig) {
  try {
    // Check RPC endpoint - required
    try {
      const rpcResponse = await fetch(config.rpcUrl);
      if (!rpcResponse.ok) {
        throw new Error(`RPC service not available at ${config.rpcUrl}`);
      }
      console.log("RPC service is available");
    } catch (error) {
      throw new Error(
        `RPC service not available at ${config.rpcUrl}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    // Check Torii endpoint - optional
    if (config.toriiUrl) {
      try {
        const toriiResponse = await fetch(config.toriiUrl);
        if (!toriiResponse.ok) {
          console.warn(`Warning: Torii service not available at ${config.toriiUrl}`);
        } else {
          console.log("Torii service is available");
        }
      } catch (error) {
        console.warn(`Warning: Could not connect to Torii service at ${config.toriiUrl}`);
      }
    }

    // Check Relay endpoint - optional
    if (config.relayUrl) {
      try {
        const relayResponse = await fetch(config.relayUrl);
        if (!relayResponse.ok) {
          console.warn(`Warning: Relay service not available at ${config.relayUrl}`);
        } else {
          console.log("Relay service is available");
        }
      } catch (error) {
        console.warn(`Warning: Could not connect to Relay service at ${config.relayUrl}`);
      }
    }
  } catch (error) {
    console.error("Service check failed:", error);
    throw error;
  }
}

export async function setup(config: DojoConfig): Promise<SetupResult> {
  try {
    console.log("Setting up Dojo with config:", {
      hasRpcUrl: !!config.rpcUrl,
      hasToriiUrl: !!config.toriiUrl,
      hasRelayUrl: !!config.relayUrl,
      hasMasterAddress: !!config.masterAddress,
      hasMasterPrivateKey: !!config.masterPrivateKey,
      hasAccountClassHash: !!config.accountClassHash,
      hasManifest: !!config.manifest,
      rpcUrl: config.rpcUrl,
      toriiUrl: config.toriiUrl,
      relayUrl: config.relayUrl,
    });

    if (!config.masterAddress || !config.masterPrivateKey || !config.accountClassHash) {
      throw new Error(
        "Missing required configuration. Check that all required environment variables are set."
      );
    }

    console.log("Checking Dojo services...");
    await checkServices(config);

    console.log("Creating burner manager...");
    let burnerManager;
    try {
      burnerManager = await setupBurnerManager(config);
      console.log("Burner manager created:", {
        hasGetActiveAccount: typeof burnerManager.getActiveAccount === "function",
      });
    } catch (error) {
      console.error("Error creating burner manager:", error);
      throw new Error(
        `Failed to create burner manager: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    console.log("Getting active account...");
    let account: Account | null = null;
    try {
      account = burnerManager.getActiveAccount();
      console.log("Active account:", account ? "obtained" : "null");
    } catch (error) {
      console.error("Error getting active account:", error);
      throw new Error(
        `Failed to get active account: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    console.log("Setting up world...");
    const world = setupWorld(account as unknown as DojoProvider);
    console.log("World setup complete:", {
      hasActions: !!world.actions,
      hasGameConfig: !!world.game_config,
    });

    console.log("Setup complete");
    return {
      config: {
        actions: world.actions,
        game_config: world.game_config,
      },
      account,
      world,
    };
  } catch (error) {
    console.error("Error setting up Dojo:", error);
    throw error;
  }
}