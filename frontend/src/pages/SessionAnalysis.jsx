import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { Brain, Target, Zap, Clock, Activity, BookOpen, Type } from "lucide-react";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const clusterLabels = {
  0: "Systematic Thinker",
  1: "Creative Coder",
  2: "Analytical Processor",
  3: "Intuitive Developer",
  4: "Methodical Planner",
};

const clusterDescriptions = {
  0: "You approach problems methodically, following logical steps with high consistency. Your structured patterns reveal strong analytical discipline.",
  1: "You demonstrate creative problem-solving with flexible thinking patterns. High typing variation indicates an exploratory coding style.",
  2: "You excel at breaking down complex problems. Your behavior metrics show strong attention to accuracy over speed.",
  3: "You rely on instinct and experience, writing code fluidly with minimal pauses and high confidence.",
  4: "You are a planner-first developer. Your data shows frequent pauses for thinking before implementing.",
};

function DetailMetric({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-lg bg-darkBg border border-cardBorder/60">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-textSecondary">{label}</p>
        <p className="text-sm font-semibold text-textPrimary">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function SessionAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/sessions/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const clusterName = data?.clusterMeaning ?? "Demo Style";
  const description = clusterDescriptions[data?.cluster] ?? "Analysis of your cognitive coding patterns.";

  // Radar chart values (normalize 0–100)
  const radarData = {
    labels: ["Focus", "Speed", "Accuracy", "Consistency", "Memory", "Logic"],
    datasets: [
      {
        label: "Cognitive Traits",
        data: [
          data?.focusScore ?? 0,
          Math.min(100, data?.wpm ?? 0),
          data?.accuracy ?? 0,
          data?.consistencyScore ?? 0,
          data?.memoryScore ?? 0,
          data?.logicScore ?? 0,
        ],
        backgroundColor: "rgba(59,130,246,0.15)",
        borderColor: "#3b82f6",
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#3b82f6",
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      r: {
        angleLines: { color: "#1a2744" },
        grid: { color: "#1a2744" },
        pointLabels: { color: "#6b7fa8", font: { size: 11 } },
        ticks: { color: "#3d5080", backdropColor: "transparent", stepSize: 25 },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="page-shell slide-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Session Analysis</h1>
        <p className="page-subtitle">Deep dive into your coding behavior</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse h-64" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            {/* Radar Chart */}
            <div className="glass-card p-6">
              <p className="text-sm font-semibold text-textPrimary mb-1">Cognitive Traits</p>
              <p className="text-xs text-textMuted mb-5">Multidimensional behavior analysis</p>
              <div style={{ height: "280px" }}>
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>

            {/* Cognitive Profile Analysis */}
            <div className="glass-card p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Brain size={16} className="text-accent" />
                </div>
                <p className="text-sm font-semibold text-textPrimary">Cognitive Profile Analysis</p>
              </div>

              <div className="rounded-xl p-4 mb-5" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <p className="text-xs text-textMuted mb-2 uppercase tracking-wider font-bold">Cognitive Profile Analysis</p>
                <p className={`text-sm leading-relaxed mb-3 ${data?.clusterMeaning === "Pending Analysis" ? "text-textMuted animate-pulse whitespace-pre-wrap" : "text-textPrimary"}`}>
                  {data?.sessionNarrative || (data?.clusterMeaning === "Pending Analysis" ? "Analyzing your coding patterns to identify cognitive shifts..." : description)}
                </p>
                <p className="text-xs text-textSecondary leading-relaxed border-t border-cardBorder/30 pt-3 italic">
                  {data?.comparisonNarrative || "Establishing your baseline for future comparisons..."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="flex flex-col p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <span className="text-[10px] text-accent font-bold uppercase mb-1">Dominant Trait</span>
                  <span className="text-sm font-bold text-textPrimary">{data?.dominantTrait ?? "Logic"}</span>
                </div>
                <div className="flex flex-col p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <span className="text-[10px] text-amber-500 font-bold uppercase mb-1">Area for Improv.</span>
                  <span className="text-sm font-bold text-textPrimary">{data?.improvementArea ?? "Accuracy"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="glass-card p-6">
            <p className="text-sm font-semibold text-textPrimary mb-4">Detailed Metrics</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <DetailMetric icon={Clock} label="Avg Pause Duration" value={`${data?.avgPauseTime ?? 0}s`} color="#3b82f6" />
              <DetailMetric icon={Type} label="Total Characters" value={data?.totalTypedChars ?? 0} color="#6366f1" />
              <DetailMetric icon={Activity} label="Keypress Latency" value={`${data?.keypressLatency ?? 0}ms`} color="#8b5cf6" />
              <DetailMetric icon={Target} label="Error Frequency" value={data?.errorRate ?? "0%"} color="#ef4444" />
              <DetailMetric icon={BookOpen} label="Focus Score" value={`${data?.focusScore ?? 0}%`} color="#10b981" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}