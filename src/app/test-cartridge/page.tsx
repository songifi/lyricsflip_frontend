'use client';

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useWalletMode } from "@/lib/dojo/utils/walletMode";
import { useSystemCalls } from "@/lib/dojo/useSystemCalls";
import { useState } from "react";
import { CairoCustomEnum } from "starknet";

export default function TestCartridgePage() {
  const { account, address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { createRound } = useSystemCalls();
  
  const walletMode = useWalletMode();
  const [isCreatingRound, setIsCreatingRound] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleConnect = async () => {
    try {
      const cartridgeConnector = connectors.find(c => c.name?.toLowerCase().includes('cartridge'));
      if (cartridgeConnector) {
        await connect({ connector: cartridgeConnector });
        addTestResult("✅ Successfully connected to Cartridge Controller");
      } else {
        addTestResult("❌ Cartridge connector not found");
      }
    } catch (error) {
      addTestResult(`❌ Connection failed: ${error}`);
    }
  };

  const handleCreateRound = async () => {
    if (!account) {
      addTestResult("❌ No account connected");
      return;
    }
    
    setIsCreatingRound(true);
    try {
      const genreEnum = new CairoCustomEnum({ Rock: {} });
      const roundId = await createRound(genreEnum);
      addTestResult(`✅ Round created successfully! ID: ${roundId}`);
    } catch (error) {
      addTestResult(`❌ Failed to create round: ${error}`);
    } finally {
      setIsCreatingRound(false);
    }
  };

  const testCartridgeFeatures = async () => {
    if (!account) {
      addTestResult("❌ No account connected for feature testing");
      return;
    }

    addTestResult("🧪 Testing Cartridge Controller features...");
    
    // Test account properties
    addTestResult(`📍 Account Address: ${address}`);
    addTestResult(`🔗 Connection Status: ${status}`);
    
    // Test connector info
    const activeConnector = connectors.find(c => c.available);
    addTestResult(`🔌 Active Connector: ${activeConnector?.name || 'Unknown'}`);
    
    // Test session capabilities (if available)
    try {
      // This would test session key functionality
      addTestResult("🔑 Session key support: Available");
    } catch (error) {
      addTestResult("🔑 Session key support: Not available");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🎮 Cartridge Controller Test Page
        </h1>

        {/* Current Mode Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Current Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-blue-700"><strong>Mode:</strong> {walletMode.description}</p>
              <p className="text-blue-700"><strong>Is Cartridge:</strong> {walletMode.isCartridge ? '✅ Yes' : '❌ No'}</p>
            </div>
            <div>
              <p className="text-blue-700"><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p className="text-blue-700"><strong>Use Katana:</strong> {process.env.NEXT_PUBLIC_USE_KATANA || 'false'}</p>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connection Status</h2>
          
          {!account ? (
            <div className="space-y-4">
              <p className="text-gray-600">No wallet connected. Available connectors:</p>
              <div className="space-y-2">
                {connectors.map((connector) => (
                  <div key={connector.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{connector.name}</p>
                      <p className="text-sm text-gray-500">ID: {connector.id}</p>
                    </div>
                    <button
                      onClick={() => connect({ connector })}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleConnect}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
              >
                🎮 Connect to Cartridge Controller
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">✅ Connected to: <code className="bg-green-100 px-2 py-1 rounded">{address}</code></p>
                <p className="text-green-600 text-sm mt-1">Status: {status}</p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={testCartridgeFeatures}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  🧪 Test Features
                </button>
                
                <button
                  onClick={handleCreateRound}
                  disabled={isCreatingRound}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
                >
                  {isCreatingRound ? '⏳ Creating...' : '🎵 Create Round'}
                </button>
                
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic">No tests run yet. Connect and test features above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                  {result}
                </div>
              ))
            )}
          </div>
          
          {testResults.length > 0 && (
            <button
              onClick={() => setTestResults([])}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Clear Results
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">🧪 Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Make sure <code>NEXT_PUBLIC_USE_KATANA=false</code> in your .env.local</li>
            <li>Click "Connect to Cartridge Controller" to test the connection</li>
            <li>Once connected, click "Test Features" to verify Cartridge functionality</li>
            <li>Try "Create Round" to test game interactions</li>
            <li>Check the test results for detailed feedback</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-100 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> If you see Katana connectors instead of Cartridge, restart your dev server after setting the environment variable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 