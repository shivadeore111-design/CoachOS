/**
 * AlertsPanel — shows recent alerts with read/unread state.
 */
import { useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import type { Alert } from "../types";
import { getAlertIcon, getAlertColor, getAlertTextColor, formatAlertTime } from "../lib/alerts";
import { markAlertRead, markAllAlertsRead } from "../lib/api";
import { useNavigate } from "react-router-dom";

interface AlertsPanelProps {
  alerts: Alert[];
  coachId: string;
  onAlertsChange: (alerts: Alert[]) => void;
}

export default function AlertsPanel({ alerts, coachId, onAlertsChange }: AlertsPanelProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleMarkRead = async (alertId: string) => {
    await markAlertRead(alertId);
    onAlertsChange(alerts.map((a) => a.id === alertId ? { ...a, read: true } : a));
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    await markAllAlertsRead(coachId);
    onAlertsChange(alerts.map((a) => ({ ...a, read: true })));
    setLoading(false);
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
            <Bell size={13} className="text-slate-500" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Alerts</h2>
        </div>
        <div className="text-center py-6">
          <Bell size={28} className="mx-auto text-slate-200 mb-2" />
          <p className="text-xs text-slate-400">No alerts — all clients on track! ✅</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
            <Bell size={13} className="text-red-500" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Alerts</h2>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-medium leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <CheckCheck size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`relative rounded-xl border p-3 transition-all ${getAlertColor(alert.type)} ${
              alert.read ? "opacity-60" : ""
            }`}
          >
            {!alert.read && (
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              </div>
            )}
            <div className="flex items-start gap-2 pr-6">
              <span className="text-sm leading-none mt-0.5">{getAlertIcon(alert.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium leading-relaxed ${getAlertTextColor(alert.type)}`}>
                  {alert.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-400">{formatAlertTime(alert.created_at)}</span>
                  {alert.client_id && (
                    <button
                      onClick={() => navigate(`/clients/${alert.client_id}`)}
                      className="text-xs text-emerald-600 font-medium hover:text-emerald-700"
                    >
                      View client →
                    </button>
                  )}
                  {!alert.read && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 ml-auto"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
