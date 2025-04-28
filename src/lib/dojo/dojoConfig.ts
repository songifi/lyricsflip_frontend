import { createDojoConfig } from "@dojoengine/core";
import manifest from "../../../manifest_dev.json";

// Helper function to get environment variables
const getEnvVar = (name: string, defaultValue: string = '') => {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.__ENV?.[name as keyof typeof window.__ENV] || defaultValue;
  }
  // Server-side
  return process.env[name] || defaultValue;
};

// Create the Dojo configuration
export const createConfig = () => {
  const toriiUrl = getEnvVar('NEXT_PUBLIC_TORII_URL');
  const relayUrl = getEnvVar('NEXT_PUBLIC_RELAY_URL');
  
  return createDojoConfig({
    rpcUrl: getEnvVar('NEXT_PUBLIC_RPC_URL', 'http://localhost:5050'),
    toriiUrl: toriiUrl || undefined,
    relayUrl: relayUrl || undefined,
    manifest,
    masterAddress: getEnvVar('NEXT_PUBLIC_MASTER_ADDRESS'),
    masterPrivateKey: getEnvVar('NEXT_PUBLIC_MASTER_PRIVATE_KEY'),
    accountClassHash: getEnvVar('NEXT_PUBLIC_ACCOUNT_CLASS_HASH')
  });
};