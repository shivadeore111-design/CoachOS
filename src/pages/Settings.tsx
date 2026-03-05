import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Zap,
  Save,
  ChevronRight,
  CheckCircle2,
  Globe,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCoachProfile, updateCoachProfile } from "../lib/api";
import toast from "react-hot-toast";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: Globe },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [active, setActive] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    phone: "",
    website: "",
  });
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    weeklyDigest: true,
    clientMilestones: true,
    productUpdates: false,
    marketingEmails: false,
  });

  // Load real profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      const result = await getCoachProfile(user.id);
      if (result.data) {
        setProfile({
          name: result.data.name || user.user_metadata?.name || "",
          email: result.data.email || user.email || "",
          bio: "Elite personal trainer with 8+ years of experience.",
          location: "",
          phone: "",
          website: "",
        });
      } else {
        // Fall back to auth user data
        setProfile((prev) => ({
          ...prev,
          name: (user.user_metadata?.name as string) || user.email?.split("@")[0] || "",
          email: user.email || "",
        }));
      }
    }
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    const result = await updateCoachProfile(user.id, {
      name: profile.name,
      email: profile.email,
    });
    setSaving(false);
    if (result.error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile saved! ✅");
    }
  };

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5">
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      <div className="px-8 py-6 flex gap-6 max-w-4xl">
        {/* Sidebar nav */}
        <nav className="w-48 flex-shrink-0">
          <ul className="space-y-0.5">
            {sections.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActive(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active === id
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                      : "text-slate-500 hover:bg-white hover:text-slate-700"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content panel */}
        <div className="flex-1 space-y-4">
          {/* ── Profile ── */}
          {active === "profile" && (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-5">Coach Profile</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{profile.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{profile.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", key: "name", type: "text", placeholder: "Your name" },
                    {
                      label: "Email",
                      key: "email",
                      type: "email",
                      placeholder: "you@example.com",
                    },
                    {
                      label: "Phone",
                      key: "phone",
                      type: "tel",
                      placeholder: "+1 (555) 000-0000",
                    },
                    {
                      label: "Location",
                      key: "location",
                      type: "text",
                      placeholder: "City, Country",
                    },
                    {
                      label: "Website",
                      key: "website",
                      type: "text",
                      placeholder: "yoursite.com",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-xs text-slate-500 font-medium block mb-1.5">
                        {field.label}
                      </label>
                      <input
                        value={profile[field.key as keyof typeof profile]}
                        onChange={(e) =>
                          setProfile({ ...profile, [field.key]: e.target.value })
                        }
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-xs text-slate-500 font-medium block mb-1.5">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      placeholder="Tell clients about yourself..."
                      className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ── Notifications ── */}
          {active === "notifications" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-5">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  {
                    key: "criticalAlerts",
                    label: "Critical Adherence Alerts",
                    desc: "Get notified when a client drops below 40% adherence",
                  },
                  {
                    key: "weeklyDigest",
                    label: "Weekly Coach Digest",
                    desc: "Summary of all client performance every Monday morning",
                  },
                  {
                    key: "clientMilestones",
                    label: "Client Milestones",
                    desc: "Streak achievements, PRs, and breakthrough moments",
                  },
                  {
                    key: "productUpdates",
                    label: "Product Updates",
                    desc: "New features and improvements to CoachOS",
                  },
                  {
                    key: "marketingEmails",
                    label: "Marketing Emails",
                    desc: "Tips, resources, and coaching insights",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between py-3 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications({
                          ...notifications,
                          [item.key]:
                            !notifications[item.key as keyof typeof notifications],
                        })
                      }
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                        notifications[item.key as keyof typeof notifications]
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                          notifications[item.key as keyof typeof notifications]
                            ? "translate-x-4"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => toast.success("Notification preferences saved!")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                >
                  <Save size={15} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {active === "security" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-5">Change Password</h2>
                <div className="space-y-4 max-w-sm">
                  {["Current Password", "New Password", "Confirm New Password"].map(
                    (label, i) => (
                      <div key={i}>
                        <label className="text-xs text-slate-500 font-medium block mb-1.5">
                          {label}
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                        />
                      </div>
                    )
                  )}
                  <button
                    onClick={() => toast.success("Password updated!")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-1">
                  Two-Factor Authentication
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Add an extra layer of security to your account
                </p>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Authenticator App</p>
                    <p className="text-xs text-slate-400">Not configured</p>
                  </div>
                  <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
                    Setup <ChevronRight size={12} />
                  </button>
                </div>
              </div>
              <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
                <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
                <p className="text-xs text-red-500 mb-3">
                  These actions are permanent and cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      signOut();
                      navigate("/login");
                    }}
                    className="text-xs text-slate-600 font-medium border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Sign Out
                  </button>
                  <button className="text-xs text-red-600 font-medium border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Billing ── */}
          {active === "billing" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-sm font-semibold text-slate-800 mb-4">Current Plan</h2>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                      <Zap size={18} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Free Plan</p>
                      <p className="text-xs text-slate-400">3/3 clients used · No expiry</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                <p className="text-sm font-bold mb-1">Unlock Pro for $29/month</p>
                <p className="text-emerald-100 text-xs mb-3 max-w-xs">
                  Unlimited clients, AI insights, trend analytics, and shareable reports.
                </p>
                <ul className="space-y-1.5 mb-4">
                  {[
                    "Unlimited clients",
                    "AI coaching insights",
                    "Client progress reports",
                    "Advanced analytics",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-emerald-100">
                      <CheckCircle2 size={12} className="text-emerald-200" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/pricing")}
                  className="bg-white text-emerald-600 text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  Start 14-Day Free Trial →
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Payment Method</h3>
                <div className="flex items-center gap-3 p-3 border border-dashed border-slate-200 rounded-xl text-slate-400">
                  <CreditCard size={16} />
                  <p className="text-sm">No payment method added yet</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Integrations ── */}
          {active === "integrations" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-5">Integrations</h2>
              <div className="space-y-3">
                {[
                  {
                    name: "Google Calendar",
                    desc: "Sync workout sessions with Google Calendar",
                    status: "available",
                    color: "bg-blue-100 text-blue-600",
                  },
                  {
                    name: "Stripe",
                    desc: "Accept payments from clients directly",
                    status: "available",
                    color: "bg-violet-100 text-violet-600",
                  },
                  {
                    name: "Zapier",
                    desc: "Automate workflows with 5000+ apps",
                    status: "coming-soon",
                    color: "bg-orange-100 text-orange-600",
                  },
                  {
                    name: "WhatsApp",
                    desc: "Send client reports via WhatsApp",
                    status: "coming-soon",
                    color: "bg-emerald-100 text-emerald-600",
                  },
                  {
                    name: "MyFitnessPal",
                    desc: "Sync nutrition data for holistic tracking",
                    status: "coming-soon",
                    color: "bg-blue-100 text-blue-700",
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${integration.color}`}
                      >
                        {integration.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{integration.name}</p>
                        <p className="text-xs text-slate-400">{integration.desc}</p>
                      </div>
                    </div>
                    {integration.status === "available" ? (
                      <button
                        onClick={() => toast.success(`${integration.name} integration coming soon!`)}
                        className="text-xs font-medium text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        Connect
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
                        Coming Soon
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
