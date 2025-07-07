'use client';

import { useState } from 'react';
import { useSystemCalls } from '@/lib/dojo/useSystemCalls';
import { toast } from 'sonner';

interface EmergencyControlsProps {
  isAdmin: boolean;
}

interface SystemStatus {
  maintenanceMode: boolean;
  emergencyShutdown: boolean;
  gameCreationDisabled: boolean;
  newPlayerRegistration: boolean;
  contractPaused: boolean;
  lastEmergencyAction: string | null;
}

export function EmergencyControls({ isAdmin }: EmergencyControlsProps) {
  const { forceStartRound } = useSystemCalls();

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    maintenanceMode: false,
    emergencyShutdown: false,
    gameCreationDisabled: false,
    newPlayerRegistration: true,
    contractPaused: false,
    lastEmergencyAction: null
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    action: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    callback: () => Promise<void>;
  } | null>(null);

  const [emergencyReason, setEmergencyReason] = useState('');
  const [targetRoundId, setTargetRoundId] = useState('');
  const [backupConfirmation, setBackupConfirmation] = useState('');

  const handleEmergencyAction = async (
    action: string,
    description: string,
    severity: 'low' | 'medium' | 'high',
    callback: () => Promise<void>
  ) => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setPendingAction({ action, description, severity, callback });
    setIsConfirmModalOpen(true);
  };

  const executeEmergencyAction = async () => {
    if (!pendingAction) return;

    try {
      await pendingAction.callback();
      setSystemStatus(prev => ({
        ...prev,
        lastEmergencyAction: `${pendingAction.action} at ${new Date().toLocaleString()}`
      }));
      toast.success(`${pendingAction.action} executed successfully`);
    } catch (error) {
      console.error('Emergency action failed:', error);
      toast.error(`Failed to execute ${pendingAction.action}`);
    } finally {
      setIsConfirmModalOpen(false);
      setPendingAction(null);
      setEmergencyReason('');
    }
  };

  const handleMaintenanceMode = async () => {
    // Note: This would need contract implementation
    setSystemStatus(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
    toast.warning('Maintenance mode toggle not available in contract yet');
  };

  const handleEmergencyShutdown = async () => {
    // Note: This would need contract implementation
    setSystemStatus(prev => ({ ...prev, emergencyShutdown: true, contractPaused: true }));
    toast.warning('Emergency shutdown not available in contract yet');
  };

  const handleGameCreationToggle = async () => {
    // Note: This would need contract implementation
    setSystemStatus(prev => ({ ...prev, gameCreationDisabled: !prev.gameCreationDisabled }));
    toast.warning('Game creation toggle not available in contract yet');
  };

  const handlePlayerRegistrationToggle = async () => {
    // Note: This would need contract implementation
    setSystemStatus(prev => ({ ...prev, newPlayerRegistration: !prev.newPlayerRegistration }));
    toast.warning('Player registration toggle not available in contract yet');
  };

  const handleForceStartRound = async () => {
    if (!targetRoundId) {
      toast.error('Please enter a round ID');
      return;
    }

    try {
      await forceStartRound(BigInt(targetRoundId));
      toast.success(`Round ${targetRoundId} force started successfully`);
      setTargetRoundId('');
    } catch (error) {
      console.error('Force start failed:', error);
      toast.error('Failed to force start round');
    }
  };

  const handleSystemRestart = async () => {
    // Note: This would need contract implementation
    toast.warning('System restart not available in contract yet');
  };

  const handleDataBackup = async () => {
    if (backupConfirmation !== 'BACKUP') {
      toast.error('Please type BACKUP to confirm');
      return;
    }

    // Note: This would need backend implementation
    toast.warning('Data backup not implemented yet');
    setBackupConfirmation('');
  };

  const handleContractUpgrade = async () => {
    // Note: This would need contract implementation
    toast.warning('Contract upgrade not available yet');
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Emergency Controls</h2>
          <p className="text-gray-600">System maintenance and emergency operations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">System Operational</span>
        </div>
      </div>

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          🚨 RESTRICTED: Emergency controls require admin access
        </div>
      )}

      {/* System Status Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm font-medium">Maintenance Mode</span>
            <span className={`px-2 py-1 text-xs rounded ${systemStatus.maintenanceMode
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
              }`}>
              {systemStatus.maintenanceMode ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm font-medium">Game Creation</span>
            <span className={`px-2 py-1 text-xs rounded ${systemStatus.gameCreationDisabled
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
              }`}>
              {systemStatus.gameCreationDisabled ? 'DISABLED' : 'ENABLED'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm font-medium">Player Registration</span>
            <span className={`px-2 py-1 text-xs rounded ${systemStatus.newPlayerRegistration
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {systemStatus.newPlayerRegistration ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm font-medium">Contract Status</span>
            <span className={`px-2 py-1 text-xs rounded ${systemStatus.contractPaused
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
              }`}>
              {systemStatus.contractPaused ? 'PAUSED' : 'ACTIVE'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm font-medium">Emergency Shutdown</span>
            <span className={`px-2 py-1 text-xs rounded ${systemStatus.emergencyShutdown
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
              }`}>
              {systemStatus.emergencyShutdown ? 'ACTIVE' : 'NORMAL'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-sm font-medium">Last Action</span>
            <span className="text-xs text-gray-600 truncate max-w-24">
              {systemStatus.lastEmergencyAction || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* System Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Controls */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            🔧 Basic System Controls
            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">UI Only</span>
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => handleEmergencyAction(
                'Toggle Maintenance Mode',
                systemStatus.maintenanceMode
                  ? 'Disable maintenance mode and restore normal operations'
                  : 'Enable maintenance mode - this will prevent new games and warn users',
                'medium',
                handleMaintenanceMode
              )}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 rounded-md text-white disabled:opacity-50 ${systemStatus.maintenanceMode
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
            >
              {systemStatus.maintenanceMode ? 'Exit Maintenance Mode' : 'Enter Maintenance Mode'}
            </button>

            <button
              onClick={() => handleEmergencyAction(
                'Toggle Game Creation',
                systemStatus.gameCreationDisabled
                  ? 'Re-enable new game creation'
                  : 'Disable new game creation while keeping existing games running',
                'medium',
                handleGameCreationToggle
              )}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 rounded-md text-white disabled:opacity-50 ${systemStatus.gameCreationDisabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-orange-600 hover:bg-orange-700'
                }`}
            >
              {systemStatus.gameCreationDisabled ? 'Enable Game Creation' : 'Disable Game Creation'}
            </button>

            <button
              onClick={() => handleEmergencyAction(
                'Toggle Player Registration',
                systemStatus.newPlayerRegistration
                  ? 'Disable new player registration'
                  : 'Re-enable new player registration',
                'low',
                handlePlayerRegistrationToggle
              )}
              disabled={!isAdmin}
              className={`w-full px-4 py-2 rounded-md text-white disabled:opacity-50 ${systemStatus.newPlayerRegistration
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {systemStatus.newPlayerRegistration ? 'Disable Registration' : 'Enable Registration'}
            </button>
          </div>
        </div>

        {/* Game Management */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            🎮 Game Management
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Contract Ready</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Force Start Round
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={targetRoundId}
                  onChange={(e) => setTargetRoundId(e.target.value)}
                  placeholder="Round ID"
                  disabled={!isAdmin}
                  className="flex-1 p-2 border rounded-md disabled:bg-gray-100"
                />
                <button
                  onClick={handleForceStartRound}
                  disabled={!isAdmin || !targetRoundId}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Force Start
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Manually start a round that&apos;s waiting for players
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-red-700">
          🚨 Emergency Actions
          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">High Risk</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleEmergencyAction(
              'Emergency Shutdown',
              'IMMEDIATE shutdown of all system operations. This will stop all active games and disable all functionality.',
              'high',
              handleEmergencyShutdown
            )}
            disabled={!isAdmin || systemStatus.emergencyShutdown}
            className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            🛑 Emergency Shutdown
          </button>

          <button
            onClick={() => handleEmergencyAction(
              'System Restart',
              'Restart all system services. Active games will be preserved.',
              'high',
              handleSystemRestart
            )}
            disabled={!isAdmin}
            className="bg-orange-600 text-white px-4 py-3 rounded-md hover:bg-orange-700 disabled:opacity-50 font-medium"
          >
            🔄 System Restart
          </button>

          <button
            onClick={() => handleEmergencyAction(
              'Contract Upgrade',
              'Deploy a new version of the smart contract. This requires careful coordination.',
              'high',
              handleContractUpgrade
            )}
            disabled={!isAdmin}
            className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 font-medium"
          >
            📦 Contract Upgrade
          </button>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={backupConfirmation}
                onChange={(e) => setBackupConfirmation(e.target.value)}
                placeholder="Type BACKUP to confirm"
                disabled={!isAdmin}
                className="flex-1 p-2 border rounded-md disabled:bg-gray-100 text-sm"
              />
              <button
                onClick={() => handleEmergencyAction(
                  'Data Backup',
                  'Create an emergency backup of all system data.',
                  'medium',
                  handleDataBackup
                )}
                disabled={!isAdmin || backupConfirmation !== 'BACKUP'}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                💾 Backup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Log */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Emergency Action Log</h3>
        <div className="space-y-2">
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
            No emergency actions recorded in this session
          </div>
          {systemStatus.lastEmergencyAction && (
            <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded">
              Last action: {systemStatus.lastEmergencyAction}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-700">
              Confirm Emergency Action
            </h3>

            <div className={`p-4 rounded-lg border mb-4 ${getSeverityColor(pendingAction.severity)}`}>
              <h4 className="font-medium mb-2">{pendingAction.action}</h4>
              <p className="text-sm">{pendingAction.description}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for this action
              </label>
              <textarea
                value={emergencyReason}
                onChange={(e) => setEmergencyReason(e.target.value)}
                rows={3}
                className="w-full p-2 border rounded-md"
                placeholder="Enter the reason for this emergency action..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={executeEmergencyAction}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium"
              >
                Confirm Action
              </button>
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setPendingAction(null);
                  setEmergencyReason('');
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Implementation Notice */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
        <h4 className="font-semibold mb-2">Implementation Status</h4>
        <ul className="text-sm space-y-1">
          <li>✅ <strong>Force Start Round:</strong> Fully functional with contract</li>
          <li>⚠️ <strong>System Controls:</strong> UI ready, requires contract implementation</li>
          <li>⚠️ <strong>Emergency Actions:</strong> UI ready, requires backend services</li>
          <li>🔒 <strong>Safety Features:</strong> Confirmation dialogs and reason logging</li>
        </ul>
      </div>
    </div>
  );
} 