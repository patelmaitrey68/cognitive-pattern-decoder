import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/notifications")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setNotifications(data);
      })
      .catch(err => console.error("Notifications fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Info;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="page-shell slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with your coding insights</p>
        </div>
        <div className="badge badge-blue">
          <Bell size={12} />
          {notifications.length} notifications
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-cardBorder/40 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-textMuted">
            <Bell size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No notifications yet.</p>
            <p className="text-xs mt-1">We'll notify you about important updates and insights.</p>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            {notifications.map((notification, i) => {
              const Icon = getIcon(notification.type);
              const color = getColor(notification.type);
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-darkBg border border-cardBorder/60">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-textPrimary">{notification.message || notification.title || 'Notification'}</p>
                    {notification.description && (
                      <p className="text-xs text-textSecondary mt-1">{notification.description}</p>
                    )}
                    {notification.createdAt && (
                      <p className="text-xs text-textMuted mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}