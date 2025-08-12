'use client';

import { Card } from '@/components/molecules/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type LeaderboardEntry = {
  rank: number;
  username: string;
  plays: number;
  points: number;
};

const MOCK_ENTRIES: LeaderboardEntry[] = Array.from({ length: 8 }).map((_, i) => ({
  rank: i + 1,
  username: 'theJohnKennedy',
  plays: 120,
  points: 1200,
}));

function RankBadge({ rank }: { rank: number }) {
  const topThree = rank <= 3;
  const bg =
    rank === 1
      ? 'bg-yellow-400'
      : rank === 2
      ? 'bg-gray-300'
      : rank === 3
      ? 'bg-amber-600'
      : 'bg-[#EFEFEF]';
  const text = topThree ? 'text-white' : 'text-[#606060]';
  return (
    <div className={`h-6 w-6 flex items-center justify-center rounded-full ${bg} ${text} text-xs font-bold`}>{rank}</div>
  );
}

function formatNumber(n: number) {
  return n.toLocaleString();
}

export default function LeaderboardPage() {
  return (
    <main className="lg:max-w-[66rem] mx-auto w-full mb-24 p-4 lg:p-0 md:mt-24 lg:mt-28">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h1 className="text-[1.5rem] font-semibold leading-tight">Leaderboard</h1>
          <p className="text-sm text-[#909090]">Hey!!! No pressure, it’s just a leaderboard really 🎵</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Select defaultValue="all-time">
            <SelectTrigger className="w-[110px] rounded-md border-[#EAEAEA]">
              <SelectValue placeholder="All time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All time</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="week">This week</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="global">
            <SelectTrigger className="w-[110px] rounded-md border-[#EAEAEA]">
              <SelectValue placeholder="Global" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="local">Local</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EFEFEF] bg-white shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_160px_140px] md:grid-cols-[1fr_220px_160px] items-center px-4 md:px-6 h-12 text-sm text-[#606060]">
          <div>Username</div>
          <div className="text-center">Number of Plays</div>
          <div className="text-right">Points</div>
        </div>
        <div className="h-px bg-[#F3F4F6]" />

        {/* Rows */}
        <div>
          {MOCK_ENTRIES.map((row) => (
            <div
              key={row.rank}
              className={`grid grid-cols-[1fr_160px_140px] md:grid-cols-[1fr_220px_160px] items-center px-4 md:px-6 h-[64px] transition-colors ${
                row.rank === 1 ? 'bg-teal-400/15' : 'hover:bg-gray-50'
              }`}
            >
              {/* Username */}
              <div className="flex items-center gap-3 min-w-0">
                <RankBadge rank={row.rank} />
                <Image src="/image1.png" alt="avatar" width={24} height={24} className="rounded-full object-cover border border-[#EAEAEA]" />
                <span className="truncate font-medium text-gray-900">{row.username}</span>
              </div>

              {/* Plays */}
              <div className="text-center text-gray-700">{formatNumber(row.plays)}</div>

              {/* Points */}
              <div className="text-right font-semibold text-purplePrimary5">{formatNumber(row.points)} pts</div>
            </div>
          ))}
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between px-4 md:px-6 h-14 text-sm text-[#606060] border-t border-[#F3F4F6]">
          <div>1–8 of 10 items</div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-gray-100" aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`h-7 w-7 rounded text-sm leading-none ${
                  n === 1 ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
            <button className="p-1.5 rounded hover:bg-gray-100" aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


