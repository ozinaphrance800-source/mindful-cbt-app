import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    authBusy,
    authError,
    authNotice,
    clearAuthMessages,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    clearAuthMessages();
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await signInWithEmail({ email, password });
    } else {
      await signUpWithEmail({ name, email, password });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between px-4 py-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1
              className="text-2xl font-bold tracking-tight text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Mindful
            </h1>
            <p className="text-sm text-slate-600">
              {mode === 'login'
                ? 'Log in to your private CBT companion and cloud vault.'
                : 'Create your account to start CBT sessions and sentiment tracking.'}
            </p>
          </div>

          {/* Log In / Sign Up Switch */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs text-red-800">
              <span>{authError}</span>
              <button
                type="button"
                onClick={clearAuthMessages}
                className="font-semibold underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {authNotice && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg px-3.5 py-2.5 text-xs text-teal-900">
              {authNotice}
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    disabled={authBusy}
                    onClick={() => void sendPasswordReset(email)}
                    className="text-xs font-medium text-teal-800 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter password'}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authBusy}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <span>
                {authBusy
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Log In with Email'
                    : 'Create Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 shrink-0">or</span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={authBusy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            <span>{mode === 'login' ? 'Log in with Google' : 'Sign up with Google'}</span>
          </button>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 pt-6">
        If you are in immediate crisis, call or text 988 (US/Canada) or local emergency services.
      </footer>
    </div>
  );
}
