import React, { useState, useEffect } from 'react';
import { User, Sparkles, Mail, Shield, Save, CheckCircle2, Download } from 'lucide-react';
import { api } from '../services/api';

export const ProfilePage = () => {
  const [preferredName, setPreferredName] = useState('Explorer');
  const [fullName, setFullName] = useState('Explorer');
  const [email, setEmail] = useState('explorer@origen.ai');
  const [age, setAge] = useState(26);
  const [profession, setProfession] = useState('Software Engineer');
  const [bio, setBio] = useState('Building high-impact intelligent systems.');
  const [activePersona, setActivePersona] = useState(localStorage.getItem('selectedPersona') || 'krishna');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data) {
          setPreferredName(res.data.preferred_name || 'Explorer');
          setFullName(res.data.full_name || 'Explorer');
          setEmail(res.data.email || 'explorer@origen.ai');
          setAge(res.data.age || 26);
          setProfession(res.data.profession || 'Professional');
          setBio(res.data.bio || '');
          if (res.data.active_persona_id) {
            setActivePersona(res.data.active_persona_id);
            localStorage.setItem('selectedPersona', res.data.active_persona_id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      localStorage.setItem('selectedPersona', activePersona);
      localStorage.setItem('preferred_name', preferredName);

      await api.put('/auth/profile', {
        preferred_name: preferredName,
        full_name: fullName,
        age: Number(age),
        profession,
        bio,
        active_persona_id: activePersona
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/memories/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `ai_persona_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar pr-1 pb-16 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border/50 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            User Profile & Archetype Settings
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure your personal identity, active companion archetype, and data credentials
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="outline-button px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <Download className="w-4 h-4" /> Export All Data
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Profile and companion preferences saved successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 glass-card p-6 md:p-8 rounded-3xl border border-border space-y-5">
          
          <h2 className="text-base font-bold text-text-primary">Personal Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Preferred Name</label>
              <input
                type="text"
                required
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-surface/50 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-text-secondary cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Profession / Craft</label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="E.g., Senior Systems Architect, Product Founder..."
              className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Bio / Personal Mission</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What are your core drivers and life values?"
              className="w-full bg-surface-hover border border-border rounded-xl p-3 text-xs text-text-primary focus:border-primary min-h-[90px] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="primary-button px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-primary/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>

        </div>

        {/* Right Column: Active Companion Archetype (4 cols) */}
        <div className="lg:col-span-4 glass-card p-6 md:p-8 rounded-3xl border border-border space-y-4">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Active Companion
          </h2>
          <p className="text-xs text-text-secondary">
            Switch which mind guides your chat, voice, and daily dashboard insights.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { id: 'krishna', name: 'Krishna', role: 'The Wise Guide', emoji: '🦚', desc: 'Philosophy, emotional balance, relationships, and serene life guidance.' },
              { id: 'chhava', name: 'Chhava', role: 'The Warrior', emoji: '🦁', desc: 'Discipline, habits, leadership, mental toughness, and motivation.' },
              { id: 'chanakya', name: 'Chanakya', role: 'The Master Strategist', emoji: '📜', desc: 'Business, finance, career strategy, decision-making, and productivity.' },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setActivePersona(p.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  activePersona === p.id
                    ? 'bg-primary/15 border-primary shadow-md ring-1 ring-primary'
                    : 'bg-surface border-border hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <h3 className="font-bold text-text-primary text-sm">{p.name}</h3>
                    <span className="text-[10px] font-semibold text-primary block uppercase">{p.role}</span>
                  </div>
                </div>
                <p className="text-[11px] text-text-secondary mt-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </form>

    </div>
  );
};

export default ProfilePage;
