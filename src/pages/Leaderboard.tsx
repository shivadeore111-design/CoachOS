import { useEffect, useMemo, useState } from "react";
import { Trophy, Flame, TrendingUp, Minus, Medal } from "lucide-react";
import { getAvatarColor, getInitials } from "../lib/utils";
import AdherenceScore from "../components/AdherenceScore";
import RiskBadge from "../components/RiskBadge";
import { getLeaderboard } from "../lib/metrics";
import { supabase } from "../lib/supabase";
import type { ClientMetrics } from "../types/clientMetrics";

function getRankEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function getRankColor(rank: number): string {
  if (rank === 1) return "text-amber-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-amber-700";
  return "text-slate-500";
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<ClientMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getLeaderboard();
      setLeaderboard(data);
      setLoading(false);
    }

    void load();

    const channel = supabase
      .channel("leaderboard-metrics")
      .on("postgres_changes", { event: "*", schema: "public", table: "workouts" }, () => {
        void load();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const top3 = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Leaderboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">Client rankings by adherence score</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <Trophy size={13} className="text-amber-500" />
            Updated daily
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs text-slate-500">Score = Adherence (30-day, from database view)</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={13} className="text-orange-500" />
              <span className="text-xs text-slate-500">Ranked by client_metrics.adherence</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={13} className="text-amber-500" />
              <span className="text-xs text-slate-500">Max leaderboard score: 100</span>
            </div>
          </div>
        </div>

        {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {top3[1] ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center text-center mt-6">
                <div className="text-2xl mb-2">🥈</div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(top3[1].name)} flex items-center justify-center text-white font-bold text-lg shadow-md mb-3`}>
                  {getInitials(top3[1].name)}
                </div>
                <p className="text-sm font-bold text-slate-800">{top3[1].name}</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-3 line-clamp-1">{top3[1].goal}</p>
                <div className="w-full bg-slate-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-slate-700">{Math.round(top3[1].adherence)}</p>
                  <p className="text-xs text-slate-400">leaderboard pts</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">{top3[1].adherence}% adherence</span>
                  </div>
                </div>
              </div>
            ) : <div />}

            {top3[0] && (
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-300 p-5 flex flex-col items-center text-center shadow-md shadow-amber-100">
                <div className="text-3xl mb-2">🥇</div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(top3[0].name)} flex items-center justify-center text-white font-bold text-xl shadow-lg mb-3`}>
                  {getInitials(top3[0].name)}
                </div>
                <p className="text-sm font-bold text-slate-800">{top3[0].name}</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-3 line-clamp-1">{top3[0].goal}</p>
                <div className="w-full bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <p className="text-3xl font-bold text-amber-600">{Math.round(top3[0].adherence)}</p>
                  <p className="text-xs text-amber-500">leaderboard pts</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">{top3[0].adherence}% adherence</span>
                  </div>
                </div>
              </div>
            )}

            {top3[2] ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center text-center mt-10">
                <div className="text-2xl mb-2">🥉</div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(top3[2].name)} flex items-center justify-center text-white font-bold text-lg shadow-md mb-3`}>
                  {getInitials(top3[2].name)}
                </div>
                <p className="text-sm font-bold text-slate-800">{top3[2].name}</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-3 line-clamp-1">{top3[2].goal}</p>
                <div className="w-full bg-slate-50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-amber-800">{Math.round(top3[2].adherence)}</p>
                  <p className="text-xs text-slate-400">leaderboard pts</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">{top3[2].adherence}% adherence</span>
                  </div>
                </div>
              </div>
            ) : <div />}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Medal size={15} className="text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Full Rankings</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">
              {leaderboard.length} clients
            </span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-16 text-center">
              <Trophy size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">No clients yet</p>
              <p className="text-xs text-slate-300 mt-1">Add clients to see the leaderboard</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {leaderboard.map((entry, index) => {
                const riskLevel = entry.status === "critical" ? "critical" : entry.status === "at_risk" ? "risk" : "good";
                return (
                  <div
                    key={entry.client_id}
                    className={`px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${index < 3 ? "bg-slate-50/50" : ""}`}
                  >
                    <div className={`w-8 text-center font-bold text-sm ${getRankColor(index + 1)}`}>
                      {getRankEmoji(index + 1)}
                    </div>

                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(entry.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {getInitials(entry.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{entry.name}</p>
                      <p className="text-xs text-slate-400 truncate">{entry.goal}</p>
                    </div>

                    <RiskBadge level={riskLevel} size="sm" />

                    <div className="hidden sm:flex items-center">
                      {riskLevel === "good" ? <TrendingUp size={14} className="text-emerald-500" /> : <Minus size={14} className="text-slate-400" />}
                    </div>

                    <AdherenceScore score={entry.adherence} size="sm" showLabel={false} />

                    <div className="text-right w-16 flex-shrink-0">
                      <p className={`text-lg font-bold ${getRankColor(index + 1)}`}>
                        {Math.round(entry.adherence)}
                      </p>
                      <p className="text-xs text-slate-300">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
