import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Sparkles, Heart, Trash2, Calendar, Search, X } from 'lucide-react';
import { api } from '../services/api';

interface JournalEntry {
  id: string;
  date_label: string;
  title: string;
  preview: string;
  content: string;
  category: string;
  gratitude?: string;
  ai_summary?: string;
  created_at: string;
}

export const JournalPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [category, setCategory] = useState('Reflection');
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/journal');
      setEntries(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const now = new Date();
      const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      await api.post('/journal', {
        date_label: dateLabel,
        title,
        preview: content.slice(0, 100),
        content,
        category,
        gratitude
      });

      setShowModal(false);
      setTitle('');
      setContent('');
      setGratitude('');
      fetchEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      await api.delete(`/journal/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border/50 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Personal Journal & Reflection
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Capture thoughts, gratitude, and AI-synthesized self-awareness
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="primary-button flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input 
          type="text"
          placeholder="Search journal entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary focus:border-primary transition-colors"
        />
      </div>

      {/* Entries Timeline */}
      {loading ? (
        <div className="py-16 text-center text-sm text-text-secondary">Loading journal entries...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-text-secondary py-20 glass-card rounded-3xl border border-border">
          <BookOpen className="w-16 h-16 mb-4 opacity-20 text-purple-400" />
          <h2 className="text-lg font-bold text-text-primary mb-1">No Journal Entries</h2>
          <p className="max-w-md text-center text-xs text-text-secondary mb-6">
            Take a few moments to log your thoughts. Your companion will analyze patterns and generate insights.
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="primary-button text-xs px-5 py-2.5 rounded-xl font-bold"
          >
            Write First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((item) => (
            <div key={item.id} className="glass-card p-6 rounded-3xl border border-border space-y-4 shadow-sm hover:border-primary/40 transition-all">
              
              {/* Header Info */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-surface border border-border text-primary">
                      {item.category}
                    </span>
                    <span className="text-xs text-text-secondary flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {item.date_label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{item.title}</h3>
                </div>

                <button 
                  onClick={() => handleDeleteEntry(item.id)}
                  className="text-text-secondary hover:text-red-400 p-1.5 rounded-lg hover:bg-surface transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Main Content */}
              <p className="text-sm text-text-primary/90 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>

              {/* Gratitude Section */}
              {item.gratitude && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
                  <Heart className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Gratitude Highlight:</strong>
                    <span>{item.gratitude}</span>
                  </div>
                </div>
              )}

              {/* AI Insight Summary */}
              {item.ai_summary && (
                <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-2.5 text-xs text-primary">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Companion Insight:</strong>
                    <span className="text-text-primary/80">{item.ai_summary}</span>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* New Journal Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl glass-card border border-border shadow-2xl rounded-3xl p-6 md:p-8 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-text-primary mb-1">New Journal Entry</h2>
            <p className="text-xs text-text-secondary mb-6">Reflect on your day, achievements, and lessons learned.</p>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Entry Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Breakthrough in Focus & Strategy"
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2.5 text-xs text-text-primary focus:border-primary"
                >
                  {['Reflection', 'Gratitude', 'Strategic Breakthrough', 'Emotional Release', 'Creative Thoughts'].map(c => (
                    <option key={c} value={c} className="bg-background">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Your Thoughts & Reflections</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What was the highlight of your day? What challenged you and what did you learn?"
                  className="w-full bg-surface-hover border border-border rounded-xl p-3 text-sm text-text-primary focus:border-primary min-h-[120px] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">What are you grateful for today? (Optional)</label>
                <input
                  type="text"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="E.g., A calm morning coffee and uninterrupted coding sprint"
                  className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-xs text-text-primary focus:border-primary transition-colors"
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
                  disabled={saving}
                  className="primary-button px-6 py-2 text-xs font-bold"
                >
                  {saving ? 'Analyzing & Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default JournalPage;
