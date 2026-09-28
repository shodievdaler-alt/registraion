import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string, password: string) => Promise<{ error?: string }>;
  onRegister: (email: string, password: string) => Promise<{ error?: string }>;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result =
        mode === 'login'
          ? await onLogin(normalizedEmail, password)
          : await onRegister(normalizedEmail, password);

      if (result.error) {
        setError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Bar Contract: 3 zones */}
      <header className="w-full border-b border-slate-200 bg-white px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#top" onClick={e => e.preventDefault()} className="text-lg font-bold tracking-tight text-slate-900">
            My Tasks
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                mode === 'login' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                mode === 'register' ? 'text-slate-900 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              Create account
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              {mode === 'login' ? 'Create account' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Content Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-16">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Product Context & Structured Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 tracking-wide">
                Personal Task Workspace
              </p>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 [text-wrap:balance]">
                Focused daily execution, isolated to your personal account.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Organize priorities, track completion progress, and keep your individual task queue clean across desktop and mobile devices.
              </p>
            </div>

            {/* Single-elevation preview table showing how tasks look */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                <span className="text-xs font-semibold text-slate-700">Workspace Structure</span>
                <span className="text-xs font-mono tabular-nums text-slate-500">Row-level user isolation</span>
              </div>
              <div className="divide-y divide-slate-200 text-sm">
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-slate-500 line-through truncate">
                      Configure Supabase row-level security policies
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                    Engineering · Completed
                  </span>
                </div>
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                    <span className="text-slate-900 font-medium truncate">
                      Finalize Q4 product roadmap milestones
                    </span>
                  </div>
                  <span className="text-xs text-amber-700 whitespace-nowrap shrink-0">
                    Product · High priority
                  </span>
                </div>
                <div className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                    <span className="text-slate-900 font-medium truncate">
                      Review weekly sprint retrospective notes
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                    Work · Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Login / Registration Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
              {/* Segmented Mode Selector */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 px-4 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2 px-4 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create account
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {mode === 'login' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'login'
                    ? 'Enter your email and password to access My Tasks.'
                    : 'Register with your email and password to start managing your tasks.'}
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md focus-visible:outline-2 focus-visible:outline-slate-900"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label
                      htmlFor="auth-confirm-password"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="auth-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>
                    {isSubmitting
                      ? mode === 'login'
                        ? 'Signing in...'
                        : 'Creating account...'
                      : mode === 'login'
                      ? 'Sign in to My Tasks'
                      : 'Create account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-600">
                  {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                    className="font-semibold text-slate-900 hover:underline ml-1"
                  >
                    {mode === 'login' ? 'Create an account' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full border-t border-slate-200 bg-white px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>My Tasks Workspace</span>
          <span>Ready for Supabase Auth & PostgreSQL integration</span>
        </div>
      </footer>
    </div>
  );
};
