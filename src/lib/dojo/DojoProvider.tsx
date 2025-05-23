'use client';

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { roundEventBus } from './events/eventBus';
import { useRoundStore } from './events/roundStore';
import { useSystemCalls } from './useSystemCalls';
import { usePlayerEvents } from './events/usePlayerEvents';

interface DojoContextValue {
  client: any;
  roundEventBus: typeof roundEventBus;
  roundStore: ReturnType<typeof useRoundStore>;
  systemCalls: ReturnType<typeof useSystemCalls>;
}

const DojoContext = createContext<DojoContextValue | null>(null);

export const DojoProvider = ({ children }: { children: React.ReactNode }) => {
  const { client } = useDojoSDK();
  const roundStore = useRoundStore();
  const systemCalls = useSystemCalls();

  // Initialize player event subscriptions globally
  usePlayerEvents();

  const value = useMemo(() => ({
    client,
    roundEventBus,
    roundStore,
    systemCalls,
  }), [client, roundStore, systemCalls]);

  // Cleanup on unmount or network change
  useEffect(() => {
    return () => {
      roundEventBus.clear();
    };
  }, []);

  return <DojoContext.Provider value={value}>{children}</DojoContext.Provider>;
};

export const useDojo = () => {
  const context = useContext(DojoContext);
  if (!context) {
    throw new Error('useDojo must be used within a DojoProvider');
  }
  return context;
};
