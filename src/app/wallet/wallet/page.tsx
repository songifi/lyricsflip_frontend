'use client';

import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { Card } from '@/components/molecules/card';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { useWalletMode } from '@/lib/dojo/utils/walletMode';
import { useMemo, useState } from 'react';
import { Copy, Check, LogOut, Wallet } from 'lucide-react';
// import { WalletModeDemo } from '@/components/examples/WalletModeDemo'; // Enable if you want advanced demo

function truncateAddress(address?: string | null) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletPage() {
  const { account, address, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const walletMode = useWalletMode();

  const [copied, setCopied] = useState(false);
  const [selectedToken, setSelectedToken] = useState<'STRK' | 'USDC'>('STRK');
  const [depositAmount, setDepositAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const shortAddress = useMemo(() => truncateAddress(address), [address]);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <main className="lg:max-w-[53rem] mx-auto w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100 text-purple-700">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Wallet</h1>
          <p className="text-sm text-[#909090]">Manage your connection and view basic account info.</p>
        </div>
      </div>

      {/* Token selector and balance overview */}
      <Card className="mb-6" variant="default">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
            <div className="md:col-span-2">
              <p className="text-xs text-[#909090] mb-2">Token</p>
              <Select value={selectedToken} onValueChange={(v) => setSelectedToken(v as 'STRK' | 'USDC')}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRK">STRK</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-[#909090] mb-2">Balance</p>
              <div className="rounded border border-[#DBE2E8] px-3 py-2 bg-white">
                <div className="text-sm font-medium">18,678 {selectedToken}</div>
                <div className="text-xs text-[#909090]">≈ 5,678 USD</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {!account && (
        <Card
          title={walletMode.isKatana ? 'Connect to a Predeployed Account' : 'Connect Your Wallet'}
          description={walletMode.description}
          className="mb-6"
          variant="purple"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  variant="purple"
                  size="full"
                  aria-label={`Connect ${connector.name}`}
                >
                  Connect {connector.name}
                </Button>
              ))}
            </div>
            {walletMode.isKatana && (
              <p className="text-xs text-gray-600">Development mode: Using Katana prefunded accounts</p>
            )}
          </div>
        </Card>
      )}

      {account && (
        <div className="space-y-6">
          <Card title="Account" description={walletMode.description} variant="purple">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[#909090]">Address</span>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-purple-50 px-2 py-1 text-sm">{shortAddress}</code>
                  <Button
                    onClick={handleCopy}
                    variant="outlinePurple"
                    size="sm"
                    aria-label="Copy address"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                  <p className="text-xs text-[#909090]">Status</p>
                  <p className="text-sm font-medium capitalize">{status}</p>
                </div>
                <div>
                  <p className="text-xs text-[#909090]">Mode</p>
                  <p className="text-sm font-medium">{walletMode.mode}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-[#909090]">Recommendations</p>
                  <p className="text-sm">{walletMode.recommendations[0]}</p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => disconnect()}
                  variant="outlinePurple"
                  aria-label="Disconnect wallet"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Disconnect
                </Button>
              </div>
            </div>
          </Card>

          {/* Token actions: Deposit / Transfer / Withdraw (UI only) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Deposit */}
            <Card title="Deposit" description={`Move ${selectedToken} into the game wallet`} variant="default">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#909090] mb-1">Amount</p>
                  <Input
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={`0.00 ${selectedToken}`}
                    inputMode="decimal"
                  />
                </div>
                <Button variant="purple">Deposit</Button>
              </div>
            </Card>

            {/* Transfer */}
            <Card title="Transfer" description={`Send ${selectedToken} to another address`} variant="default">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#909090] mb-1">Recipient Address</p>
                  <Input
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <div>
                  <p className="text-xs text-[#909090] mb-1">Amount</p>
                  <Input
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder={`0.00 ${selectedToken}`}
                    inputMode="decimal"
                  />
                </div>
                <Button variant="purple">Transfer</Button>
              </div>
            </Card>

            {/* Withdraw */}
            <Card title="Withdraw" description={`Move ${selectedToken} back to your wallet`} variant="default" className="md:col-span-2">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
                <div className="md:col-span-2">
                  <p className="text-xs text-[#909090] mb-1">Amount</p>
                  <Input
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`0.00 ${selectedToken}`}
                    inputMode="decimal"
                  />
                </div>
                <div>
                  <Button variant="purple" className="w-full">Withdraw</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}


