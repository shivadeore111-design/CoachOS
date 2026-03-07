import { useMemo, useState, useCallback, useEffect } from "react";
import { Search, Plus, SlidersHorizontal, Users, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useClients } from "../hooks/useClients";
import { createClient, createProgram, getPrograms, updateClientProgram } from "../lib/api";
import ClientCard from "../components/ClientCard";
import AddClientModal from "../components/AddClientModal";
import toast from "react-hot-toast";
import type { RiskLevel } from "../lib/types";
import type { Program } from "../lib/types";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 bg-slate-100 rounded-xl" />
        <div className="flex-1">
          <div className="h-3.5 bg-slate-100 rounded w-2/3 mb-2" />
          <div className="h-2.5 bg-slate-100 rounded w-full" />
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full mb-3" />
      <div className="flex gap-2">
        <div className="h-6 bg-slate-100 rounded-full w-16" />
        <div className="h-6 bg-slate-100 rounded-full w-12" />
      </div>
    </div>
  );
}

export default function Clients() {
  const { user } = useAuth();
  const { clients, loading, error, refresh } = useClients(user?.id ?? "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | RiskLevel>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "score" | "streak">("score");
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const loadPrograms = async () => {
      if (!showAddModal) return;
      const res = await getPrograms();
      if (res.data) setPrograms(res.data);
    };
    loadPrograms();
  }, [showAddModal]);

  const filtered = useMemo(() => {
    return clients
      .filter((c) => {
        const matchSearch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.goal.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || c.riskLevel === filter;
        return matchSearch && matchFilter;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "score") return (b.adherenceScore ?? 0) - (a.adherenceScore ?? 0);
        if (sortBy === "streak") return (b.streak ?? 0) - (a.streak ?? 0);
        return 0;
      });
  }, [clients, search, filter, sortBy]);

  const counts = useMemo(
    () => ({
      all: clients.length,
      good: clients.filter((c) => c.riskLevel === "good").length,
      risk: clients.filter((c) => c.riskLevel === "risk").length,
      critical: clients.filter((c) => c.riskLevel === "critical").length,
    }),
    [clients]
  );

  const handleAddClient = useCallback(
    async (form: {
      name: string;
      email: string;
      goal: string;
      programName: string;
      programType: string;
      weeklyTarget: number;
      programId?: string;
    }) => {
      if (!user?.id) return;

      const toastId = toast.loading("Adding client...");

      // 1. Create client
      const clientResult = await createClient({
        coach_id: user.id,
        name: form.name.trim(),
        goal: form.goal.trim(),
        email: form.email.trim() || undefined,
      } as Parameters<typeof createClient>[0]);

      if (clientResult.error || !clientResult.data) {
        toast.error(clientResult.error ?? "Failed to create client", { id: toastId });
        return;
      }

      if (form.programId) {
        const assignResult = await updateClientProgram(clientResult.data.id, form.programId);
        if (assignResult.error) {
          toast.error("Client added but program assignment failed", { id: toastId });
        } else {
          toast.success(`${form.name} added successfully! 🎉`, { id: toastId });
        }
      } else {
        // 2. Create a fresh program for the client if none was selected
        const programResult = await createProgram({
          coach_id: user.id,
          is_template: false,
          client_id: clientResult.data.id,
          name: form.programName.trim() || `${form.name}'s Program`,
          weekly_target: form.weeklyTarget,
          duration_weeks: 12,
          type: form.programType as Parameters<typeof createProgram>[0]["type"],
        });

        if (programResult.error || !programResult.data) {
          toast.error("Client added but program creation failed", { id: toastId });
        } else {
          await updateClientProgram(clientResult.data.id, programResult.data.id);
          toast.success(`${form.name} added successfully! 🎉`, { id: toastId });
        }
      }

      setShowAddModal(false);
      refresh();
    },
    [user?.id, refresh]
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Clients</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage and track all your clients
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={15} />
              Add Client
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Error banner */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={refresh}
              className="text-xs text-red-500 font-medium hover:text-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filters bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>

          {/* Risk filter pills */}
          {(["all", "good", "risk", "critical"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === f
                  ? f === "all"
                    ? "bg-slate-800 text-white border-slate-800"
                    : f === "good"
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : f === "risk"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-red-500 text-white border-red-500"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              {f === "all"
                ? `All (${counts.all})`
                : f === "good"
                ? `On Track (${counts.good})`
                : f === "risk"
                ? `At Risk (${counts.risk})`
                : `Critical (${counts.critical})`}
            </button>
          ))}

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none"
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="streak">Sort by Streak</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">
              {clients.length === 0 ? "No clients yet" : "No clients match your filters"}
            </p>
            {clients.length === 0 ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-emerald-600 text-sm font-medium hover:text-emerald-700"
              >
                Add your first client →
              </button>
            ) : (
              <p className="text-slate-300 text-xs mt-1">
                Try adjusting your filters
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddClient}
          programs={programs}
        />
      )}
    </div>
  );
}
