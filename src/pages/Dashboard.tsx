import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  XOctagon,
  Activity,
  Flame,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useClients } from "../hooks/useClients";
import { getAlerts } from "../lib/api";
import { generateInsights } from "../lib/adherence";
import { AdherenceBarChart } from "../components/Charts";
import ClientCard from "../components/ClientCard";
import InsightCard from "../components/InsightCard";
import AlertsPanel from "../components/AlertsPanel";
import type { Alert } from "../types";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 px-8 py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl border border-slate-100 h-80" />
        <div className="bg-white rounded-2xl border border-slate-100 h-80" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clients, loading, error, refresh } = useClients(user?.id ?? "");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // Load alerts
  const loadAlerts = useCallback(async () => {
    if (!user?.id) return;
    setAlertsLoading(true);
    const result = await getAlerts(user.id);
    if (result.data) setAlerts(result.data);
    setAlertsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const stats = useMemo(() => {
    if (clients.length === 0)
      return { total: 0, avg: 0, atRisk: 0, critical: 0 };
    const avg = Math.round(
      clients.reduce((sum, c) => sum + (c.adherenceScore ?? 0), 0) /
        clients.length
    );
    const atRisk = clients.filter((c) => c.riskLevel === "risk").length;
    const critical = clients.filter((c) => c.riskLevel === "critical").length;
    return { total: clients.length, avg, atRisk, critical };
  }, [clients]);

  const insights = useMemo(() => generateInsights(clients), [clients]);

  const topClients = useMemo(
    () =>
      [...clients]
        .sort((a, b) => (b.adherenceScore ?? 0) - (a.adherenceScore ?? 0))
        .slice(0, 4),
    [clients]
  );

  const atRiskClients = useMemo(
    () =>
      [...clients]
        .filter((c) => c.riskLevel !== "good")
        .sort((a, b) => (a.adherenceScore ?? 0) - (b.adherenceScore ?? 0))
        .slice(0, 4),
    [clients]
  );

  // Derive display name
  const coachFirstName =
    ((user?.user_metadata?.name as string | undefined) || user?.email || "Coach")
      .split(/[\s@]/)[0];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {greeting}, {coachFirstName} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Here's your client overview for today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { refresh(); loadAlerts(); }}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={15} />
            </button>
            <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
              Free Plan · {clients.length}/3 clients
            </span>
            <button
              onClick={() => navigate("/pricing")}
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full font-medium transition-colors"
            >
              Upgrade to Pro →
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={refresh}
            className="text-xs text-red-500 font-medium hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="px-8 py-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Clients"
              value={stats.total}
              icon={Users}
              color="bg-slate-700"
              sub="across all programs"
            />
            <StatCard
              label="Avg Adherence"
              value={`${stats.avg}%`}
              icon={Activity}
              color="bg-emerald-500"
              sub="last 30 days"
            />
            <StatCard
              label="At Risk"
              value={stats.atRisk}
              icon={AlertTriangle}
              color="bg-amber-500"
              sub="need attention"
            />
            <StatCard
              label="Critical"
              value={stats.critical}
              icon={XOctagon}
              color="bg-red-500"
              sub="immediate action"
            />
          </div>

          {/* Main Grid — chart + insights */}
          <div className="grid grid-cols-3 gap-6">
            {/* Chart — 2 cols */}
            <div className="col-span-3 lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Client Adherence Scores
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    30-day performance overview
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                    On Track (≥70)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                    At Risk
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />
                    Critical
                  </span>
                </div>
              </div>
              {clients.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Users size={36} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-sm text-slate-400">No clients yet</p>
                    <button
                      onClick={() => navigate("/clients")}
                      className="mt-2 text-xs text-emerald-600 font-medium hover:text-emerald-700"
                    >
                      Add your first client →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-64">
                  <AdherenceBarChart clients={clients} />
                </div>
              )}
            </div>

            {/* Insights — 1 col */}
            <div className="col-span-3 lg:col-span-1 bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-violet-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={13} className="text-violet-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">AI Insights</h2>
                <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium ml-auto">
                  {insights.length} alerts
                </span>
              </div>
              {insights.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400">
                    All clients on track — no alerts! ✅
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {insights.map((insight, i) => (
                    <InsightCard
                      key={i}
                      insight={insight}
                      onClientClick={(id) => navigate(`/clients/${id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Alerts Panel */}
          {!alertsLoading && (
            <AlertsPanel
              alerts={alerts}
              coachId={user?.id ?? ""}
              onAlertsChange={setAlerts}
            />
          )}

          {/* Client Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame size={16} className="text-emerald-500" />
                <h2 className="text-sm font-semibold text-slate-700">
                  Top Performers
                </h2>
              </div>
              {topClients.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <p className="text-sm text-slate-400">No clients yet</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {topClients.map((client) => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>
              )}
            </div>

            {/* Needs Attention */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-500" />
                <h2 className="text-sm font-semibold text-slate-700">
                  Needs Attention
                </h2>
              </div>
              {atRiskClients.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <p className="text-sm text-emerald-600 font-medium">
                    ✅ All clients on track!
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {atRiskClients.map((client) => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
