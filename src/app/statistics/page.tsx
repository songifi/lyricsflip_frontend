'use client';

import React, { useMemo, useState } from 'react';
import { usePlayerStatistics } from '@/hooks/usePlayerStatistics';
import type { ModeStats } from '@/hooks/usePlayerStatistics';
import { Card } from '@/components/molecules/card';
import { Trophy, Percent, Gauge, Timer, Gamepad, Target } from 'lucide-react';

const numberFmt = (v: number, digits = 0) =>
  isFinite(v) ? v.toFixed(digits) : '0';

const pctFmt = (v: number) => `${numberFmt(v * 100, 1)}%`;

const msToSec = (v?: number) => (v && v > 0 ? `${numberFmt(v / 1000, 2)}s` : '—');

// Centralized label for mode IDs
const modeLabel = (key: string | number | undefined) => {
  const k = String(key ?? 'unknown');
  if (k === '0') return 'Single Player';
  if (k === '1') return 'Multiplayer';
  return k === 'unknown' ? 'Unknown' : `Mode ${k}`;
};

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
    { label: 'Games Played', value: totalPlayed.toString(), icon: <Gamepad className="h-4 w-4 text-purple-600" /> },
    { label: 'Wins', value: wins.toString(), icon: <Trophy className="h-4 w-4 text-green-600" /> },
    { label: 'Win Rate', value: pctFmt(winRate), icon: <Percent className="h-4 w-4 text-blue-600" /> },
    { label: 'Avg. Score', value: numberFmt(avgScore, 1), icon: <Gauge className="h-4 w-4 text-indigo-600" /> },
    { label: 'Avg. Accuracy', value: pctFmt(avgAccuracy), icon: <Target className="h-4 w-4 text-pink-600" /> },
    { label: 'Best Time', value: msToSec(bestTime), icon: <Timer className="h-4 w-4 text-orange-600" /> },
  ];

  const gradients = [
    'from-purple-200 to-purple-100',
    'from-green-200 to-green-100',
    'from-blue-200 to-blue-100',
    'from-indigo-200 to-indigo-100',
    'from-pink-200 to-pink-100',
    'from-orange-200 to-orange-100',
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((it, i) => (
        <Card key={it.label} variant="purple" className="shadow-sm">
          <div className={`p-1 rounded-lg bg-gradient-to-r ${gradients[i % gradients.length]}`}>
            <div className="rounded-md bg-white p-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {it.icon}
                <span>{it.label}</span>
              </div>
              <div className="text-xl font-semibold mt-1 text-gray-900">{it.value}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function LineChart({ points, height = 140, color = '#7C3AED' }: { points: { x: number; y: number }[]; height?: number; color?: string }) {
  if (!points.length) return <div className="h-[140px]" />;
  const width = 600; // fixed svg width; container scales responsively
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${(height - p.y).toFixed(2)}`)
    .join(' ');
  const gridY = [0.25, 0.5, 0.75].map((r) => r * height);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[140px]">
      {gridY.map((gy, i) => (
        <line key={i} x1={0} y1={gy} x2={width} y2={gy} stroke="#E5E7EB" strokeWidth={1} />
      ))}
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={height - p.y} r={3} fill={color} />
      ))}
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

function ModeStatsSection({ modeStats, onSelectMode, activeMode }: { modeStats: ModeStats; onSelectMode?: (key: string) => void; activeMode?: string }) {
  const entries = Object.entries(modeStats);
  if (!entries.length) return null;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500 mb-3">By Game Mode</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {entries.map(([key, s], i) => {
          const gradients = [
            'from-purple-200 to-purple-100',
            'from-pink-200 to-pink-100',
            'from-blue-200 to-blue-100',
            'from-orange-200 to-orange-100',
          ];
          const gradient = gradients[i % gradients.length];
          const isActive = activeMode === key;
          return (
            <button key={key} type="button" onClick={() => onSelectMode?.(key)} className="text-left">
              <Card variant="purple" className={`shadow-sm ${isActive ? 'ring-2 ring-purple-300' : ''}`}>
                <div className={`p-1 rounded-lg bg-gradient-to-r ${gradient}`}>
                  <div className="rounded-md bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-purple-700">{modeLabel(key)}</div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-gray-500">Games</div>
                      <div className="font-semibold text-gray-900">{s.totalPlayed}</div>
                      <div className="text-gray-500">Win Rate</div>
                      <div className="font-semibold text-gray-900">{pctFmt(s.winRate)}</div>
                      <div className="text-gray-500">Avg. Score</div>
                      <div className="font-semibold text-gray-900">{numberFmt(s.avgScore, 1)}</div>
                      <div className="text-gray-500">Avg. Accuracy</div>
                      <div className="font-semibold text-gray-900">{pctFmt(s.avgAccuracy)}</div>
                      <div className="text-gray-500">Best Time</div>
                      <div className="font-semibold text-gray-900">{msToSec(s.bestTime)}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
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
          <thead className="sticky top-0 bg-white z-10">
            <tr className="text-left text-gray-500">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Round</th>
              <th className="py-2 pr-4">Score</th>
              <th className="py-2 pr-4">Accuracy</th>
              <th className="py-2 pr-4">Best Time</th>
              <th className="py-2 pr-4">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((r, idx) => (
              <tr key={r.roundId.toString()} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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
  const percentile = Number.isFinite(topPercentileByWins as number) ? (topPercentileByWins as number) : 0;
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500 mb-2">Global Comparison</div>
      {globalRankByWins && totalPlayers ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="text-xs text-gray-500">Rank by Wins</div>
            <div className="text-xl font-semibold">{globalRankByWins} / {totalPlayers}</div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Percentile</span>
              <span>{numberFmt(percentile, 0)}%</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${Math.max(0, Math.min(100, percentile))}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-sm">Not enough data yet</div>
      )}
    </div>
  );
}

export default function StatisticsPage() {
  const { isReady, summary, rounds, progress, comparison, modeStats } = usePlayerStatistics();
  const [modeFilter, setModeFilter] = useState<string | undefined>(undefined);

  const displayRounds = useMemo(
    () => (modeFilter ? rounds.filter((r) => String(r.mode ?? 'unknown') === modeFilter) : rounds),
    [rounds, modeFilter]
  );
  const hasData = displayRounds.length > 0;

  return (
    <div className="max-w-6xl mx-auto md:mt-24 lg:mt-28 px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Player Statistics</h1>

      {!isReady ? (
        <div className="text-gray-500">Connect your wallet to view your stats.</div>
      ) : !hasData ? (
        <EmptyState />
      ) : (
        <>
          {modeFilter && (
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full border border-purple-200 bg-purple-50 text-purple-700 px-2 py-1">
                Filter: {modeLabel(modeFilter)}
              </span>
              <button
                type="button"
                onClick={() => setModeFilter(undefined)}
                className="text-purple-700 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          <SummaryCards
            totalPlayed={summary.totalPlayed}
            wins={summary.wins}
            winRate={summary.winRate}
            avgScore={summary.avgScore}
            avgAccuracy={summary.avgAccuracy}
            bestTime={summary.bestTime}
          />

          <ModeStatsSection modeStats={modeStats} activeMode={modeFilter} onSelectMode={(key) => setModeFilter((prev) => (prev === key ? undefined : key))} />

          <ProgressCharts data={progress} />

          <ComparisonCard {...comparison} />

          <RoundHistory rounds={displayRounds.filter((r) => r.creationTime)} />
        </>
      )}
    </div>
  );
}
