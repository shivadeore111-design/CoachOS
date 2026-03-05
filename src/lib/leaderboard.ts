/**
 * src/lib/leaderboard.ts
 * Client leaderboard scoring — gamifies adherence.
 * Score factors: adherence (70%) + streak bonus (30%).
 */
import type { Client, LeaderboardEntry } from "../types";

export function leaderboardScore(adherence: number, streak: number): number {
  const adherenceComponent = adherence * 0.7;
  const streakBonus = Math.min(streak * 2, 30); // Max 30 bonus points for streak
  return Math.min(100, Math.round(adherenceComponent + streakBonus));
}

export function buildLeaderboard(clients: Client[]): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = clients.map((c) => ({
    client_id: c.id,
    client_name: c.name,
    coach_id: c.coach_id,
    adherenceScore: c.adherenceScore ?? 0,
    streak: c.streak ?? 0,
    leaderboardScore: leaderboardScore(c.adherenceScore ?? 0, c.streak ?? 0),
    rank: 0, // assigned below
    goal: c.goal,
  }));

  entries.sort((a, b) => b.leaderboardScore - a.leaderboardScore);
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  return entries;
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export function getRankColor(rank: number): string {
  if (rank === 1) return "text-amber-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-amber-700";
  return "text-slate-500";
}
