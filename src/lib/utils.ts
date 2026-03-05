import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel, MomentumTrend, ProgramType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(level: RiskLevel) {
  switch (level) {
    case "good": return { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" };
    case "risk": return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
    case "critical": return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
  }
}

export function getMomentumIcon(trend: MomentumTrend) {
  switch (trend) {
    case "improving": return { icon: "↑", color: "text-emerald-600" };
    case "declining": return { icon: "↓", color: "text-red-500" };
    case "stable": return { icon: "→", color: "text-slate-400" };
  }
}

export function getProgramTypeColor(type: ProgramType) {
  switch (type) {
    case "strength": return "bg-blue-100 text-blue-700";
    case "fat_loss": return "bg-orange-100 text-orange-700";
    case "athletic": return "bg-purple-100 text-purple-700";
    case "mobility": return "bg-teal-100 text-teal-700";
    case "custom": return "bg-slate-100 text-slate-700";
  }
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function getAvatarColor(name: string) {
  const colors = [
    "from-emerald-400 to-teal-500",
    "from-blue-400 to-indigo-500",
    "from-violet-400 to-purple-500",
    "from-rose-400 to-pink-500",
    "from-amber-400 to-orange-500",
    "from-cyan-400 to-sky-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}
