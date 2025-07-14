'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { useSystemCalls } from './useSystemCalls';
import { useRoundsCount } from './hooks/useRoundsCount';

interface DojoContextValue {
  client: any;
  systemCalls: ReturnType<typeof useSystemCalls>;
}

const DojoContext = createContext<DojoContextValue | null>(null);

export const DojoProvider = ({ children }: { children: React.ReactNode }) => {
  const { client } = useDojoSDK();
  const systemCalls = useSystemCalls();
  
  // Subscribe to RoundsCount to ensure store receives round creation updates
  useRoundsCount();

  const value = useMemo(() => ({
    client,
    systemCalls,
  }), [client, systemCalls]);

  return <DojoContext.Provider value={value}>{children}</DojoContext.Provider>;
};

export const useDojo = () => {
  const context = useContext(DojoContext);
  if (!context) {
    throw new Error('useDojo must be used within a DojoProvider');
  }
  return context;
};
