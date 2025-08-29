"use client";

import React from 'react';
import { Button } from '@/components/atoms/button';
import { Wallet, Copy, Check, RefreshCw, Link, Unlink } from 'lucide-react';

interface WalletData {
  address: string;
  connected: boolean;
}

interface WalletSectionProps {
  data: WalletData;
  onChange: (data: WalletData) => void;
  onCopy: (text: string, field: string) => void;
  copiedField: string | null;
}

export function WalletSection({ data, onChange, onCopy, copiedField }: WalletSectionProps) {
  const handleCopyAddress = () => {
    onCopy(data.address, 'address');
  };

  const toggleConnection = () => {
    onChange({ ...data, connected: !data.connected });
  };

  const refreshWallet = () => {
    // In a real app, this would refresh the wallet connection
    console.log('Refreshing wallet...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Wallet & Payments</h2>
      </div>

      {/* Wallet Connection Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Wallet Connection</h3>
        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${data.connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <h4 className="font-medium">
                  {data.connected ? 'Connected' : 'Disconnected'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {data.connected ? 'Your wallet is connected and ready' : 'Connect your wallet to start playing'}
                </p>
              </div>
            </div>
            <Button
              variant={data.connected ? "outline" : "default"}
              onClick={toggleConnection}
            >
              {data.connected ? (
                <>
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </div>

          {data.connected && (
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshWallet}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <span className="text-sm text-muted-foreground">
                  Last updated: Just now
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Address */}
      {data.connected && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Wallet Address</h3>
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Address</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAddress}
              >
                {copiedField === 'address' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm font-mono break-all">{data.address}</code>
            </div>
            <p className="text-xs text-muted-foreground">
              This is your connected wallet address. Keep it secure and never share your private keys.
            </p>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Payment Methods</h3>
        <div className="p-4 border rounded-lg">
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No payment methods added</p>
            <p className="text-sm">Add payment methods to enable in-game purchases</p>
          </div>
          <div className="flex justify-center">
            <Button variant="outline">
              <Link className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <div className="p-4 border rounded-lg">
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        </div>
      </div>

      {/* Wallet Security */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Security</h3>
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-disconnect</h4>
              <p className="text-sm text-muted-foreground">
                Automatically disconnect wallet after inactivity
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="pt-3 border-t">
            <Button variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Wallet Connection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
