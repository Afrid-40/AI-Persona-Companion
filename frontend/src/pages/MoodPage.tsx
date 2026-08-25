import React, { useState, useEffect } from 'react';
import { Smile, Sparkles, TrendingUp, Calendar, Heart, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

const MOOD_TYPES = [
  { id: 'Calm', emoji: '😌', label: 'Calm & Serene', color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
  { id: 'Driven', emoji: '⚡', label: 'Driven & Focused', color: 'border-amber-500 bg-amber-500/10 text-amber-400' },
  { id: 'Inspired', emoji: '🌟', label: 'Inspired & Creative', color: 'border-purple-500 bg-purple-500/10 text-purple-400' },
  { id: 'Low', emoji: '🌧️', label: 'Low & Heavy', color: 'border-indigo-500 bg-indigo-500/10 text-indigo-400' },
  { id: 'Tired', emoji: '😴', label: 'Tired & Drained', color: 'border-stone-500 bg-stone-500/10 text-stone-400' },
  { id: 'Anxious', emoji: '🌀', label: 'Anxious & Restless', color: 'border-red-500 bg-red-500/10 text-red-400' },
];

export const MoodPage = () => {
  const [selectedMood, setSelectedMood] = useState('Calm');
  const [score, setScore] = useState(7);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      const [histRes, analyticsRes] = await Promise.all([
        api.get('/mood'),
        api.get('/mood/analytics')
      ]);
      setHistory(histRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodData();
  }, []);

  const handleLogMood = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/mood', {
        mood_type: selectedMood,
        mood_score: score,
        note
      });
      setNote('');
      fetchMoodData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="pb-6 border-b border-border/50">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Smile className="w-6 h-6 text-amber-400" />
          Mood & Emotional Analytics
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitor your psychological baseline and receive AI-guided emotional regulation tips
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Mood Check-in Form (6 cols) */}
        <div className="lg:col-span-6 glass-card p-6 md:p-8 rounded-3xl border border-border space-y-6">
          <div>
            <h2 className="text-lg font-bold text-text-primary">How are you feeling right now?</h2>
            <p className="text-xs text-text-secondary mt-1">Select your predominant state of mind.</p>
          </div>

          <form onSubmit={handleLogMood} className="space-y-6">
            
            {/* Mood Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOOD_TYPES.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedMood === m.id
                      ? `${m.color} ring-2 ring-primary scale-102 shadow-md`
                      : 'bg-surface/50 border-border hover:bg-surface-hover text-text-secondary'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs font-bold text-text-primary">{m.id}</span>
                </button>
              ))}
            </div>

            {/* Score Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-semibold">Intensity Level</span>
                <span className="text-primary font-bold text-sm">{score} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full accent-primary bg-surface h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-secondary/60">
                <span>1 (Subdued)</span>
                <span>5 (Balanced)</span>
                <span>10 (Peak Energy)</span>
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">What triggered this state? (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="E.g., Concluded an intense sprint meeting; feeling energized but need recovery."
                className="w-full bg-surface-hover border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary min-h-[80px] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full primary-button py-3 rounded-xl text-xs font-bold shadow-md shadow-primary/20"
            >
              {submitting ? 'Logging...' : 'Log Mood Check-in'}
            </button>
          </form>
        </div>

        {/* Right: AI Insights & Distribution (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* AI Emotional Insight */}
          <div className="glass-card p-6 rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/10 via-surface to-background space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">AI Emotional Coaching</span>
            </div>
            <p className="text-sm text-text-primary leading-relaxed font-medium">
              "{analytics?.ai_insight || 'Your emotional baseline is centered. Continue regular check-ins to build psychological resilience.'}"
            </p>
          </div>

          {/* Emotional Metrics Summary */}
          <div className="glass-card p-6 rounded-3xl border border-border space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Mood Patterns & Distribution
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-surface/50 border border-border">
                <span className="text-xs text-text-secondary block">Average Intensity</span>
                <span className="text-2xl font-extrabold text-primary mt-1 block">
                  {analytics?.average_score || 7.5} / 10
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-surface/50 border border-border">
                <span className="text-xs text-text-secondary block">Frequent State</span>
                <span className="text-2xl font-extrabold text-amber-400 mt-1 block">
                  {analytics?.top_mood || 'Calm'}
                </span>
              </div>
            </div>

            {/* Distribution Bars */}
            {analytics?.distribution && (
              <div className="space-y-2 pt-2">
                {Object.entries(analytics.distribution).map(([mName, count]) => {
                  const numCount = Number(count) || 0;
                  const total = analytics.total_checkins || 1;
                  const pct = Math.round((numCount / total) * 100);
                  return (
                    <div key={mName} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">{mName}</span>
                        <span className="font-semibold text-text-primary">{numCount} times ({pct}%)</span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Mood History */}
          <div className="glass-card p-6 rounded-3xl border border-border space-y-3">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Recent Check-ins</h3>
            {history.length === 0 ? (
              <p className="text-xs text-text-secondary italic">No recent check-ins.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {history.slice(0, 5).map((h) => (
                  <div key={h.id} className="p-2.5 rounded-xl bg-surface/40 border border-border/50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">{h.mood_type}</span>
                      <span className="text-text-secondary/70">({h.mood_score}/10)</span>
                    </div>
                    <span className="text-[10px] text-text-secondary">
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default MoodPage;
