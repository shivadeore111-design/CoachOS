import { useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getClients, getWorkoutsForCoach } from "../lib/api";
import { AdherenceBarChart } from "../components/Charts";
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
    setWorkouts(wRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, [user?.id]);

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

  const perClient = useMemo(() => clients.map((c) => {
    const cWorkouts = workouts.filter((w) => w.client_id === c.id);
    const total = cWorkouts.length;
    const completed = cWorkouts.filter((w) => w.status === "completed").length;
    const adherenceScore = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { ...c, adherenceScore };
  }), [clients, workouts]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
            <p className="text-sm text-slate-400 mt-0.5">Deep dive into your coaching performance</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><RefreshCw size={15} /></button>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"><Calendar size={13} />Last 8 weeks</div>
          </div>
        </div>
      </div>

      {error && <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3"><p className="text-sm text-red-600">{error}</p></div>}

      {loading ? <div className="p-8 text-sm text-slate-400">Loading analytics...</div> : (
        <div className="px-8 py-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4"><BarChart3 size={15} className="text-emerald-500" /><h2 className="text-sm font-semibold text-slate-800">Weekly completion trend (8 weeks)</h2></div>
            <div className="grid grid-cols-8 gap-2">
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

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Per-client breakdown</h2>
            <div className="h-64"><AdherenceBarChart clients={perClient} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
