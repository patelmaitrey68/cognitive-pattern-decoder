import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  LineChart,
  History,
  Settings,
  LogOut,
  Brain,
  ChevronLeft,
  Bell,
  Users,
} from "lucide-react";
import NotificationCenter from "./NotificationCenter";

const navLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analysis", label: "Session Analysis", icon: LineChart },
  { to: "/history", label: "History", icon: History },
  { to: "/compare", label: "Peer Compare", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name || user?.email || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 flex-shrink-0 transition-all duration-300 border-r border-cardBorder"
      style={{
        width: collapsed ? "72px" : "240px",
        background: "linear-gradient(180deg, #070d1a 0%, #060c18 100%)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-cardBorder">
        <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 shadow-glowSm">
          <Brain size={20} className="text-accent" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm text-textPrimary tracking-wide whitespace-nowrap">
            CPD Platform
          </span>
        )}
        <div className={`ml-auto ${collapsed ? 'hidden' : 'block'}`}>
          <NotificationCenter />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-textMuted mb-3 px-2">
            Navigation
          </p>
        )}
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User profile strip */}
      {!collapsed && (
        <div className="px-3 pb-2 border-t border-cardBorder pt-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-chart2 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-textPrimary truncate">{displayName}</p>
              <p className="text-[10px] text-textMuted">Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-cardBorder pt-3">
        <button
          onClick={handleLogout}
          className={`nav-item w-full text-danger hover:bg-danger/10 hover:text-danger ${collapsed ? "justify-center px-2" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`nav-item w-full ${collapsed ? "justify-center px-2" : ""}`}
          title={collapsed ? "Expand" : undefined}
        >
          <ChevronLeft
            size={18}
            className={`flex-shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          />
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}