import { useNavigate } from "react-router-dom";
import { Client } from "../lib/types";
import { getInitials, getAvatarColor, getMomentumIcon } from "../lib/utils";
import AdherenceScore from "./AdherenceScore";
import RiskBadge from "./RiskBadge";
import { Flame, TrendingUp } from "lucide-react";

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  const navigate = useNavigate();
  const momentum = client.momentum && getMomentumIcon(client.momentum);
  const avatarGrad = getAvatarColor(client.name);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/clients/${client.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
            {getInitials(client.name)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors text-sm">
              {client.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-[140px]">{client.goal}</p>
          </div>
        </div>
        <AdherenceScore score={client.adherenceScore ?? 0} size="sm" showLabel={false} />
      </div>

      {/* Program */}
      {client.program && (
        <div className="mb-3">
          <p className="text-xs text-slate-400 mb-1">Program</p>
          <p className="text-xs font-medium text-slate-600 truncate">{client.program.name}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <RiskBadge level={client.riskLevel ?? "good"} size="sm" />
        <div className="flex items-center gap-3">
          {(client.streak ?? 0) > 0 && (
            <div className="flex items-center gap-1 text-xs text-orange-500 font-medium">
              <Flame size={12} />
              <span>{client.streak}</span>
            </div>
          )}
          {momentum && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${momentum.color}`}>
              <TrendingUp size={12} />
              <span>{client.momentum}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
