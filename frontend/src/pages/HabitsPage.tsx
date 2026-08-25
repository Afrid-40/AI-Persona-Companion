import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Flame, Check, Trash2, Calendar, Sparkles, X } from 'lucide-react';
import { api } from '../services/api';

interface Habit {
  id: string;
  title: string;
  icon: string;
  category: string;
  frequency: string;
  streak_count: number;
  completed_today: boolean;
  history: string[];
}

export const HabitsPage = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('🧘');
  const [newCategory, setNewCategory] = useState('Wellness');
  const [newFreq, setNewFreq] = useState('Daily');

  const EMOJI_OPTIONS = ['🧘', '📚', '⚡', '💧', '🏃', '🧠', '✍️', '🍎', '💤', '🎯'];

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/habits');
      setHabits(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleToggleHabit = async (habitId: string) => {
    try {
      const res = await api.post(`/habits/${habitId}/toggle`);
      setHabits(prev => prev.map(h => {
        if (h.id === habitId) {
          return {
            ...h,
            completed_today: res.data.completed_today,
            streak_count: res.data.streak_count
          };
        }
        return h;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await api.post('/habits', {
        title: newTitle,
        icon: newIcon,
        category: newCategory,
        frequency: newFreq
      });
      setShowModal(false);
      setNewTitle('');
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (err) {
      console.error(err);
    }
  };

  // Past 7 days date strings
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-400" />
            Habit Consistency Tracker
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Build unshakeable discipline with daily streak loops
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="primary-button flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {/* Habits List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-text-secondary">Loading habits...</div>
      ) : habits.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-20 glass-card rounded-3xl border border-border">
          <CheckSquare className="w-16 h-16 mb-4 opacity-20 text-amber-400" />
          <h2 className="text-lg font-bold text-text-primary mb-1">No Habits Tracked</h2>
          <p className="max-w-md text-center text-xs text-text-secondary mb-6">
            Small daily actions compound into massive life transformations. Add your first habit today.
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="primary-button text-xs px-5 py-2.5 rounded-xl font-bold"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((h) => (
            <div key={h.id} className="glass-card p-5 rounded-3xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition-all">
              
              {/* Left Details */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-2xl flex-shrink-0">
                  {h.icon || '🧘'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-text-primary">{h.title}</h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
                      {h.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" /> {h.streak_count} day streak
                    </span>
                    <span>• {h.frequency}</span>
                  </div>
                </div>
              </div>

              {/* Right: 7-Day History + Today's Checkbox */}
              <div className="flex items-center gap-6 justify-between md:justify-end">
                
                {/* 7-Day Mini Heatmap */}
                <div className="flex items-center gap-1.5">
                  {past7Days.map((dStr, idx) => {
                    const isDone = h.history?.includes(dStr) || (idx === 6 && h.completed_today);
                    const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(dStr).getDay()];
                    return (
                      <div key={dStr} className="flex flex-col items-center gap-1">
                        <span className="text-[9px] text-text-secondary/60">{dayLetter}</span>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          isDone 
                            ? 'bg-emerald-500 border-emerald-400 text-white' 
                            : 'bg-surface/60 border-border text-text-secondary/40'
                        }`}>
                          {isDone ? '✓' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Today's Toggle Button */}
                <button
                  onClick={() => handleToggleHabit(h.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    h.completed_today
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'primary-button shadow-md shadow-primary/20'
                  }`}
                >
                  {h.completed_today ? (
                    <>Completed Today ✓</>
                  ) : (
                    <>Mark Done</>
                  )}
                </button>

                <button
                  onClick={() => handleDeleteHabit(h.id)}
                  className="p-2 text-text-secondary hover:text-red-400 hover:bg-surface rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* New Habit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card border border-border shadow-2xl rounded-3xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-1">Create New Habit</h2>
            <p className="text-xs text-text-secondary mb-5">Define a recurring discipline you want to master.</p>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Habit Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., 20 Mins Deep Meditation"
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Choose Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setNewIcon(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                        newIcon === em ? 'bg-primary/20 border-primary scale-110' : 'bg-surface border-border hover:bg-surface-hover'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary"
                  >
                    {['Wellness', 'Focus & Work', 'Fitness', 'Learning', 'Mindset'].map(c => (
                      <option key={c} value={c} className="bg-background">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Frequency</label>
                  <select
                    value={newFreq}
                    onChange={(e) => setNewFreq(e.target.value)}
                    className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary"
                  >
                    {['Daily', 'Weekly', 'Weekdays'].map(f => (
                      <option key={f} value={f} className="bg-background">{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="outline-button px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button px-5 py-2 text-xs font-bold"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HabitsPage;
