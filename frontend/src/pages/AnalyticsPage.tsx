import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Flame, Smile, BookOpen, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="pb-6 border-b border-border/50">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          Analytics & Growth Engine
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Holistic performance metrics across goals, habits, emotional balance, and cognitive reflections
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Goal Success Rate', value: `${summary?.goal_completion_rate || 0}%`, sub: `${summary?.total_goals || 0} Total Goals`, icon: Target, color: 'text-emerald-400' },
          { label: 'Longest Streak', value: `${summary?.longest_streak || 0}d`, sub: `${summary?.active_habits || 0} Active Habits`, icon: Flame, color: 'text-amber-400' },
          { label: 'Mood Baseline', value: `${summary?.mood_average || 7.5}/10`, sub: 'Balanced Emotional State', icon: Smile, color: 'text-purple-400' },
          { label: 'Total Reflections', value: `${summary?.total_journals || 0}`, sub: `${summary?.total_memories || 0} Context Nodes`, icon: BookOpen, color: 'text-blue-400' },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border border-border flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold text-text-secondary">{kpi.label}</span>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <span className="text-2xl font-black text-text-primary">{kpi.value}</span>
              <span className="text-[10px] text-text-secondary/70 block mt-0.5">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Emotional Trend Chart */}
        <div className="glass-card p-6 rounded-3xl border border-border space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Smile className="w-4 h-4 text-purple-400" />
            7-Day Emotional Baseline Trend
          </h2>
          <p className="text-xs text-text-secondary">Tracking daily psychological energy from 1 (Low) to 10 (Peak).</p>

          <div className="pt-6 pb-2">
            <div className="flex items-end justify-between h-40 gap-3 px-2">
              {(summary?.weekly_mood_trend || [
                { day: 'Mon', score: 7 },
                { day: 'Tue', score: 8 },
                { day: 'Wed', score: 7 },
                { day: 'Thu', score: 9 },
                { day: 'Fri', score: 8 },
                { day: 'Sat', score: 9 },
                { day: 'Sun', score: 8 },
              ]).map((item: any, i: number) => {
                const heightPct = Math.max(15, (item.score / 10) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.score}
                    </span>
                    <div 
                      className="w-full max-w-[36px] bg-gradient-to-t from-primary/30 to-primary rounded-t-xl transition-all duration-500 hover:brightness-125"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-semibold text-text-secondary">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Habit Consistency Distribution */}
        <div className="glass-card p-6 rounded-3xl border border-border space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Habit Adherence Breakdown
          </h2>
          <p className="text-xs text-text-secondary">Consistency scores based on 30-day completion rates.</p>

          <div className="space-y-4 pt-2">
            {(summary?.habit_consistency?.length ? summary.habit_consistency : [
              { name: 'Daily Meditation', streak: 12, rate: 85 },
              { name: 'Deep Work Sprint', streak: 8, rate: 75 },
              { name: 'Evening Journal', streak: 15, rate: 92 },
            ]).map((h: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-primary">{h.name}</span>
                  <span className="text-amber-400 font-bold">{h.streak}d streak • {h.rate}% adherence</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${h.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Companion Synthesis Card */}
      <div className="glass-card p-6 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-background flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-text-primary">Executive Summary & Cognitive Calibration</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
            Your daily consistency index is currently in the top 10% of high performers. Your active companion suggests increasing your target date thresholds for SMART goals to sustain progressive overload.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
