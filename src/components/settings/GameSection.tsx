"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Input } from '@/components/atoms/input';
import { Gamepad2, Volume2, Music, Smartphone, DollarSign, AlertTriangle } from 'lucide-react';

interface GameData {
  defaultMode: string;
  difficulty: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  wagerDefaults: {
    amount: number;
    confirmationPrompt: boolean;
  };
}

interface GameSectionProps {
  data: GameData;
  onChange: (data: GameData) => void;
}

export function GameSection({ data, onChange }: GameSectionProps) {
  const updateWagerDefaults = (key: keyof GameData['wagerDefaults'], value: boolean | number) => {
    onChange({
      ...data,
      wagerDefaults: { ...data.wagerDefaults, [key]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Gamepad2 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Game Preferences</h2>
      </div>

      {/* Game Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Game Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Game Mode</label>
            <Select value={data.defaultMode} onValueChange={(value) => onChange({ ...data, defaultMode: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select game mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Player</SelectItem>
                <SelectItem value="multiplayer">Multiplayer</SelectItem>
                <SelectItem value="challenge">Challenge Mode</SelectItem>
                <SelectItem value="practice">Practice Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty Level</label>
            <Select value={data.difficulty} onValueChange={(value) => onChange({ ...data, difficulty: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Audio & Haptics */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Audio & Haptics</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Sound Effects</h4>
                <p className="text-sm text-muted-foreground">
                  Enable game sound effects
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.soundEnabled}
                onChange={(e) => onChange({ ...data, soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Music className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">Background Music</h4>
                <p className="text-sm text-muted-foreground">
                  Enable background music during gameplay
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.musicEnabled}
                onChange={(e) => onChange({ ...data, musicEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-purple-500" />
              <div>
                <h4 className="font-medium">Haptic Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  Enable vibration feedback on mobile devices
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.hapticsEnabled}
                onChange={(e) => onChange({ ...data, hapticsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Match Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Quick Match Options</h3>
        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-yellow-500" />
            <div className="flex-1">
              <h4 className="font-medium">Default Wager Amount</h4>
              <p className="text-sm text-muted-foreground">
                Set your preferred wager amount for quick matches
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Wager Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={data.wagerDefaults.amount}
                  onChange={(e) => updateWagerDefaults('amount', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="pl-8"
                  min="0"
                  step="10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmation Prompt</label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.wagerDefaults.confirmationPrompt}
                    onChange={(e) => updateWagerDefaults('confirmationPrompt', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm text-muted-foreground">
                  Always ask before confirming wagers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Tips */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              Game Settings Tip
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              These settings will be applied to all new games. You can still adjust them individually for each game session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
