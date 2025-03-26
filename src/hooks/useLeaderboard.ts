import { useQuery } from '@tanstack/react-query';


export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      return data.map((user: { id: number; username: string; points: number }, index: number) => ({
        ...user,
        rank: index + 1,
      }));
    },
  });
}