"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/atoms/dialog';
import { ToastContainer, ToastProps } from '@/components/atoms/toast';
import {
  ProfileSection,
  NotificationsSection,
  PrivacySection,
  GameSection,
  WalletSection,
  AppearanceSection,
  LocaleSection,
  AccessibilitySection,
  DataManagementSection,
  AboutSection
} from '@/components/settings';
import { 
  User, 
  Bell, 
  Shield, 
  Gamepad2, 
  Wallet, 
  Palette, 
  Globe, 
  Eye, 
  Settings as SettingsIcon,
  Save,
  X,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  Trash2,
  Download,
  HelpCircle,
  Info,
  Database
} from 'lucide-react';

interface SettingsData {
  profile: {
    avatar: string;
    displayName: string;
    username: string;
    email: string;
  };
  notifications: {
    push: boolean;
    email: boolean;
    inApp: boolean;
    mentions: boolean;
    system: boolean;
    gameInvites: boolean;
    rewards: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  privacy: {
    profileVisible: boolean;
    leaderboardVisible: boolean;
    blockedUsers: string[];
  };
  game: {
    defaultMode: string;
    difficulty: string;
    soundEnabled: boolean;
    musicEnabled: boolean;
    hapticsEnabled: boolean;
    wagerDefaults: {
      amount: number;
      confirmationPrompt: boolean;
    };
  };
  wallet: {
    address: string;
    connected: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
  locale: {
    language: string;
    timezone: string;
    numberFormat: string;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    captions: boolean;
  };
}

const defaultSettings: SettingsData = {
  profile: {
    avatar: '',
    displayName: 'Player',
    username: 'player123',
    email: 'player@example.com',
  },
  notifications: {
    push: true,
    email: true,
    inApp: true,
    mentions: true,
    system: true,
    gameInvites: true,
    rewards: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
  privacy: {
    profileVisible: true,
    leaderboardVisible: true,
    blockedUsers: [],
  },
  game: {
    defaultMode: 'single',
    difficulty: 'medium',
    soundEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
    wagerDefaults: {
      amount: 100,
      confirmationPrompt: true,
    },
  },
  wallet: {
    address: '0x1234...5678',
    connected: true,
  },
  appearance: {
    theme: 'system',
    accentColor: '#9747ff',
    fontSize: 'medium',
    compactMode: false,
  },
  locale: {
    language: 'en',
    timezone: 'UTC',
    numberFormat: 'en-US',
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    captions: false,
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<SettingsData>(defaultSettings);
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    // Check for changes
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings));
  }, [settings, originalSettings]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      addToast({
        type: 'success',
        title: 'Copied!',
        message: 'Text copied to clipboard',
        duration: 2000,
        onClose: removeToast,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      addToast({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy text to clipboard',
        onClose: removeToast,
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      setHasChanges(false);
      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your settings have been saved successfully',
        onClose: removeToast,
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save settings. Please try again.',
        onClose: removeToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setShowResetDialog(false);
  };

  const handleResetToDefaults = () => {
    setSettings(JSON.parse(JSON.stringify(defaultSettings)));
    setOriginalSettings(JSON.parse(JSON.stringify(defaultSettings)));
    setShowResetDialog(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile & Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'game', label: 'Game Preferences', icon: Gamepad2 },
    { id: 'wallet', label: 'Wallet & Payments', icon: Wallet },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'locale', label: 'Language & Region', icon: Globe },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'about', label: 'About & Support', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and game settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Navigation Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-card border rounded-lg p-6">
              {/* Profile & Account */}
              {activeTab === 'profile' && (
                <ProfileSection 
                  data={settings.profile}
                  onChange={(profile) => setSettings({ ...settings, profile })}
                />
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <NotificationsSection 
                  data={settings.notifications}
                  onChange={(notifications) => setSettings({ ...settings, notifications })}
                />
              )}

              {/* Privacy & Security */}
              {activeTab === 'privacy' && (
                <PrivacySection 
                  data={settings.privacy}
                  onChange={(privacy) => setSettings({ ...settings, privacy })}
                />
              )}

              {/* Game Preferences */}
              {activeTab === 'game' && (
                <GameSection 
                  data={settings.game}
                  onChange={(game) => setSettings({ ...settings, game })}
                />
              )}

              {/* Wallet & Payments */}
              {activeTab === 'wallet' && (
                <WalletSection 
                  data={settings.wallet}
                  onChange={(wallet) => setSettings({ ...settings, wallet })}
                  onCopy={copyToClipboard}
                  copiedField={copiedField}
                />
              )}

              {/* Appearance */}
              {activeTab === 'appearance' && (
                <AppearanceSection 
                  data={settings.appearance}
                  onChange={(appearance) => setSettings({ ...settings, appearance })}
                />
              )}

              {/* Language & Region */}
              {activeTab === 'locale' && (
                <LocaleSection 
                  data={settings.locale}
                  onChange={(locale) => setSettings({ ...settings, locale })}
                />
              )}

              {/* Accessibility */}
              {activeTab === 'accessibility' && (
                <AccessibilitySection 
                  data={settings.accessibility}
                  onChange={(accessibility) => setSettings({ ...settings, accessibility })}
                />
              )}

              {/* Data & Storage */}
              {activeTab === 'data' && (
                <DataManagementSection 
                  onExportData={() => console.log('Export data')}
                  onClearCache={() => console.log('Clear cache')}
                  onDeleteAccount={() => console.log('Delete account')}
                />
              )}

              {/* About & Support */}
              {activeTab === 'about' && (
                <AboutSection 
                  appVersion="1.0.0"
                  onContactSupport={() => console.log('Contact support')}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
            <div className="container mx-auto max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                You have unsaved changes
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResetDialog(true)}
                  disabled={isLoading}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to reset your settings?</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset to Last Saved
                </Button>
                <Button variant="destructive" onClick={handleResetToDefaults}>
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
