import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Volume2 } from 'lucide-react';

const companions = [
  {
    id: 'krishna',
    name: 'Krishna',
    subtitle: 'THE WISE GUIDE',
    description: "Philosophy, emotional balance, relationships, and personal growth — a calm voice through life's noise.",
    traits: ['Wise', 'Compassionate', 'Serene', 'Reflective'],
    quote: '"You are not your thoughts, dear one. You are the awareness behind them."',
    avatarGradient: 'from-blue-500 to-emerald-400',
    tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    emoji: '🦚',
  },
  {
    id: 'chhava',
    name: 'Chhava',
    subtitle: 'THE WARRIOR',
    description: 'Discipline, daily habits, leadership, and mental fortitude — conquer your doubts and build unshakeable strength.',
    traits: ['Disciplined', 'Courageous', 'Unyielding', 'Motivational'],
    quote: '"Victory belongs to those who conquer themselves first. Stand tall and execute."',
    avatarGradient: 'from-amber-500 to-red-500',
    tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    emoji: '🦁',
  },
  {
    id: 'chanakya',
    name: 'Chanakya',
    subtitle: 'THE MASTER STRATEGIST',
    description: 'Business, finance, strategic decision-making, and elite productivity — calculate every move with surgical precision.',
    traits: ['Strategic', 'Pragmatic', 'Shrewd', 'Analytical'],
    quote: '"A wise person plans three steps ahead while the world reacts to the first. Calculate every move."',
    avatarGradient: 'from-purple-500 to-indigo-500',
    tagColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    emoji: '📜',
  }
];

export const CompanionsPage = () => {
  const navigate = useNavigate();

  const handleChoose = (id: string) => {
    localStorage.setItem('selectedPersona', id);
    navigate('/onboarding');
  };

  return (
    <div className="flex-grow flex flex-col items-center pt-28 pb-20 px-4 md:px-6 min-h-screen relative z-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mb-14">
        <span className="text-xs font-bold text-primary uppercase tracking-widest">Architects of Mind</span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 text-text-primary">
          Select Your AI Companion
        </h1>
        <p className="text-sm md:text-base text-text-secondary mt-3">
          Each persona possesses a unique philosophical core, speech style, and specialized mastery.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
        {companions.map((c) => (
          <div key={c.id} className="glass-card p-8 rounded-3xl flex flex-col justify-between relative group overflow-hidden border border-border/80 hover:border-primary/50 transition-all duration-300 shadow-xl">
            
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${c.avatarGradient} opacity-10 rounded-full blur-[50px] -mr-10 -mt-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none`} />

            <div>
              {/* Avatar Icon */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${c.avatarGradient} p-[2px] mb-6 shadow-lg group-hover:scale-105 transition-transform`}>
                <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center text-4xl">
                  {c.emoji}
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl font-bold text-text-primary">{c.name}</h2>
              <span className={`text-[10px] tracking-widest uppercase font-bold px-2.5 py-0.5 rounded-full border inline-block mt-2 mb-4 ${c.tagColor}`}>
                {c.subtitle}
              </span>
              
              {/* Description */}
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {c.description}
              </p>
              
              {/* Traits */}
              <div className="flex flex-wrap gap-2 mb-6">
                {c.traits.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full border border-border bg-surface text-xs font-medium text-text-secondary">
                    {t}
                  </span>
                ))}
              </div>

              {/* Quote */}
              <div className="border-l-2 border-primary/60 pl-4 py-1 mb-8 bg-surface/30 rounded-r-xl">
                <p className="text-xs font-serif italic text-text-primary/90 leading-relaxed">{c.quote}</p>
              </div>
            </div>

            <button 
              onClick={() => handleChoose(c.id)}
              className="w-full primary-button py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              Choose {c.name} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanionsPage;
