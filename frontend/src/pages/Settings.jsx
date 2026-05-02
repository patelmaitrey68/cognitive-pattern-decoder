import { useState, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { 
  User, Mail, Save, Shield, KeyRound, Loader2, CheckCircle, 
  Bell, Zap, Brain, Moon, Info, LayoutGrid, AlertCircle
} from "lucide-react";

function Toggle({ label, sub, checked, onChange, icon: Icon, color = "accent" }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-darkBg/30 border border-cardBorder/40 hover:border-cardBorder transition-colors">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg bg-${color}/10 flex items-center justify-center`}>
            <Icon size={16} className={`text-${color}`} />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-textPrimary">{label}</p>
          {sub && <p className="text-[10px] text-textMuted mt-0.5">{sub}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-accent' : 'bg-cardBorder'}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, login } = useContext(AuthContext);

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  });

  const [settings, setSettings] = useState({
    notificationsEnabled: user?.settings?.notificationsEnabled ?? true,
    fatigueAlerts: user?.settings?.fatigueAlerts ?? true,
    distractionAlerts: user?.settings?.distractionAlerts ?? true,
    focusCelebrations: user?.settings?.focusCelebrations ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError("");
    try {
      const res = await axios.put("/auth/update", {
        name: profile.name,
        settings: settings
      });
      
      // Update context with new data
      login({ 
        ...user, 
        name: res.data?.name ?? profile.name,
        settings: res.data?.settings ?? settings
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="page-shell slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your cognitive profile preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-glow shadow-accent/20"
        >
          {saving ? (
            <><Loader2 size={16} className="animate-spin" /> Saving…</>
          ) : (
            <><Save size={16} /> Save Preferences</>
          )}
        </button>
      </div>

      <div className="max-w-4xl mx-auto pb-12">
        {/* Main Settings */}
        <div className="space-y-6">
          
          {/* Success/Error Alerts */}
          {success && (
            <div className="flex items-center gap-3 bg-success/10 border border-success/30 text-success text-sm rounded-xl px-5 py-4 slide-in-bottom">
              <CheckCircle size={18} />
              <p className="font-medium">All preferences has been synchronized across your devices.</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 bg-danger/10 border border-danger/30 text-danger text-sm rounded-xl px-5 py-4 slide-in-bottom">
              <AlertCircle size={18} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Profile Section */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <User size={16} className="text-accent" />
              </div>
              <p className="text-sm font-bold text-textPrimary uppercase tracking-wider">Public Profile</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent to-chart2 flex items-center justify-center text-3xl font-bold text-white shadow-glow">
                  {initials}
                </div>
                <button className="text-[10px] font-bold text-accent uppercase hover:underline">Change Avatar</button>
              </div>

              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-textMuted uppercase mb-2 tracking-widest">Display Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                      <input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Coding Persona"
                        className="input-field pl-11 bg-darkBg/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-textMuted uppercase mb-2 tracking-widest">Account email</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted" />
                      <input
                        value={profile.email}
                        disabled
                        className="input-field pl-11 opacity-40 cursor-not-allowed bg-darkBg/10 border-dashed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Bell size={16} className="text-indigo-400" />
                </div>
                <p className="text-sm font-bold text-textPrimary uppercase tracking-wider">Cognitive Notifications</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${settings.notificationsEnabled ? 'bg-success/20 text-success' : 'bg-cardBorder text-textMuted'}`}>
                {settings.notificationsEnabled ? "LIVE" : "PAUSED"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle 
                label="Enable Notifications" 
                sub="Master switch for all system alerts"
                checked={settings.notificationsEnabled}
                onChange={(val) => setSettings({ ...settings, notificationsEnabled: val })}
                icon={Bell}
              />
              <Toggle 
                label="Efficiency Celebrations" 
                sub="Notify when you hit peak focus flow"
                checked={settings.focusCelebrations}
                onChange={(val) => setSettings({ ...settings, focusCelebrations: val })}
                icon={Zap}
                color="success"
              />
              <Toggle 
                label="Fatigue Warnings" 
                sub="Alert when session length risks burnout"
                checked={settings.fatigueAlerts}
                onChange={(val) => setSettings({ ...settings, fatigueAlerts: val })}
                icon={Brain}
                color="warning"
              />
              <Toggle 
                label="Distraction Alerts" 
                sub="Detect context switching patterns"
                checked={settings.distractionAlerts}
                onChange={(val) => setSettings({ ...settings, distractionAlerts: val })}
                icon={LayoutGrid}
                color="danger"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}