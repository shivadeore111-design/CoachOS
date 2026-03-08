import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getCoachProfile, updateCoachProfile } from "../lib/api";

type Tab = "profile" | "notifications" | "security" | "billing" | "integrations";

const tabs: { key: Tab; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
  { key: "billing", label: "Billing" },
  { key: "integrations", label: "Integrations" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
    plan: "free",
  });

  useEffect(() => {
    if (!user?.id) return;
    getCoachProfile(user.id).then((res) => {
      if (!res.data) return;
      const coach = res.data as Record<string, unknown>;
      setProfile({
        name: String(coach.name ?? ""),
        email: String(coach.email ?? user.email ?? ""),
        phone: String(coach.phone ?? ""),
        location: String(coach.location ?? ""),
        website: String(coach.website ?? ""),
        bio: String(coach.bio ?? ""),
        plan: String(coach.plan ?? "free"),
      });
    });
  }, [user?.id, user?.email]);

  const saveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    const updates = {
      name: profile.name,
      phone: profile.phone || null,
      location: profile.location || null,
      website: profile.website || null,
      bio: profile.bio || null,
    } as Record<string, string | null>;
    const res = await updateCoachProfile(user.id, updates as never);
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

  const content = useMemo(() => {
    if (activeTab === "profile") {
      return (
        <div className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
              <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
              <input value={profile.email} readOnly className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
              <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
              <input value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Website</label>
              <input value={profile.website} onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Bio</label>
              <textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={4} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={saving} className="px-4 min-h-11 bg-emerald-500 text-white rounded-xl text-sm font-medium">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      );
    }

    if (activeTab === "billing") {
      return (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500">Current plan</p>
            <p className="text-lg font-bold text-slate-800 capitalize">{profile.plan}</p>
            <button onClick={() => navigate("/pricing")} className="mt-3 px-4 min-h-11 border border-slate-200 rounded-xl text-sm bg-white">Manage</button>
          </div>
          <div className="bg-white rounded-2xl border border-red-200 p-4">
            <h2 className="text-sm font-semibold text-red-700 mb-2">Danger Zone</h2>
            <button onClick={() => setShowDeleteModal(true)} className="px-4 min-h-11 bg-red-600 text-white rounded-xl text-sm">Delete Account</button>
          </div>
        </div>
      );
    }

    return <p className="text-sm text-slate-500">{tabs.find((t) => t.key === activeTab)?.label} settings are available in the original experience and can be configured here.</p>;
  }, [activeTab, navigate, profile, saving]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-4 sm:px-8 py-6 pb-6 space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-400">Manage your profile, account, and billing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="bg-white rounded-2xl border border-slate-100 p-3 h-fit overflow-x-auto">
          <div className="flex lg:block gap-2 lg:gap-0">{tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full lg:w-auto lg:min-w-0 min-w-[130px] text-left px-3 min-h-11 rounded-xl text-sm mb-1 lg:mb-1 ${activeTab === tab.key ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {tab.label}
            </button>
          ))}</div>
        </aside>

        <section className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">{tabs.find((t) => t.key === activeTab)?.label}</h2>
          {content}
        </section>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-slate-800 mb-2">Confirm account deletion</h3>
            <p className="text-sm text-slate-500 mb-3">Type DELETE to confirm.</p>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-3 min-h-11 text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={confirmText !== "DELETE"} className="px-3 min-h-11 bg-red-600 disabled:bg-red-300 text-white rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
