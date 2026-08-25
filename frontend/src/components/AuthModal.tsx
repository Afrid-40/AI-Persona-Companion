import React, { useState } from 'react';
import { X, Sparkles, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await api.post('/auth/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('user_email', res.data.email);
        localStorage.setItem('preferred_name', res.data.preferred_name || '');
        if (onSuccess) onSuccess();
        onClose();
      } else if (mode === 'register') {
        const res = await api.post('/auth/register', {
          email,
          password,
          full_name: fullName,
          preferred_name: fullName
        });

        setSuccessMsg('Account created successfully! Signing you in...');
        setTimeout(async () => {
          // Auto login
          const formData = new URLSearchParams();
          formData.append('username', email);
          formData.append('password', password);
          const loginRes = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
          localStorage.setItem('access_token', loginRes.data.access_token);
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      } else if (mode === 'forgot') {
        await api.post('/auth/forgot-password', { email });
        setSuccessMsg('If an account exists, a reset link has been dispatched to your email.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMock = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google');
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('user_email', res.data.email);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError('Google Sign In placeholder failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-card border border-border shadow-2xl rounded-2xl overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary p-[2px]">
              <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Your Account' : 'Reset Password'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {mode === 'login' ? 'Sign in to access your companion' : mode === 'register' ? 'Start your intelligent journey' : 'Enter your registered email'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-text-secondary">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-hover border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary transition-colors"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border bg-surface text-primary focus:ring-primary"
                />
                <label htmlFor="remember" className="text-xs text-text-secondary cursor-pointer">
                  Remember me for 30 days
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full primary-button py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              ) : mode === 'register' ? (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Social Google Login Button */}
          <div className="mt-5 pt-5 border-t border-border/50 text-center">
            <button
              onClick={handleGoogleMock}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors text-sm font-medium text-text-primary flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Switch Mode Links */}
            <div className="mt-4 text-xs text-text-secondary">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setMode('register')} className="text-primary font-semibold hover:underline">
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-primary font-semibold hover:underline">
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
