import { useContext } from 'react';
import { Account } from 'starknet';
import { DojoContext, DojoContextType } from '../DojoProvider';
import { DojoSetup } from '../setup';

export type { DojoSetup };

export interface DojoHookResult {
  setup: DojoSetup | null;
  account: Account | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDojo(): DojoHookResult {
  const { setup, isLoading, error }: DojoContextType = useContext(DojoContext);

  // Debug current state
  console.log('useDojo state:', {
    isLoading,
    hasSetup: !!setup,
    hasConfig: !!setup?.config,
    hasActions: !!setup?.config?.actions,
    hasGameConfig: !!setup?.config?.game_config,
    hasError: !!error
  });

  // Early return if setup is still in progress
  if (isLoading && !setup) {
    return { 
      setup: null, 
      account: null,
      isLoading: true,
      error: null
    };
  }

  // Return error state if setup failed
  if (error) {
    return {
      setup: null,
      account: null,
      isLoading: false,
      error
    };
  }

  // Return not ready state if setup is incomplete
  if (!setup?.config?.actions || !setup?.config?.game_config) {
    console.warn('Dojo setup incomplete:', { 
      hasSetup: !!setup, 
      hasActions: !!setup?.config?.actions, 
      hasGameConfig: !!setup?.config?.game_config 
    });
    return { 
      setup: null, 
      account: null,
      isLoading: false,
      error: new Error('Dojo setup incomplete')
    };
  }

  return {
    setup,
    account: setup.account,
    isLoading: false,
    error: null
  };
}