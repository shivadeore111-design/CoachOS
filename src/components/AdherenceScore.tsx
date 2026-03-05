interface AdherenceScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function AdherenceScore({ score, size = "md", showLabel = true }: AdherenceScoreProps) {
  const radius = size === "lg" ? 52 : size === "md" ? 38 : 26;
  const stroke = size === "lg" ? 8 : size === "md" ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const svgSize = (radius + stroke) * 2 + 4;

  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const trackColor = "#f1f5f9";

  const fontSize = size === "lg" ? "text-2xl" : size === "md" ? "text-base" : "text-xs";
  const labelSize = size === "lg" ? "text-xs" : "text-[10px]";

  return (
    <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold leading-none ${fontSize}`} style={{ color }}>
          {score}
        </span>
        {showLabel && (
          <span className={`text-slate-400 font-medium mt-0.5 ${labelSize}`}>score</span>
        )}
      </div>
    </div>
  );
}
