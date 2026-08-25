import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle2, Circle, Sparkles, Trash2, Calendar, Tag, ChevronRight, X } from 'lucide-react';
import { api } from '../services/api';

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  start_date?: string;
  target_date?: string;
  progress: number;
  status: string;
  milestones: Milestone[];
}

export const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newMilestonesText, setNewMilestonesText] = useState('');
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      setGoals(res.data || []);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const milestonesList = newMilestonesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      await api.post('/goals', {
        title: newTitle,
        description: newDesc,
        category: newCategory,
        target_date: newTargetDate,
        milestones: milestonesList
      });

      setShowModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewMilestonesText('');
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      await api.put(`/goals/milestones/${milestoneId}/toggle`);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${goalId}`);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiBreakdown = async (goalId: string) => {
    setBreakingDownId(goalId);
    try {
      const res = await api.post(`/goals/${goalId}/ai-breakdown`);
      const suggested = res.data.suggested_milestones || [];
      for (const mTitle of suggested) {
        await api.post(`/goals/${goalId}/milestones`, { title: mTitle });
      }
      fetchGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setBreakingDownId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-400" />
            SMART Goals & Milestones
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Structure ambitious objectives with measurable action steps
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="primary-button flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-text-secondary">Loading your goals...</div>
      ) : goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-20 glass-card rounded-3xl border border-border">
          <Target className="w-16 h-16 mb-4 opacity-20 text-emerald-400" />
          <h2 className="text-lg font-bold text-text-primary mb-1">No Active Goals Yet</h2>
          <p className="max-w-md text-center text-xs text-text-secondary mb-6">
            Set your first milestone-driven goal. Your AI companion will help calculate steps and maintain momentum.
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="primary-button text-xs px-5 py-2.5 rounded-xl font-bold"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((g) => (
            <div key={g.id} className="glass-card p-6 rounded-3xl border border-border flex flex-col justify-between shadow-sm hover:border-primary/40 transition-all">
              
              <div>
                {/* Header & Category */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface border border-border text-primary">
                      {g.category}
                    </span>
                    <h3 className="text-lg font-bold text-text-primary mt-2">{g.title}</h3>
                  </div>
                  <button 
                    onClick={() => handleDeleteGoal(g.id)}
                    className="text-text-secondary hover:text-red-400 p-1.5 rounded-lg hover:bg-surface transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {g.description && (
                  <p className="text-xs text-text-secondary mb-4 leading-relaxed">{g.description}</p>
                )}

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary font-medium">Completion Progress</span>
                    <span className="font-bold text-primary">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                    Action Milestones ({g.milestones?.filter(m => m.completed).length || 0}/{g.milestones?.length || 0})
                  </span>

                  {g.milestones && g.milestones.length > 0 ? (
                    <div className="space-y-1.5">
                      {g.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(m.id)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors text-xs ${
                            m.completed 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 line-through' 
                              : 'bg-surface/50 border-border hover:bg-surface-hover text-text-primary'
                          }`}
                        >
                          {m.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-text-secondary flex-shrink-0" />
                          )}
                          <span className="truncate">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-secondary italic">No milestones defined.</p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-[11px] text-text-secondary flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {g.target_date ? `Deadline: ${g.target_date}` : 'Ongoing'}
                </span>

                <button
                  onClick={() => handleAiBreakdown(g.id)}
                  disabled={breakingDownId === g.id}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {breakingDownId === g.id ? 'Generating...' : 'AI Auto-Breakdown'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* New Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-card border border-border shadow-2xl rounded-3xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-1">Create SMART Goal</h2>
            <p className="text-xs text-text-secondary mb-5">Define what you want to achieve with specific action steps.</p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Complete System Architecture Certification"
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary"
                  >
                    {['Career', 'Health & Fitness', 'Personal Growth', 'Finance', 'Learning', 'Business'].map(c => (
                      <option key={c} value={c} className="bg-background">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Description (Optional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Why is this goal important? What is the intended outcome?"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary min-h-[70px] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Initial Milestones (1 per line)</label>
                <textarea
                  value={newMilestonesText}
                  onChange={(e) => setNewMilestonesText(e.target.value)}
                  placeholder="Finish syllabus review&#10;Complete 3 practice mock exams&#10;Submit official exam registration"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary min-h-[80px] resize-none"
                />
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoalsPage;
