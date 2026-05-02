import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { Bell, CheckCircle, AlertCircle, Info, Trash2, ExternalLink, X } from "lucide-react";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);
  const knownIds = useRef(new Set());

  useEffect(() => {
    fetchNotifications(true); // Initial fetch to populate knownIds
    
    // Polling interval - 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async (isInitial = false) => {
    try {
      const res = await axios.get("/notifications");
      const data = res.data || [];
      setNotifications(data);
      
      const unread = data.filter(n => !n.seen);
      setUnreadCount(unread.length);

      if (isInitial) {
        data.forEach(n => knownIds.current.add(n._id));
      } else {
        // Look for new unread notifications that aren't in knownIds
        const newNotification = unread.find(n => !knownIds.current.has(n._id));
        if (newNotification) {
          showToast(newNotification);
          knownIds.current.add(newNotification._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const showToast = (notification) => {
    setToast(notification);
    // Play a subtle sound if possible, or just hold for 5 seconds
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  const markAsSeen = async (id) => {
    try {
      await axios.put(`/notifications/${id}/seen`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, seen: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as seen:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'focus': return Zap;
      case 'fatigue': return Brain;
      case 'distraction': return LayoutGrid;
      default: return Info;
    }
  };

  const Zap = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  );

  const Brain = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A5 5 0 0 1 12 7c0 .42.06.83.17 1.22l.53 1.78h6.8c1.38 0 2.5 1.12 2.5 2.5v.5c0 1.38-1.12 2.5-2.5 2.5h-1.3l-.53 1.78c-.11.39-.17.8-.17 1.22a5 5 0 0 1-5 5A5 5 0 0 1 7.5 21a5 5 0 0 1-5-5c0-.42.06-.83.17-1.22l.53-1.78H2.5C1.12 13 0 11.88 0 10.5v-.5C0 8.62 1.12 7.5 2.5 7.5h1.3l.53-1.78C4.44 5.33 4.5 4.92 4.5 4.5a5 5 0 0 1 5-2.5Z"/></svg>
  );

  const LayoutGrid = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
  );

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] w-80 slide-in-bottom">
          <div className="glass-card p-4 border-accent/30 shadow-2xl bg-darkBg/95 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                {(() => {
                  const Icon = getIcon(toast.type);
                  return <Icon size={20} className="text-accent" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">New Cognitive Insight</p>
                <p className="text-sm font-semibold text-textPrimary leading-snug">{toast.message}</p>
                <div className="flex gap-3 mt-3">
                  <button 
                    onClick={() => { markAsSeen(toast._id); setToast(null); }}
                    className="text-[10px] font-bold text-accent uppercase hover:underline"
                  >
                    Mark Seen
                  </button>
                  <Link 
                    to="/analysis" 
                    onClick={() => setToast(null)}
                    className="text-[10px] font-bold text-textMuted uppercase hover:text-textPrimary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              <button onClick={() => setToast(null)} className="text-textMuted hover:text-textPrimary transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl bg-darkBg border border-cardBorder hover:border-accent/40 transition-colors group"
        >
          <Bell size={18} className="text-textSecondary group-hover:text-accent transition-colors" />
          
          {/* Live Indicator */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-40"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent border-2 border-darkBg"></span>
          </span>

          {unreadCount > 0 && (
            <span className="absolute -bottom-1 -right-1 flex items-center justify-center min-w-[16px] h-4 bg-accent text-[9px] font-bold text-white px-1 rounded-full border-2 border-darkBg">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-85 max-h-[480px] overflow-hidden rounded-2xl bg-darkBg/95 backdrop-blur-xl border border-cardBorder shadow-2xl z-50 slide-up">
            <div className="flex items-center justify-between p-4 border-b border-cardBorder/50">
              <div>
                <p className="text-sm font-bold text-textPrimary uppercase tracking-wider">Cognitive Insights</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[9px] text-textMuted font-bold uppercase tracking-widest">Live Decoding</span>
                </div>
              </div>
              <button 
                onClick={fetchNotifications}
                className="text-[10px] font-bold text-accent uppercase hover:underline"
              >
                Refresh
              </button>
            </div>

            <div className="overflow-y-auto max-h-[400px] p-2 space-y-2">
              {notifications.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-textMuted">
                  <div className="w-12 h-12 rounded-full bg-cardBorder/20 flex items-center justify-center mb-4">
                    <Bell size={24} className="opacity-20" />
                  </div>
                  <p className="text-xs font-medium">All systems clear!</p>
                  <p className="text-[10px] mt-1 opacity-50">Notifications will appear here as we decode your flow.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = getIcon(n.type);
                  return (
                    <div 
                      key={n._id} 
                      onClick={() => !n.seen && markAsSeen(n._id)}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${n.seen ? 'opacity-40 grayscale-[0.3] hover:opacity-60' : 'bg-accent/5 border border-accent/10 hover:border-accent/30 shadow-sm'}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${n.seen ? 'bg-white/5 text-textMuted' : 'bg-accent/10 text-accent'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-textPrimary leading-snug">{n.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-[10px] text-textMuted">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {!n.seen && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 p-4 text-[10px] font-bold text-accent uppercase hover:bg-accent/5 transition-colors border-t border-cardBorder/50"
            >
              System History
              <ExternalLink size={10} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
