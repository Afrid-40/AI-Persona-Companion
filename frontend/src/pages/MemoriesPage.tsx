import React, { useState, useEffect } from 'react';
import { BrainCircuit, Search, Plus, Trash2, Edit3, Shield, Download, X } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '../services/api';

interface Memory {
  id: string;
  category: string;
  title?: string;
  content: string;
  date_label: string;
  importance: string;
}

const CATEGORIES = ['all', 'personal', 'goal', 'preference', 'fact', 'event', 'learning', 'relationship'];

export const MemoriesPage = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [categoryInput, setCategoryInput] = useState('Personal');
  const [contentInput, setContentInput] = useState('');
  const [importanceInput, setImportanceInput] = useState('medium');

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/memories');
      setMemories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentInput.trim()) return;

    try {
      if (editId) {
        await api.put(`/memories/${editId}`, {
          category: categoryInput,
          content: contentInput,
          importance: importanceInput
        });
      } else {
        await api.post('/memories', {
          category: categoryInput,
          content: contentInput,
          importance: importanceInput
        });
      }

      setShowModal(false);
      setEditId(null);
      setContentInput('');
      fetchMemories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to forget this memory?')) return;
    try {
      await api.delete(`/memories/${id}`);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/memories/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "ai_persona_memories.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'preference': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'fact': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'goal': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'relationship': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'event': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-surface text-text-primary border-border';
    }
  };

  const filteredMemories = memories.filter(m => {
    const matchCat = filter === 'all' || m.category.toLowerCase() === filter.toLowerCase();
    const matchSearch = m.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border/50 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            Long-Term Memory Timeline
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Verified facts, preferences, and context your companion retains
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="outline-button px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            title="Export memories to JSON"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>
          <button
            onClick={() => {
              setEditId(null);
              setContentInput('');
              setShowModal(true);
            }}
            className="primary-button px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Add Memory
          </button>
        </div>
      </div>

      {/* Controls: Search & Category Chips */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input 
            type="text"
            placeholder="Search memory timeline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          {CATEGORIES.map(c => (
            <button 
              key={c}
              onClick={() => setFilter(c)}
              className={clsx(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize",
                filter === c 
                  ? "bg-primary text-white shadow-sm shadow-primary/30" 
                  : "bg-surface border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-text-secondary">Loading memory timeline...</div>
      ) : filteredMemories.length === 0 ? (
        <div className="py-16 text-center text-sm text-text-secondary glass-card rounded-3xl border border-border">
          No memories match your query. Your companion continuously extracts context as you chat!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMemories.map(memory => (
            <div key={memory.id} className="glass-card p-5 rounded-3xl border border-border flex flex-col justify-between group hover:border-primary/40 transition-all shadow-sm">
              
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={clsx("text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider", getCategoryColor(memory.category))}>
                    {memory.category}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditId(memory.id);
                        setContentInput(memory.content);
                        setCategoryInput(memory.category);
                        setImportanceInput(memory.importance || 'medium');
                        setShowModal(true);
                      }}
                      className="p-1 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(memory.id)}
                      className="p-1 rounded-lg hover:bg-red-500/20 text-text-secondary hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-text-primary/90 leading-relaxed">
                  {memory.content}
                </p>
              </div>

              <div className="pt-4 border-t border-border/40 flex justify-between items-center text-[10px] text-text-secondary/70 mt-4">
                <span>{memory.date_label}</span>
                <span className="capitalize">Priority: {memory.importance || 'medium'}</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Memory Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card border border-border shadow-2xl rounded-3xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-text-primary mb-1">
              {editId ? 'Edit Memory Fact' : 'Add Personal Memory'}
            </h2>
            <p className="text-xs text-text-secondary mb-5">
              Explicitly teach your companion a core truth, preference, or goal.
            </p>

            <form onSubmit={handleSaveMemory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Category</label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary"
                >
                  {['Personal', 'Goal', 'Preference', 'Fact', 'Event', 'Learning', 'Relationship', 'Dream', 'Project'].map(c => (
                    <option key={c} value={c} className="bg-background">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Memory Content</label>
                <textarea
                  required
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  placeholder="E.g., Prefers strategic frameworks over philosophical quotes when discussing work..."
                  className="w-full bg-surface-hover border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary min-h-[90px] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">Importance</label>
                <select
                  value={importanceInput}
                  onChange={(e) => setImportanceInput(e.target.value)}
                  className="w-full bg-surface-hover border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary"
                >
                  <option value="high" className="bg-background">High Priority</option>
                  <option value="medium" className="bg-background">Medium Priority</option>
                  <option value="low" className="bg-background">Low Priority</option>
                </select>
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
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemoriesPage;
