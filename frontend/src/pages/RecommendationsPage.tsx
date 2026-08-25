import React, { useState, useEffect } from 'react';
import { Sparkles, Bookmark, BookmarkCheck, ExternalLink, BookOpen, Layers, Heart, Zap, Compass, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  link?: string;
  reason?: string;
  is_saved: boolean;
}

const CATEGORIES = ['All', 'Books', 'Courses', 'Meditation', 'Productivity', 'Health', 'Career'];

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const url = activeCategory === 'All' ? '/recommendations' : `/recommendations?category=${activeCategory}`;
      const res = await api.get(url);
      setRecommendations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [activeCategory]);

  const handleToggleSave = async (id: string) => {
    try {
      await api.post(`/recommendations/${id}/toggle-save`);
      setRecommendations(prev => prev.map(r => r.id === id ? { ...r, is_saved: !r.is_saved } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateFresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/recommendations/generate-custom');
      fetchRecommendations();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'books': return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'courses': return <Layers className="w-4 h-4 text-blue-400" />;
      case 'meditation': return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'health': return <Heart className="w-4 h-4 text-red-400" />;
      default: return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border/50 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Recommendations & Learning Hub
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Curated wisdom, books, courses, and focus protocols tailored to your active goals
          </p>
        </div>

        <button
          onClick={handleGenerateFresh}
          disabled={refreshing}
          className="primary-button flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/20 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Synthesizing...' : 'Generate Fresh AI Suggestions'}</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
                : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-text-secondary">Loading recommendations...</div>
      ) : recommendations.length === 0 ? (
        <div className="py-16 text-center text-sm text-text-secondary glass-card rounded-3xl border border-border">
          No recommendations found for this category. Click above to generate fresh AI suggestions!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="glass-card p-6 rounded-3xl border border-border flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm group"
            >
              <div>
                {/* Header Badge & Bookmark */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface border border-border text-text-primary">
                    {getCategoryIcon(rec.category)}
                    <span>{rec.category}</span>
                  </span>

                  <button
                    onClick={() => handleToggleSave(rec.id)}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-primary transition-colors"
                    title={rec.is_saved ? "Remove bookmark" : "Save recommendation"}
                  >
                    {rec.is_saved ? (
                      <BookmarkCheck className="w-5 h-5 text-primary fill-primary" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <h3 className="text-base font-bold text-text-primary mb-2 leading-snug group-hover:text-primary transition-colors">
                  {rec.title}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  {rec.description}
                </p>

                {rec.reason && (
                  <div className="p-3 rounded-2xl bg-surface/50 border border-border/60 text-[11px] text-text-secondary leading-relaxed mb-4">
                    <strong className="text-primary block font-semibold mb-0.5">Why it fits you:</strong>
                    <span>{rec.reason}</span>
                  </div>
                )}
              </div>

              {rec.link && rec.link !== '#' && (
                <a
                  href={rec.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 self-start"
                >
                  <span>Explore Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default RecommendationsPage;
