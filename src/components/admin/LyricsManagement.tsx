'use client';

import { useState, useEffect } from 'react';
import { useSystemCalls, Genre, CardData, mockLyricToCardData } from '@/lib/dojo/useSystemCalls';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { MOCK_LYRICS } from '@/mock/mock';
import { CairoCustomEnum } from 'starknet';
import { toast } from 'sonner';

interface LyricsCard {
  id: string;
  artist: string;
  title: string;
  year: number;
  genre: string;
  lyrics: string;
  created_at?: string;
  card_id?: bigint;
}

interface LyricsManagementProps {
  isAdmin: boolean;
}

export function LyricsManagement({ isAdmin }: LyricsManagementProps) {
  const { addLyricsCard, addBatchLyricsCard, getCardCount } = useSystemCalls();
  const [lyrics, setLyrics] = useState<LyricsCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [batchUploadGenre, setBatchUploadGenre] = useState('');
  const [selectedLyric, setSelectedLyric] = useState<LyricsCard | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    artist: '',
    title: '',
    year: new Date().getFullYear(),
    genre: '',
    lyrics: ''
  });

  useEffect(() => {
    loadLyrics();
  }, []);

  const loadLyrics = async () => {
    setLoading(true);
    try {
      // For now, we'll use mock data since we can't easily query all lyrics from contract
      // In a real implementation, you'd need contract functions to list all lyrics
      const mockLyrics: LyricsCard[] = MOCK_LYRICS.map((lyric, index) => ({
        id: `mock-${index}`,
        artist: lyric.artist,
        title: lyric.title,
        year: 2025,
        genre: 'Hip-Hop', // Default genre for mock data
        lyrics: lyric.text,
        created_at: new Date().toISOString()
      }));
      setLyrics(mockLyrics);
    } catch (error) {
      console.error('Error loading lyrics:', error);
      toast.error('Failed to load lyrics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLyric = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    try {
      const genreEnum = new CairoCustomEnum({ [formData.genre]: {} });
      await addLyricsCard(
        genreEnum,
        formData.artist,
        formData.title,
        formData.year,
        formData.lyrics
      );

      toast.success('Lyric added successfully');
      setIsAddModalOpen(false);
      resetForm();
      loadLyrics();
    } catch (error) {
      console.error('Error adding lyric:', error);
      toast.error('Failed to add lyric');
    }
  };

  const handleEditLyric = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    // Note: Contract doesn't have edit function, so this is UI-only for now
    toast.warning('Edit function not available in contract yet');
    setIsEditModalOpen(false);
  };

  const handleDeleteLyric = async (lyricId: string) => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    // Note: Contract doesn't have delete function, so this is UI-only for now
    toast.warning('Delete function not available in contract yet');
  };

  const handleBatchUpload = async () => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return;
    }

    if (!batchUploadGenre) {
      toast.error('Please select a genre for batch upload');
      return;
    }

    setIsUploadingBatch(true);
    try {
      const cardsData: CardData[] = MOCK_LYRICS.map(lyric =>
        mockLyricToCardData(lyric, batchUploadGenre)
      );

      const batchSize = 10;
      for (let i = 0; i < cardsData.length; i += batchSize) {
        const batch = cardsData.slice(i, i + batchSize);
        await addBatchLyricsCard(batch);

        if (i + batchSize < cardsData.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast.success(`Successfully uploaded ${cardsData.length} lyrics cards`);
      loadLyrics();
    } catch (error) {
      console.error('Error in batch upload:', error);
      toast.error('Batch upload failed');
    } finally {
      setIsUploadingBatch(false);
    }
  };

  const resetForm = () => {
    setFormData({
      artist: '',
      title: '',
      year: new Date().getFullYear(),
      genre: '',
      lyrics: ''
    });
  };

  const openEditModal = (lyric: LyricsCard) => {
    setSelectedLyric(lyric);
    setFormData({
      artist: lyric.artist,
      title: lyric.title,
      year: lyric.year,
      genre: lyric.genre,
      lyrics: lyric.lyrics
    });
    setIsEditModalOpen(true);
  };

  const filteredLyrics = lyrics.filter(lyric => {
    const matchesSearch = lyric.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lyric.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lyric.lyrics.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || lyric.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = Object.keys(Genre).filter(key => isNaN(Number(key)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lyrics Database Management</h2>
          <p className="text-gray-600">Manage lyrics cards in the database</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!isAdmin}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Add Lyric
          </button>
          <button
            onClick={loadLyrics}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          ⚠️ Admin access required for add/edit/delete operations
        </div>
      )}

      {/* Batch Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Batch Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre for Batch Upload
            </label>
            <select
              value={batchUploadGenre}
              onChange={(e) => setBatchUploadGenre(e.target.value)}
              disabled={!isAdmin || isUploadingBatch}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select genre</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={handleBatchUpload}
              disabled={!isAdmin || !batchUploadGenre || isUploadingBatch}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isUploadingBatch ? 'Uploading...' : `Upload ${MOCK_LYRICS.length} Mock Lyrics`}
            </button>
          </div>
          <div className="text-sm text-gray-500">
            This will upload all mock lyrics with the selected genre
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by artist, title, or lyrics..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lyrics List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            Lyrics ({filteredLyrics.length} found)
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading lyrics...</div>
        ) : filteredLyrics.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No lyrics found. Try adjusting your search or filters.
          </div>
        ) : (
          <div className="divide-y">
            {filteredLyrics.map((lyric) => (
              <div key={lyric.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{lyric.title}</h4>
                      <span className="text-sm text-gray-500">by {lyric.artist}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{lyric.year}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{lyric.genre}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {lyric.lyrics}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditModal(lyric)}
                      disabled={!isAdmin}
                      className="text-blue-600 hover:text-blue-700 disabled:opacity-50 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLyric(lyric.id)}
                      disabled={!isAdmin}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Lyric</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select genre</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lyrics</label>
                <textarea
                  value={formData.lyrics}
                  onChange={(e) => setFormData(prev => ({ ...prev, lyrics: e.target.value }))}
                  rows={8}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddLyric}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Add Lyric
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedLyric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Lyric</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select genre</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lyrics</label>
                <textarea
                  value={formData.lyrics}
                  onChange={(e) => setFormData(prev => ({ ...prev, lyrics: e.target.value }))}
                  rows={8}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-2 rounded mt-4">
              ⚠️ Edit functionality requires contract update to implement update_lyrics_card()
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleEditLyric}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedLyric(null);
                  resetForm();
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