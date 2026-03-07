import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertTriangle, XOctagon, Activity, Flame, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useClients } from "../hooks/useClients";
import { getAlerts, getWorkoutsForCoach } from "../lib/api";
import { AdherenceBarChart } from "../components/Charts";
import ClientCard from "../components/ClientCard";
import InsightCard from "../components/InsightCard";
import AlertsPanel from "../components/AlertsPanel";
import type { Alert } from "../types";
import type { Client, Insight, Workout } from "../lib/types";

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
  return <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4"><div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={20} className="text-white" /></div><div><p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p><p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>{sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}</div></div>;
}

function LoadingSkeleton() {
  return <div className="animate-pulse space-y-6 px-8 py-6"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-24" />)}</div><div className="grid grid-cols-3 gap-6"><div className="col-span-2 bg-white rounded-2xl border border-slate-100 h-80" /><div className="bg-white rounded-2xl border border-slate-100 h-80" /></div></div>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clients, loading, error, refresh } = useClients(user?.id ?? "");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const loadAlerts = useCallback(async () => {
    if (!user?.id) return;
    setAlertsLoading(true);
    const result = await getAlerts(user.id);
    if (result.data) setAlerts(result.data);
    setAlertsLoading(false);
  }, [user?.id]);

  const loadWorkouts = useCallback(async () => {
    if (!user?.id) return;
    const result = await getWorkoutsForCoach(user.id);
    if (result.data) setWorkouts(result.data);
  }, [user?.id]);

  useEffect(() => { void loadAlerts(); void loadWorkouts(); }, [loadAlerts, loadWorkouts]);

  const adherenceByClient = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return clients.map((client) => {
      const w = workouts.filter((x) => x.client_id === client.id && new Date(x.date) >= cutoff);
      const total = w.length;
      const completed = w.filter((x) => x.status === "completed").length;
      const adherence = total > 0 ? Math.round((completed / total) * 100) : 0;
      const riskLevel = adherence < 50 ? "critical" : adherence < 70 ? "risk" : "good";
      return { ...client, adherenceScore: adherence, riskLevel } as Client;
    });
  }, [clients, workouts]);

  const stats = useMemo(() => {
    if (adherenceByClient.length === 0) return { total: 0, avg: 0, atRisk: 0, critical: 0 };
    const avg = Math.round(adherenceByClient.reduce((sum, c) => sum + (c.adherenceScore ?? 0), 0) / adherenceByClient.length);
    const atRisk = adherenceByClient.filter((c) => (c.adherenceScore ?? 0) < 70).length;
    const critical = adherenceByClient.filter((c) => (c.adherenceScore ?? 0) < 50).length;
    return { total: adherenceByClient.length, avg, atRisk, critical };
  }, [adherenceByClient]);

  const insights = useMemo<Insight[]>(() =>
    alerts.slice(0, 6).map((a) => ({
      type: a.type === "critical_adherence" ? "critical" : "warning",
      title: a.type === "critical_adherence" ? "Critical Alert" : "Coach Alert",
      message: a.message,
      client_id: a.client_id,
      client_name: a.client_name,
    })), [alerts]);

  const topClients = useMemo(() => [...adherenceByClient].sort((a, b) => (b.adherenceScore ?? 0) - (a.adherenceScore ?? 0)).slice(0, 4), [adherenceByClient]);
  const atRiskClients = useMemo(() => [...adherenceByClient].filter((c) => (c.adherenceScore ?? 0) < 70).sort((a, b) => (a.adherenceScore ?? 0) - (b.adherenceScore ?? 0)).slice(0, 4), [adherenceByClient]);

  const coachFirstName = ((user?.user_metadata?.name as string | undefined) || user?.email || "Coach").split(/[\s@]/)[0];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-8 py-5"><div className="flex items-center justify-between"><div><h1 className="text-xl font-bold text-slate-800">Hello, {coachFirstName} 👋</h1><p className="text-sm text-slate-400 mt-0.5">Here's your client overview for today</p></div><div className="flex items-center gap-2"><button onClick={() => { refresh(); void loadAlerts(); void loadWorkouts(); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors" title="Refresh data"><RefreshCw size={15} /></button></div></div></div>

      {error && <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-sm text-red-600">{error}</p></div>}

      {loading ? <LoadingSkeleton /> : (
        <div className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Clients" value={stats.total} icon={Users} color="bg-slate-700" sub="across all programs" />
            <StatCard label="Avg Adherence" value={`${stats.avg}%`} icon={Activity} color="bg-emerald-500" sub="last 30 days" />
            <StatCard label="At Risk" value={stats.atRisk} icon={AlertTriangle} color="bg-amber-500" sub="need attention" />
            <StatCard label="Critical" value={stats.critical} icon={XOctagon} color="bg-red-500" sub="immediate action" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3 lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5"><h2 className="text-sm font-semibold text-slate-800 mb-4">Client Adherence Scores</h2><div className="h-64"><AdherenceBarChart clients={adherenceByClient} /></div></div>
            <div className="col-span-3 lg:col-span-1 bg-white rounded-2xl border border-slate-100 p-5"><div className="flex items-center gap-2 mb-4"><h2 className="text-sm font-semibold text-slate-800">AI Insights</h2><span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium ml-auto">{insights.length} alerts</span></div>{insights.length === 0 ? <p className="text-xs text-slate-400">No alerts.</p> : <div className="space-y-2.5 max-h-64 overflow-y-auto">{insights.map((insight, i) => <InsightCard key={i} insight={insight} onClientClick={(id) => navigate(`/clients/${id}`)} />)}</div>}</div>
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
