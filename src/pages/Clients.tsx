import { useMemo, useState, useCallback, useEffect } from "react";
import { Search, Plus, SlidersHorizontal, Users, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useClients } from "../hooks/useClients";
import { createClient, createProgram, getPrograms, getCoachPlan, updateClientProgram } from "../lib/api";
import ClientCard from "../components/ClientCard";
import AddClientModal from "../components/AddClientModal";
import toast from "react-hot-toast";
import type { RiskLevel } from "../lib/types";
import type { Program } from "../lib/types";
import { SkeletonPage } from "../components/Skeleton";

const planBadgeStyles: Record<string, string> = {
  free: "bg-slate-200 text-slate-700",
  pro: "bg-emerald-100 text-emerald-700",
  business: "bg-purple-100 text-purple-700",
};

export default function Clients() {
  const { user } = useAuth();
  const { clients, loading, error, refresh } = useClients(user?.id ?? "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | RiskLevel>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "score" | "streak">("score");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [plan, setPlan] = useState<{ plan: string; max_clients: number }>({ plan: "free", max_clients: 5 });

  useEffect(() => {
    getCoachPlan().then((res) => {
      if (res.data) setPlan(res.data);
    });
  }, []);

  useEffect(() => {
    const loadPrograms = async () => {
      if (!showAddModal) return;
      const res = await getPrograms();
      if (res.data) setPrograms(res.data);
    };
    loadPrograms();
  }, [showAddModal]);

  const canAddClient = plan.max_clients === -1 || clients.length < plan.max_clients;

  const filtered = useMemo(() => clients.filter((c) => (c.name.toLowerCase().includes(search.toLowerCase()) || c.goal.toLowerCase().includes(search.toLowerCase())) && (filter === "all" || c.riskLevel === filter)).sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : sortBy === "score" ? (b.adherenceScore ?? 0) - (a.adherenceScore ?? 0) : (b.streak ?? 0) - (a.streak ?? 0)), [clients, search, filter, sortBy]);

  const counts = useMemo(() => ({ all: clients.length, good: clients.filter((c) => c.riskLevel === "good").length, risk: clients.filter((c) => c.riskLevel === "risk").length, critical: clients.filter((c) => c.riskLevel === "critical").length }), [clients]);

  const handleAddClient = useCallback(async (form: { name: string; email: string; goal: string; notes: string; experienceLevel: string; programName: string; programType: string; weeklyTarget: number; programId?: string; }) => {
    if (!user?.id) return;
    const toastId = toast.loading("Adding client...");
    const goalWithMeta = `${form.goal}${form.experienceLevel ? ` (${form.experienceLevel})` : ""}${form.notes ? ` - ${form.notes}` : ""}`;

    const clientResult = await createClient({ coach_id: user.id, name: form.name.trim(), goal: goalWithMeta, email: form.email.trim() || undefined } as Parameters<typeof createClient>[0]);
    if (clientResult.error || !clientResult.data) {
      toast.error(clientResult.error ?? "Failed to create client", { id: toastId });
      return;
    }

    if (form.programId) {
      const assignResult = await updateClientProgram(clientResult.data.id, form.programId);
      if (assignResult.error) toast.error("Client added but program assignment failed", { id: toastId });
      else toast.success(`${form.name} added successfully! 🎉`, { id: toastId });
    } else {
      const programResult = await createProgram({ coach_id: user.id, is_template: false, client_id: clientResult.data.id, name: form.programName.trim() || `${form.name}'s Program`, weekly_target: form.weeklyTarget, duration_weeks: 12, type: form.programType as Parameters<typeof createProgram>[0]["type"] });
      if (programResult.error || !programResult.data) toast.error("Client added but program creation failed", { id: toastId });
      else {
        await updateClientProgram(clientResult.data.id, programResult.data.id);
        toast.success(`${form.name} added successfully! 🎉`, { id: toastId });
      }
    }

    setShowAddModal(false);
    refresh();
  }, [user?.id, refresh]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-6">
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Clients</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage and track all your clients</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${planBadgeStyles[plan.plan] ?? planBadgeStyles.free}`}>{plan.plan}</span>
            <button onClick={refresh} className="w-11 h-11 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl flex items-center justify-center"><RefreshCw size={15} /></button>
            <button onClick={() => canAddClient && setShowAddModal(true)} disabled={!canAddClient} title={canAddClient ? "Add Client" : "Upgrade to add more clients"} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white px-4 min-h-11 rounded-xl text-sm font-medium">
              <Plus size={15} /> Add Client
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6">
        
        {!canAddClient && <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">Upgrade to add more clients.</div>}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative w-full sm:flex-1 min-w-[200px] sm:max-w-sm"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients..." className="w-full pl-9 pr-4 min-h-11 text-sm border border-slate-200 rounded-xl bg-white" /></div>
          <div className="w-full sm:w-auto overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {(["all", "good", "risk", "critical"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={`px-3 min-h-11 rounded-full text-xs font-medium border whitespace-nowrap ${filter === f ? "bg-slate-800 text-white" : "bg-white text-slate-500 border-slate-200"}`}>{f === "all" ? `All (${counts.all})` : f === "good" ? `On Track (${counts.good})` : f === "risk" ? `At Risk (${counts.risk})` : `Critical (${counts.critical})`}</button>)}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-0 sm:ml-auto w-full sm:w-auto"><SlidersHorizontal size={14} className="text-slate-400" /><select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="text-xs border border-slate-200 rounded-lg px-2 min-h-11 bg-white text-slate-600 w-full sm:w-auto"><option value="score">Sort by Score</option><option value="name">Sort by Name</option><option value="streak">Sort by Streak</option></select></div>
        </div>

        {error ? <div className="m-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between"><p className="text-red-400 text-sm">Failed to load data.</p><button onClick={() => window.location.reload()} className="text-red-400 text-sm underline hover:text-red-300">Try again</button></div> : loading ? <SkeletonPage /> : filtered.length === 0 ? <div className="text-center py-16"><Users size={40} className="mx-auto text-slate-200 mb-3" /><p className="text-slate-400 text-sm">{clients.length === 0 ? "No clients yet" : "No clients match your filters"}</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filtered.map((client) => <ClientCard key={client.id} client={client} />)}</div>}
      </div>

      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} onSubmit={handleAddClient} programs={programs} />}
    </div>
  );
}
