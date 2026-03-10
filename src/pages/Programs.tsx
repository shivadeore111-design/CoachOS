import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Plus, Users, Target, Clock, ChevronRight, Zap, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  createProgram,
  createTemplateProgram,
  getActiveClientPrograms,
  getPrograms,
  updateClientProgram,
  getClients,
} from "../lib/api";
import { getProgramTypeColor } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { Program, ProgramType } from "../lib/types";
import { SkeletonPage } from "../components/Skeleton";

type ActiveProgram = Program & { client: { id: string; name: string; goal: string } | null };

export default function Programs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePrograms, setActivePrograms] = useState<ActiveProgram[]>([]);
  const [templates, setTemplates] = useState<Program[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [templateToAssign, setTemplateToAssign] = useState<Program | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [assigningTemplate, setAssigningTemplate] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    const [activeRes, programsRes, clientsRes] = await Promise.all([
      getActiveClientPrograms(),
      getPrograms(),
      getClients(user.id),
    ]);

    if (activeRes.error || programsRes.error || clientsRes.error) {
      setError(activeRes.error || programsRes.error || clientsRes.error || "Failed to load programs");
    }

    setActivePrograms(activeRes.data ?? []);
    const allPrograms = programsRes.data ?? [];
    const templateNames = [
      "Strength Builder",
      "Fat Loss Accelerator",
      "Athletic Performance",
      "Mobility & Recovery",
    ];
    setTemplates(
      allPrograms.filter(
        (p) => p.is_template && templateNames.includes(p.name)
      )
    );
    setClients((clientsRes.data ?? []).map((c) => ({ id: c.id, name: c.name })));
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [user?.id]);

  const programStats = useMemo(() => {
    const byType: Record<string, { count: number; avgAdherence: number }> = {};
    activePrograms.forEach((p) => {
      const t = p.type;
      if (!byType[t]) byType[t] = { count: 0, avgAdherence: 0 };
      byType[t].count++;
    });
    return byType;
  }, [activePrograms]);

  const handleUseTemplate = (template: Program) => {
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
      coach_id: user?.id,
      is_template: false,
      client_id: selectedClientId,
      name: templateToAssign.name,
      type: templateToAssign.type,
      weekly_target: templateToAssign.weekly_target,
      duration_weeks: templateToAssign.duration_weeks,
      description: templateToAssign.description,
      exercises: templateToAssign.exercises,
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
    await loadData();
    toast.success(`Assigned ${templateToAssign.name} successfully`);
  };

  const handleCreateTemplate = async () => {
    const result = await createTemplateProgram({
      name: "New Template Program",
      type: "custom" as ProgramType,
      weekly_target: 3,
      duration_weeks: 8,
    });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Template program created");
    await loadData();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-6">
      <div className="bg-white border-b border-slate-100 px-4 sm:px-8 sm:px-6 py-5">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Programs</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage training programs and templates</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button onClick={loadData} className="w-full sm:w-11 h-11 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center">
              <RefreshCw size={15} />
            </button>
            <button
              onClick={handleCreateTemplate}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 min-h-11 rounded-xl text-sm font-medium transition-colors shadow-sm w-full sm:w-auto"
            >
              <Plus size={15} />
              New Program
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 sm:px-6 py-6 space-y-8">
        {error && <div className="m-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between"><p className="text-red-400 text-sm">Failed to load data.</p><button onClick={() => window.location.reload()} className="text-red-400 text-sm underline hover:text-red-300">Try again</button></div>}

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell size={16} className="text-emerald-500" />
            <h2 className="text-sm font-semibold text-slate-700">Active Client Programs</h2>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">{activePrograms.length}</span>
          </div>

          {loading ? <SkeletonPage /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePrograms.map((prog) => (
                <div key={prog.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group" onClick={() => prog.client && navigate(`/clients/${prog.client.id}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getProgramTypeColor(prog.type)}`}>
                      {prog.type.replace("_", " ")}
                    </span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-0.5">{prog.name}</h3>
                  <p className="text-xs text-slate-400 mb-3">{prog.client?.name ?? "Unassigned"}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-50 rounded-lg p-2"><div className="flex items-center gap-1 mb-0.5"><Target size={10} className="text-slate-400" /><p className="text-xs text-slate-400">Weekly</p></div><p className="text-sm font-bold text-slate-700">{prog.weekly_target}x</p></div>
                    <div className="bg-slate-50 rounded-lg p-2"><div className="flex items-center gap-1 mb-0.5"><Clock size={10} className="text-slate-400" /><p className="text-xs text-slate-400">Duration</p></div><p className="text-sm font-bold text-slate-700">{prog.duration_weeks}w</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {Object.keys(programStats).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-slate-700">Performance by Program Type</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(programStats).map(([type, stats]) => (
                <div key={type} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getProgramTypeColor(type as ProgramType)}`}>{type.replace("_", " ")}</span>
                  <div className="mt-3"><p className="text-2xl font-bold text-slate-800">{stats.count}</p><p className="text-xs text-slate-400">active programs</p></div>
                  <div className="flex items-center gap-1 mt-2"><Users size={11} className="text-slate-300" /><p className="text-xs text-slate-400">{stats.count} client{stats.count > 1 ? "s" : ""}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-violet-500" />
            <h2 className="text-sm font-semibold text-slate-700">Program Templates</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div key={template.id} className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${activeTemplate === template.id ? "border-emerald-400 shadow-md shadow-emerald-500/10" : "border-slate-100 hover:border-slate-200 hover:shadow-sm"}`} onClick={() => setActiveTemplate(activeTemplate === template.id ? null : template.id)}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getProgramTypeColor(template.type)}`}>{template.type.replace("_", " ")}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{template.name}</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{template.description || "Template program"}</p>
                <button className={`w-full mt-4 min-h-11 rounded-xl text-xs font-medium transition-all ${activeTemplate === template.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"}`} onClick={(e) => { e.stopPropagation(); handleUseTemplate(template); }}>
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
            <h3 className="text-lg font-semibold text-slate-800">Assign {templateToAssign.name} to a client</h3>
            <p className="text-sm text-slate-500 mt-1">Choose a client to immediately apply this template.</p>
            <label className="block text-sm text-slate-600 mt-5 mb-2">Client</label>
            <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="" disabled>Select a client</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => { if (assigningTemplate) return; setTemplateToAssign(null); setSelectedClientId(""); }} className="px-4 min-h-11 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleConfirmTemplateAssignment} disabled={assigningTemplate || !selectedClientId} className="px-4 min-h-11 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{assigningTemplate ? "Assigning..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
