import React, { useState, useEffect } from 'react';
import { Search, Target, CheckSquare, BookOpen, BrainCircuit, MessageSquare, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface SearchItem {
  type: string;
  id: string;
  title: string;
  snippet: string;
  link: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'goal': return <Target className="w-4 h-4 text-emerald-400" />;
      case 'habit': return <CheckSquare className="w-4 h-4 text-amber-400" />;
      case 'journal': return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'memory': return <BrainCircuit className="w-4 h-4 text-blue-400" />;
      default: return <MessageSquare className="w-4 h-4 text-primary" />;
    }
  };

  const handleSelect = (link: string) => {
    navigate(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-card border border-border/80 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-surface/50">
          <Search className="w-5 h-5 text-primary flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats, goals, habits, journal, memories... (Esc to exit)"
            className="w-full bg-transparent text-text-primary placeholder:text-text-secondary/50 focus:outline-none text-[15px]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-text-secondary hover:text-text-primary p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {loading && (
            <div className="py-6 text-center text-sm text-text-secondary">Searching your personal space...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-8 text-center text-sm text-text-secondary">
              No results found for "{query}". Try searching another keyword.
            </div>
          )}

          {!loading && !query && (
            <div className="py-4 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Quick Navigation
            </div>
          )}

          {!query && (
            <div className="grid grid-cols-2 gap-2 p-1">
              {[
                { title: 'AI Chat Companion', link: '/dashboard/chat', icon: MessageSquare },
                { title: 'Goals & Milestones', link: '/dashboard/goals', icon: Target },
                { title: 'Habits Tracker', link: '/dashboard/habits', icon: CheckSquare },
                { title: 'Daily Journal', link: '/dashboard/journal', icon: BookOpen },
                { title: 'Memory Timeline', link: '/dashboard/memories', icon: BrainCircuit },
              ].map((item) => (
                <button
                  key={item.link}
                  onClick={() => handleSelect(item.link)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface/40 hover:bg-surface-hover border border-border/40 text-left text-sm text-text-primary transition-colors"
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          )}

          {results.map((res) => (
            <button
              key={`${res.type}-${res.id}`}
              onClick={() => handleSelect(res.link)}
              className="w-full flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors text-left group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 p-1.5 rounded-lg bg-surface border border-border/50">
                  {getTypeIcon(res.type)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {res.title}
                  </div>
                  <div className="text-xs text-text-secondary truncate mt-0.5">{res.snippet}</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-secondary/40 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-surface/30 border-t border-border/40 flex items-center justify-between text-xs text-text-secondary">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono">K</kbd> anywhere</span>
          <span>Click or Enter to select</span>
        </div>
      </div>
    </div>
  );
};
