import { useState } from "react";
import axios from "../api/axios";
import { 
  Search, Users, Zap, Target, BarChart2, TrendingUp, 
  Trophy, ArrowRight, Loader2, Info, AlertCircle, Sparkles
} from "lucide-react";

function ComparisonStat({ label, val1, val2, unit = "", icon: Icon, color = "accent" }) {
  const max = Math.max(val1, val2, 1);
  const pct1 = (val1 / max) * 100;
  const pct2 = (val2 / max) * 100;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className={`text-${color}`} />}
        <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest">{label}</span>
      </div>
      
      <div className="space-y-3">
        {/* User 1 Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] px-1">
            <span className="text-textSecondary">You</span>
            <span className="text-textPrimary font-bold">{val1}{unit}</span>
          </div>
          <div className="h-1.5 w-full bg-darkBg/50 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full bg-${color} rounded-full transition-all duration-1000 ease-out shadow-glowSm shadow-${color}/30`}
              style={{ width: `${pct1}%` }}
            />
          </div>
        </div>

        {/* User 2 Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] px-1">
            <span className="text-textSecondary">Target Peer</span>
            <span className="text-textPrimary font-bold">{val2}{unit}</span>
          </div>
          <div className="h-1.5 w-full bg-darkBg/50 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-cardBorder rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${pct2}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompareUser() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/auth/compare?email=${email}`);
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.error ?? "Search failed. Please check the email and try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Peer Comparison</h1>
          <p className="page-subtitle">Benchmark your cognitive style against other professional coders</p>
        </div>
        
        <form onSubmit={handleCompare} className="relative w-full max-w-sm">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by peer email..."
            className="input-field pl-11 bg-darkBg/40 border-accent/20 focus:border-accent"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-3 text-[10px] font-bold"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : "COMPARE"}
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-danger/10 border border-danger/30 text-danger text-sm rounded-xl px-5 py-4 mb-6 slide-in-bottom">
          <AlertCircle size={18} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
            <Users size={40} className="text-accent opacity-40" />
          </div>
          <h3 className="text-lg font-bold text-textPrimary mb-2">Find Your Peer</h3>
          <p className="text-sm text-textMuted max-w-xs">Enter a colleague's email to compare coding velocity, accuracy, and efficiency patterns.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 size={40} className="text-accent animate-spin mb-4" />
          <p className="text-sm text-textMuted animate-pulse">Scanning Atlas Cloud for peer sessions...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 pb-12">
          {/* Winner Banner */}
          <div className="glass-card p-6 border-accent/20 bg-gradient-to-r from-accent/5 via-transparent to-accent/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center shadow-glow shadow-accent/20">
                  <Trophy size={28} className="text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Cognitive Leader</p>
                  <h2 className="text-2xl font-bold text-textPrimary">{result.leader}</h2>
                </div>
              </div>

              <div className="flex-1 md:max-w-md">
                <div className="p-4 rounded-xl bg-darkBg/40 border border-cardBorder/40">
                  <div className="flex items-start gap-3">
                    <Sparkles size={16} className="text-chart3 mt-0.5" />
                    <p className="text-xs text-textSecondary italic leading-relaxed">
                      "{result.growthNarrative}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Stats Comparison */}
            <div className="lg:col-span-8 glass-card p-6">
              <div className="flex items-center gap-2 mb-8">
                <BarChart2 size={16} className="text-accent" />
                <p className="text-sm font-bold text-textPrimary uppercase tracking-wider">Metrics Benchmark</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <ComparisonStat 
                  label="Coding Velocity" 
                  val1={result.self.stats.avgWpm} 
                  val2={result.peer.stats.avgWpm} 
                  unit=" WPM"
                  icon={Zap}
                />
                <ComparisonStat 
                  label="Accuracy Rate" 
                  val1={result.self.stats.accuracy} 
                  val2={result.peer.stats.accuracy} 
                  unit="%"
                  icon={Target}
                  color="chart3"
                />
                <ComparisonStat 
                  label="Cognitive Efficiency" 
                  val1={Math.round(result.self.stats.efficiency)} 
                  val2={Math.round(result.peer.stats.efficiency)} 
                  unit="%"
                  icon={TrendingUp}
                  color="chart2"
                />
                <ComparisonStat 
                  label="Total Mastery" 
                  val1={result.self.stats.totalSessions} 
                  val2={result.peer.stats.totalSessions} 
                  unit=" Sessions"
                  icon={BarChart2}
                  color="warning"
                />
              </div>
            </div>

            {/* Right: Insights & Challenges */}
            <div className="lg:col-span-4 space-y-6">
              {/* Styles Card */}
              <div className="glass-card p-6 flex flex-col items-center text-center">
                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-6 w-full text-left">Archetype Comparison</p>
                
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">You</div>
                    <span className="text-[10px] font-bold text-textPrimary">{result.self.stats.dominantStyle}</span>
                  </div>
                  <div className="h-[1px] flex-1 mx-4 bg-cardBorder/50 relative">
                    <ArrowRight size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-textMuted" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-textMuted font-bold">Peer</div>
                    <span className="text-[10px] font-bold text-textPrimary">{result.peer.stats.dominantStyle}</span>
                  </div>
                </div>
              </div>

              {/* Challenges Card */}
              <div className="glass-card p-6 border-chart3/10 shadow-glow shadow-chart3/5">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-lg bg-chart3/20 flex items-center justify-center">
                    <Target size={14} className="text-chart3" />
                  </div>
                  <p className="text-sm font-bold text-textPrimary uppercase tracking-wider">Growth Challenges</p>
                </div>

                <div className="space-y-4">
                  {result.challenges.map((challenge, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-xl bg-darkBg/40 border border-cardBorder/30">
                      <div className="mt-1 w-4 h-4 rounded-full border border-chart3/50 flex items-center justify-center text-[8px] font-bold text-chart3">
                        {i + 1}
                      </div>
                      <p className="text-[11px] text-textSecondary leading-relaxed">{challenge}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-white/5 flex items-start gap-3">
                  <Info size={14} className="text-textMuted mt-0.5" />
                  <p className="text-[10px] text-textMuted leading-relaxed">
                    Comparison scores are calculated using a weighted average of velocity, precision, and cognitive efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}