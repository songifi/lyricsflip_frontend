'use client';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useSongs } from '../hooks/useSongs';
import { useCategories } from '../hooks/useCategories';

interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  points: number; 
}

export default function MusicDashboard() {
  const { data: songs, isLoading: songsLoading, error: songsError } = useSongs();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard();

  if (songsLoading || categoriesLoading || leaderboardLoading) {
    return <div className="p-4 text-center">Loading music data...</div>;
  }

  if (songsError) {
    return <div className="p-4 text-red-500">Error loading songs</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Music Dashboard</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Songs</h2>
        <div className="grid gap-4">
          {songs?.map((song: any) => (
            <div key={song.id} className="p-4 border rounded-lg">
              <h3 className="font-medium">{song.title}</h3>
              <p className="text-gray-600">{song.artist}</p>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">{song.category}</span>
                <span className="text-sm font-medium">{song.plays.toLocaleString()} plays</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex gap-2 flex-wrap">
          {categories?.map((category: any) => (
            <span key={category.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {category.name} ({category.songCount})
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
        <div className="space-y-3">
          {leaderboard?.map((user: LeaderboardUser) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-medium w-6 text-center">{user.rank}</span>
                <span>{user.username}</span>
              </div>
              <span className="font-medium">{user.points} pts</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}