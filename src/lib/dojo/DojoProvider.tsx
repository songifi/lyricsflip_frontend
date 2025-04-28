import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { type Account } from 'starknet';
import { type DojoConfig } from '@dojoengine/core';
import { setup, type SetupResult } from './setup';
import { createConfig } from './dojoConfig';

// Declare window.__ENV type
declare global {
  interface Window {
    __ENV?: {
      NEXT_PUBLIC_MASTER_ADDRESS?: string;
      NEXT_PUBLIC_MASTER_PRIVATE_KEY?: string;
      NEXT_PUBLIC_ACCOUNT_CLASS_HASH?: string;
      NEXT_PUBLIC_RPC_URL?: string;
      NEXT_PUBLIC_TORII_URL?: string;
      NEXT_PUBLIC_RELAY_URL?: string;
    };
  }
}

export interface DojoContextType {
  setup: SetupResult | null;
  isLoading: boolean;
  error: Error | null;
  warnings: string[];
}

const DojoContext = createContext<DojoContextType>({
  setup: null,
  isLoading: true,
  error: null,
  warnings: [],
});

export const DojoProvider = ({ children }: { children: React.ReactNode }) => {
  const [dojoSetup, setDojoSetup] = useState<SetupResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const hasSetup = useRef(false);

  const initDojo = useCallback(async () => {
    if (hasSetup.current) {
      console.log('Skipping duplicate initialization');
      return;
    }

    setIsLoading(true);
    try {
      // Ensure window.__ENV is populated
      if (typeof window !== 'undefined' && !window.__ENV) {
        window.__ENV = {
          NEXT_PUBLIC_MASTER_ADDRESS: process.env.NEXT_PUBLIC_MASTER_ADDRESS,
          NEXT_PUBLIC_MASTER_PRIVATE_KEY: process.env.NEXT_PUBLIC_MASTER_PRIVATE_KEY,
          NEXT_PUBLIC_ACCOUNT_CLASS_HASH: process.env.NEXT_PUBLIC_ACCOUNT_CLASS_HASH,
          NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
          NEXT_PUBLIC_TORII_URL: process.env.NEXT_PUBLIC_TORII_URL,
          NEXT_PUBLIC_RELAY_URL: process.env.NEXT_PUBLIC_RELAY_URL
        };
      }

      // Debug: Log environment variables (excluding sensitive data)
      console.log('Environment variables:', {
        NEXT_PUBLIC_RPC_URL: window.__ENV?.NEXT_PUBLIC_RPC_URL,
        NEXT_PUBLIC_TORII_URL: window.__ENV?.NEXT_PUBLIC_TORII_URL,
        NEXT_PUBLIC_RELAY_URL: window.__ENV?.NEXT_PUBLIC_RELAY_URL,
        // Log only existence of sensitive data
        NEXT_PUBLIC_MASTER_ADDRESS: !!window.__ENV?.NEXT_PUBLIC_MASTER_ADDRESS,
        NEXT_PUBLIC_MASTER_PRIVATE_KEY: !!window.__ENV?.NEXT_PUBLIC_MASTER_PRIVATE_KEY,
        NEXT_PUBLIC_ACCOUNT_CLASS_HASH: !!window.__ENV?.NEXT_PUBLIC_ACCOUNT_CLASS_HASH,
      });

      // Validate required environment variables
      const requiredEnvVars = [
        'NEXT_PUBLIC_MASTER_ADDRESS',
        'NEXT_PUBLIC_MASTER_PRIVATE_KEY',
        'NEXT_PUBLIC_ACCOUNT_CLASS_HASH',
        'NEXT_PUBLIC_RPC_URL'
      ];

      const missingEnvVars = requiredEnvVars.filter(
        varName => !window.__ENV?.[varName as keyof typeof window.__ENV]
      );

      if (missingEnvVars.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingEnvVars.join(', ')}`
        );
      }

      // Check optional services
      const newWarnings: string[] = [];
      if (!window.__ENV?.NEXT_PUBLIC_TORII_URL) {
        newWarnings.push('Torii service URL not configured - some features may be limited');
      }
      if (!window.__ENV?.NEXT_PUBLIC_RELAY_URL) {
        newWarnings.push('Relay service URL not configured - some features may be limited');
      }

      // Create Dojo config with current environment variables
      const config = createConfig();
      console.log('Starting Dojo setup...');
      const setupResult = await setup(config);
      
      // Validate setup result
      if (!setupResult?.config) {
        throw new Error('Setup completed but configuration is missing');
      }

      // Update state with setup result
      setDojoSetup(setupResult);
      hasSetup.current = true;
      setIsLoading(false);
      
      console.log('Dojo setup result:', {
        hasSetup: true,
        hasConfig: !!setupResult.config,
        hasActions: !!setupResult.config.actions,
        hasGameConfig: !!setupResult.config.game_config,
        hasAccount: !!setupResult.account
      });

      setWarnings(newWarnings);
      setError(null);

    } catch (error) {
      console.error('Dojo initialization failed:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    initDojo();

    return () => {
      mounted = false;
    };
  }, [initDojo]);

  // Debug: Log current context value
  console.log('DojoProvider current state:', {
    hasSetup: !!dojoSetup,
    isLoading,
    hasError: !!error,
    warningsCount: warnings.length,
    setupConfig: dojoSetup?.config ? {
      hasActions: !!dojoSetup.config.actions,
      hasGameConfig: !!dojoSetup.config.game_config
    } : null
  });

  const contextValue = {
    setup: dojoSetup,
    isLoading,
    error,
    warnings
  };

  return (
    <DojoContext.Provider value={contextValue}>
      {children}
    </DojoContext.Provider>
  );
};

export { DojoContext };