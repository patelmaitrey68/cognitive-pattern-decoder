import { useEffect, useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  Zap, Target, Clipboard, Clock, Delete, PauseCircle,
  FolderOpen, Save, BarChart2, RefreshCw, TrendingUp, Type,
  MousePointer2, TerminalSquare, Bug
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
);

// ──────────────────────────────────────
// Sub-components
// ──────────────────────────────────────
function MetricCard({ icon: Icon, label, value, color = "#3b82f6", sub }) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
          style={{ background: `${color}22` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {sub && <span className="text-[10px] text-textMuted badge badge-blue">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-textPrimary">{value ?? "—"}</p>
      <p className="text-xs text-textSecondary mt-1">{label}</p>
    </div>
  );
}

function SessionActivityBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-textSecondary">{label}</span>
        <span className="text-textPrimary font-medium">{pct}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

const clusterLabels = {
  0: "Systematic Thinker",
  1: "Creative Coder",
  2: "Analytical Processor",
  3: "Intuitive Developer",
  4: "Methodical Planner",
};

// ──────────────────────────────────────
// Dashboard
// ──────────────────────────────────────
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get("/sessions/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  console.log("Dashboard stats:", stats); // Debug log for stats data

  const metrics = stats
    ? [
      { icon: Zap, label: "Typing Speed", value: `${stats.wpm ?? 0} WPM`, color: "#3b82f6" },
      { icon: Type, label: "Total Characters", value: stats.totalTypedChars ?? 0, color: "#6366f1" },
      { icon: Target, label: "Accuracy Rate", value: `${stats.accuracy ?? 0}%`, color: "#10b981" },
      { icon: Clipboard, label: "Paste Ratio", value: stats.pasteRatio ?? "0%", color: "#8b5cf6" },
      { icon: Clock, label: "Session Duration", value: stats.duration ?? "—", color: "#f59e0b" },
      { icon: Delete, label: "Backspaces", value: stats.backspaces ?? 0, color: "#ef4444" },
      { icon: PauseCircle, label: "Thinking Time", value: `${stats.avgPauseTime ?? 0}s`, color: "#06b6d4" },
      { icon: FolderOpen, label: "File Switches", value: stats.fileSwitches ?? 0, color: "#ec4899" },
      { icon: Save, label: "Saves", value: stats.saves ?? 0, color: "#84cc16" },
      { icon: MousePointer2, label: "Scrolls", value: stats.scrollCount ?? 0, color: "#f43f5e" },
      { icon: TerminalSquare, label: "Terminal Opens", value: stats.terminalOpenCount ?? 0, color: "#14b8a6" },
      { icon: Bug, label: "Debug Runs", value: stats.debugRunCount ?? 0, color: "#d946ef" },
      { icon: BarChart2, label: "Total Sessions", value: stats.totalSessions ?? 0, color: "#f97316" },
    ]
    : [];

  // Trend chart data
  const trendLabels = stats?.trend?.length
    ? stats.trend.map((_, i) => `Session ${i + 1}`)
    : [];

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Words Per Minute (WPM)",
        data: stats?.trend ?? [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7fa8", font: { size: 10 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(107, 127, 168, 0.1)" },
        ticks: { color: "#6b7fa8", font: { size: 10 } }
      },
    },
  };

  // Behaviour pie data
  const pieData = {
    labels: ["Coding", "Debugging", "Planning"],
    datasets: [
      {
        data: [
          stats?.behaviourCoding ?? 0,
          stats?.behaviourDebugging ?? 0,
          stats?.behaviourPlanning ?? 0,
        ],
        backgroundColor: ["#3b82f6", "#8b5cf6", "#06b6d4"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#6b7fa8", font: { size: 11 }, boxWidth: 10, padding: 16 },
      },
    },
    cutout: "65%",
  };

  const maxActivity = Math.max(
    stats?.activityTyping ?? 0,
    stats?.activityDeletions ?? 0,
    stats?.activityReviewing ?? 0,
    stats?.activityIdle ?? 0,
    1
  );

  const clusterName = stats?.clusterMeaning ?? "Demo Style";
  const confidence = stats?.confidence ?? 95;

  return (
    <div className="page-shell slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Real-time cognitive pattern analysis
            {user?.name ? ` · ${user.name}` : ""}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="metric-card animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-cardBorder mb-3" />
              <div className="h-7 w-16 rounded bg-cardBorder mb-2" />
              <div className="h-3 w-24 rounded bg-cardBorder" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {metrics.map((m) => <MetricCard key={m.label} {...m} />)}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Typing Speed Trend */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-accent" />
            <p className="text-sm font-semibold text-textPrimary">Typing Speed Trend</p>
          </div>
          <div style={{ height: "200px" }}>
            {stats?.trend?.length ? (
              <Line data={trendData} options={trendOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-textMuted text-sm">
                No session data yet
              </div>
            )}
          </div>
        </div>

        {/* Behavior Distribution */}
        <div className="glass-card p-5">
          <p className="text-sm font-semibold text-textPrimary mb-4">Behavior Distribution</p>
          <div style={{ height: "200px" }}>
            <Doughnut data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Session Activity */}
        <div className="glass-card p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-textPrimary mb-4">Session Activity</p>
          <SessionActivityBar label="Typing" value={stats?.activityTyping ?? 0} max={100} color="#3b82f6" />
          <SessionActivityBar label="Deletions" value={stats?.activityDeletions ?? 0} max={100} color="#ef4444" />
          <SessionActivityBar label="Reviewing" value={stats?.activityReviewing ?? 0} max={100} color="#8b5cf6" />
          <SessionActivityBar label="Idle" value={stats?.activityIdle ?? 0} max={100} color="#6b7fa8" />
        </div>

        {/* Cognitive Style Prediction */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-bold text-textPrimary uppercase tracking-wider">Cognitive Prediction</p>
              <p className="text-textMuted text-[10px] uppercase font-bold tracking-widest mt-0.5">ML decoded pattern</p>
            </div>
            <div className="badge badge-green text-[10px] font-bold">{confidence}% Confidence</div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <p className={`text-base font-bold mb-1.5 ${clusterName === "Pending Analysis" ? "text-textMuted animate-pulse" : "text-accentLight"}`}>
                {clusterName === "Pending Analysis" ? "Analyzing activity..." : clusterName}
              </p>
              <p className="text-[11px] text-textSecondary leading-relaxed">
                {stats?.sessionNarrative || (clusterName === "Pending Analysis" ? "Deciphering your current coding rhythm and focus shifts..." : "Your pattern reflects a balanced professional approach.")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col p-3 rounded-lg bg-accent/5 border border-accent/15">
                <span className="text-[9px] text-accent font-bold uppercase mb-1">Dominant</span>
                <span className="text-xs font-bold text-textPrimary truncate">{stats?.dominantTrait ?? "Logic"}</span>
              </div>
              <div className="flex flex-col p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <span className="text-[9px] text-amber-500 font-bold uppercase mb-1">Improve</span>
                <span className="text-xs font-bold text-textPrimary truncate">{stats?.improvementArea ?? "Accuracy"}</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] text-textMuted italic leading-normal border-t border-cardBorder/30 pt-3">
                {stats?.comparisonNarrative || "Establishing your session baseline..."}
              </p>
            </div>

            <button 
              onClick={fetchData}
              disabled={refreshing}
              className="btn-primary w-full text-xs font-bold py-2.5 mt-2 flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Synchronizing..." : "Run Live Analysis"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}