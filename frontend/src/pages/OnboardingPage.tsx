import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const INTEREST_TAGS = [
  'Philosophy', 'Software Engineering', 'Business & Startups', 
  'Fitness & Health', 'Mindfulness & Meditation', 'Finance & Investing',
  'Writing & Art', 'Psychology', 'Leadership', 'Science & AI'
];

const COMMUNICATION_STYLES = [
  { id: 'Gentle', title: 'Gentle & Empathetic', desc: 'Compassionate, reassuring, and emotionally supportive.' },
  { id: 'Balanced', title: 'Balanced & Practical', desc: 'Clear, articulate, direct, and conversational.' },
  { id: 'Direct', title: 'Direct & Concise', desc: 'Straight to the point with zero fluff.' },
  { id: 'Motivational', title: 'Motivational & Driving', desc: 'High energy, disciplined, and action-oriented.' },
  { id: 'Reflective', title: 'Philosophical & Deep', desc: 'In-depth Socratic reasoning and thoughtful inquiries.' },
];

const PERSONA_OPTIONS = [
  {
    id: 'krishna',
    name: 'Krishna',
    role: 'The Wise Guide',
    desc: 'Philosophy, emotional balance, relationships, and calm guidance.',
    emoji: '🦚',
    color: 'from-blue-500 to-emerald-400'
  },
  {
    id: 'chhava',
    name: 'Chhava',
    role: 'The Warrior',
    desc: 'Discipline, habits, leadership, mental toughness, and motivation.',
    emoji: '🦁',
    color: 'from-amber-500 to-red-500'
  },
  {
    id: 'chanakya',
    name: 'Chanakya',
    role: 'The Master Strategist',
    desc: 'Business, finance, career strategy, decision-making, and productivity.',
    emoji: '📜',
    color: 'from-purple-500 to-indigo-500'
  }
];

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    preferredName: localStorage.getItem('preferred_name') || '',
    age: 26,
    profession: '',
    interests: ['Philosophy', 'Software Engineering'],
    mainGoals: ['Personal Growth', 'Build Daily Habits'],
    customGoalInput: '',
    personalContext: '',
    communicationPreference: 'Balanced',
    selectedPersona: localStorage.getItem('selectedPersona') || 'krishna'
  });

  const toggleInterest = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter(t => t !== tag)
        : [...prev.interests, tag]
    }));
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else handleComplete();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      localStorage.setItem('selectedPersona', formData.selectedPersona);
      localStorage.setItem('preferred_name', formData.preferredName);
      localStorage.setItem('onboardingComplete', 'true');

      await api.post('/auth/onboarding', {
        preferred_name: formData.preferredName || 'Explorer',
        age: Number(formData.age) || 25,
        profession: formData.profession || 'Professional',
        interests: formData.interests,
        main_goals: formData.mainGoals,
        personal_context: formData.personalContext,
        communication_preference: formData.communicationPreference,
        selected_persona: formData.selectedPersona
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding submission error:', err);
      navigate('/dashboard'); // fallback smoothly
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-6 min-h-screen relative z-10 pt-20">
      <div className="glass-card w-full max-w-2xl p-6 md:p-10 relative overflow-hidden rounded-3xl border border-border shadow-2xl">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          
          {/* Header Step Indicator */}
          <div className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold text-text-primary">Personalize Your Companion</h1>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-border text-text-secondary">
              Step {step} of 5
            </span>
          </div>

          <div className="min-h-[260px] flex flex-col justify-center">
            
            {/* Step 1: Name & Age */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-text-primary">What should your companion call you?</h2>
                <p className="text-xs text-text-secondary">This personalizes every greeting and interaction.</p>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Your Preferred Name</label>
                  <input 
                    type="text" 
                    value={formData.preferredName}
                    onChange={(e) => setFormData({...formData, preferredName: e.target.value})}
                    placeholder="E.g., Arjun, Alex, Sophia..." 
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-text-primary text-sm focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Your Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 25})}
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-text-primary text-sm focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Profession & Interests */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-text-primary">What is your craft & interests?</h2>
                <p className="text-xs text-text-secondary">Helps tailor career advice, analogies, and book recommendations.</p>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Profession / Role</label>
                  <input 
                    type="text" 
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    placeholder="E.g., Software Architect, Founder, Student, Designer..." 
                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-text-primary text-sm focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-2">Interests (Select multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_TAGS.map(tag => {
                      const active = formData.interests.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleInterest(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            active 
                              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30' 
                              : 'bg-surface border-border text-text-secondary hover:bg-surface-hover'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Life Goals */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-text-primary">What are your primary goals?</h2>
                <p className="text-xs text-text-secondary">Your companion will align daily habits and milestones around these.</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['Mental Clarity & Peace', 'Career Promotion', 'Launch a Startup', 'Physical Discipline', 'Deep Emotional Balance', 'Financial Mastery'].map(g => {
                    const active = formData.mainGoals.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            mainGoals: active ? prev.mainGoals.filter(x => x !== g) : [...prev.mainGoals, g]
                          }));
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          active ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-border text-text-secondary'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">Personal Context / Daily Challenges</label>
                  <textarea
                    value={formData.personalContext}
                    onChange={(e) => setFormData({...formData, personalContext: e.target.value})}
                    placeholder="E.g., I work long hours and struggle with evening focus. Looking to build sustained discipline..."
                    className="w-full bg-surface-hover border border-border rounded-xl p-3 text-text-primary text-xs focus:border-primary transition-colors min-h-[90px] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Communication Style */}
            {step === 4 && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-text-primary">Preferred Communication Style</h2>
                <p className="text-xs text-text-secondary">How should your companion speak to you?</p>
                <div className="space-y-2">
                  {COMMUNICATION_STYLES.map((st) => (
                    <label
                      key={st.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        formData.communicationPreference === st.id
                          ? 'bg-primary/10 border-primary shadow-sm'
                          : 'bg-surface border-border hover:bg-surface-hover'
                      }`}
                    >
                      <input
                        type="radio"
                        name="comm_style"
                        value={st.id}
                        checked={formData.communicationPreference === st.id}
                        onChange={() => setFormData({...formData, communicationPreference: st.id})}
                        className="mt-1"
                      />
                      <div>
                        <span className="text-sm font-bold text-text-primary block">{st.title}</span>
                        <span className="text-xs text-text-secondary">{st.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Choose Companion Persona */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-text-primary">Choose Your Active Companion</h2>
                <p className="text-xs text-text-secondary">Select ONE archetype for your session. (You can switch anytime).</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PERSONA_OPTIONS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setFormData({...formData, selectedPersona: p.id})}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        formData.selectedPersona === p.id
                          ? 'bg-primary/15 border-primary shadow-lg scale-102 ring-1 ring-primary'
                          : 'bg-surface border-border hover:bg-surface-hover'
                      }`}
                    >
                      <div className="text-3xl mb-2">{p.emoji}</div>
                      <div>
                        <h3 className="font-bold text-text-primary text-base">{p.name}</h3>
                        <span className="text-[10px] font-semibold text-primary block uppercase tracking-wider">{p.role}</span>
                        <p className="text-xs text-text-secondary mt-1.5 leading-snug">{p.desc}</p>
                      </div>
                      {formData.selectedPersona === p.id && (
                        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-primary">
                          <CheckCircle2 className="w-4 h-4" /> Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-border/40">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="outline-button px-5 py-2.5 text-xs font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="primary-button px-6 py-2.5 text-xs font-bold flex items-center gap-2"
            >
              {loading ? (
                <span>Initializing...</span>
              ) : step === 5 ? (
                <>Enter Dashboard <Check className="w-4 h-4" /></>
              ) : (
                <>Next Step <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
