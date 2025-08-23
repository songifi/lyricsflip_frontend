import { useAccount } from '@starknet-react/core';
import { useEntityQuery, useModels } from '@dojoengine/sdk/react';
import { ToriiQueryBuilder, MemberClause } from '@dojoengine/sdk';
import { useMemo } from 'react';
import {
  ModelsMapping,
  Round,
  RoundPlayer,
  PlayerStats as PlayerStatsModel,
} from '@/lib/dojo/typescript/models.gen';

export type PlayerRoundSummary = {
  roundId: bigint;
  mode?: number;
  creationTime?: number;
  correct: number;
  total: number;
  score: number;
  bestTime?: number;
  completed: boolean;
  isWinner: boolean;
  rankInRound?: number;
  playersInRound?: number;
};

export type SummaryStats = {
  totalPlayed: number; // joined rounds
  totalCompleted: number; // completed rounds
  wins: number;
  winRate: number; // wins / completed
  avgScore: number;
  avgAccuracy: number; // correct / total
  bestTime?: number; // min best_time
};

export type ModeStats = Record<string, SummaryStats>;

export type ProgressPoint = {
  t: number; // timestamp (ms)
  score: number;
  accuracy: number; // 0..1
};

export type Comparison = {
  globalRankByWins?: number;
  totalPlayers?: number;
  topPercentileByWins?: number; // 0..100
};

export type UsePlayerStatistics = {
  isReady: boolean;
  summary: SummaryStats;
  modeStats: ModeStats;
  rounds: PlayerRoundSummary[];
  progress: ProgressPoint[];
  comparison: Comparison;
};

// Helper to safely BigInt->number when small
const n = (v: any): number => {
  try {
    const b = BigInt(v ?? 0);
    const asNum = Number(b);
    return Number.isFinite(asNum) ? asNum : 0;
  } catch {
    const asNum = Number(v ?? 0);
    return Number.isFinite(asNum) ? asNum : 0;
  }
};

const bi = (v: any): bigint => {
  try {
    return BigInt(v ?? 0);
  } catch {
    return 0n;
  }
};

export function usePlayerStatistics(): UsePlayerStatistics {
  const { account } = useAccount();

  // Pull all rounds and round players; also PlayerStats for comparisons
  useEntityQuery(
    new ToriiQueryBuilder()
      .withClause(MemberClause(ModelsMapping.Round, 'round_id', 'Gt', '0').build())
      .includeHashedKeys()
  );

  useEntityQuery(
    new ToriiQueryBuilder()
      .withClause(MemberClause(ModelsMapping.RoundPlayer, 'joined', 'Eq', true).build())
      .includeHashedKeys()
  );

  useEntityQuery(
    new ToriiQueryBuilder()
      .withClause(MemberClause(ModelsMapping.PlayerStats, 'total_rounds', 'Gt', '0').build())
      .includeHashedKeys()
  );

  const roundsMap = useModels(ModelsMapping.Round) as Record<string, any> | undefined;
  const roundPlayersMap = useModels(ModelsMapping.RoundPlayer) as Record<string, any> | undefined;
  const playerStatsMap = useModels(ModelsMapping.PlayerStats) as Record<string, any> | undefined;

  // Flatten entity maps into usable arrays
  const allRounds: Round[] = useMemo(() => {
    if (!roundsMap) return [];
    return Object.values(roundsMap)
      .map((e: any) => {
        const keys = Object.keys(e);
        return keys.length > 0 ? (e[keys[0]] as Round) : null;
      })
      .filter(Boolean) as Round[];
  }, [roundsMap]);

  const allRoundPlayers: RoundPlayer[] = useMemo(() => {
    if (!roundPlayersMap) return [];
    return Object.values(roundPlayersMap)
      .map((e: any) => {
        const keys = Object.keys(e);
        return keys.length > 0 ? (e[keys[0]] as RoundPlayer) : null;
      })
      .filter(Boolean) as RoundPlayer[];
  }, [roundPlayersMap]);

  const allPlayerStats: PlayerStatsModel[] = useMemo(() => {
    if (!playerStatsMap) return [];
    return Object.values(playerStatsMap)
      .map((e: any) => {
        const keys = Object.keys(e);
        return keys.length > 0 ? (e[keys[0]] as PlayerStatsModel) : null;
      })
      .filter(Boolean) as PlayerStatsModel[];
  }, [playerStatsMap]);

  // Build index for quick lookups
  const roundById = useMemo(() => {
    const m = new Map<string, Round>();
    for (const r of allRounds) m.set(bi(r.round_id).toString(), r);
    return m;
  }, [allRounds]);

  const myRoundPlayers = useMemo(() => {
    if (!account?.address) return [] as RoundPlayer[];
    return allRoundPlayers.filter(
      (rp) => Array.isArray(rp.player_to_round_id) && rp.player_to_round_id[0] === account.address
    );
  }, [allRoundPlayers, account?.address]);

  const roundsByIdToAllPlayers = useMemo(() => {
    const grouped = new Map<string, RoundPlayer[]>();
    for (const rp of allRoundPlayers) {
      const roundId = bi(rp.player_to_round_id?.[1]).toString();
      const arr = grouped.get(roundId) ?? [];
      arr.push(rp);
      grouped.set(roundId, arr);
    }
    return grouped;
  }, [allRoundPlayers]);

  const rounds: PlayerRoundSummary[] = useMemo(() => {
    return myRoundPlayers.map((rp) => {
      const roundId = bi(rp.player_to_round_id?.[1]);
      const r = roundById.get(roundId.toString());
      const peers = roundsByIdToAllPlayers.get(roundId.toString()) ?? [];
      const myScore = n(rp.total_score);
      const maxScore = peers.reduce((m, p) => Math.max(m, n(p.total_score)), Number.NEGATIVE_INFINITY);
      const isWinner = peers.length > 0 ? myScore >= maxScore && maxScore !== Number.NEGATIVE_INFINITY : false;

      // rank 1-based among peers by score desc
      const sorted = [...peers].sort((a, b) => n(b.total_score) - n(a.total_score));
      const rank = sorted.findIndex((p) => p === rp) + 1 || undefined;

      return {
        roundId,
        mode: r ? n(r.mode) : undefined,
        creationTime: r ? n(r.creation_time) * 1000 : undefined,
        correct: n(rp.correct_answers),
        total: n(rp.total_answers),
        score: myScore,
        bestTime: n(rp.best_time) || undefined,
        completed: Boolean(rp.round_completed),
        isWinner,
        rankInRound: peers.length ? rank : undefined,
        playersInRound: peers.length || undefined,
      } as PlayerRoundSummary;
    });
  }, [myRoundPlayers, roundById, roundsByIdToAllPlayers]);

  const completedRounds = useMemo(() => rounds.filter((r) => r.completed), [rounds]);

  const summary: SummaryStats = useMemo(() => {
    const totalPlayed = rounds.length;
    const totalCompleted = completedRounds.length;
    const wins = completedRounds.filter((r) => r.isWinner).length;
    const winRate = totalCompleted > 0 ? wins / totalCompleted : 0;

    const scoreSum = completedRounds.reduce((s, r) => s + r.score, 0);
    const avgScore = totalCompleted > 0 ? scoreSum / totalCompleted : 0;

    const correctSum = completedRounds.reduce((s, r) => s + r.correct, 0);
    const answersSum = completedRounds.reduce((s, r) => s + r.total, 0);
    const avgAccuracy = answersSum > 0 ? correctSum / answersSum : 0;

    const bestTimes = completedRounds.map((r) => r.bestTime ?? Number.MAX_SAFE_INTEGER);
    const bestTime = bestTimes.length ? Math.min(...bestTimes) : undefined;

    return { totalPlayed, totalCompleted, wins, winRate, avgScore, avgAccuracy, bestTime };
  }, [rounds, completedRounds]);

  const modeStats: ModeStats = useMemo(() => {
    const groups = new Map<string, PlayerRoundSummary[]>();
    for (const r of rounds) {
      const key = String(r.mode ?? 'unknown');
      const arr = groups.get(key) ?? [];
      arr.push(r);
      groups.set(key, arr);
    }
    const result: ModeStats = {};
    for (const [key, arr] of groups) {
      const done = arr.filter((x) => x.completed);
      const wins = done.filter((x) => x.isWinner).length;
      const avgScore = done.length ? done.reduce((s, x) => s + x.score, 0) / done.length : 0;
      const correct = done.reduce((s, x) => s + x.correct, 0);
      const total = done.reduce((s, x) => s + x.total, 0);
      const avgAccuracy = total > 0 ? correct / total : 0;
      const bestTimeVals = done.map((x) => x.bestTime ?? Number.MAX_SAFE_INTEGER);
      const bestTime = bestTimeVals.length ? Math.min(...bestTimeVals) : undefined;
      result[key] = {
        totalPlayed: arr.length,
        totalCompleted: done.length,
        wins,
        winRate: done.length ? wins / done.length : 0,
        avgScore,
        avgAccuracy,
        bestTime,
      };
    }
    return result;
  }, [rounds]);

  const progress: ProgressPoint[] = useMemo(() => {
    const pts = completedRounds
      .map((r) => ({
        t: r.creationTime ?? 0,
        score: r.score,
        accuracy: r.total > 0 ? r.correct / r.total : 0,
      }))
      .filter((p) => p.t > 0)
      .sort((a, b) => a.t - b.t);
    return pts;
  }, [completedRounds]);

  const comparison: Comparison = useMemo(() => {
    if (!account?.address || allPlayerStats.length === 0) return {};
    const sortedByWins = [...allPlayerStats].sort(
      (a, b) => n(b.rounds_won) - n(a.rounds_won)
    );
    const idx = sortedByWins.findIndex((s) => s.player === account.address);
    const totalPlayers = sortedByWins.length;
    const rank = idx >= 0 ? idx + 1 : undefined;
    const topPercentileByWins = rank && totalPlayers
      ? Math.max(0, 100 - Math.floor(((rank - 1) / totalPlayers) * 100))
      : undefined;
    return {
      globalRankByWins: rank,
      totalPlayers,
      topPercentileByWins,
    };
  }, [account?.address, allPlayerStats]);

  const isReady = Boolean(account?.address);

  return {
    isReady,
    summary,
    modeStats,
    rounds,
    progress,
    comparison,
  };
}
