import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, AlertCircle, Loader, CheckCircle, ChevronLeft } from 'lucide-react';
import { Onboarding } from '../../views/Onboarding';
import { UserProfile as LocalUserProfile } from '../../types';

interface SignupProps {
  onSwitchToLogin: () => void;
  onBack?: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onBack }) => {
  const [step, setStep] = useState<'credentials' | 'onboarding'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setStep('onboarding');
  };

  const handleOnboardingComplete = async (profile: LocalUserProfile) => {
    setLoading(true);
    setError('');

    // Step 1: Create auth account (or recover existing one)
    let userId: string | null = null;

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password });

    if (signUpErr) {
      const msg = signUpErr.message?.toLowerCase() ?? '';
      if (msg.includes('already registered') || msg.includes('already_registered') || msg.includes('user already')) {
        // Auth exists — sign in to recover the session and get the user ID
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) {
          setError('This email is already registered. Please sign in instead.');
          setLoading(false);
          setStep('credentials');
          return;
        }
        userId = signInData.user?.id ?? null;
      } else {
        setError(signUpErr.message || 'Failed to create account. Please try again.');
        setLoading(false);
        setStep('credentials');
        return;
      }
    } else {
      userId = signUpData.user?.id ?? null;
    }

    if (!userId) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      setStep('credentials');
      return;
    }

    // Step 2: Insert profile row
    const { error: profileErr } = await supabase.from('user_profiles').insert({
      id: userId,
      name: profile.name,
      university: profile.university,
      level: profile.level,
      semester: profile.semester ?? 'First Semester',
      courses: profile.courses,
    });

    if (profileErr) {
      // Duplicate key → profile already exists, user is already set up and logged in
      if (profileErr.code === '23505') {
        setLoading(false);
        return;
      }
      setError(profileErr.message || 'Failed to save your profile. Please try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
    // AuthContext's onAuthStateChange listener will pick up the new session and fetch the profile
  };

  if (step === 'onboarding') {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-slate-950">
        {loading && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-900 rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-xl">
              <Loader size={32} className="animate-spin text-slate-900 dark:text-white" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Creating your account…</p>
            </div>
          </div>
        )}
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-100 dark:border-slate-800">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-6"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <img src="/logo_icon.png" alt="Learned Icon" className="w-16 h-16 rounded-full shadow-sm" />
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Learned</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              {error.includes('already registered') && (
                <button onClick={onSwitchToLogin} className="text-sm text-red-700 dark:text-red-400 underline mt-1 font-semibold">
                  Go to Sign In →
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent outline-none transition"
                placeholder="you@university.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">At least 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <CheckCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            Continue to Profile Setup
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-slate-900 dark:text-white hover:underline font-bold">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
