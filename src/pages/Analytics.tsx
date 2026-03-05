import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  BarChart3,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useClients } from "../hooks/useClients";
import { AdherenceBarChart, AdherenceTrendChart } from "../components/Charts";
import AdherenceScore from "../components/AdherenceScore";
import RiskBadge from "../components/RiskBadge";
import { getAvatarColor, getInitials } from "../lib/utils";

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 px-8 py-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 h-72" />
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 h-32" />
          <div className="bg-white rounded-2xl border border-slate-100 h-32" />
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const { clients, loading, error, refresh } = useClients(user?.id ?? "");

  const stats = useMemo(() => {
    if (clients.length === 0)
      return {
        avg: 0,
        best: 0,
        worst: 0,
        improving: 0,
        declining: 0,
        totalCompleted: 0,
        totalMissed: 0,
        completionRate: 0,
      };
    const scores = clients.map((c) => c.adherenceScore ?? 0);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const improving = clients.filter((c) => c.momentum === "improving").length;
    const declining = clients.filter((c) => c.momentum === "declining").length;
    const totalCompleted = clients.reduce(
      (sum, c) =>
        sum + (c.workouts ?? []).filter((w) => w.status === "completed").length,
      0
    );
    const totalMissed = clients.reduce(
      (sum, c) =>
        sum + (c.workouts ?? []).filter((w) => w.status === "missed").length,
      0
    );
    const total = totalCompleted + totalMissed;
    const completionRate = total > 0 ? Math.round((totalCompleted / total) * 100) : 0;
    return { avg, best, worst, improving, declining, totalCompleted, totalMissed, completionRate };
  }, [clients]);

  const topPerformer = useMemo(
    () =>
      [...clients].sort((a, b) => (b.adherenceScore ?? 0) - (a.adherenceScore ?? 0))[0] ??
      null,
    [clients]
  );

  const mostImproved = useMemo(
    () =>
      [...clients]
        .filter((c) => c.momentum === "improving")
        .sort((a, b) => (b.adherenceScore ?? 0) - (a.adherenceScore ?? 0))[0] ?? null,
    [clients]
  );

  const atRiskClients = useMemo(
    () =>
      [...clients]
        .sort((a, b) => (a.adherenceScore ?? 0) - (b.adherenceScore ?? 0))
        .filter((c) => c.riskLevel !== "good"),
    [clients]
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Deep dive into your coaching performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RefreshCw size={15} />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
              <Calendar size={13} />
              Last 30 days
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="px-8 py-6 space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Team Avg Adherence",
                value: `${stats.avg}%`,
                icon: BarChart3,
                color: "bg-emerald-500",
                sub:
                  stats.avg >= 70
                    ? "Excellent"
                    : stats.avg >= 40
                    ? "Needs work"
                    : "Critical",
                subColor:
                  stats.avg >= 70
                    ? "text-emerald-600"
                    : stats.avg >= 40
                    ? "text-amber-600"
                    : "text-red-500",
              },
              {
                label: "Completion Rate",
                value: `${stats.completionRate}%`,
                icon: TrendingUp,
                color: "bg-blue-500",
                sub: `${stats.totalCompleted} sessions done`,
                subColor: "text-slate-400",
              },
              {
                label: "Improving Clients",
                value: stats.improving,
                icon: TrendingUp,
                color: "bg-teal-500",
                sub: "positive momentum",
                subColor: "text-teal-600",
              },
              {
                label: "Declining Clients",
                value: stats.declining,
                icon: TrendingDown,
                color: "bg-rose-500",
                sub: "need intervention",
                subColor: "text-rose-500",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}
                >
                  <card.icon size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5">{card.value}</p>
                  <p className={`text-xs mt-0.5 ${card.subColor}`}>{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {clients.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <BarChart3 size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm">
                No data yet — add clients to see analytics
              </p>
            </div>
          ) : (
            <>
              {/* Charts row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">
                        Adherence by Client
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        30-day adherence scores across all clients
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                        Best: {stats.best}%
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg font-medium">
                        Lowest: {stats.worst}%
                      </span>
                    </div>
                  </div>
                  <div className="h-64">
                    <AdherenceBarChart clients={clients} />
                  </div>
                </div>

                <div className="col-span-3 lg:col-span-1 space-y-4">
                  {topPerformer && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Award size={15} className="text-amber-500" />
                        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          Top Performer
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(
                            topPerformer.name
                          )} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {getInitials(topPerformer.name)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {topPerformer.name}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {topPerformer.goal}
                          </p>
                        </div>
                        <AdherenceScore
                          score={topPerformer.adherenceScore ?? 0}
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                    </div>
                  )}

                  {mostImproved && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={15} className="text-emerald-500" />
                        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          Most Improved
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(
                            mostImproved.name
                          )} flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {getInitials(mostImproved.name)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">
                            {mostImproved.name}
                          </p>
                          <p className="text-xs text-emerald-500 font-medium">
                            ↑ Improving trend
                          </p>
                        </div>
                        <AdherenceScore
                          score={mostImproved.adherenceScore ?? 0}
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">
                      Workout Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Completed</span>
                          <span className="text-emerald-600 font-bold">
                            {stats.totalCompleted}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${stats.completionRate}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Missed</span>
                          <span className="text-red-500 font-bold">{stats.totalMissed}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-red-400 h-2 rounded-full"
                            style={{ width: `${100 - stats.completionRate}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 pt-1">
                        {stats.completionRate}% overall completion rate
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Trend Charts */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-blue-500" />
                  <h2 className="text-sm font-semibold text-slate-700">
                    Individual 8-Week Trends
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className="bg-white rounded-2xl border border-slate-100 p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(
                              client.name
                            )} flex items-center justify-center text-white font-bold text-xs`}
                          >
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {client.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <RiskBadge level={client.riskLevel ?? "good"} size="sm" />
                              <span
                                className={`text-xs font-medium ${
                                  client.momentum === "improving"
                                    ? "text-emerald-500"
                                    : client.momentum === "declining"
                                    ? "text-red-500"
                                    : "text-slate-400"
                                }`}
                              >
                                {client.momentum === "improving"
                                  ? "↑ Improving"
                                  : client.momentum === "declining"
                                  ? "↓ Declining"
                                  : "→ Stable"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <AdherenceScore
                          score={client.adherenceScore ?? 0}
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                      <div className="h-28">
                        <AdherenceTrendChart client={client} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* At-Risk Table */}
              {atRiskClients.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-500" />
                    <h2 className="text-sm font-semibold text-slate-800">
                      Intervention Priority List
                    </h2>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium ml-auto">
                      {atRiskClients.length} clients need attention
                    </span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {atRiskClients.map((client) => (
                      <div
                        key={client.id}
                        className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarColor(
                            client.name
                          )} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
                        >
                          {getInitials(client.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{client.name}</p>
                          <p className="text-xs text-slate-400 truncate">{client.goal}</p>
                        </div>
                        <RiskBadge level={client.riskLevel ?? "good"} size="sm" />
                        <span
                          className={`text-xs font-medium ${
                            client.momentum === "improving"
                              ? "text-emerald-500"
                              : client.momentum === "declining"
                              ? "text-red-500"
                              : "text-slate-400"
                          }`}
                        >
                          {client.momentum === "improving"
                            ? "↑"
                            : client.momentum === "declining"
                            ? "↓"
                            : "→"}{" "}
                          {client.momentum}
                        </span>
                        <AdherenceScore
                          score={client.adherenceScore ?? 0}
                          size="sm"
                          showLabel={false}
                        />
                        <div className="text-xs text-slate-400 hidden lg:block w-32">
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                (client.adherenceScore ?? 0) >= 70
                                  ? "bg-emerald-500"
                                  : (client.adherenceScore ?? 0) >= 40
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${client.adherenceScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
