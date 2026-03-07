import { useState } from "react";
import { X, User, Target, Dumbbell } from "lucide-react";
import type { Program, ProgramType } from "../lib/types";

interface ClientForm {
  name: string;
  email: string;
  goal: string;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  notes: string;
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
    goal: "Weight Loss",
    experienceLevel: "Beginner",
    notes: "",
    programName: "",
    programType: "strength",
    weeklyTarget: 3,
    programId: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.goal) return;
    setSubmitting(true);
    try {
      if (onSubmit) await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div><h2 className="text-base font-semibold text-slate-800">Add New Client</h2><p className="text-xs text-slate-400 mt-0.5">Step {step} of 2</p></div>
          <button onClick={onClose} disabled={submitting} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 pt-4"><div className="flex gap-2">{[1, 2].map((s) => <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-emerald-500" : "bg-slate-100"}`} />)}</div></div>

        <div className="px-6 py-5">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1"><User size={15} className="text-emerald-500" /><h3 className="text-sm font-medium text-slate-700">Client Information</h3></div>
              <div><label className="text-xs text-slate-500 font-medium block mb-1.5">Full Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" /></div>
              <div><label className="text-xs text-slate-500 font-medium block mb-1.5">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" /></div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">Goal *</label>
                <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white">
                  <option>Weight Loss</option><option>Muscle Gain</option><option>Athletic Performance</option><option>General Fitness</option><option>Mobility</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">Experience Level</label>
                <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value as ClientForm["experienceLevel"] })} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl resize-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1"><Dumbbell size={15} className="text-emerald-500" /><h3 className="text-sm font-medium text-slate-700">Training Program</h3></div>
              <div><label className="text-xs text-slate-500 font-medium block mb-1.5">Assign Existing Program</label><select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"><option value="">Assign Program</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></div>
              <div><label className="text-xs text-slate-500 font-medium block mb-1.5">Program Name</label><input value={form.programName} onChange={(e) => setForm({ ...form, programName: e.target.value })} disabled={!!form.programId} placeholder={`e.g. ${form.name || "Client"}'s 12-Week Plan`} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl disabled:bg-slate-50" /></div>
              <div><label className="text-xs text-slate-500 font-medium block mb-1.5">Program Type</label><select value={form.programType} onChange={(e) => setForm({ ...form, programType: e.target.value as ProgramType })} disabled={!!form.programId} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white"><option value="strength">Strength Training</option><option value="fat_loss">Fat Loss</option><option value="athletic">Athletic Performance</option><option value="mobility">Mobility & Recovery</option><option value="custom">Custom</option></select></div>
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1.5">Weekly Target: <span className="text-emerald-600 font-semibold">{form.weeklyTarget} sessions/week</span></label>
                <input type="range" min={1} max={7} value={form.weeklyTarget} onChange={(e) => setForm({ ...form, weeklyTarget: parseInt(e.target.value) })} disabled={!!form.programId} className="w-full accent-emerald-500" />
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100"><div className="flex items-center gap-2 mb-2"><Target size={13} className="text-slate-400" /><p className="text-xs font-medium text-slate-600">Summary</p></div><p className="text-xs text-slate-500">{form.name || "Client"} · {form.goal} · {form.experienceLevel}</p></div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 pb-5">
          {step > 1 ? <button onClick={() => setStep(1)} disabled={submitting} className="text-sm text-slate-400">← Back</button> : <button onClick={onClose} disabled={submitting} className="text-sm text-slate-400">Cancel</button>}
          {step < 2 ? <button onClick={() => setStep(2)} disabled={!form.name || !form.goal} className="bg-emerald-500 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-sm font-medium">Next →</button> : <button onClick={handleSubmit} disabled={submitting} className="bg-emerald-500 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-medium">{submitting ? "Saving..." : "Add Client ✓"}</button>}
        </div>
      </div>
    </div>
  );
}
