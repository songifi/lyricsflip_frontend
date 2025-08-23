'use client';

import React, { useMemo } from 'react';
import { usePlayerStatistics } from '@/hooks/usePlayerStatistics';

const numberFmt = (v: number, digits = 0) =>
  isFinite(v) ? v.toFixed(digits) : '0';

const pctFmt = (v: number) => `${numberFmt(v * 100, 1)}%`;

const msToSec = (v?: number) => (v && v > 0 ? `${numberFmt(v / 1000, 2)}s` : '—');

function EmptyState() {
  return (
    <div className="text-center text-gray-500 py-16">
      <p className="text-lg font-medium">No rounds yet</p>
      <p className="text-sm">Play some rounds to see your statistics.</p>
    </div>
  );
}

function SummaryCards({
  totalPlayed,
  wins,
  winRate,
  avgScore,
  avgAccuracy,
  bestTime,
}: {
  totalPlayed: number;
  wins: number;
  winRate: number;
  avgScore: number;
  avgAccuracy: number;
  bestTime?: number;
}) {
  const items = [
    { label: 'Games Played', value: totalPlayed.toString() },
    { label: 'Wins', value: wins.toString() },
    { label: 'Win Rate', value: pctFmt(winRate) },
    { label: 'Avg. Score', value: numberFmt(avgScore, 1) },
    { label: 'Avg. Accuracy', value: pctFmt(avgAccuracy) },
    { label: 'Best Time', value: msToSec(bestTime) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-500">{it.label}</div>
          <div className="text-xl font-semibold mt-1">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ points, height = 140, color = '#7C3AED' }: { points: { x: number; y: number }[]; height?: number; color?: string }) {
  if (!points.length) return <div className="h-[140px]" />;
  const width = 600; // fixed svg width; container scrolls on small screens
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${(height - p.y).toFixed(2)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[140px]">
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}

function ProgressCharts({ data }: { data: { t: number; score: number; accuracy: number }[] }) {
  const { scorePts, accPts } = useMemo(() => {
    if (!data.length) return { scorePts: [], accPts: [] } as any;
    const minT = Math.min(...data.map((d) => d.t));
    const maxT = Math.max(...data.map((d) => d.t));
    const minScore = 0;
    const maxScore = Math.max(...data.map((d) => d.score), 1);
    const height = 140;
    const width = 600;
    const x = (t: number) => (t - minT) / Math.max(1, maxT - minT) * width;
    const yScore = (s: number) => (s - minScore) / Math.max(1, maxScore - minScore) * height;
    const yAcc = (a: number) => a * height;

    return {
      scorePts: data.map((d) => ({ x: x(d.t), y: yScore(d.score) })),
      accPts: data.map((d) => ({ x: x(d.t), y: yAcc(d.accuracy) })),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500 mb-2">Score Over Time</div>
        <LineChart points={scorePts} color="#7C3AED" />
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500 mb-2">Accuracy Over Time</div>
        <LineChart points={accPts} color="#10B981" />
      </div>
    </div>
  );
}

function RoundHistory({ rounds }: { rounds: Array<{ roundId: bigint; creationTime?: number; score: number; correct: number; total: number; bestTime?: number; isWinner: boolean; rankInRound?: number; playersInRound?: number }> }) {
  if (!rounds.length) return null;
  const sorted = [...rounds]
    .filter((r) => r.creationTime)
    .sort((a, b) => (a.creationTime! - b.creationTime!));

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500 mb-3">Round History</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Round</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Accuracy</th>
              <th className="py-2 pr-4">Best Time</th>
              <th className="py-2 pr-4">Result</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.roundId.toString()} className="border-t border-gray-100">
                <td className="py-2 pr-4 text-gray-700">{r.creationTime ? new Date(r.creationTime).toLocaleString() : '—'}</td>
                <td className="py-2 pr-4 font-medium">#{r.roundId.toString()}</td>
                <td className="py-2 pr-4">{r.score}</td>
                <td className="py-2 pr-4">{r.total > 0 ? pctFmt(r.correct / r.total) : '—'}</td>
                <td className="py-2 pr-4">{msToSec(r.bestTime)}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-1 rounded text-xs ${r.isWinner ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                    {r.isWinner ? `Win${r.rankInRound ? ` (Rank ${r.rankInRound}/${r.playersInRound ?? '-'})` : ''}` : 'Played'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonCard({ globalRankByWins, totalPlayers, topPercentileByWins }: { globalRankByWins?: number; totalPlayers?: number; topPercentileByWins?: number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500 mb-2">Global Comparison</div>
      {globalRankByWins && totalPlayers ? (
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-gray-500">Rank by Wins</div>
            <div className="text-xl font-semibold">{globalRankByWins} / {totalPlayers}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Top Percentile</div>
            <div className="text-xl font-semibold">{numberFmt(topPercentileByWins ?? 0, 0)}</div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-sm">Not enough data yet</div>
      )}
    </div>
  );
}

export default function StatisticsPage() {
  const { isReady, summary, rounds, progress, comparison } = usePlayerStatistics();

  const hasData = rounds.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Player Statistics</h1>

      {!isReady ? (
        <div className="text-gray-500">Connect your wallet to view your stats.</div>
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <>
          <SummaryCards
            totalPlayed={summary.totalPlayed}
            wins={summary.wins}
            winRate={summary.winRate}
            avgScore={summary.avgScore}
            avgAccuracy={summary.avgAccuracy}
            bestTime={summary.bestTime}
          />

          <ProgressCharts data={progress} />

          <ComparisonCard {...comparison} />

          <RoundHistory rounds={rounds.filter((r) => r.creationTime)} />
        </>
      )}
    </div>
  );
}
