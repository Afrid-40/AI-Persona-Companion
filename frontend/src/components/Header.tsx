import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import { clsx } from 'clsx';
import { AuthModal } from './AuthModal';

const Header = () => {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <>
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => navigate('/dashboard')}
      />

      <header className="w-full fixed top-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none">
        <div className="glass-card flex items-center justify-between px-6 py-3 w-full max-w-5xl pointer-events-auto shadow-xl">
          
          {/* Logo Section */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary p-[2px] shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base leading-tight tracking-wide text-text-primary">AI Persona</span>
              <span className="text-[10px] font-semibold tracking-widest text-text-secondary uppercase">Commercial SaaS</span>
            </div>
          </NavLink>

          {/* Navigation Section */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink 
              to="/" 
              className={({ isActive }) => clsx("nav-link", isActive && "active")}
            >
              Home
            </NavLink>
            <NavLink 
              to="/companions" 
              className={({ isActive }) => clsx("nav-link", isActive && "active")}
            >
              Companions
            </NavLink>
            <NavLink 
              to="/onboarding" 
              className={({ isActive }) => clsx("nav-link", isActive && "active")}
            >
              Onboarding
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => clsx("nav-link", isActive && "active")}
            >
              Dashboard
            </NavLink>
          </nav>

          {/* Right Auth CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('login')}
              className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors hidden sm:block px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/onboarding')}
              className="primary-button text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
        </div>
      </header>
    </>
  );
};

export default Header;
