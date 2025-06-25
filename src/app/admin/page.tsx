'use client';

import { useState, useEffect } from 'react';
import { useAccount } from "@starknet-react/core";
import { useAdminFunctions } from '@/hooks/useAdminFunctions';
import { useSystemCalls, mockLyricToCardData, Genre, CardData } from '@/lib/dojo/useSystemCalls';
import { MOCK_LYRICS } from '@/mock/mock';
import { CairoCustomEnum } from 'starknet';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { account, address } = useAccount();
  const { setAdminAddress, setCardsPerRound, setGameConfig, checkIsAdmin } = useAdminFunctions();
  const { addBatchLyricsCard } = useSystemCalls();
  const [adminAddress, setAdminAddressInput] = useState('');
  const [cardsPerRound, setCardsPerRoundInput] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLyrics, setIsUploadingLyrics] = useState(false);
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

  const handleSetAdminAddress = async () => {
    if (!adminAddress) {
      setError('Please enter an admin address');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await setAdminAddress(adminAddress);
      setSuccess('Admin address updated successfully');
      setAdminAddressInput(''); // Clear input
    } catch (err) {
      setError('Failed to update admin address');
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleSetConnectedWalletAsAdmin = async () => {
    if (!address) {
      setError('No wallet connected');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Initialize game config with the connected wallet as admin
      await setGameConfig(address);
      setSuccess('Connected wallet set as admin successfully');
      // Recheck admin status
      await handleCheckAdminStatus();
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || '';
      if (errorMessage.includes('Game config already initialized')) {
        setSuccess('Game config was already initialized. Admin address updated successfully.');
      } else if (errorMessage.includes('game config initialized')) {
        setSuccess('Game config was already initialized. Admin address updated successfully.');
      } else {
        setError('Failed to set connected wallet as admin: ' + errorMessage);
      }
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleSetCardsPerRound = async () => {
    if (!cardsPerRound || isNaN(Number(cardsPerRound))) {
      setError('Please enter a valid number of cards');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await setCardsPerRound(Number(cardsPerRound));
      setSuccess('Cards per round updated successfully');
      setCardsPerRoundInput(''); // Clear input
    } catch (err) {
      setError('Failed to update cards per round');
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleBatchUploadLyrics = async () => {
    if (!selectedGenre) {
      setError('Please select a genre for the lyrics');
      return;
    }

    // Check if current wallet is admin before proceeding
    if (isCurrentWalletAdmin === false) {
      setError('❌ Current wallet is not an admin! Please switch to your admin wallet first.');
      return;
    }

    setIsUploadingLyrics(true);
    setError('');
    
    try {
      console.log(`Starting batch upload of ${MOCK_LYRICS.length} lyrics for genre: ${selectedGenre}`);
      
      // Convert mock lyrics to CardData format
      const genreEnum = new CairoCustomEnum({ [selectedGenre]: {} });
      const cardsData: CardData[] = MOCK_LYRICS.map(lyric => mockLyricToCardData(lyric, selectedGenre));
      
      // Upload in batches of 10 to avoid transaction size limits
      const batchSize = 10;
      for (let i = 0; i < cardsData.length; i += batchSize) {
        const batch = cardsData.slice(i, i + batchSize);
        console.log(`Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cardsData.length / batchSize)} (${batch.length} cards)`);
        
        await addBatchLyricsCard(batch);
        
        // Add a small delay between batches to avoid overwhelming the network
        if (i + batchSize < cardsData.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setSuccess(`Successfully uploaded ${MOCK_LYRICS.length} lyrics cards for ${selectedGenre} genre!`);
      toast.success(`Uploaded ${MOCK_LYRICS.length} lyrics cards`, {
        description: `All ${selectedGenre} lyrics have been added to the game`,
        duration: 4000
      });
      setSelectedGenre(''); // Clear selection
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || '';
      if (errorMessage.includes('caller not admin')) {
        setError('❌ Current wallet is not an admin! Please switch to your admin wallet and try again.');
      } else {
        setError(`Failed to upload lyrics: ${errorMessage}`);
      }
      toast.error('Upload failed', {
        description: errorMessage.includes('caller not admin') 
          ? 'Current wallet is not an admin' 
          : errorMessage,
        duration: 4000
      });
      console.error('Batch upload error:', err);
    } finally {
      setIsUploadingLyrics(false);
    }
  };

  if (!account) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Please connect your wallet to access the admin dashboard
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="space-y-8">
        {/* Admin Status Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Admin Status Check</h2>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p><strong>Current Wallet:</strong> {address}</p>
              <p className="text-xs mt-1">Check if this wallet has admin privileges</p>
            </div>
            
            <button
              onClick={handleCheckAdminStatus}
              disabled={isCheckingAdmin}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isCheckingAdmin ? 'Checking...' : 'Check Admin Status'}
            </button>
            
            {isCurrentWalletAdmin !== null && (
              <div className={`p-3 rounded-md ${
                isCurrentWalletAdmin 
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {isCurrentWalletAdmin 
                  ? '✅ This wallet has admin privileges! You can upload lyrics.'
                  : '❌ This wallet does not have admin privileges. Try switching to a different wallet from your collection of 10 wallets.'
                }
              </div>
            )}
          </div>
        </div>

        {/* Admin Address Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Set Admin Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Admin Address
              </label>
              <input
                type="text"
                value={adminAddress}
                onChange={(e) => setAdminAddressInput(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter StarkNet address"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSetAdminAddress}
                disabled={isLoading || isCurrentWalletAdmin === false}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Admin Address'}
              </button>
              <button
                onClick={handleSetConnectedWalletAsAdmin}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Use Connected Wallet'}
              </button>
            </div>
            {address && (
              <div className="text-sm text-gray-500 mt-2">
                Connected Wallet: {address}
              </div>
            )}
          </div>
        </div>

        {/* Cards Per Round Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Set Cards Per Round</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Cards
              </label>
              <input
                type="number"
                value={cardsPerRound}
                onChange={(e) => setCardsPerRoundInput(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter number of cards"
                min="1"
              />
            </div>
            <button
              onClick={handleSetCardsPerRound}
              disabled={isLoading || isCurrentWalletAdmin === false}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Cards Per Round'}
            </button>
          </div>
        </div>

        {/* Batch Lyrics Upload Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload Lyrics Database</h2>
          <div className="space-y-4">
            {isCurrentWalletAdmin === false && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
                <p className="text-sm">
                  ⚠️ <strong>Admin Required:</strong> You need to switch to your admin wallet to upload lyrics. 
                  Use the "Check Admin Status" button above to test different wallets.
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
              <p className="text-sm">
                This will upload all {MOCK_LYRICS.length} mock lyrics to the contract database. 
                Select a genre to categorize all lyrics under.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Genre for All Lyrics
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={isUploadingLyrics || isCurrentWalletAdmin === false}
              >
                <option value="">Select a genre</option>
                {Object.keys(Genre).filter(key => isNaN(Number(key))).map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleBatchUploadLyrics}
                disabled={isUploadingLyrics || !selectedGenre || isCurrentWalletAdmin === false}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isUploadingLyrics ? 'Uploading...' : 'Upload Lyrics Database'}
              </button>
              {isUploadingLyrics && (
                <div className="text-sm text-gray-600">
                  This may take a few minutes...
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              <p><strong>Note:</strong> This uploads lyrics in batches of 10 to avoid transaction limits.</p>
              <p>All lyrics will be categorized under the selected genre.</p>
            </div>
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
    </main>
  );
} 