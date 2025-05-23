'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
import { init, SDK } from '@dojoengine/sdk';
import { schema, SchemaType } from '@/lib/dojo/typescript/models.gen';
import { dojoConfig } from '@/lib/dojo/dojoConfig';
import { setupWorld } from '@/lib/dojo/typescript/contracts.gen';
import { DojoSdkProvider } from '@dojoengine/sdk/react';
import { useState, useEffect } from 'react';
import StarknetProvider from '@/lib/dojo/StarknetProvider';
import { DojoProvider } from '@/lib/dojo/DojoProvider';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [sdk, setSdk] = useState<SDK<typeof schema> | null>(null);

  useEffect(() => {
    async function initializeSdk() {
      try {
        const sdkInstance = await init<SchemaType>({
          client: {
            toriiUrl: dojoConfig.toriiUrl,
            relayUrl: dojoConfig.relayUrl,
            worldAddress: dojoConfig.manifest.world.address,
          },
          domain: {
            name: "lyricsflip",
            version: "1.0",
            chainId: "KATANA",
            revision: "1",
          },
        });
        setSdk(sdkInstance);
      } catch (error) {
        console.error('Failed to initialize SDK:', error);
      }
    }
    initializeSdk();
  }, []);

  if (!sdk) {
    return <div>Loading...</div>; // Customize as needed
  }

  return (
    <DojoSdkProvider sdk={sdk} dojoConfig={dojoConfig} clientFn={setupWorld}>
      <StarknetProvider>
        <DojoProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </DojoProvider>
      </StarknetProvider>
    </DojoSdkProvider>
  );
}