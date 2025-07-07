'use client';

import { useState, useEffect } from 'react';
import { useDojoSDK, useModels } from '@dojoengine/sdk/react';
import { ModelsMapping } from '@/lib/dojo/typescript/models.gen';
import { toast } from 'sonner';

interface PlayerStats {
  player: string;
  totalRounds: number;
  roundsWon: number;
  currentStreak: number;
  maxStreak: number;
  winRate: number;
  averageScore: number;
  lastActiveDate: string;
  status: 'active' | 'banned' | 'suspended';
  warningCount: number;
}

interface PlayerManagementProps {
  isAdmin: boolean;
}

export function PlayerManagement({ isAdmin }: PlayerManagementProps) {
  const { client } = useDojoSDK();
  const playerStatsModels = useModels(ModelsMapping.PlayerStats);

  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<keyof PlayerStats>('lastActiveDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moderationAction, setModerationAction] = useState('');
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      // Mock player data - in real implementation, you'd query the contract
      const mockPlayers: PlayerStats[] = [
        {
          player: '0x1234...5678',
          totalRounds: 45,
          roundsWon: 32,
          currentStreak: 5,
          maxStreak: 12,
          winRate: 71.1,
          averageScore: 850,
          lastActiveDate: '2024-01-15',
          status: 'active',
          warningCount: 0
        },
        {
          player: '0x2468...1357',
          totalRounds: 23,
          roundsWon: 8,
          currentStreak: 0,
          maxStreak: 3,
          winRate: 34.8,
          averageScore: 420,
          lastActiveDate: '2024-01-14',
          status: 'active',
          warningCount: 1
        },
        {
          player: '0x9876...4321',
          totalRounds: 78,
          roundsWon: 65,
          currentStreak: 15,
          maxStreak: 20,
          winRate: 83.3,
          averageScore: 950,
          lastActiveDate: '2024-01-16',
          status: 'active',
          warningCount: 0
        },
        {
          player: '0x5555...9999',
          totalRounds: 12,
          roundsWon: 2,
          currentStreak: 0,
          maxStreak: 1,
          winRate: 16.7,
          averageScore: 200,
          lastActiveDate: '2024-01-10',
          status: 'suspended',
          warningCount: 3
        }
      ];

      setPlayers(mockPlayers);
    } catch (error) {
      console.error('Error loading players:', error);
      toast.error('Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  const handleModeratePlayer = async () => {
    if (!isAdmin || !selectedPlayer) {
      toast.error('Admin access required');
      return;
    }

    // Note: These actions would need contract implementation
    toast.warning(`${moderationAction} action not available in contract yet`);
    setIsModalOpen(false);
    setModerationAction('');
    setModerationReason('');
  };

  const handleBanPlayer = (player: PlayerStats) => {
    setSelectedPlayer(player);
    setModerationAction('ban');
    setIsModalOpen(true);
  };

  const handleSuspendPlayer = (player: PlayerStats) => {
    setSelectedPlayer(player);
    setModerationAction('suspend');
    setIsModalOpen(true);
  };

  const handleWarnPlayer = (player: PlayerStats) => {
    setSelectedPlayer(player);
    setModerationAction('warn');
    setIsModalOpen(true);
  };

  const filteredAndSortedPlayers = players
    .filter(player => {
      const matchesSearch = player.player.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || player.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>;
      case 'banned':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Banned</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Suspended</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Unknown</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Player Management</h2>
          <p className="text-gray-600">Monitor and moderate player accounts</p>
        </div>
        <button
          onClick={loadPlayers}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          ⚠️ Admin access required for moderation actions
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Players</h3>
          <p className="text-2xl font-bold text-gray-900">{players.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Players</h3>
          <p className="text-2xl font-bold text-green-600">
            {players.filter(p => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Suspended</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {players.filter(p => p.status === 'suspended').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Banned</h3>
          <p className="text-2xl font-bold text-red-600">
            {players.filter(p => p.status === 'banned').length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Players
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by wallet address..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as keyof PlayerStats)}
              className="w-full p-2 border rounded-md"
            >
              <option value="lastActiveDate">Last Active</option>
              <option value="totalRounds">Total Rounds</option>
              <option value="winRate">Win Rate</option>
              <option value="averageScore">Average Score</option>
              <option value="warningCount">Warning Count</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full p-2 border rounded-md"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            Players ({filteredAndSortedPlayers.length} found)
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading players...</div>
        ) : filteredAndSortedPlayers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No players found. Try adjusting your search or filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedPlayers.map((player) => (
                  <tr key={player.player} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {player.player}
                        </div>
                        <div className="text-sm text-gray-500">
                          Last active: {player.lastActiveDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Rounds: {player.totalRounds}</div>
                        <div>Won: {player.roundsWon}</div>
                        <div>Current Streak: {player.currentStreak}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Win Rate: {player.winRate}%</div>
                        <div>Avg Score: {player.averageScore}</div>
                        <div>Max Streak: {player.maxStreak}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(player.status)}
                        {player.warningCount > 0 && (
                          <div className="text-xs text-orange-600">
                            {player.warningCount} warning(s)
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {player.status === 'active' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleWarnPlayer(player)}
                            disabled={!isAdmin}
                            className="text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
                          >
                            Warn
                          </button>
                          <button
                            onClick={() => handleSuspendPlayer(player)}
                            disabled={!isAdmin}
                            className="text-orange-600 hover:text-orange-700 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleBanPlayer(player)}
                            disabled={!isAdmin}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            Ban
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedPlayer(player);
                            setModerationAction('unban');
                            setIsModalOpen(true);
                          }}
                          disabled={!isAdmin}
                          className="text-green-600 hover:text-green-700 disabled:opacity-50"
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      {isModalOpen && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 capitalize">
              {moderationAction} Player
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Player Address
                </label>
                <div className="p-2 bg-gray-50 rounded text-sm font-mono">
                  {selectedPlayer.player}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter reason for this action..."
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded mt-4">
              ⚠️ Moderation actions require contract implementation
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleModeratePlayer}
                className={`px-4 py-2 rounded-md text-white ${moderationAction === 'ban' ? 'bg-red-600 hover:bg-red-700' :
                    moderationAction === 'suspend' ? 'bg-orange-600 hover:bg-orange-700' :
                      moderationAction === 'warn' ? 'bg-yellow-600 hover:bg-yellow-700' :
                        'bg-green-600 hover:bg-green-700'
                  }`}
              >
                Confirm {moderationAction}
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPlayer(null);
                  setModerationAction('');
                  setModerationReason('');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 