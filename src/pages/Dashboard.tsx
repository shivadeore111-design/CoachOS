import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertTriangle, XOctagon, Activity, Flame, RefreshCw, TrendingDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useClients } from "../hooks/useClients";
import { getAlerts } from "../lib/api";
import { AdherenceBarChart } from "../components/Charts";
import ClientCard from "../components/ClientCard";
import InsightCard from "../components/InsightCard";
import AlertsPanel from "../components/AlertsPanel";
import { rankByDropoutRisk } from "../lib/riskEngine";
import { generateInsights } from "../lib/insights";
import type { Alert } from "../types";
import type { Insight } from "../lib/types";
import { SkeletonPage } from "../components/Skeleton";
import { usePreload } from "../hooks/usePreload";

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
  return <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4"><div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={20} className="text-white" /></div><div><p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p><p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>{sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}</div></div>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  usePreload();
  const { user } = useAuth();
  const { clients, loading, error, refresh } = useClients(user?.id ?? "");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    if (!user?.id) return;
    setAlertsLoading(true);
    const result = await getAlerts(user.id);
    if (result.data) setAlerts(result.data);
    setAlertsLoading(false);
  }, [user?.id]);

  useEffect(() => { void loadAlerts(); }, [loadAlerts]);

  const stats = useMemo(() => {
    if (clients.length === 0) return { total: 0, avg: 0, atRisk: 0, critical: 0 };
    const avg = Math.round(clients.reduce((sum, c) => sum + (c.adherenceScore ?? 0), 0) / clients.length);
    const atRisk = clients.filter((c) => c.riskLevel !== "good").length;
    const critical = clients.filter((c) => c.riskLevel === "critical").length;
    return { total: clients.length, avg, atRisk, critical };
  }, [clients]);

  const topClients = useMemo(() => [...clients].sort((a, b) => (b.adherenceScore ?? 0) - (a.adherenceScore ?? 0)).slice(0, 4), [clients]);
  const atRiskClients = useMemo(() => [...clients].filter((c) => c.riskLevel !== "good").sort((a, b) => (a.adherenceScore ?? 0) - (b.adherenceScore ?? 0)).slice(0, 4), [clients]);

  const weeklySnapshot = useMemo(() => {
    const decliningClients = clients.filter((c) => c.momentum === "declining").length;
    const topPerformer = [...clients].sort((a, b) => (b.adherenceScore ?? 0) - (a.adherenceScore ?? 0))[0];
    const longestStreak = [...clients].sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0))[0];
    return { decliningClients, topPerformer, longestStreak };
  }, [clients]);

  const riskRadar = useMemo(() => {
    const ranked = rankByDropoutRisk(clients);
    return {
      high: ranked.filter((r) => r.level === "critical").slice(0, 5),
      medium: ranked.filter((r) => r.level === "risk").slice(0, 5),
      low: ranked.filter((r) => r.level === "good").slice(0, 5),
    };
  }, [clients]);

  const aiInsights = useMemo<Insight[]>(
    () => generateInsights(clients).map((item) => ({
      type: item.type,
      title: item.title,
      message: item.message,
      client_id: item.client_id,
      client_name: item.client_name,
    })),
    [clients]
  );

  const coachFirstName = ((user?.user_metadata?.name as string | undefined) || user?.email || "Coach").split(/[\s@]/)[0];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-6">
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 py-5"><div className="flex items-center justify-between"><div><h1 className="text-lg sm:text-xl font-bold text-slate-800">Hello, {coachFirstName} 👋</h1><p className="text-sm text-slate-400 mt-0.5">Here's your client overview for today</p></div><div className="flex items-center gap-2"><button onClick={() => { refresh(); void loadAlerts(); }} className="w-11 h-11 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center" title="Refresh data"><RefreshCw size={15} /></button></div></div></div>

      {error ? <div className="m-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between"><p className="text-red-400 text-sm">Failed to load data.</p><button onClick={() => window.location.reload()} className="text-red-400 text-sm underline hover:text-red-300">Try again</button></div> : loading ? <SkeletonPage /> : (
        <div className="px-4 sm:px-8 py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Clients" value={stats.total} icon={Users} color="bg-slate-700" sub="across all programs" />
            <StatCard label="Avg Adherence" value={`${stats.avg}%`} icon={Activity} color="bg-emerald-500" sub="last 30 days" />
            <StatCard label="At Risk" value={stats.atRisk} icon={AlertTriangle} color="bg-amber-500" sub="need attention" />
            <StatCard label="Critical" value={stats.critical} icon={XOctagon} color="bg-red-500" sub="immediate action" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4"><TrendingDown size={16} className="text-indigo-500" /><h2 className="text-sm font-semibold text-slate-800">This Week's Snapshot</h2></div>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-3 flex-1 min-w-[180px]"><p className="text-slate-500">Declining clients</p><p className="text-xl font-bold text-red-500">{weeklySnapshot.decliningClients}</p></div>
              <div className="bg-slate-50 rounded-xl p-3 flex-1 min-w-[180px]"><p className="text-slate-500">Top performer</p><p className="text-xl font-bold text-emerald-600">{weeklySnapshot.topPerformer?.name ?? "—"}</p><p className="text-xs text-slate-500">{weeklySnapshot.topPerformer ? `${weeklySnapshot.topPerformer.adherenceScore ?? 0}% adherence` : "No data"}</p></div>
              <div className="bg-slate-50 rounded-xl p-3 flex-1 min-w-[180px]"><p className="text-slate-500">Longest streak</p><p className="text-xl font-bold text-orange-500">{weeklySnapshot.longestStreak?.name ?? "—"}</p><p className="text-xs text-slate-500">{weeklySnapshot.longestStreak ? `${weeklySnapshot.longestStreak.streak ?? 0} days` : "No data"}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3 lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5"><h2 className="text-sm font-semibold text-slate-800 mb-4">Client Adherence Scores</h2><div className="h-[200px] sm:h-64"><AdherenceBarChart clients={clients} /></div></div>
            <div className="col-span-3 lg:col-span-1 bg-white rounded-2xl border border-slate-100 p-5"><div className="flex items-center gap-2 mb-4"><h2 className="text-sm font-semibold text-slate-800">AI Insights</h2><span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium ml-auto">{aiInsights.length} alerts</span></div>{aiInsights.length === 0 ? <p className="text-xs text-slate-400">No alerts.</p> : <div className="space-y-2.5 max-h-64 overflow-y-auto">{aiInsights.map((insight, i) => <InsightCard key={i} insight={insight} onClientClick={(id) => navigate(`/clients/${id}`)} />)}</div>}</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4"><AlertTriangle size={16} className="text-rose-500" /><h2 className="text-sm font-semibold text-slate-800">Risk Radar</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-3"><p className="text-xs font-semibold text-red-700 mb-2">High Risk (immediate action)</p>{riskRadar.high.length === 0 ? <p className="text-xs text-red-500">No high-risk clients</p> : riskRadar.high.map((item) => <p key={item.client_id} className="text-sm text-red-700">{item.client_name} ({item.score})</p>)}</div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-semibold text-amber-700 mb-2">Medium Risk (monitor)</p>{riskRadar.medium.length === 0 ? <p className="text-xs text-amber-500">No medium-risk clients</p> : riskRadar.medium.map((item) => <p key={item.client_id} className="text-sm text-amber-700">{item.client_name} ({item.score})</p>)}</div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs font-semibold text-emerald-700 mb-2">Low Risk (on track)</p>{riskRadar.low.length === 0 ? <p className="text-xs text-emerald-500">No low-risk clients</p> : riskRadar.low.map((item) => <p key={item.client_id} className="text-sm text-emerald-700">{item.client_name} ({item.score})</p>)}</div>
            </div>
          </div>

          {!alertsLoading && <AlertsPanel alerts={alerts} coachId={user?.id ?? ""} onAlertsChange={setAlerts} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><div className="flex items-center gap-2 mb-3"><Flame size={16} className="text-emerald-500" /><h2 className="text-sm font-semibold text-slate-700">Top Performers</h2></div><div className="grid gap-3">{topClients.map((client) => <ClientCard key={client.id} client={client} />)}</div></div>
            <div><div className="flex items-center gap-2 mb-3"><AlertTriangle size={16} className="text-amber-500" /><h2 className="text-sm font-semibold text-slate-700">Needs Attention</h2></div><div className="grid gap-3">{atRiskClients.map((client) => <ClientCard key={client.id} client={client} />)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
