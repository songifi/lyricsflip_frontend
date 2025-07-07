'use client';

import { useState } from 'react';
import { useSystemCalls, mockLyricToCardData, Genre, CardData } from '@/lib/dojo/useSystemCalls';
import { MOCK_LYRICS } from '@/mock/mock';
import { CairoCustomEnum } from 'starknet';
import { toast } from 'sonner';

interface BatchOperationsProps {
  isAdmin: boolean;
}

interface BatchProgress {
  operation: string;
  progress: number;
  total: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  errors: string[];
}

export function BatchOperations({ isAdmin }: BatchOperationsProps) {
  const { addBatchLyricsCard } = useSystemCalls();

  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    operation: '',
    progress: 0,
    total: 0,
    status: 'idle',
    errors: []
  });

  // Lyrics Upload State
  const [selectedGenre, setSelectedGenre] = useState('');
  const [customLyricsText, setCustomLyricsText] = useState('');
  const [batchSize, setBatchSize] = useState(10);

  // Player Management State
  const [playerList, setPlayerList] = useState('');
  const [moderationAction, setModerationAction] = useState('warn');
  const [moderationReason, setModerationReason] = useState('');

  // System Maintenance State
  const [selectedGenreForCleanup, setSelectedGenreForCleanup] = useState('');
  const [minYear, setMinYear] = useState(1950);
  const [maxYear, setMaxYear] = useState(new Date().getFullYear());

  const updateProgress = (progress: number, total: number, errors: string[] = []) => {
    setBatchProgress(prev => ({
      ...prev,
      progress,
      total,
      errors,
      status: progress >= total ? 'completed' : 'running'
    }));
  };

  const handleBatchLyricsUpload = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    if (!selectedGenre) {
      toast.error('Please select a genre');
      return;
    }

    setActiveOperation('lyrics_upload');
    setBatchProgress({
      operation: 'Uploading lyrics cards',
      progress: 0,
      total: MOCK_LYRICS.length,
      status: 'running',
      errors: []
    });

    try {
      const cardsData: CardData[] = MOCK_LYRICS.map(lyric =>
        mockLyricToCardData(lyric, selectedGenre)
      );

      let uploadedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < cardsData.length; i += batchSize) {
        const batch = cardsData.slice(i, i + batchSize);

        try {
          await addBatchLyricsCard(batch);
          uploadedCount += batch.length;
          updateProgress(uploadedCount, cardsData.length, errors);

          // Small delay between batches
          if (i + batchSize < cardsData.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          const errorMsg = `Batch ${Math.floor(i / batchSize) + 1} failed: ${error}`;
          errors.push(errorMsg);
          updateProgress(uploadedCount, cardsData.length, errors);
        }
      }

      if (errors.length === 0) {
        toast.success(`Successfully uploaded ${uploadedCount} lyrics cards`);
      } else {
        toast.warning(`Uploaded ${uploadedCount} cards with ${errors.length} batch errors`);
      }
    } catch (error) {
      setBatchProgress(prev => ({ ...prev, status: 'error' }));
      toast.error('Batch upload failed');
    } finally {
      setActiveOperation(null);
    }
  };

  const handleCustomLyricsUpload = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    if (!selectedGenre || !customLyricsText.trim()) {
      toast.error('Please select a genre and enter lyrics text');
      return;
    }

    // Parse custom lyrics (expecting format: Artist - Title (Year)\nLyrics\n\n)
    const lyricsEntries = customLyricsText.split('\n\n').filter(entry => entry.trim());

    if (lyricsEntries.length === 0) {
      toast.error('No valid lyrics entries found');
      return;
    }

    setActiveOperation('custom_lyrics');
    setBatchProgress({
      operation: 'Processing custom lyrics',
      progress: 0,
      total: lyricsEntries.length,
      status: 'running',
      errors: []
    });

    try {
      const cardsData: CardData[] = [];
      const errors: string[] = [];

      lyricsEntries.forEach((entry, index) => {
        try {
          const lines = entry.split('\n');
          const header = lines[0];
          const lyrics = lines.slice(1).join('\n');

          // Parse "Artist - Title (Year)" format
          const match = header.match(/^(.+?)\s*-\s*(.+?)\s*\((\d{4})\)$/);
          if (match) {
            const [, artist, title, year] = match;
            const genreEnum = new CairoCustomEnum({ [selectedGenre]: {} });
            cardsData.push({
              genre: genreEnum,
              artist: artist.trim(),
              title: title.trim(),
              year: BigInt(year),
              lyrics: lyrics.trim()
            });
          } else {
            errors.push(`Entry ${index + 1}: Invalid format`);
          }
        } catch (error) {
          errors.push(`Entry ${index + 1}: ${error}`);
        }
        updateProgress(index + 1, lyricsEntries.length, errors);
      });

      if (cardsData.length > 0) {
        await addBatchLyricsCard(cardsData);
        toast.success(`Successfully processed ${cardsData.length} custom lyrics`);
      }

      if (errors.length > 0) {
        toast.warning(`${errors.length} entries had formatting errors`);
      }
    } catch (error) {
      setBatchProgress(prev => ({ ...prev, status: 'error' }));
      toast.error('Custom lyrics upload failed');
    } finally {
      setActiveOperation(null);
    }
  };

  const handleBatchPlayerModeration = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    const players = playerList.split('\n').filter(p => p.trim());
    if (players.length === 0) {
      toast.error('Please enter player addresses');
      return;
    }

    setActiveOperation('player_moderation');
    setBatchProgress({
      operation: `Batch ${moderationAction} players`,
      progress: 0,
      total: players.length,
      status: 'running',
      errors: []
    });

    // Note: This would need contract implementation
    toast.warning(`Batch ${moderationAction} not available in contract yet`);

    // Simulate progress for demo
    for (let i = 0; i < players.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      updateProgress(i + 1, players.length);
    }

    setActiveOperation(null);
  };

  const handleDataCleanup = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    setActiveOperation('data_cleanup');
    setBatchProgress({
      operation: 'Cleaning up old data',
      progress: 0,
      total: 100,
      status: 'running',
      errors: []
    });

    // Note: This would need contract implementation
    toast.warning('Data cleanup not available in contract yet');

    // Simulate progress for demo
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      updateProgress(i, 100);
    }

    setActiveOperation(null);
  };

  const genres = Object.keys(Genre).filter(key => isNaN(Number(key)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Batch Operations</h2>
          <p className="text-gray-600">Perform bulk operations for content management</p>
        </div>
      </div>

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          ⚠️ Admin access required for batch operations
        </div>
      )}

      {/* Progress Display */}
      {activeOperation && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-2">{batchProgress.operation}</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {batchProgress.progress} / {batchProgress.total}</span>
              <span>{Math.round((batchProgress.progress / batchProgress.total) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(batchProgress.progress / batchProgress.total) * 100}%` }}
              ></div>
            </div>
            {batchProgress.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-red-600 font-medium">Errors ({batchProgress.errors.length}):</p>
                <div className="max-h-20 overflow-y-auto text-xs text-red-500">
                  {batchProgress.errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lyrics Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          🎵 Lyrics Content Management
          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Contract Ready</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mock Lyrics Upload */}
          <div className="space-y-4">
            <h4 className="font-medium">Batch Upload Mock Lyrics</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  disabled={!isAdmin || activeOperation === 'lyrics_upload'}
                  className="w-full p-2 border rounded-md disabled:bg-gray-100"
                >
                  <option value="">Select genre</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Size
                </label>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  disabled={!isAdmin || activeOperation === 'lyrics_upload'}
                  className="w-full p-2 border rounded-md disabled:bg-gray-100"
                >
                  <option value={5}>5 cards per batch</option>
                  <option value={10}>10 cards per batch</option>
                  <option value={20}>20 cards per batch</option>
                </select>
              </div>
              <button
                onClick={handleBatchLyricsUpload}
                disabled={!isAdmin || !selectedGenre || activeOperation === 'lyrics_upload'}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                Upload {MOCK_LYRICS.length} Mock Lyrics
              </button>
            </div>
          </div>

          {/* Custom Lyrics Upload */}
          <div className="space-y-4">
            <h4 className="font-medium">Upload Custom Lyrics</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Lyrics Text
                </label>
                <textarea
                  value={customLyricsText}
                  onChange={(e) => setCustomLyricsText(e.target.value)}
                  disabled={!isAdmin || activeOperation === 'custom_lyrics'}
                  rows={6}
                  className="w-full p-2 border rounded-md text-sm disabled:bg-gray-100"
                  placeholder="Format:
Artist - Title (Year)
Lyrics line 1
Lyrics line 2

Artist 2 - Title 2 (Year)
More lyrics..."
                />
              </div>
              <button
                onClick={handleCustomLyricsUpload}
                disabled={!isAdmin || !selectedGenre || !customLyricsText.trim() || activeOperation === 'custom_lyrics'}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Process Custom Lyrics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Player Management */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          👥 Batch Player Management
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">UI Only</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Player Addresses (one per line)
              </label>
              <textarea
                value={playerList}
                onChange={(e) => setPlayerList(e.target.value)}
                disabled={!isAdmin || activeOperation === 'player_moderation'}
                rows={5}
                className="w-full p-2 border rounded-md text-sm disabled:bg-gray-100"
                placeholder="0x1234567890abcdef...
0x2345678901bcdef0...
0x3456789012cdef01..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  value={moderationAction}
                  onChange={(e) => setModerationAction(e.target.value)}
                  disabled={!isAdmin || activeOperation === 'player_moderation'}
                  className="w-full p-2 border rounded-md disabled:bg-gray-100"
                >
                  <option value="warn">Warn</option>
                  <option value="suspend">Suspend</option>
                  <option value="ban">Ban</option>
                  <option value="unban">Unban</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  disabled={!isAdmin || activeOperation === 'player_moderation'}
                  className="w-full p-2 border rounded-md disabled:bg-gray-100"
                  placeholder="Reason for action..."
                />
              </div>
            </div>
            <button
              onClick={handleBatchPlayerModeration}
              disabled={!isAdmin || !playerList.trim() || activeOperation === 'player_moderation'}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Execute Batch {moderationAction}
            </button>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Available Actions:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Warn:</strong> Send warning to players</li>
              <li><strong>Suspend:</strong> Temporarily disable accounts</li>
              <li><strong>Ban:</strong> Permanently disable accounts</li>
              <li><strong>Unban:</strong> Restore banned accounts</li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded mt-3">
              ⚠️ Player moderation requires contract implementation
            </div>
          </div>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          🔧 System Maintenance
          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">UI Only</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Data Cleanup</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre Filter
                </label>
                <select
                  value={selectedGenreForCleanup}
                  onChange={(e) => setSelectedGenreForCleanup(e.target.value)}
                  disabled={!isAdmin || activeOperation === 'data_cleanup'}
                  className="w-full p-2 border rounded-md disabled:bg-gray-100"
                >
                  <option value="">All genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Year
                  </label>
                  <input
                    type="number"
                    value={minYear}
                    onChange={(e) => setMinYear(Number(e.target.value))}
                    disabled={!isAdmin || activeOperation === 'data_cleanup'}
                    className="w-full p-2 border rounded-md disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Year
                  </label>
                  <input
                    type="number"
                    value={maxYear}
                    onChange={(e) => setMaxYear(Number(e.target.value))}
                    disabled={!isAdmin || activeOperation === 'data_cleanup'}
                    className="w-full p-2 border rounded-md disabled:bg-gray-100"
                  />
                </div>
              </div>
              <button
                onClick={handleDataCleanup}
                disabled={!isAdmin || activeOperation === 'data_cleanup'}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Clean Old Data
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Cleanup Operations:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Remove duplicate lyrics cards</li>
              <li>Clean up inactive player data</li>
              <li>Archive old round data</li>
              <li>Optimize database indexes</li>
            </ul>
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mt-3">
              ⚠️ Data cleanup operations are irreversible!
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Status */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
        <h4 className="font-semibold mb-2">Implementation Status</h4>
        <ul className="text-sm space-y-1">
          <li>✅ <strong>Lyrics Upload:</strong> Fully functional with contract integration</li>
          <li>⚠️ <strong>Player Moderation:</strong> UI ready, requires contract functions</li>
          <li>⚠️ <strong>Data Cleanup:</strong> UI ready, requires contract functions</li>
          <li>📊 <strong>Progress Tracking:</strong> Real-time progress display implemented</li>
        </ul>
      </div>
    </div>
  );
} 