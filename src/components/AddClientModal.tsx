import { useState } from "react";
import { X, User, Target, Dumbbell } from "lucide-react";
import type { Program, ProgramType } from "../lib/types";

interface ClientForm {
  name: string;
  email: string;
  goal: string;
  programName: string;
  programType: string;
  weeklyTarget: number;
  programId: string;
}

interface AddClientModalProps {
  onClose: () => void;
  onSubmit?: (form: ClientForm) => Promise<void>;
  programs?: Program[];
}

export default function AddClientModal({ onClose, onSubmit, programs = [] }: AddClientModalProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ClientForm>({
    name: "",
    email: "",
    goal: "",
    programName: "",
    programType: "strength",
    weeklyTarget: 3,
    programId: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.goal) return;
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(form);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Add New Client</h2>
            <p className="text-xs text-slate-400 mt-0.5">Step {step} of 2</p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-emerald-500" : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <User size={15} className="text-emerald-500" />
                <h3 className="text-sm font-medium text-slate-700">Client Information</h3>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">
                  Full Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@example.com"
                  type="email"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">
                  Fitness Goal *
                </label>
                <textarea
                  value={form.goal}
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                  placeholder="e.g. Lose 20 lbs and build core strength"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell size={15} className="text-emerald-500" />
                <h3 className="text-sm font-medium text-slate-700">Training Program</h3>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">
                  Assign Existing Program
                </label>
                <select
                  value={form.programId}
                  onChange={(e) => setForm({ ...form, programId: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white"
                >
                  <option value="">Assign Program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">
                  Program Name
                </label>
                <input
                  value={form.programName}
                  onChange={(e) => setForm({ ...form, programName: e.target.value })}
                  disabled={!!form.programId}
                  placeholder={`e.g. ${form.name || "Client"}'s 12-Week Plan`}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">
                  Program Type
                </label>
                <select
                  value={form.programType}
                  onChange={(e) =>
                    setForm({ ...form, programType: e.target.value as ProgramType })
                  }
                  disabled={!!form.programId}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none bg-white"
                >
                  <option value="strength">Strength Training</option>
                  <option value="fat_loss">Fat Loss</option>
                  <option value="athletic">Athletic Performance</option>
                  <option value="mobility">Mobility & Recovery</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">
                  Weekly Target:{" "}
                  <span className="text-emerald-600 font-semibold">
                    {form.weeklyTarget} sessions/week
                  </span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={form.weeklyTarget}
                  onChange={(e) =>
                    setForm({ ...form, weeklyTarget: parseInt(e.target.value) })
                  }
                  disabled={!!form.programId}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-300 mt-1">
                  <span>1x</span>
                  <span>7x</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={13} className="text-slate-400" />
                  <p className="text-xs font-medium text-slate-600">Summary</p>
                </div>
                <p className="text-xs text-slate-500">
                  {form.name || "Client"} ·{" "}
                  {form.programId
                    ? programs.find((program) => program.id === form.programId)?.name ||
                      "Assigned Program"
                    : form.programName || `${form.name || "Client"}'s Program`}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {form.programId
                    ? "Using existing program"
                    : `${form.weeklyTarget} sessions/week · ${form.programType}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5">
          {step > 1 ? (
            <button
              onClick={() => setStep(1)}
              disabled={submitting}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!form.name || !form.goal}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Add Client ✓"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
