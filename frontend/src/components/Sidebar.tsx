import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, Mic, Target, CheckSquare, 
  BookOpen, Smile, BrainCircuit, Sparkles, TrendingUp, 
  User, Settings, ShieldCheck, LogOut 
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Command Center', to: '/dashboard' },
    { icon: MessageSquare, label: 'AI Chat Companion', to: '/dashboard/chat' },
    { icon: Mic, label: 'Voice Session', to: '/dashboard/voice' },
    { icon: Target, label: 'SMART Goals', to: '/dashboard/goals' },
    { icon: CheckSquare, label: 'Habit Tracker', to: '/dashboard/habits' },
    { icon: BookOpen, label: 'Daily Journal', to: '/dashboard/journal' },
    { icon: Smile, label: 'Mood Analytics', to: '/dashboard/mood' },
    { icon: Sparkles, label: 'Recommendations', to: '/dashboard/recommendations' },
    { icon: BrainCircuit, label: 'Memory Timeline', to: '/dashboard/memories' },
    { icon: TrendingUp, label: 'Growth Analytics', to: '/dashboard/analytics' },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col glass-card border-l-0 border-t-0 border-b-0 rounded-none z-40 p-4 select-none">
      
      {/* Logo Area */}
      <div 
        onClick={() => navigate('/')}
        className="flex items-center gap-3 px-2 mb-6 mt-2 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-primary p-[2px] shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base leading-tight text-text-primary">AI Persona</span>
          <span className="text-[10px] text-text-secondary tracking-widest uppercase">SaaS Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar pr-1">
        <span className="text-[11px] font-bold text-text-secondary/70 uppercase tracking-wider mb-2 px-3">
          Modules
        </span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-xs",
              isActive 
                ? "bg-primary/15 text-primary font-bold shadow-sm shadow-primary/10" 
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Area */}
      <div className="flex flex-col gap-1 mt-auto border-t border-border/50 pt-3">
        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) => clsx(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs",
            isActive ? "bg-primary/15 text-primary font-bold" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          )}
        >
          <User className="w-4 h-4" />
          <span>Profile & Archetype</span>
        </NavLink>

        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) => clsx(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs",
            isActive ? "bg-primary/15 text-primary font-bold" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Engine Settings</span>
        </NavLink>

        <NavLink
          to="/dashboard/admin"
          className={({ isActive }) => clsx(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs",
            isActive ? "bg-primary/15 text-primary font-bold" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          )}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Admin & Health</span>
        </NavLink>
        
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-all text-xs text-left mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
