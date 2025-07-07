'use client';

import { useState, useEffect } from 'react';
import { useAdminFunctions } from '@/hooks/useAdminFunctions';
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from '@dojoengine/sdk/react';
import { toast } from 'sonner';

interface GameConfigurationProps {
  isAdmin: boolean;
}

interface GameConfig {
  cardsPerRound: number;
  adminAddress: string;
  configInit: boolean;
  // UI-only fields (not in contract yet)
  cardTimeout: number;
  waitPeriodBeforeForceStart: number;
  maxPlayersPerRound: number;
  scoringMultiplier: number;
  enableMaintenanceMode: boolean;
  allowedGenres: string[];
  minimumCardYear: number;
  maximumCardYear: number;
  enableWagers: boolean;
  defaultWagerAmount: number;
}

export function GameConfiguration({ isAdmin }: GameConfigurationProps) {
  const { account, address } = useAccount();
  const { setAdminAddress, setCardsPerRound, setGameConfig } = useAdminFunctions();
  const { client } = useDojoSDK();

  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<GameConfig>({
    cardsPerRound: 10,
    adminAddress: '',
    configInit: false,
    // Default values for UI-only fields
    cardTimeout: 30,
    waitPeriodBeforeForceStart: 300,
    maxPlayersPerRound: 10,
    scoringMultiplier: 1,
    enableMaintenanceMode: false,
    allowedGenres: ['Hip-Hop', 'Pop', 'Rock', 'RnB', 'Afrobeats'],
    minimumCardYear: 1950,
    maximumCardYear: new Date().getFullYear(),
    enableWagers: true,
    defaultWagerAmount: 1000
  });

  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadGameConfig();
  }, []);

  const loadGameConfig = async () => {
    setLoading(true);
    try {
      // In a real implementation, you'd load the actual config from the contract
      // For now, we'll use defaults and current wallet address
      setConfig(prev => ({
        ...prev,
        adminAddress: address || '',
      }));
    } catch (error) {
      console.error('Error loading game config:', error);
      toast.error('Failed to load game configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCardsPerRound = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setIsUpdating(true);
    try {
      await setCardsPerRound(config.cardsPerRound);
      toast.success('Cards per round updated successfully');
    } catch (error) {
      console.error('Error updating cards per round:', error);
      toast.error('Failed to update cards per round');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAdminAddress = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    if (!newAdminAddress) {
      toast.error('Please enter a valid admin address');
      return;
    }

    setIsUpdating(true);
    try {
      await setAdminAddress(newAdminAddress);
      toast.success('Admin address updated successfully');
      setConfig(prev => ({ ...prev, adminAddress: newAdminAddress }));
      setNewAdminAddress('');
    } catch (error) {
      console.error('Error updating admin address:', error);
      toast.error('Failed to update admin address');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetConnectedWalletAsAdmin = async () => {
    if (!isAdmin || !address) {
      toast.error('Admin access required and wallet must be connected');
      return;
    }

    setIsUpdating(true);
    try {
      await setGameConfig(address);
      toast.success('Connected wallet set as admin successfully');
      setConfig(prev => ({ ...prev, adminAddress: address, configInit: true }));
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('Game config already initialized')) {
        toast.success('Game config was already initialized');
      } else {
        console.error('Error setting game config:', error);
        toast.error('Failed to set game config');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateUIOnlyConfig = (field: keyof GameConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    // Note: These would need contract functions to persist
    toast.info(`${field} updated (UI only - requires contract implementation)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Game Configuration</h2>
          <p className="text-gray-600">Configure game parameters and settings</p>
        </div>
        <button
          onClick={loadGameConfig}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Refresh Config
        </button>
      </div>

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          ⚠️ Admin access required to modify game configuration
        </div>
      )}

      {/* Contract-Backed Configuration */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          ⚙️ Core Configuration
          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Contract Backed</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cards Per Round */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cards Per Round
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={config.cardsPerRound}
                  onChange={(e) => setConfig(prev => ({ ...prev, cardsPerRound: Number(e.target.value) }))}
                  disabled={!isAdmin}
                  className="flex-1 p-2 border rounded-md disabled:bg-gray-100"
                />
                <button
                  onClick={handleUpdateCardsPerRound}
                  disabled={!isAdmin || isUpdating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Update
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Number of lyric cards per game round (1-20)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Admin Address
              </label>
              <div className="p-2 bg-gray-50 rounded-md text-sm font-mono">
                {config.adminAddress || 'Not set'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current admin wallet address
              </p>
            </div>
          </div>

          {/* Admin Management */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set New Admin Address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newAdminAddress}
                  onChange={(e) => setNewAdminAddress(e.target.value)}
                  placeholder="Enter new admin address"
                  disabled={!isAdmin}
                  className="flex-1 p-2 border rounded-md disabled:bg-gray-100"
                />
                <button
                  onClick={handleUpdateAdminAddress}
                  disabled={!isAdmin || !newAdminAddress || isUpdating}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  Set Admin
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={handleSetConnectedWalletAsAdmin}
                disabled={!isAdmin || isUpdating}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Use Connected Wallet as Admin
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Set your currently connected wallet as the admin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Game Settings (UI Only) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          🎮 Advanced Game Settings
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">UI Only</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Timeout (seconds)
            </label>
            <input
              type="number"
              min="10"
              max="300"
              value={config.cardTimeout}
              onChange={(e) => handleUpdateUIOnlyConfig('cardTimeout', Number(e.target.value))}
              disabled={!isAdmin}
              className="w-full p-2 border rounded-md disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Time limit for answering each card</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Force Start Wait Period (seconds)
            </label>
            <input
              type="number"
              min="60"
              max="1800"
              value={config.waitPeriodBeforeForceStart}
              onChange={(e) => handleUpdateUIOnlyConfig('waitPeriodBeforeForceStart', Number(e.target.value))}
              disabled={!isAdmin}
              className="w-full p-2 border rounded-md disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Wait time before admin can force start</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Players Per Round
            </label>
            <input
              type="number"
              min="2"
              max="20"
              value={config.maxPlayersPerRound}
              onChange={(e) => handleUpdateUIOnlyConfig('maxPlayersPerRound', Number(e.target.value))}
              disabled={!isAdmin}
              className="w-full p-2 border rounded-md disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum players allowed per round</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scoring Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="5.0"
              value={config.scoringMultiplier}
              onChange={(e) => handleUpdateUIOnlyConfig('scoringMultiplier', Number(e.target.value))}
              disabled={!isAdmin}
              className="w-full p-2 border rounded-md disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Multiplier for score calculation</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Card Year
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={config.minimumCardYear}
              onChange={(e) => handleUpdateUIOnlyConfig('minimumCardYear', Number(e.target.value))}
              disabled={!isAdmin}
              className="w-full p-2 border rounded-md disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Earliest year for lyrics cards</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Card Year
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear() + 10}
              value={config.maximumCardYear}
              onChange={(e) => handleUpdateUIOnlyConfig('maximumCardYear', Number(e.target.value))}
              disabled={!isAdmin}
              className="w-full p-2 border rounded-md disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Latest year for lyrics cards</p>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          🔧 Feature Configuration
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">UI Only</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Maintenance Mode</h4>
                <p className="text-sm text-gray-500">Disable new game creation</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableMaintenanceMode}
                  onChange={(e) => handleUpdateUIOnlyConfig('enableMaintenanceMode', e.target.checked)}
                  disabled={!isAdmin}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable Wagers</h4>
                <p className="text-sm text-gray-500">Allow players to place wagers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableWagers}
                  onChange={(e) => handleUpdateUIOnlyConfig('enableWagers', e.target.checked)}
                  disabled={!isAdmin}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Wager Amount (STRK)
            </label>
            <input
              type="number"
              min="0"
              value={config.defaultWagerAmount}
              onChange={(e) => handleUpdateUIOnlyConfig('defaultWagerAmount', Number(e.target.value))}
              disabled={!isAdmin || !config.enableWagers}
              className="w-full p-2 border rounded-md disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Default wager amount for new games</p>
          </div>
        </div>
      </div>

      {/* Implementation Notice */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
        <h4 className="font-semibold mb-2">Implementation Status</h4>
        <ul className="text-sm space-y-1">
          <li>✅ <strong>Cards Per Round:</strong> Fully implemented in contract</li>
          <li>✅ <strong>Admin Address:</strong> Fully implemented in contract</li>
          <li>⚠️ <strong>Advanced Settings:</strong> UI ready, requires contract functions</li>
          <li>⚠️ <strong>Feature Toggles:</strong> UI ready, requires contract functions</li>
        </ul>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </div>
  );
} 