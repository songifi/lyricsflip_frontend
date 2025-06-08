// Configuration utility for wallet connection modes
export interface WalletConfig {
  useKatanaAccounts: boolean;
  isDevelopment: boolean;
  rpcUrl: string;
  toriiUrl: string;
  relayUrl: string;
  debug: boolean;
}

export const getWalletConfig = (): WalletConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Explicitly check for the environment variable first
  // Only default to Katana if the env var is not set AND we're in development
  const useKatanaFromEnv = process.env.NEXT_PUBLIC_USE_KATANA;
  
  // Add detailed debugging
  console.log('🔍 Environment Variable Debug:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  NEXT_PUBLIC_USE_KATANA:', useKatanaFromEnv);
  console.log('  isDevelopment:', isDevelopment);
  console.log('  useKatanaFromEnv !== undefined:', useKatanaFromEnv !== undefined);
  console.log('  useKatanaFromEnv === "true":', useKatanaFromEnv === 'true');
  
  const useKatanaAccounts = useKatanaFromEnv !== undefined 
    ? useKatanaFromEnv === 'true' 
    : isDevelopment; // Only default to true if env var is not set
  
  console.log('  Final useKatanaAccounts:', useKatanaAccounts);
  
  return {
    useKatanaAccounts,
    isDevelopment,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:5050',
    toriiUrl: process.env.NEXT_PUBLIC_TORII_URL || 'http://localhost:8080',
    relayUrl: process.env.NEXT_PUBLIC_RELAY_URL || "  /ip4/127.0.0.1/tcp/9092/ws",
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true' || isDevelopment,
  };
};

// Cartridge Controller policies for your game - using the correct format
export const getCartridgePolicies = (worldAddress: string) => ({
  contracts: {
    [worldAddress]: {
      methods: [
        {
          name: "create_round",
          entrypoint: "create_round",
          description: "Create a new game round in LyricsFlip",
        },
        {
          name: "join_round",
          entrypoint: "join_round", 
          description: "Join an existing game round",
        },
        {
          name: "start_round",
          entrypoint: "start_round",
          description: "Start a game round when ready",
        },
        {
          name: "add_lyrics_card",
          entrypoint: "add_lyrics_card",
          description: "Add lyrics card to the game collection",
        },
      ],
    },
  },
});

// Cartridge Controller chain configuration
export const getCartridgeChains = () => [
  { rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia" },
  { rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet" },
];

// Chain IDs for Cartridge Controller
export const CHAIN_IDS = {
  SEPOLIA: "0x534e5f5345504f4c4941",
  MAINNET: "0x534e5f4d41494e4e4554",
} as const;

export const WALLET_MODES = {
  KATANA: 'katana',
  CARTRIDGE: 'cartridge',
} as const;

export type WalletMode = typeof WALLET_MODES[keyof typeof WALLET_MODES]; 