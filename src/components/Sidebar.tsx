import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Dumbbell, BarChart3, Settings, Zap, CreditCard, ChevronRight, Trophy, LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getCoachPlan } from "../lib/api";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/programs", icon: Dumbbell, label: "Programs" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/pricing", icon: CreditCard, label: "Upgrade", highlight: true },
];

const planStyles: Record<string, string> = {
  free: "text-slate-300",
  pro: "text-emerald-400",
  business: "text-purple-400",
};

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { user, signOut } = useAuth();
  const [plan, setPlan] = useState<{ plan: string; max_clients: number }>({ plan: "free", max_clients: 5 });

  useEffect(() => {
    if (!user?.id) return;
    getCoachPlan().then((res) => {
      if (res.data) setPlan(res.data);
    });
  }, [user?.id]);

  const displayName = (user?.user_metadata?.name as string | undefined) || user?.email?.split("@")[0] || "Coach";
  const displayEmail = user?.email ?? "";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-64 bg-slate-900 h-full flex flex-col">
            <div className="px-5 py-6 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30"><Zap size={16} className="text-white" /></div>
                <div>
                  <span className="text-white font-bold text-base tracking-tight">CoachOS</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-xs font-medium capitalize ${planStyles[plan.plan] ?? "text-slate-300"}`}>{plan.plan} Plan</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{plan.max_clients === -1 ? "Unlimited" : `${plan.max_clients} clients`}</span>
                  </div>
                </div>
                <button onClick={onClose} className="ml-auto w-11 h-11 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center justify-center" aria-label="Close sidebar">
                  <X size={18} />
                </button>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {nav.map(({ to, icon: Icon, label, highlight }) => (
                <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 min-h-11 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? (highlight ? "bg-emerald-500 text-white" : "bg-slate-800 text-white") : highlight ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}>
                  <Icon size={16} /><span className="flex-1">{label}</span>{highlight && <ChevronRight size={14} className="opacity-70" />}
                </NavLink>
              ))}
            </nav>
            <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-0.5">
              <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 min-h-11 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}><Settings size={16} />Settings</NavLink>
              <button onClick={signOut} className="w-full flex items-center gap-3 px-3 min-h-11 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all"><LogOut size={16} />Sign Out</button>
              <div className="mt-2 flex items-center gap-3 px-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
                <div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-300 truncate">{displayName}</p><p className="text-xs text-slate-500 truncate">{displayEmail}</p></div>
              </div>
            </div>
          </div>
          <button aria-label="Close sidebar" className="flex-1 bg-black/50" onClick={onClose} />
        </div>
      )}
      <aside className="hidden lg:flex lg:static inset-y-0 left-0 z-50 lg:z-auto w-60 bg-slate-900 min-h-screen flex-col flex-shrink-0">
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30"><Zap size={16} className="text-white" /></div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">CoachOS</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-xs font-medium capitalize ${planStyles[plan.plan] ?? "text-slate-300"}`}>{plan.plan} Plan</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-500">{plan.max_clients === -1 ? "Unlimited" : `${plan.max_clients} clients`}</span>
            </div>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden w-11 h-11 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center justify-center" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ to, icon: Icon, label, highlight }) => (
          <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 min-h-11 rounded-xl text-sm font-medium transition-all duration-150 group ${isActive ? (highlight ? "bg-emerald-500 text-white" : "bg-slate-800 text-white") : highlight ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}>
            <Icon size={16} /><span className="flex-1">{label}</span>{highlight && <ChevronRight size={14} className="opacity-70" />}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-0.5">
        <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 px-3 min-h-11 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}><Settings size={16} />Settings</NavLink>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 min-h-11 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all"><LogOut size={16} />Sign Out</button>
        <div className="mt-2 flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
          <div className="flex-1 min-w-0"><p className="text-xs font-medium text-slate-300 truncate">{displayName}</p><p className="text-xs text-slate-500 truncate">{displayEmail}</p></div>
        </div>
      </div>
      </aside>
    </>
  );
}
