import { useEffect, useState } from "react";
import axios from "../api/axios";
import { History as HistoryIcon, Calendar, Folder, Clock, Zap, Delete, ChevronRight } from "lucide-react";

const clusterLabels = {
  0: "Systematic",
  1: "Creative",
  2: "Analytical",
  3: "Intuitive",
  4: "Methodical",
};

const clusterColors = {
  0: "badge-blue",
  1: "badge-green",
  2: "badge-amber",
  3: "badge-blue",
  4: "badge-green",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDuration(ms) {
  if (!ms) return "—";
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/history/cognitive-history")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.history ?? []);
        setHistory(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Session History</h1>
          <p className="page-subtitle">Your cognitive coding journey over time</p>
        </div>
        <div className="badge badge-blue">
          <HistoryIcon size={12} />
          {history.length} sessions
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-cardBorder/40 animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-textMuted">
            <HistoryIcon size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No sessions recorded yet.</p>
            <p className="text-xs mt-1">Start a coding session from your VS Code extension.</p>
          </div>
        ) : (
          <table className="cpd-table">
            <thead>
              <tr>
                <th><span className="flex items-center gap-1.5"><Calendar size={12} /> Date</span></th>
                <th><span className="flex items-center gap-1.5"><Folder size={12} /> Project</span></th>
                <th><span className="flex items-center gap-1.5"><Clock size={12} /> Duration</span></th>
                <th><span className="flex items-center gap-1.5"><Zap size={12} /> WPM</span></th>
                <th><span className="flex items-center gap-1.5"><Delete size={12} /> Backspaces</span></th>
                <th>Switches</th>
                <th>Cognitive Style</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={item._id ?? idx}>
                  <td className="text-textSecondary text-xs">{formatDate(item.date ?? item.createdAt)}</td>
                  <td>
                    <span className="font-medium">{item.project ?? "—"}</span>
                  </td>
                  <td className="text-textSecondary">{formatDuration(item.duration)}</td>
                  <td>
                    <span className="font-semibold text-accentLight">{item.wpm ?? "—"}</span>
                  </td>
                  <td className="text-textSecondary">{item.backspaces ?? "—"}</td>
                  <td className="text-textSecondary">{item.fileSwitches ?? "—"}</td>
                  <td>
                    <span className={`badge ${clusterColors[item.cluster] ?? "badge-blue"}`}>
                      {item.clusterMeaning ?? "Analyzing..."}
                    </span>
                  </td>
                  <td>
                    <ChevronRight size={14} className="text-textMuted" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}