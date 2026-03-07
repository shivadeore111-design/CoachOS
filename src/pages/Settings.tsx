import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getCoachPlan, getCoachProfile, updateCoachProfile } from "../lib/api";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    getCoachProfile(user.id).then((res) => {
      if (res.data) {
        setName(res.data.name ?? "");
        setEmail(res.data.email ?? user.email ?? "");
      }
    });
    getCoachPlan().then((res) => {
      if (res.data) setPlan(res.data.plan);
    });
  }, [user?.id, user?.email]);

  const saveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    const res = await updateCoachProfile(user.id, { name, email });
    setSaving(false);
    if (res.error) toast.error(res.error);
    else toast.success("Profile updated");
  };

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    await signOut();
    toast("Contact support to complete deletion");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-400">Manage your profile and billing</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Profile</h2>
        <div className="space-y-3 max-w-md">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
          <button onClick={saveProfile} disabled={saving} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Billing</h2>
        <p className="text-sm text-slate-500 mb-3">Current plan: <span className="font-semibold capitalize">{plan}</span></p>
        <button onClick={() => navigate("/pricing")} className="px-4 py-2 border border-slate-200 rounded-xl text-sm">Manage</button>
      </div>

      <div className="bg-white rounded-2xl border border-red-200 p-6">
        <h2 className="text-sm font-semibold text-red-700 mb-2">Danger zone</h2>
        <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm">Delete Account</button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-slate-800 mb-2">Confirm account deletion</h3>
            <p className="text-sm text-slate-500 mb-3">Type DELETE to confirm.</p>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-3 py-2 text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={confirmText !== "DELETE"} className="px-3 py-2 bg-red-600 disabled:bg-red-300 text-white rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
