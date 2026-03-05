import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { Client } from "../lib/types";
import { getWeeklyAdherenceData } from "../lib/adherence";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

interface AdherenceBarChartProps {
  clients: Client[];
}

export function AdherenceBarChart({ clients }: AdherenceBarChartProps) {
  const data = {
    labels: clients.map((c) => c.name.split(" ")[0]),
    datasets: [
      {
        label: "Adherence Score",
        data: clients.map((c) => c.adherenceScore ?? 0),
        backgroundColor: clients.map((c) => {
          const score = c.adherenceScore ?? 0;
          if (score >= 70) return "rgba(16, 185, 129, 0.8)";
          if (score >= 40) return "rgba(245, 158, 11, 0.8)";
          return "rgba(239, 68, 68, 0.8)";
        }),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        padding: 12,
        borderColor: "#1e293b",
        borderWidth: 1,
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => ` Score: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 12 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "#f1f5f9" },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          callback: (value: number | string) => `${value}%`,
        },
      },
    },
  };

  return <Bar data={data} options={options as never} />;
}

interface TrendChartProps {
  client: Client;
}

export function AdherenceTrendChart({ client }: TrendChartProps) {
  const weeklyData = client.workouts && client.program
    ? getWeeklyAdherenceData(client.workouts, client.program.weekly_target)
    : [];

  const data = {
    labels: weeklyData.map((d) => d.label),
    datasets: [
      {
        label: "Weekly Adherence",
        data: weeklyData.map((d) => d.score),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: weeklyData.map((d) =>
          d.score >= 70 ? "#10b981" : d.score >= 40 ? "#f59e0b" : "#ef4444"
        ),
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#94a3b8",
        padding: 12,
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => ` Adherence: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "#f8fafc" },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
          callback: (value: number | string) => `${value}%`,
        },
      },
    },
  };

  return <Line data={data} options={options as never} />;
}

interface MiniSparklineProps {
  scores: number[];
}

export function MiniSparkline({ scores }: MiniSparklineProps) {
  const data = {
    labels: scores.map((_, i) => `W${i + 1}`),
    datasets: [
      {
        data: scores,
        borderColor: "#10b981",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
    elements: { line: { borderCapStyle: "round" as const } },
  };

  return <Line data={data} options={options} />;
}
