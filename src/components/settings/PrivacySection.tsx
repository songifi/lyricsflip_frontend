"use client";

import React, { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Shield, Eye, EyeOff, Users, Monitor, X, Plus } from 'lucide-react';

interface PrivacyData {
  profileVisible: boolean;
  leaderboardVisible: boolean;
  blockedUsers: string[];
}

interface PrivacySectionProps {
  data: PrivacyData;
  onChange: (data: PrivacyData) => void;
}

export function PrivacySection({ data, onChange }: PrivacySectionProps) {
  const [newBlockedUser, setNewBlockedUser] = useState('');

  const addBlockedUser = () => {
    if (newBlockedUser.trim() && !data.blockedUsers.includes(newBlockedUser.trim())) {
      onChange({
        ...data,
        blockedUsers: [...data.blockedUsers, newBlockedUser.trim()]
      });
      setNewBlockedUser('');
    }
  };

  const removeBlockedUser = (username: string) => {
    onChange({
      ...data,
      blockedUsers: data.blockedUsers.filter(user => user !== username)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addBlockedUser();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Privacy & Security</h2>
      </div>

      {/* Profile Visibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Visibility</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Profile Visibility</h4>
                <p className="text-sm text-muted-foreground">
                  Allow other players to view your profile
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.profileVisible}
                onChange={(e) => onChange({ ...data, profileVisible: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">Leaderboard Visibility</h4>
                <p className="text-sm text-muted-foreground">
                  Show your scores on public leaderboards
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.leaderboardVisible}
                onChange={(e) => onChange({ ...data, leaderboardVisible: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Blocked Users</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newBlockedUser}
              onChange={(e) => setNewBlockedUser(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter username to block"
              className="flex-1"
            />
            <Button onClick={addBlockedUser} disabled={!newBlockedUser.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Block
            </Button>
          </div>

          {data.blockedUsers.length > 0 ? (
            <div className="space-y-2">
              {data.blockedUsers.map((username) => (
                <div key={username} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{username}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBlockedUser(username)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No blocked users</p>
              <p className="text-sm">Users you block won't be able to interact with you</p>
            </div>
          )}
        </div>
      </div>

      {/* Session Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Session Management</h3>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">Current Session</h4>
                <p className="text-sm text-muted-foreground">
                  This device - Active now
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Current
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Mobile Device</p>
                <p className="text-sm text-muted-foreground">
                  iPhone 14 - Last active 2 hours ago
                </p>
              </div>
              <Button variant="outline" size="sm">
                Revoke
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Desktop Browser</p>
                <p className="text-sm text-muted-foreground">
                  Chrome on Windows - Last active 1 day ago
                </p>
              </div>
              <Button variant="outline" size="sm">
                Revoke
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
