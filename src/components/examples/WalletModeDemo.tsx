'use client';

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useWalletMode } from "@/lib/dojo/utils/walletMode";
import { useSystemCalls } from "@/lib/dojo/useSystemCalls";
import { useState } from "react";
import { CairoCustomEnum } from "starknet";

/**
 * Demo component showing wallet mode integration
 * Works with both Katana and Cartridge Controller
 */
export function WalletModeDemo() {
  const { account, address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { createRound } = useSystemCalls();
  
  const walletMode = useWalletMode();
  const [isCreatingRound, setIsCreatingRound] = useState(false);

  const handleCreateRound = async () => {
    if (!account) return;
    
    setIsCreatingRound(true);
    try {
      // Create a proper CairoCustomEnum for Rock genre
      const genreEnum = new CairoCustomEnum({ Rock: {} });
      const roundId = await createRound(genreEnum);
      console.log('Round created with ID:', roundId);
      alert(`Round created successfully! ID: ${roundId}`);
    } catch (error) {
      console.error('Failed to create round:', error);
      alert('Failed to create round. Check console for details.');
    } finally {
      setIsCreatingRound(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Wallet Mode Demo</h2>
      
      {/* Current Mode Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Current Mode</h3>
        <p className="text-blue-700">{walletMode.description}</p>
        
        <div className="mt-3">
          <h4 className="font-medium text-blue-800 mb-1">Recommendations:</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            {walletMode.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Connection Status</h3>
        {account ? (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-green-800">
              ✅ Connected to: <code className="bg-green-100 px-1 rounded">{address}</code>
            </p>
            <p className="text-sm text-green-600 mt-1">
              Mode: {walletMode.mode} | Status: {status}
            </p>
            <button
              onClick={() => disconnect()}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-yellow-800 mb-3">
              ⚠️ No wallet connected. Choose a connector:
            </p>
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game Actions */}
      {account && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Game Actions</h3>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-gray-700 mb-3">
              Test your wallet integration by creating a game round:
            </p>
            <button
              onClick={handleCreateRound}
              disabled={isCreatingRound}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreatingRound ? 'Creating Round...' : 'Create Round'}
            </button>
          </div>
        </div>
      )}

      {/* Mode Switching Instructions */}
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Switch Wallet Mode</h3>
        <p className="text-gray-700 mb-2">
          To switch between Katana and Cartridge Controller:
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-white rounded border">
            <strong>Katana Mode (Development):</strong>
            <code className="block mt-1 p-1 bg-gray-100 rounded">
              NEXT_PUBLIC_USE_KATANA=true npm run dev
            </code>
          </div>
          
          <div className="p-2 bg-white rounded border">
            <strong>Cartridge Mode (Production):</strong>
            <code className="block mt-1 p-1 bg-gray-100 rounded">
              NEXT_PUBLIC_USE_KATANA=false npm run dev
            </code>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Restart your development server after changing the environment variable.
        </p>
      </div>

      {/* Debug Info (only in debug mode) */}
      {walletMode.debugInfo.config.debug && (
        <details className="mt-4">
          <summary className="cursor-pointer font-medium text-gray-700">
            🐛 Debug Information
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(walletMode.debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
} 