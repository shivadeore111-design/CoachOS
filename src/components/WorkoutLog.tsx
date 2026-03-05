import { Workout } from "../lib/types";
import { CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { formatDate } from "../lib/utils";

interface WorkoutLogProps {
  workouts: Workout[];
  limit?: number;
}

export default function WorkoutLog({ workouts, limit }: WorkoutLogProps) {
  const sorted = [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit ?? workouts.length);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <FileText size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No workouts logged yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((workout) => (
        <div
          key={workout.id}
          className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
            workout.status === "completed"
              ? "bg-emerald-50 border-emerald-100"
              : "bg-red-50 border-red-100"
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {workout.status === "completed" ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <XCircle size={18} className="text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${workout.status === "completed" ? "text-emerald-700" : "text-red-600"}`}>
                {workout.status === "completed" ? "Completed" : "Missed"}
              </span>
              {workout.workout_type && (
                <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                  {workout.workout_type}
                </span>
              )}
              {workout.duration_minutes && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} />
                  {workout.duration_minutes}m
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(workout.date)}</p>
            {workout.notes && (
              <p className="text-xs text-slate-500 mt-1 italic">"{workout.notes}"</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
