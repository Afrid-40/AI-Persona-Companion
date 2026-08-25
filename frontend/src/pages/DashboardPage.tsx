import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Target, CheckSquare, BookOpen, BrainCircuit, 
  MessageSquare, Mic, ArrowRight, Flame, Smile, TrendingUp, 
  Plus, Clock, ShieldCheck, ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Explorer');
  const [personaId, setPersonaId] = useState(localStorage.getItem('selectedPersona') || 'krishna');
  const [goals, setGoals] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const personaQuotes: Record<string, { quote: string; role: string; emoji: string }> = {
    krishna: {
      quote: "You are not your thoughts, dear one. You are the awareness behind them.",
      role: "The Wise Guide",
      emoji: "🦚"
    },
    chhava: {
      quote: "Victory belongs to those who conquer themselves first. Stand tall and execute.",
      role: "The Warrior",
      emoji: "🦁"
    },
    chanakya: {
      quote: "A wise person plans three steps ahead while the world reacts to the first.",
      role: "The Master Strategist",
      emoji: "📜"
    }
  };

  const activePersona = personaQuotes[personaId] || personaQuotes.krishna;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [goalsRes, habitsRes, journalsRes, memoriesRes, convosRes, analyticsRes] = await Promise.all([
          api.get('/goals').catch(() => ({ data: [] })),
          api.get('/habits').catch(() => ({ data: [] })),
          api.get('/journal').catch(() => ({ data: [] })),
          api.get('/memories').catch(() => ({ data: [] })),
          api.get('/chat/conversations').catch(() => ({ data: [] })),
          api.get('/analytics/summary').catch(() => ({ data: null }))
        ]);

        setGoals(goalsRes.data || []);
        setHabits(habitsRes.data || []);
        setJournals(journalsRes.data || []);
        setMemories(memoriesRes.data || []);
        setConversations(convosRes.data || []);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleHabit = async (habitId: string) => {
    try {
      await api.post(`/habits/${habitId}/toggle`);
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          const completed = !h.completed_today;
          return {
            ...h,
            completed_today: completed,
            streak_count: completed ? h.streak_count + 1 : Math.max(0, h.streak_count - 1)
          };
        }
        return h;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-8">
      
      {/* Header Greeting Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-border shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{activePersona.emoji}</span>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Active Companion: {personaId.toUpperCase()} • {activePersona.role}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-sm font-serif italic text-text-secondary mt-2 border-l-2 border-primary/50 pl-3">
            "{activePersona.quote}"
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/dashboard/chat')}
            className="primary-button flex items-center justify-center gap-2 text-sm px-5 py-3 rounded-xl font-bold flex-1 md:flex-initial shadow-lg shadow-primary/20"
          >
            <MessageSquare className="w-4 h-4" /> Start AI Chat
          </button>
          <button
            onClick={() => navigate('/dashboard/voice')}
            className="outline-button flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl font-medium"
            title="Voice session"
          >
            <Mic className="w-4 h-4 text-primary" /> Voice
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Goal Progress', value: `${analytics?.goal_completion_rate || 0}%`, sub: `${goals.length} Active Goals`, icon: Target, color: 'text-emerald-400' },
          { label: 'Active Streak', value: `${analytics?.longest_streak || 0} Days`, sub: `${habits.length} Habits Tracked`, icon: Flame, color: 'text-amber-400' },
          { label: 'Emotional Score', value: `${analytics?.mood_average || 7.5}/10`, sub: 'Balanced Mood', icon: Smile, color: 'text-purple-400' },
          { label: 'Memories Stored', value: `${memories.length}`, sub: 'Continuous Context', icon: BrainCircuit, color: 'text-blue-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card p-4 md:p-5 rounded-2xl border border-border/80 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-text-secondary">{kpi.label}</span>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <span className="text-2xl font-black text-text-primary block">{kpi.value}</span>
              <span className="text-[11px] text-text-secondary/70">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Habits & Goals (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Habits Widget */}
          <div className="glass-card p-6 rounded-3xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-text-primary">Today's Habits</h2>
              </div>
              <button 
                onClick={() => navigate('/dashboard/habits')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {habits.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-secondary">
                No habits logged yet. Click below to add your first daily habit!
              </div>
            ) : (
              <div className="space-y-2.5">
                {habits.slice(0, 4).map((h) => (
                  <div
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      h.completed_today 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-surface/50 border-border hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{h.icon || '🧘'}</span>
                      <div>
                        <span className={`text-sm font-semibold block ${h.completed_today ? 'text-emerald-400 line-through' : 'text-text-primary'}`}>
                          {h.title}
                        </span>
                        <span className="text-[11px] text-text-secondary">{h.frequency}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" /> {h.streak_count}d
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${h.completed_today ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border'}`}>
                        {h.completed_today && <CheckSquare className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Goals Widget */}
          <div className="glass-card p-6 rounded-3xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-text-primary">Key Objectives</h2>
              </div>
              <button 
                onClick={() => navigate('/dashboard/goals')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-secondary">
                No active goals. Set your first SMART goal to track progress!
              </div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((g) => (
                  <div key={g.id} className="p-4 rounded-2xl bg-surface/40 border border-border/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-text-primary">{g.title}</span>
                      <span className="text-xs font-bold text-primary">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: AI Insights, Recent Conversations, Journal (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI Companion Live Insight */}
          <div className="glass-card p-6 rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/10 via-surface to-background relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Proactive Insight</span>
            </div>
            <p className="text-sm text-text-primary leading-relaxed">
              "You are maintaining strong momentum across your goals. Remember to align your evening habits with calm reflection to avoid mental fatigue."
            </p>
            <div className="mt-4 pt-3 border-t border-border/40 flex justify-between items-center text-xs text-text-secondary">
              <span>Grounding: Memory Timeline</span>
              <button onClick={() => navigate('/dashboard/chat')} className="text-primary font-semibold hover:underline">
                Ask Companion →
              </button>
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="glass-card p-6 rounded-3xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-text-primary">Recent Chats</h2>
              </div>
              <button 
                onClick={() => navigate('/dashboard/chat')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                New Chat <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {conversations.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-secondary">
                No past chat sessions yet. Start your first dialogue!
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate('/dashboard/chat')}
                    className="p-3 rounded-xl bg-surface/40 hover:bg-surface-hover border border-border/50 cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-bold text-text-primary block truncate">{c.title}</span>
                    <span className="text-[10px] text-text-secondary truncate block mt-0.5">
                      {c.last_message || 'Conversation active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Drawer */}
          <div className="glass-card p-5 rounded-3xl border border-border grid grid-cols-2 gap-2">
            <button 
              onClick={() => navigate('/dashboard/journal')}
              className="p-3 rounded-2xl bg-surface/50 hover:bg-surface-hover border border-border text-center text-xs font-semibold text-text-primary flex flex-col items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Log Journal</span>
            </button>
            <button 
              onClick={() => navigate('/dashboard/mood')}
              className="p-3 rounded-2xl bg-surface/50 hover:bg-surface-hover border border-border text-center text-xs font-semibold text-text-primary flex flex-col items-center gap-1.5 transition-colors"
            >
              <Smile className="w-4 h-4 text-amber-400" />
              <span>Check Mood</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
