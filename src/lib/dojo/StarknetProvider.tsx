// StarknetProvider.tsx
"use client";
import type { PropsWithChildren } from "react";
import { mainnet } from "@starknet-react/chains";
import { jsonRpcProvider, StarknetConfig, voyager, useAccount, useConnect } from "@starknet-react/core";
import { dojoConfig } from "./dojoConfig";
import { usePredeployedAccounts } from "@dojoengine/predeployed-connector/react";

export default function StarknetProvider({ children }: PropsWithChildren) {
  const { connectors } = usePredeployedAccounts({
    rpc: dojoConfig.rpcUrl as string,
    id: "katana",
    name: "Katana",
  });

  const provider = jsonRpcProvider({
    rpc: () => ({ nodeUrl: dojoConfig.rpcUrl as string }),
  });

  return (
    <StarknetConfig
      chains={[mainnet]}
      provider={provider}
      connectors={connectors}
      explorer={voyager}
      autoConnect
    >
      <StarknetConnectionWrapper>
        {children}
      </StarknetConnectionWrapper>
    </StarknetConfig>
  );
}

function StarknetConnectionWrapper({ children }: PropsWithChildren) {
  const { account, status } = useAccount();
  const { connect, connectors } = useConnect();

  if (!account) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Connect to a Predeployed Account</h2>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Connect {connector.name}
          </button>
        ))}
      </div>
    );
  }

  return <>{children}</>;
}
