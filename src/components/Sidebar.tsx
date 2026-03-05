import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  BarChart3,
  Settings,
  Zap,
  CreditCard,
  ChevronRight,
  Trophy,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/programs", icon: Dumbbell, label: "Programs" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { to: "/pricing", icon: CreditCard, label: "Upgrade", highlight: true },
];

export default function Sidebar() {
  const { user, signOut, isDemo } = useAuth();

  // Derive display name from user metadata or email
  const displayName: string =
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Coach";

  const displayEmail: string = user?.email ?? "demo@coachos.io";

  // Initials for avatar
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="w-60 bg-slate-900 min-h-screen flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">CoachOS</span>
            <div className="flex items-center gap-1 mt-0.5">
              {isDemo ? (
                <span className="text-xs text-amber-400 font-medium">Demo Mode</span>
              ) : (
                <>
                  <span className="text-xs text-emerald-400 font-medium">Free Plan</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-500">3/3 clients</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ to, icon: Icon, label, highlight }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? highlight
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800 text-white"
                  : highlight
                  ? "text-emerald-400 hover:bg-emerald-500/10"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`
            }
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            {highlight && <ChevronRight size={14} className="opacity-70" />}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`
          }
        >
          <Settings size={16} />
          Settings
        </NavLink>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>

        {/* Coach avatar */}
        <div className="mt-2 flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
