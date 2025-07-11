'use client';

import { useState, useEffect } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { toast } from 'sonner';

interface SystemMetrics {
  totalRounds: number;
  activeRounds: number;
  completedRounds: number;
  totalPlayers: number;
  activePlayers: number;
  totalLyricsCards: number;
  averageRoundDuration: number;
  systemUptime: number;
  averagePlayersPerRound: number;
  popularGenres: { genre: string; count: number; percentage: number }[];
  performanceMetrics: {
    averageResponseTime: number;
    errorRate: number;
    transactionSuccess: number;
  };
  recentActivity: {
    timestamp: string;
    action: string;
    details: string;
    status: 'success' | 'error' | 'warning';
  }[];
}

interface SystemAnalyticsProps {
  isAdmin: boolean;
}

export function SystemAnalytics({ isAdmin }: SystemAnalyticsProps) {
  const { client } = useDojoSDK();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadMetrics, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, query contract and system metrics
      const mockMetrics: SystemMetrics = {
        totalRounds: 1247,
        activeRounds: 23,
        completedRounds: 1224,
        totalPlayers: 1156,
        activePlayers: 89,
        totalLyricsCards: 2450,
        averageRoundDuration: 340, // seconds
        systemUptime: 99.7,
        averagePlayersPerRound: 3.4,
        popularGenres: [
          { genre: 'Hip-Hop', count: 890, percentage: 36.3 },
          { genre: 'Pop', count: 650, percentage: 26.5 },
          { genre: 'Rock', count: 480, percentage: 19.6 },
          { genre: 'RnB', count: 280, percentage: 11.4 },
          { genre: 'Afrobeats', count: 150, percentage: 6.1 }
        ],
        performanceMetrics: {
          averageResponseTime: 120, // ms
          errorRate: 0.8, // percentage
          transactionSuccess: 99.2 // percentage
        },
        recentActivity: [
          {
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            action: 'Round Completed',
            details: 'Round #1247 completed with 4 players',
            status: 'success'
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
            action: 'Lyrics Added',
            details: 'Batch upload of 25 new lyrics cards',
            status: 'success'
          },
          {
            timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
            action: 'Player Joined',
            details: 'New player 0x1234...5678 registered',
            status: 'success'
          },
          {
            timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            action: 'Transaction Error',
            details: 'Failed to start round #1246 - timeout',
            status: 'error'
          },
          {
            timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
            action: 'Force Start',
            details: 'Admin force started round #1245',
            status: 'warning'
          }
        ]
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading system metrics:', error);
      toast.error('Failed to load system analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Analytics</h2>
          <p className="text-gray-600">Performance monitoring and usage statistics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">Auto-refresh:</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
              className="text-sm border rounded px-2 py-1 disabled:opacity-50"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Rounds</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalRounds.toLocaleString()}</p>
          <p className="text-sm text-green-600">
            {metrics.activeRounds} active now
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Players</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalPlayers.toLocaleString()}</p>
          <p className="text-sm text-green-600">
            {metrics.activePlayers} online
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Lyrics Cards</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalLyricsCards.toLocaleString()}</p>
          <p className="text-sm text-gray-500">
            In database
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">System Uptime</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.systemUptime}%</p>
          <p className="text-sm text-green-600">
            Last 30 days
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Response Time</span>
              <span className="font-semibold">{metrics.performanceMetrics.averageResponseTime}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Transaction Success Rate</span>
              <span className="font-semibold text-green-600">
                {metrics.performanceMetrics.transactionSuccess}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Error Rate</span>
              <span className="font-semibold text-red-600">
                {metrics.performanceMetrics.errorRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Round Duration</span>
              <span className="font-semibold">{formatDuration(metrics.averageRoundDuration)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Players/Round</span>
              <span className="font-semibold">{metrics.averagePlayersPerRound}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Popular Genres</h3>
          <div className="space-y-3">
            {metrics.popularGenres.map((genre) => (
              <div key={genre.genre} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium">{genre.genre}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${genre.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{genre.count}</div>
                  <div className="text-xs text-gray-500">{genre.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Recent System Activity</h3>
        </div>
        <div className="divide-y">
          {metrics.recentActivity.map((activity, index) => (
            <div key={index} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getStatusIcon(activity.status)}</span>
                  <div>
                    <h4 className={`font-medium ${getStatusColor(activity.status)}`}>
                      {activity.action}
                    </h4>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health Indicators */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Contract Services</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Database</span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Network</span>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Slow</span>
          </div>
        </div>
      </div>

      {/* Implementation Notice */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
        <h4 className="font-semibold mb-2">Data Sources</h4>
        <ul className="text-sm space-y-1">
          <li>📊 <strong>Contract Data:</strong> PlayerStats, Round events, and transaction logs</li>
          <li>🔧 <strong>System Metrics:</strong> Requires backend monitoring service</li>
          <li>📈 <strong>Real-time Updates:</strong> Auto-refresh functionality implemented</li>
          <li>💾 <strong>Historical Data:</strong> Requires data aggregation service</li>
        </ul>
      </div>
    </div>
  );
} 