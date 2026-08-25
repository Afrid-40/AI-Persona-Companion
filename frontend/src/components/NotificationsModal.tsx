import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, Target, CheckSquare, BookOpen, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCount?: (count: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, onUpdateCount }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
      const unread = (res.data || []).filter((n: NotificationItem) => !n.is_read).length;
      if (onUpdateCount) onUpdateCount(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      const unread = notifications.filter(n => n.id !== id && !n.is_read).length;
      if (onUpdateCount) onUpdateCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (onUpdateCount) onUpdateCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      if (onUpdateCount) onUpdateCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'goal_reminder': return <Target className="w-4 h-4 text-emerald-400" />;
      case 'habit_reminder': return <CheckSquare className="w-4 h-4 text-amber-400" />;
      case 'journal_reminder': return <BookOpen className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col mt-14 max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-surface/50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text-primary">Notifications</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
              {notifications.filter(n => !n.is_read).length} new
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-surface/30 border-b border-border/30 text-xs text-text-secondary">
          <button onClick={markAllAsRead} className="hover:text-primary transition-colors flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </button>
          <button onClick={clearAll} className="hover:text-red-400 transition-colors flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {loading && (
            <div className="py-8 text-center text-sm text-text-secondary">Loading notifications...</div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="py-12 text-center text-sm text-text-secondary flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 opacity-30" />
              <span>You're all caught up!</span>
            </div>
          )}

          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                notif.is_read
                  ? 'bg-surface/30 border-border/40 opacity-75'
                  : 'bg-surface-hover/80 border-primary/30 shadow-sm'
              }`}
            >
              <div className="p-2 rounded-lg bg-surface border border-border/50 h-fit mt-0.5 flex-shrink-0">
                {getTypeIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-text-primary truncate">{notif.title}</span>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{notif.message}</p>
                <span className="text-[10px] text-text-secondary/60 mt-2 block">
                  {new Date(notif.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
