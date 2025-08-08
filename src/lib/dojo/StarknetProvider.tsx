// StarknetProvider.tsx
"use client";
import type { PropsWithChildren } from "react";
import { mainnet, sepolia } from "@starknet-react/chains";
import { 
  jsonRpcProvider, 
  StarknetConfig, 
  voyager, 
  useAccount, 
  useConnect,
  Connector 
} from "@starknet-react/core";
import { dojoConfig } from "./dojoConfig";
import { usePathname } from "next/navigation";
import { usePredeployedAccounts } from "@dojoengine/predeployed-connector/react";
import ControllerConnector from "@cartridge/connector/controller";
import { getWalletConfig, getCartridgePolicies, getCartridgeChains, CHAIN_IDS } from "./config";
import { Chain } from "starknet";

// Lazily create ControllerConnector on the client to avoid SSR window usage
let clientCartridgeConnector: ControllerConnector | null = null;

export default function StarknetProvider({ children }: PropsWithChildren) {
  const walletConfig = getWalletConfig();
  
  // Katana predeployed accounts connector
  const { connectors: katanaConnectors } = usePredeployedAccounts({
    rpc: dojoConfig.rpcUrl as string,
    id: "katana",
    name: "Katana",
  });

  // Choose connectors based on environment
  let connectors: Connector[] = [] as unknown as Connector[];
  if (walletConfig.useKatanaAccounts) {
    connectors = katanaConnectors as unknown as Connector[];
  } else {
    if (typeof window !== 'undefined') {
      if (!clientCartridgeConnector) {
        clientCartridgeConnector = new ControllerConnector({
          policies: getCartridgePolicies(dojoConfig.manifest.world.address),
          defaultChainId: CHAIN_IDS.SEPOLIA,
          chains: getCartridgeChains(),
        });
      }
      connectors = [clientCartridgeConnector as unknown as Connector];
    }
  }

  const provider = jsonRpcProvider({
    rpc: (chain: Chain) => {
      // Use Katana RPC only in Katana mode; otherwise Cartridge RPC per chain
      if (walletConfig.useKatanaAccounts) {
        return { nodeUrl: dojoConfig.rpcUrl as string };
      }
      if (chain.id === mainnet.id) {
        return { nodeUrl: "https://api.cartridge.gg/x/starknet/mainnet" };
      }
      return { nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" };
    },
  });

  // Choose appropriate chain based on environment
  const chains = walletConfig.useKatanaAccounts ? [sepolia] : [sepolia, mainnet];

  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      connectors={connectors}
      explorer={voyager}
      autoConnect={walletConfig.useKatanaAccounts} // Only auto-connect for Katana
    >
      <StarknetConnectionWrapper walletConfig={walletConfig}>
        {children}
      </StarknetConnectionWrapper>
    </StarknetConfig>
  );
}

function StarknetConnectionWrapper({ 
  children, 
  walletConfig 
}: PropsWithChildren & { walletConfig: ReturnType<typeof getWalletConfig> }) {
  const { account, status } = useAccount();
  const { connect, connectors } = useConnect();
  const pathname = usePathname();

  // Do not gate the dedicated sign-in page
  if (pathname === "/sign-in-page") {
    return <>{children}</>;
  }

  if (!account) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">
          {walletConfig.useKatanaAccounts ? "Connect to a Predeployed Account" : "Connect Your Wallet"}
        </h2>
        <div className="space-y-2">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 block w-full"
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
        {walletConfig.useKatanaAccounts && (
          <p className="text-sm text-gray-600 mt-2">
            Development mode: Using Katana prefunded accounts
          </p>
        )}
        {walletConfig.debug && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <p>Debug Info:</p>
            <p>Mode: {walletConfig.useKatanaAccounts ? 'Katana' : 'Cartridge'}</p>
            <p>RPC: {walletConfig.rpcUrl}</p>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
