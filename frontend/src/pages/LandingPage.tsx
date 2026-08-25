import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Sparkles, Lock, ArrowRight, ShieldCheck, Zap, 
  MessageSquare, Mic, CheckCircle2, ChevronDown, 
  Star, Send, Play, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthModal } from '../components/AuthModal';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedPersonaTab, setSelectedPersonaTab] = useState<'krishna' | 'chhava' | 'chanakya'>('krishna');

  const personas = {
    krishna: {
      name: 'Krishna',
      subtitle: 'THE WISE GUIDE',
      quote: '"You are not your thoughts, dear one. You are the awareness behind them."',
      focus: 'Philosophy, emotional balance, relationships, and serene life guidance.',
      color: 'from-blue-500 to-emerald-400',
      tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      emoji: '🦚'
    },
    chhava: {
      name: 'Chhava',
      subtitle: 'THE WARRIOR',
      quote: '"Victory belongs to those who conquer themselves first. Stand tall and execute."',
      focus: 'Discipline, daily habits, leadership, mental toughness, and motivation.',
      color: 'from-amber-500 to-red-500',
      tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      emoji: '🦁'
    },
    chanakya: {
      name: 'Chanakya',
      subtitle: 'THE MASTER STRATEGIST',
      quote: '"A wise person plans three steps ahead while the world reacts to the first."',
      focus: 'Business, finance, career strategy, decision-making, and productivity systems.',
      color: 'from-purple-500 to-indigo-500',
      tagColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      emoji: '📜'
    }
  };

  const faqs = [
    {
      q: 'How does AI Persona remember my personal details and goals?',
      a: 'AI Persona features an embedded Long-Term Memory Engine. When you chat, set goals, or journal, key personal preferences, facts, and milestones are encrypted and stored in your private memory timeline.'
    },
    {
      q: 'Can I switch between Krishna, Chhava, and Chanakya at any time?',
      a: 'Yes! You can switch your active companion persona at any point from your profile or companion selector without losing conversation history or memories.'
    },
    {
      q: 'Which AI models power the platform?',
      a: 'AI Persona is integrated with OpenRouter, providing access to state-of-the-art models including GPT-4o, Claude 3.5 Sonnet, DeepSeek R1, Llama 3.3 70B, and Gemini 2.0.'
    },
    {
      q: 'Is my data secure and private?',
      a: 'Absolutely. Your journal entries, thoughts, and memories are strictly confidential and protected by modern database encryption protocols.'
    },
    {
      q: 'Does AI Persona support voice conversations?',
      a: 'Yes! The Voice Companion module provides live microphone speech-to-text and personalized text-to-speech audio with dynamic pitch and voice personalities.'
    }
  ];

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center pt-24 pb-16 px-4 md:px-6 relative z-10">
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => navigate('/dashboard')}
      />

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-5xl mx-auto pt-12 pb-20 relative">
        
        {/* Glowing visualizer core */}
        <div className="relative w-48 h-48 md:w-60 md:h-60 mb-10 flex items-center justify-center">
          <motion.div 
            className="absolute w-36 h-36 rounded-full bg-primary/40 blur-[50px] mix-blend-screen"
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute w-44 h-44 rounded-full bg-secondary/30 blur-[60px] mix-blend-screen -ml-16 -mt-8"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-secondary via-primary to-accent shadow-[0_0_60px_rgba(96,165,250,0.5)] flex items-center justify-center border border-white/20">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        {/* Live Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/80 text-xs font-semibold text-text-secondary mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Next-Gen OpenRouter AI Engine • Krishna • Chhava • Chanakya</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Your Elite AI Companion <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-accent">
            for Mind, Habits & Growth.
          </span>
        </h1>
        
        <p className="text-base sm:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
          The all-in-one AI companion platform that remembers your life, tracks your habits, guides your goals, and sharpens your decisions with wisdom and strategy.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
          <button 
            onClick={() => navigate('/onboarding')}
            className="primary-button flex items-center justify-center gap-2 text-base px-8 py-3.5 w-full sm:w-auto font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            Start Free Journey <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="outline-button text-base px-8 py-3.5 w-full sm:w-auto font-medium"
          >
            Explore Dashboard
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-14 text-xs font-medium text-text-secondary/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>OpenRouter Multi-Model</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span>Long-Term Memory Engine</span>
          </div>
        </div>
      </section>

      {/* Persona Showcase Section */}
      <section className="w-full max-w-6xl mx-auto py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Archetype Intelligence</span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mt-2">Meet Your Persona Trio</h2>
          <p className="text-text-secondary text-sm md:text-base max-w-xl mx-auto mt-2">
            Choose the mind that matches your current chapter in life.
          </p>
        </div>

        {/* Persona Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {(['krishna', 'chhava', 'chanakya'] as const).map((pKey) => (
            <button
              key={pKey}
              onClick={() => setSelectedPersonaTab(pKey)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedPersonaTab === pKey
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                  : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover'
              }`}
            >
              <span>{personas[pKey].emoji}</span>
              <span>{personas[pKey].name}</span>
            </button>
          ))}
        </div>

        {/* Selected Persona Card */}
        <div className="glass-card p-8 md:p-12 rounded-3xl border border-border shadow-xl relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${personas[selectedPersonaTab].color} opacity-10 rounded-full blur-[90px] pointer-events-none`} />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${personas[selectedPersonaTab].color} p-[2px] shadow-xl mb-4`}>
                <div className="w-full h-full bg-background rounded-[22px] flex items-center justify-center text-5xl">
                  {personas[selectedPersonaTab].emoji}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-text-primary">{personas[selectedPersonaTab].name}</h3>
              <span className={`text-[11px] font-bold tracking-widest uppercase mt-1 px-3 py-1 rounded-full border ${personas[selectedPersonaTab].tagColor}`}>
                {personas[selectedPersonaTab].subtitle}
              </span>
            </div>

            <div className="md:col-span-8 flex flex-col gap-4">
              <div className="border-l-4 border-primary pl-4 py-1 bg-surface/30 rounded-r-xl p-3">
                <p className="text-lg md:text-xl font-serif italic text-text-primary">
                  {personas[selectedPersonaTab].quote}
                </p>
              </div>
              <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                <strong className="text-text-primary">Focus & Mastery: </strong>
                {personas[selectedPersonaTab].focus}
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    localStorage.setItem('selectedPersona', selectedPersonaTab);
                    navigate('/onboarding');
                  }}
                  className="primary-button text-sm px-6 py-2.5 rounded-xl font-semibold"
                >
                  Choose {personas[selectedPersonaTab].name} & Begin
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('selectedPersona', selectedPersonaTab);
                    navigate('/dashboard/voice');
                  }}
                  className="outline-button text-sm px-5 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4 text-primary" /> Test Voice Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full max-w-6xl mx-auto py-16">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Platform Capabilities</span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mt-2">Engineered Like a Super-App</h2>
          <p className="text-text-secondary text-sm md:text-base max-w-xl mx-auto mt-2">
            Every module you need to achieve peak clarity, discipline, and personal achievement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Brain,
              title: "Long-Term Memory Engine",
              desc: "Automatically extracts facts, personal goals, and preferences across chats to maintain coherent context forever."
            },
            {
              icon: MessageSquare,
              title: "Supercharged AI Chat",
              desc: "Streaming responses, full Markdown formatting, syntax-highlighted code blocks with 1-click copy, and multi-chat folders."
            },
            {
              icon: Mic,
              title: "Voice Companion",
              desc: "Live audio orb visualizer with seamless speech-to-text and personalized text-to-speech voice styles for each persona."
            },
            {
              icon: CheckCircle2,
              title: "SMART Goals & Habits",
              desc: "Break down ambitious objectives into actionable milestones with AI breakdown suggestions and daily streak tracking."
            },
            {
              icon: Sparkles,
              title: "Daily Journal & Mood Tracker",
              desc: "Guided evening reflections, gratitude check-ins, emotional analytics trends, and automated AI summary takeaways."
            },
            {
              icon: Zap,
              title: "OpenRouter Multi-Model",
              desc: "Powered by OpenRouter with seamless switching between GPT-4o, Claude 3.5 Sonnet, DeepSeek R1, Llama 3.3, and Gemini."
            }
          ].map((f, i) => (
            <div key={i} className="glass-card p-6 md:p-8 rounded-2xl flex flex-col gap-4 hover:border-primary/50 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-surface border border-border/80 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full max-w-6xl mx-auto py-16">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Transparent Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mt-2">Invest in Your Personal Evolution</h2>
          <p className="text-text-secondary text-sm md:text-base max-w-xl mx-auto mt-2">
            Start free, upgrade whenever you need unlimited OpenRouter compute and sovereign capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Free Tier */}
          <div className="glass-card p-8 rounded-3xl border border-border flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Free Explorer</span>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-text-primary">$0</span>
                <span className="text-xs text-text-secondary">/ forever</span>
              </div>
              <p className="text-xs text-text-secondary mb-6">Perfect for discovering your companion and establishing your habits.</p>
              <ul className="space-y-3 text-sm text-text-secondary mb-8">
                {['Access to Krishna Persona', '100 Chat turns per day', 'Basic Goal & Habit tracking', 'Daily Journal & Mood logs', 'Standard memory retention'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => navigate('/onboarding')} className="w-full outline-button py-2.5 text-sm font-semibold">
              Get Started Free
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="glass-card p-8 rounded-3xl border-2 border-primary shadow-2xl relative flex flex-col justify-between scale-105 bg-surface/80">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wider shadow-md">
              Most Popular
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Pro Companion</span>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-text-primary">$19</span>
                <span className="text-xs text-text-secondary">/ month</span>
              </div>
              <p className="text-xs text-text-secondary mb-6">Full access to all 3 personas, voice companion, and OpenRouter AI models.</p>
              <ul className="space-y-3 text-sm text-text-secondary mb-8">
                {[
                  'All 3 Personas (Krishna, Chhava, Chanakya)',
                  'Unlimited streaming chats with GPT-4o / Claude',
                  'Full Voice Companion STT & TTS',
                  'Unlimited Long-Term Memory timeline',
                  'AI SMART milestone breakdown',
                  'Emotional Analytics & Recommendations'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => handleOpenAuth('register')} className="w-full primary-button py-3 text-sm font-bold shadow-lg shadow-primary/30">
              Upgrade to Pro
            </button>
          </div>

          {/* Sovereign Executive */}
          <div className="glass-card p-8 rounded-3xl border border-border flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Sovereign Executive</span>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-text-primary">$49</span>
                <span className="text-xs text-text-secondary">/ month</span>
              </div>
              <p className="text-xs text-text-secondary mb-6">For entrepreneurs, executives, and high-performers demanding custom tuning.</p>
              <ul className="space-y-3 text-sm text-text-secondary mb-8">
                {[
                  'Custom OpenRouter API key routing',
                  'Priority low-latency inference',
                  'Custom persona prompt engineering',
                  'Exportable encrypted data backups',
                  'Executive analytics & weekly reports',
                  'Direct VIP support channel'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => handleOpenAuth('register')} className="w-full outline-button py-2.5 text-sm font-semibold">
              Join Sovereign
            </button>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-5xl mx-auto py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">User Stories</span>
          <h2 className="text-3xl font-bold text-text-primary mt-2">Trusted by Thinkers & Builders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "Krishna's serene perspective completely transformed how I handle executive burnout and emotional stress.",
              author: "Aarav Sharma",
              role: "Tech Founder & CTO",
              persona: "Krishna"
            },
            {
              quote: "Chhava holds me accountable like a military commander. My habit consistency went from 30% to 95% in 30 days.",
              author: "Devendra Patil",
              role: "Product Lead",
              persona: "Chhava"
            },
            {
              quote: "Chanakya's strategic decision frameworks helped me negotiate a pivotal enterprise contract with total precision.",
              author: "Rohan Verma",
              role: "Managing Director",
              persona: "Chanakya"
            }
          ].map((t, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col justify-between">
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-text-secondary italic mb-6 leading-relaxed">"{t.quote}"</p>
              <div>
                <span className="text-sm font-bold text-text-primary block">{t.author}</span>
                <span className="text-xs text-text-secondary">{t.role} • Companion: {t.persona}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="w-full max-w-4xl mx-auto py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Got Questions?</span>
          <h2 className="text-3xl font-bold text-text-primary mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card rounded-2xl border border-border/70 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-text-primary hover:text-primary transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180 text-primary' : 'text-text-secondary'}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed border-t border-border/30 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto mt-20 pt-10 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-xs">
            Ψ
          </div>
          <span className="font-bold text-text-primary text-sm">AI Persona Platform</span>
          <span>© 2026 Origen Technologies. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Dashboard</button>
          <button onClick={() => navigate('/companions')} className="hover:text-primary transition-colors">Companions</button>
          <button onClick={() => navigate('/onboarding')} className="hover:text-primary transition-colors">Onboarding</button>
          <button onClick={() => handleOpenAuth('login')} className="hover:text-primary transition-colors">Sign In</button>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
