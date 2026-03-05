import { useState, useMemo } from "react";
import { Dumbbell, Plus, Users, Target, Clock, ChevronRight, Zap, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useClients } from "../hooks/useClients";
import { createProgram, updateClientProgram } from "../lib/api";
import { getProgramTypeColor } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { ProgramType } from "../lib/types";

const programTemplates = [
  {
    id: "t-1",
    name: "Strength Builder",
    type: "strength" as ProgramType,
    weekly_target: 4,
    duration_weeks: 12,
    description: "Progressive overload program focused on compound movements.",
    exercises: ["Squat", "Deadlift", "Bench Press", "Overhead Press"],
  },
  {
    id: "t-2",
    name: "Fat Loss Accelerator",
    type: "fat_loss" as ProgramType,
    weekly_target: 5,
    duration_weeks: 8,
    description: "High-frequency training with cardio to maximize fat loss.",
    exercises: ["HIIT Circuits", "Metabolic Conditioning", "Steady State Cardio"],
  },
  {
    id: "t-3",
    name: "Athletic Performance",
    type: "athletic" as ProgramType,
    weekly_target: 6,
    duration_weeks: 16,
    description: "Sport-specific training for peak athletic performance.",
    exercises: ["Plyometrics", "Speed Work", "Agility Drills", "Power Training"],
  },
  {
    id: "t-4",
    name: "Mobility & Recovery",
    type: "mobility" as ProgramType,
    weekly_target: 3,
    duration_weeks: 6,
    description: "Improve flexibility, reduce pain, and enhance movement quality.",
    exercises: ["Yoga Flow", "Foam Rolling", "Stretching Sequences", "Breathwork"],
  },
];

function LoadingSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 h-48" />
      ))}
    </div>
  );
}

export default function Programs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clients, loading, error, refresh } = useClients(user?.id ?? "");
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [templateToAssign, setTemplateToAssign] = useState<(typeof programTemplates)[0] | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [assigningTemplate, setAssigningTemplate] = useState(false);

  const clientsWithPrograms = useMemo(
    () => clients.filter((c) => c.program),
    [clients]
  );

  const programStats = useMemo(() => {
    const byType: Record<
      string,
      { count: number; avgAdherence: number; clients: typeof clients }
    > = {};
    clients.forEach((c) => {
      if (!c.program) return;
      const t = c.program.type;
      if (!byType[t]) byType[t] = { count: 0, avgAdherence: 0, clients: [] };
      byType[t].count++;
      byType[t].avgAdherence += c.adherenceScore ?? 0;
      byType[t].clients.push(c);
    });
    Object.keys(byType).forEach((k) => {
      byType[k].avgAdherence = Math.round(byType[k].avgAdherence / byType[k].count);
    });
    return byType;
  }, [clients]);

  const handleUseTemplate = (template: (typeof programTemplates)[0]) => {
    setTemplateToAssign(template);
    setSelectedClientId(clients[0]?.id ?? "");
  };

  const handleConfirmTemplateAssignment = async () => {
    if (!templateToAssign || !selectedClientId) {
      toast.error("Select a client to continue");
      return;
    }

    setAssigningTemplate(true);

    const createdProgram = await createProgram({
      client_id: selectedClientId,
      name: templateToAssign.name,
      type: templateToAssign.type,
      weekly_target: templateToAssign.weekly_target,
      duration_weeks: templateToAssign.duration_weeks,
    });

    if (createdProgram.error || !createdProgram.data) {
      toast.error("Failed to create program from template");
      setAssigningTemplate(false);
      return;
    }

    const result = await updateClientProgram(selectedClientId, createdProgram.data.id);

    if (result.error) {
      toast.error("Failed to assign template");
      setAssigningTemplate(false);
      return;
    }

    setAssigningTemplate(false);
    setTemplateToAssign(null);
    setSelectedClientId("");
    refresh();
    toast.success(`Assigned ${templateToAssign.name} successfully`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Programs</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage training programs and templates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => navigate("/clients")}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={15} />
              New Program
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Active Programs Grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={16} className="text-emerald-500" />
            <h2 className="text-sm font-semibold text-slate-700">Active Client Programs</h2>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">
              {clientsWithPrograms.length}
            </span>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : clientsWithPrograms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <Dumbbell size={36} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">No programs yet</p>
              <p className="text-xs text-slate-300 mt-1">
                Add clients and assign programs from their profiles
              </p>
              <button
                onClick={() => navigate("/clients")}
                className="mt-4 text-xs text-emerald-600 font-medium hover:text-emerald-700"
              >
                Go to Clients →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientsWithPrograms.map((client) => {
                const prog = client.program!;
                const score = client.adherenceScore ?? 0;
                const scoreColor =
                  score >= 70
                    ? "text-emerald-600"
                    : score >= 40
                    ? "text-amber-600"
                    : "text-red-500";
                const barColor =
                  score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";

                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${getProgramTypeColor(
                          prog.type
                        )}`}
                      >
                        {prog.type.replace("_", " ")}
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-slate-300 group-hover:text-emerald-500 transition-colors"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-0.5 group-hover:text-emerald-600 transition-colors">
                      {prog.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">{client.name}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Target size={10} className="text-slate-400" />
                          <p className="text-xs text-slate-400">Weekly</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">{prog.weekly_target}x</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Clock size={10} className="text-slate-400" />
                          <p className="text-xs text-slate-400">Duration</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          {prog.duration_weeks}w
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-400">Adherence</span>
                        <span className={`text-xs font-bold ${scoreColor}`}>{score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${barColor}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Performance by Program Type */}
        {Object.keys(programStats).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-700">
                Performance by Program Type
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(programStats).map(([type, stats]) => {
                const scoreColor =
                  stats.avgAdherence >= 70
                    ? "text-emerald-600"
                    : stats.avgAdherence >= 40
                    ? "text-amber-600"
                    : "text-red-500";
                const barColor =
                  stats.avgAdherence >= 70
                    ? "bg-emerald-500"
                    : stats.avgAdherence >= 40
                    ? "bg-amber-500"
                    : "bg-red-500";
                return (
                  <div key={type} className="bg-white rounded-2xl border border-slate-100 p-4">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${getProgramTypeColor(
                        type as ProgramType
                      )}`}
                    >
                      {type.replace("_", " ")}
                    </span>
                    <div className="mt-3">
                      <p className={`text-2xl font-bold ${scoreColor}`}>
                        {stats.avgAdherence}%
                      </p>
                      <p className="text-xs text-slate-400">avg adherence</p>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Users size={11} className="text-slate-300" />
                      <p className="text-xs text-slate-400">
                        {stats.count} client{stats.count > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1 mt-3">
                      <div
                        className={`h-1 rounded-full ${barColor}`}
                        style={{ width: `${stats.avgAdherence}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Program Templates */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-violet-500" />
            <h2 className="text-sm font-semibold text-slate-700">Program Templates</h2>
            <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium ml-1">
              Quickstart
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {programTemplates.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                  activeTemplate === template.id
                    ? "border-emerald-400 shadow-md shadow-emerald-500/10"
                    : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
                }`}
                onClick={() =>
                  setActiveTemplate(activeTemplate === template.id ? null : template.id)
                }
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${getProgramTypeColor(
                      template.type
                    )}`}
                  >
                    {template.type.replace("_", " ")}
                  </span>
                  {activeTemplate === template.id && (
                    <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{template.name}</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  {template.description}
                </p>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
                    <p className="text-xs font-bold text-slate-700">{template.weekly_target}x</p>
                    <p className="text-xs text-slate-400" style={{ fontSize: "10px" }}>
                      per week
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-2 py-1.5 text-center">
                    <p className="text-xs font-bold text-slate-700">
                      {template.duration_weeks}w
                    </p>
                    <p className="text-xs text-slate-400" style={{ fontSize: "10px" }}>
                      duration
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  {template.exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-xs text-slate-500">{ex}</span>
                    </div>
                  ))}
                  {template.exercises.length > 3 && (
                    <p className="text-xs text-slate-300 pl-3">
                      +{template.exercises.length - 3} more
                    </p>
                  )}
                </div>
                <button
                  className={`w-full mt-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeTemplate === template.id
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(template);
                  }}
                >
                  {activeTemplate === template.id ? "✓ Selected" : "Use Template"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
        {templateToAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-slate-800">
                Assign {templateToAssign.name} to a client
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Choose a client to immediately apply this template.
              </p>

              <label className="block text-sm text-slate-600 mt-5 mb-2">Client</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="" disabled>
                  Select a client
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => {
                    if (assigningTemplate) return;
                    setTemplateToAssign(null);
                    setSelectedClientId("");
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmTemplateAssignment}
                  disabled={assigningTemplate || !selectedClientId}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {assigningTemplate ? "Assigning..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
