import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sparkles, User, ChevronDown } from 'lucide-react';
import { CommandPalette } from './CommandPalette';
import { NotificationsModal } from './NotificationsModal';
import { api } from '../services/api';

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [personaId, setPersonaId] = useState(localStorage.getItem('selectedPersona') || 'krishna');
  const [preferredName, setPreferredName] = useState(localStorage.getItem('preferred_name') || 'Explorer');

  const personaMap: Record<string, { name: string; emoji: string }> = {
    krishna: { name: 'Krishna', emoji: '🦚' },
    chhava: { name: 'Chhava', emoji: '🦁' },
    chanakya: { name: 'Chanakya', emoji: '📜' },
  };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        const unread = (res.data || []).filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        // silent
      }
    };
    fetchUnread();
  }, []);

  const handleSwitchPersona = (id: string) => {
    setPersonaId(id);
    localStorage.setItem('selectedPersona', id);
    window.location.reload();
  };

  return (
    <>
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      <NotificationsModal 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)}
        onUpdateCount={(count) => setUnreadCount(count)}
      />

      <header className="w-full flex items-center justify-between pb-4 mb-4 border-b border-border/40 select-none">
        
        {/* Global Search Bar (Trigger for Ctrl+K) */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-surface/60 hover:bg-surface-hover border border-border text-xs text-text-secondary w-72 justify-between transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-primary" />
            <span>Search anything...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-secondary">
            Ctrl K
          </kbd>
        </button>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          
          {/* Persona Switcher Quick Pill */}
          <div className="relative flex items-center">
            <select
              value={personaId}
              onChange={(e) => handleSwitchPersona(e.target.value)}
              className="bg-surface/80 hover:bg-surface-hover border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary font-bold cursor-pointer transition-colors appearance-none pr-7 pl-2.5"
            >
              <option value="krishna">🦚 Krishna (Wise Guide)</option>
              <option value="chhava">🦁 Chhava (Warrior)</option>
              <option value="chanakya">📜 Chanakya (Strategist)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 pointer-events-none" />
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="p-2 rounded-xl bg-surface/80 hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-surface/80 hover:bg-surface-hover border border-border text-xs text-text-primary font-semibold transition-colors"
          >
            <span>{preferredName}</span>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-secondary to-primary p-[1px] flex items-center justify-center">
              <div className="w-full h-full bg-background rounded-[7px] flex items-center justify-center">
                <User className="w-3 h-3 text-text-primary" />
              </div>
            </div>
          </button>

        </div>

      </header>
    </>
  );
};

export default DashboardHeader;
