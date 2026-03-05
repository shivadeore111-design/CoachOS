import { Insight } from "../lib/types";
import { AlertTriangle, CheckCircle2, Info, XOctagon } from "lucide-react";

interface InsightCardProps {
  insight: Insight;
  onClientClick?: (clientId: string) => void;
}

const config = {
  critical: {
    icon: XOctagon,
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-500",
    titleColor: "text-red-800",
    msgColor: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-500",
    titleColor: "text-amber-800",
    msgColor: "text-amber-700",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-500",
    titleColor: "text-emerald-800",
    msgColor: "text-emerald-700",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-500",
    titleColor: "text-blue-800",
    msgColor: "text-blue-700",
  },
};

export default function InsightCard({ insight, onClientClick }: InsightCardProps) {
  const c = config[insight.type];
  const Icon = c.icon;

  return (
    <div
      className={`flex gap-3 p-3.5 rounded-xl border ${c.bg} ${c.border} ${insight.client_id && onClientClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
      onClick={() => insight.client_id && onClientClick?.(insight.client_id)}
    >
      <Icon size={16} className={`${c.iconColor} flex-shrink-0 mt-0.5`} />
      <div>
        <p className={`text-xs font-semibold ${c.titleColor}`}>{insight.title}</p>
        <p className={`text-xs mt-0.5 ${c.msgColor}`}>{insight.message}</p>
      </div>
    </div>
  );
}
