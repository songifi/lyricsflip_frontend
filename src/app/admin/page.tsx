'use client';

import { useState, useEffect } from 'react';
import { useAccount } from "@starknet-react/core";
import { useAdminFunctions } from '@/hooks/useAdminFunctions';
import { useSystemCalls } from '@/lib/dojo/useSystemCalls';
import { toast } from 'sonner';

// Import the new admin components
import { LyricsManagement } from '@/components/admin/LyricsManagement';
import { GameConfiguration } from '@/components/admin/GameConfiguration';
import { PlayerManagement } from '@/components/admin/PlayerManagement';
import { SystemAnalytics } from '@/components/admin/SystemAnalytics';
import { BatchOperations } from '@/components/admin/BatchOperations';
import { EmergencyControls } from '@/components/admin/EmergencyControls';

type AdminTab = 'overview' | 'lyrics' | 'config' | 'players' | 'analytics' | 'batch' | 'emergency';

export default function AdminDashboard() {
  const { account, address } = useAccount();
  const { checkIsAdmin } = useAdminFunctions();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [isCurrentWalletAdmin, setIsCurrentWalletAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check admin status when wallet changes
  useEffect(() => {
    if (address) {
      handleCheckAdminStatus();
    } else {
      setIsCurrentWalletAdmin(null);
    }
  }, [address]);

  const handleCheckAdminStatus = async () => {
    if (!address) return;

    setIsCheckingAdmin(true);
    try {
      const isAdmin = await checkIsAdmin();
      setIsCurrentWalletAdmin(isAdmin);

      if (isAdmin) {
        setSuccess(`✅ This wallet (${address.slice(0, 6)}...${address.slice(-4)}) IS an admin!`);
        setError('');
      } else {
        setError(`❌ This wallet (${address.slice(0, 6)}...${address.slice(-4)}) is NOT an admin. Try switching to a different wallet.`);
        setSuccess('');
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setError('Failed to check admin status');
      setIsCurrentWalletAdmin(null);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

  const tabs = [
    { id: 'overview' as AdminTab, name: 'Overview', icon: '🏠' },
    { id: 'lyrics' as AdminTab, name: 'Lyrics Database', icon: '🎵' },
    { id: 'config' as AdminTab, name: 'Game Config', icon: '⚙️' },
    { id: 'players' as AdminTab, name: 'Player Management', icon: '👥' },
    { id: 'analytics' as AdminTab, name: 'Analytics', icon: '📊' },
    { id: 'batch' as AdminTab, name: 'Batch Operations', icon: '📦' },
    { id: 'emergency' as AdminTab, name: 'Emergency Controls', icon: '🚨' },
  ];

  if (!account) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Please connect your wallet to access the admin dashboard
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">LyricsFlip Admin Dashboard</h1>

        {/* Admin Status Card */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Admin Status</h2>
              <p className="text-sm text-gray-600">
                Current Wallet: {address?.slice(0, 8)}...{address?.slice(-6)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCheckAdminStatus}
                disabled={isCheckingAdmin}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isCheckingAdmin ? 'Checking...' : 'Check Status'}
              </button>
              {isCurrentWalletAdmin !== null && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${isCurrentWalletAdmin
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {isCurrentWalletAdmin ? '✅ Admin' : '❌ Not Admin'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">🎵 Lyrics Database</h3>
                <p className="text-gray-600 text-sm">Manage lyrics cards, view, edit, and remove entries</p>
                <button
                  onClick={() => setActiveTab('lyrics')}
                  className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Manage →
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">⚙️ Game Config</h3>
                <p className="text-gray-600 text-sm">Configure game parameters and settings</p>
                <button
                  onClick={() => setActiveTab('config')}
                  className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Configure →
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">👥 Players</h3>
                <p className="text-gray-600 text-sm">Monitor and moderate player accounts</p>
                <button
                  onClick={() => setActiveTab('players')}
                  className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Manage →
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">📊 Analytics</h3>
                <p className="text-gray-600 text-sm">System performance and usage analytics</p>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View →
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
          </div>
        )}

        {activeTab === 'lyrics' && (
          <LyricsManagement isAdmin={isCurrentWalletAdmin === true} />
        )}

        {activeTab === 'config' && (
          <GameConfiguration isAdmin={isCurrentWalletAdmin === true} />
        )}

        {activeTab === 'players' && (
          <PlayerManagement isAdmin={isCurrentWalletAdmin === true} />
        )}

        {activeTab === 'analytics' && (
          <SystemAnalytics isAdmin={isCurrentWalletAdmin === true} />
        )}

        {activeTab === 'batch' && (
          <BatchOperations isAdmin={isCurrentWalletAdmin === true} />
        )}

        {activeTab === 'emergency' && (
          <EmergencyControls isAdmin={isCurrentWalletAdmin === true} />
        )}
      </div>
    </main>
  );
} 