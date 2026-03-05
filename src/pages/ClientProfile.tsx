import { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Plus,
  Share2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getClientById,
  getWorkouts,
  getPrograms,
  logWorkout,
  updateClientProgram,
} from "../lib/api";
import {
  getAdherenceFromWorkouts,
  calculateStreak,
  getMomentumTrend,
  getRiskLevel,
  getWeeklyAdherenceData,
} from "../lib/adherence";
import { createAlert } from "../lib/api";
import type { Client, Workout, Program, WorkoutStatus } from "../lib/types";
import AdherenceScore from "../components/AdherenceScore";
import RiskBadge from "../components/RiskBadge";
import WorkoutLog from "../components/WorkoutLog";
import { AdherenceTrendChart } from "../components/Charts";
import { getProgramTypeColor, getMomentumIcon, formatDate } from "../lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "workouts" | "program">("overview");

  // Log workout form
  const [logDate, setLogDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [logStatus, setLogStatus] = useState<WorkoutStatus>("completed");
  const [logNote, setLogNote] = useState("");
  const [logType, setLogType] = useState("Strength");
  const [logDuration, setLogDuration] = useState(60);
  const [showLogForm, setShowLogForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!id || !user?.id) return;
    setLoading(true);

    const [clientRes, workoutsRes, programsRes] = await Promise.all([
      getClientById(id, user.id),
      getWorkouts(id),
      getPrograms(),
    ]);

    if (clientRes.data) setClient(clientRes.data);
    if (workoutsRes.data) setWorkouts(workoutsRes.data);
    if (programsRes.data) setPrograms(programsRes.data);

    setLoading(false);
  }, [id, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived stats
  const enrichedClient = useMemo(() => {
    if (!client) return null;
    const selectedProgram = client.program ?? null;
    const weeklyTarget = selectedProgram?.weekly_target ?? 3;
    const score = getAdherenceFromWorkouts(workouts, weeklyTarget);
    const riskLevel = getRiskLevel(score);
    const streak = calculateStreak(workouts);
    const momentum = getMomentumTrend(workouts, weeklyTarget);
    return { ...client, adherenceScore: score, riskLevel, streak, momentum, program: selectedProgram ?? undefined, workouts };
  }, [client, workouts]);

  const completedCount = useMemo(
    () => workouts.filter((w) => w.status === "completed").length,
    [workouts]
  );
  const missedCount = useMemo(
    () => workouts.filter((w) => w.status === "missed").length,
    [workouts]
  );

  const weeklyData = useMemo(
    () => getWeeklyAdherenceData(workouts, client?.program?.weekly_target ?? 3),
    [workouts, client?.program?.weekly_target]
  );

  const handleAssignProgram = useCallback(
    async (programId: string) => {
      if (!client) return;
      const result = await updateClientProgram(client.id, programId || null);
      if (result.error || !result.data) {
        toast.error("Failed to assign program");
        return;
      }
      setClient(result.data);
      toast.success(programId ? "Program assigned" : "Program removed");
    },
    [client]
  );

  const handleLogWorkout = useCallback(async () => {
    if (!id || !user?.id) return;
    setSaving(true);

    const result = await logWorkout({
      client_id: id,
      date: logDate,
      status: logStatus,
      notes: logNote.trim() || undefined,
      workout_type: logStatus === "completed" ? logType : undefined,
      duration_minutes: logStatus === "completed" ? logDuration : undefined,
    });

    if (result.error) {
      toast.error("Failed to save workout");
      setSaving(false);
      return;
    }

    // If missed, create an alert
    if (logStatus === "missed" && enrichedClient) {
      await createAlert({
        coach_id: user.id,
        client_id: id,
        type: "missed_workout",
        message: `${enrichedClient.name} missed a workout on ${logDate}.`,
        client_name: enrichedClient.name,
      });
    }

    toast.success(
      logStatus === "completed"
        ? "✅ Workout logged successfully!"
        : "📝 Missed workout recorded."
    );

    setShowLogForm(false);
    setLogNote("");
    setLogStatus("completed");
    setSaving(false);

    // Reload workouts
    const fresh = await getWorkouts(id);
    if (fresh.data) setWorkouts(fresh.data);
  }, [id, user?.id, logDate, logStatus, logNote, logType, logDuration, enrichedClient]);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (!enrichedClient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-400 text-sm">Client not found</p>
          <button
            onClick={() => navigate("/clients")}
            className="mt-3 text-emerald-600 text-sm font-medium"
          >
            ← Back to Clients
          </button>
        </div>
      </div>
    );
  }

  const momentumIcon = getMomentumIcon(enrichedClient.momentum!);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5">
        <button
          onClick={() => navigate("/clients")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm mb-4 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Clients
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {enrichedClient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-800">{enrichedClient.name}</h1>
                <RiskBadge level={enrichedClient.riskLevel!} />
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{enrichedClient.goal}</p>
              <p className="text-xs text-slate-500 mt-1">
                Program: {enrichedClient.program?.name || "No program assigned"}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Client since {formatDate(enrichedClient.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const url = `${window.location.origin}/clients/${id}`;
                navigator.clipboard.writeText(url).then(() =>
                  toast.success("Profile link copied!")
                );
              }}
              className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-600 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            >
              <Share2 size={13} />
              Share Report
            </button>
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-medium transition-colors shadow-sm"
            >
              <Plus size={13} />
              Log Workout
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Log Workout Form */}
        {showLogForm && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={15} className="text-emerald-500" />
              Log Workout for {enrichedClient.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(["completed", "missed"] as WorkoutStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setLogStatus(s)}
                      className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-colors ${
                        logStatus === s
                          ? s === "completed"
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-red-500 text-white border-red-500"
                          : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {s === "completed" ? "✓ Completed" : "✗ Missed"}
                    </button>
                  ))}
                </div>
              </div>
              {logStatus === "completed" && (
                <>
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1.5">
                      Workout Type
                    </label>
                    <select
                      value={logType}
                      onChange={(e) => setLogType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white"
                    >
                      {[
                        "Strength",
                        "Cardio",
                        "HIIT",
                        "Mobility",
                        "Upper Body",
                        "Lower Body",
                        "Full Body",
                      ].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1.5">
                      Duration:{" "}
                      <span className="text-emerald-600 font-semibold">{logDuration} min</span>
                    </label>
                    <input
                      type="range"
                      min={15}
                      max={120}
                      step={5}
                      value={logDuration}
                      onChange={(e) => setLogDuration(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-500 font-medium block mb-1.5">
                Notes (optional)
              </label>
              <textarea
                value={logNote}
                onChange={(e) => setLogNote(e.target.value)}
                placeholder="Session notes, client feedback..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogForm(false)}
                disabled={saving}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleLogWorkout}
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Workout"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <label className="text-xs text-slate-500 font-medium block mb-1.5">
            Program Assignment
          </label>
          <select
            value={client?.program_id || ""}
            onChange={(e) => handleAssignProgram(e.target.value)}
            className="w-full max-w-sm px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white"
          >
            <option value="">Assign Program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            <AdherenceScore score={enrichedClient.adherenceScore!} size="md" />
            <div>
              <p className="text-xs text-slate-400">Adherence</p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">Last 30 days</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={14} className="text-orange-500" />
              <p className="text-xs text-slate-400">Current Streak</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{enrichedClient.streak ?? 0}</p>
            <p className="text-xs text-slate-400">consecutive days</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-blue-500" />
              <p className="text-xs text-slate-400">Momentum</p>
            </div>
            <p className={`text-base font-bold ${momentumIcon.color} capitalize`}>
              {momentumIcon.icon} {enrichedClient.momentum}
            </p>
            <p className="text-xs text-slate-400">vs. last 2 weeks</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-violet-500" />
              <p className="text-xs text-slate-400">Total Workouts</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{completedCount}</p>
            <p className="text-xs text-slate-400">{missedCount} missed</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {(["overview", "workouts", "program"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                8-Week Adherence Trend
              </h3>
              <div className="h-56">
                <AdherenceTrendChart client={enrichedClient} />
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50">
                {weeklyData.slice(-4).map((w, i) => (
                  <div key={i} className="text-center">
                    <p className="text-xs text-slate-400">{w.label}</p>
                    <p
                      className={`text-sm font-bold ${
                        w.score >= 70
                          ? "text-emerald-600"
                          : w.score >= 40
                          ? "text-amber-600"
                          : "text-red-500"
                      }`}
                    >
                      {w.score}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {enrichedClient.program && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Target size={14} className="text-emerald-500" />
                    Program
                  </h3>
                  <p className="text-sm font-medium text-slate-700">{enrichedClient.program.name}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Type</span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getProgramTypeColor(
                          enrichedClient.program.type
                        )}`}
                      >
                        {enrichedClient.program.type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Weekly Target</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {enrichedClient.program.weekly_target}x / week
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Duration</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {enrichedClient.program.duration_weeks} weeks
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">
                  Recent Workouts
                </h3>
                {workouts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No workouts logged yet
                  </p>
                ) : (
                  <WorkoutLog workouts={workouts} limit={5} />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "workouts" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Full Workout History</h3>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="text-emerald-600 font-medium">{completedCount} completed</span>
                <span className="text-red-500 font-medium">{missedCount} missed</span>
              </div>
            </div>
            {workouts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">No workouts logged yet</p>
                <button
                  onClick={() => setShowLogForm(true)}
                  className="mt-2 text-xs text-emerald-600 font-medium hover:text-emerald-700"
                >
                  Log first workout →
                </button>
              </div>
            ) : (
              <WorkoutLog workouts={workouts} />
            )}
          </div>
        )}

        {activeTab === "program" && (
          <div className="grid grid-cols-2 gap-4">
            {enrichedClient.program ? (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Program Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Program Name</p>
                      <p className="text-sm font-medium text-slate-700">{enrichedClient.program.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Type</p>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${getProgramTypeColor(
                          enrichedClient.program.type
                        )}`}
                      >
                        {enrichedClient.program.type.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Weekly Target</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {enrichedClient.program.weekly_target} sessions per week
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Duration</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {enrichedClient.program.duration_weeks} weeks
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Started</p>
                      <p className="text-sm text-slate-700">
                        {formatDate(enrichedClient.program.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">
                    Adherence Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Completed</span>
                        <span className="text-emerald-600 font-semibold">{completedCount}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              completedCount + missedCount > 0
                                ? (completedCount / (completedCount + missedCount)) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Missed</span>
                        <span className="text-red-500 font-semibold">{missedCount}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-red-400 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              completedCount + missedCount > 0
                                ? (missedCount / (completedCount + missedCount)) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-50">
                      <p className="text-xs text-slate-400">Overall Rate</p>
                      <p className="text-2xl font-bold text-slate-800 mt-1">
                        {enrichedClient.adherenceScore}%
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-8 text-center">
                <Target size={32} className="mx-auto text-slate-200 mb-2" />
                <p className="text-sm text-slate-400">No program assigned yet</p>
                <p className="text-xs text-slate-300 mt-1">
                  Go to Programs page to assign a training program
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
