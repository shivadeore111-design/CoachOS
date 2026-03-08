import { useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, RefreshCw, Trophy, TriangleAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getClients, getWorkoutsForCoach } from "../lib/api";
import { AdherenceBarChart, AdherenceTrendChart } from "../components/Charts";
import { calculateAdherence, getWeeklyAdherenceData } from "../lib/adherence";
import type { Client, Workout } from "../lib/types";

export default function Analytics() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    const [cRes, wRes] = await Promise.all([getClients(user.id), getWorkoutsForCoach(user.id)]);
    if (cRes.error || wRes.error) setError(cRes.error || wRes.error || "Failed to load analytics");
    setClients(cRes.data ?? []);
    setWorkouts((wRes.data ?? []) as Workout[]);
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, [user?.id]);

  const enrichedClients = useMemo(() => clients.map((c) => {
    const cWorkouts = workouts.filter((w) => w.client_id === c.id);
    const weeklyTarget = c.program?.weekly_target ?? 3;
    const adherenceScore = calculateAdherence(cWorkouts, weeklyTarget * 4, 30);
    const completed = cWorkouts.filter((w) => w.status === "completed").length;
    const missed = cWorkouts.filter((w) => w.status === "missed").length;
    return { ...c, workouts: cWorkouts, adherenceScore, completed, missed };
  }), [clients, workouts]);

  const weeklyTrend = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const start = new Date();
      start.setDate(start.getDate() - ((7 - i) * 7));
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const weekWorkouts = workouts.filter((w) => {
        const d = new Date(w.date);
        return d >= start && d <= end;
      });
      const total = weekWorkouts.length;
      const completed = weekWorkouts.filter((w) => w.status === "completed").length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { label: `W${i + 1}`, pct, total, completed };
    });
  }, [workouts]);

  const topPerformer = useMemo(() => [...enrichedClients].sort((a, b) => (b.adherenceScore ?? 0) - (a.adherenceScore ?? 0))[0], [enrichedClients]);
  const interventionList = useMemo(() => [...enrichedClients].filter((c) => (c.adherenceScore ?? 0) < 70).sort((a, b) => (a.adherenceScore ?? 0) - (b.adherenceScore ?? 0)), [enrichedClients]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-6">
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Analytics</h1>
            <p className="text-sm text-slate-400 mt-0.5">Deep dive into your coaching performance</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button onClick={refresh} className="w-11 h-11 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center"><RefreshCw size={15} /></button>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"><Calendar size={13} />Last 8 weeks</div>
          </div>
        </div>
      </div>

      {error && <div className="mx-4 sm:mx-8 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-sm text-red-600">{error}</p></div>}

      {loading ? <div className="p-4 sm:p-8 text-sm text-slate-400">Loading analytics...</div> : (
        <div className="px-4 sm:px-8 py-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4"><BarChart3 size={15} className="text-emerald-500" /><h2 className="text-sm font-semibold text-slate-800">Weekly completion trend (8 weeks)</h2></div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {weeklyTrend.map((w) => (
                <div key={w.label} className="text-center">
                  <div className="w-full bg-slate-100 rounded h-24 relative overflow-hidden">
                    <div className="bg-emerald-500 absolute bottom-0 left-0 right-0" style={{ height: `${w.pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{w.label}</p>
                  <p className="text-xs font-medium text-slate-700">{w.pct}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Workout Breakdown</h2>
              <div className="space-y-3">
                {enrichedClients.map((client) => {
                  const total = client.completed + client.missed;
                  const completedPct = total > 0 ? Math.round((client.completed / total) * 100) : 0;
                  return (
                    <div key={client.id}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{client.name}</span><span className="text-slate-500">{client.completed} completed / {client.missed} missed</span></div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${completedPct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4"><Trophy size={15} className="text-amber-500" /><h2 className="text-sm font-semibold text-slate-800">Top Performer</h2></div>
              {!topPerformer ? <p className="text-sm text-slate-400">No data yet.</p> : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-700">{topPerformer.name}</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{topPerformer.adherenceScore}%</p>
                  <p className="text-xs text-emerald-700 mt-1">{topPerformer.goal}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Per-client breakdown</h2>
            <div className="h-[200px] sm:h-64"><AdherenceBarChart clients={enrichedClients} /></div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Individual 8-week trend charts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-x-auto">
              {enrichedClients.map((client) => {
                const weeklyData = getWeeklyAdherenceData(client.workouts ?? [], client.program?.weekly_target ?? 3, 8);
                return (
                  <div key={client.id} className="rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-700">{client.name}</p>
                      <p className="text-xs text-slate-500">{weeklyData.length} weeks</p>
                    </div>
                    <div className="h-[200px] sm:h-48"><AdherenceTrendChart client={client} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4"><TriangleAlert size={15} className="text-rose-500" /><h2 className="text-sm font-semibold text-slate-800">Intervention Priority List</h2></div>
            {interventionList.length === 0 ? <p className="text-sm text-slate-400">No at-risk clients right now.</p> : (
              <div className="space-y-2">
                {interventionList.map((client, idx) => (
                  <div key={client.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                    <p className="text-sm text-slate-700">#{idx + 1} {client.name}</p>
                    <p className="text-sm font-semibold text-rose-600">{client.adherenceScore}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
