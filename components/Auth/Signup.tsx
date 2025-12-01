import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { Onboarding } from '../../views/Onboarding';
import { UserProfile as LocalUserProfile } from '../../types';

interface SignupProps {
    onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
    const { signUp } = useAuth();
    const [step, setStep] = useState<'credentials' | 'onboarding'>('credentials');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Move to onboarding step
        setStep('onboarding');
    };

    const handleOnboardingComplete = async (profile: LocalUserProfile) => {
        setLoading(true);
        setError('');

        const { error } = await signUp(email, password, {
            name: profile.name,
            university: profile.university,
            level: profile.level,
            courses: profile.courses,
        });

        if (error) {
            setError(error.message || 'Failed to create account');
            setLoading(false);
            setStep('credentials'); // Go back to credentials step
        }
        // If successful, AuthContext will handle the state update
    };

    if (step === 'onboarding') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100">
                <Onboarding onComplete={handleOnboardingComplete} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-slate-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full border-2 border-amber-600 flex items-center justify-center">
                            <span className="text-amber-600 font-bold">L</span>
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-slate-900">Learned</h1>
                    </div>
                    <p className="text-slate-500 text-sm">Create your account to get started</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                                placeholder="you@university.edu"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
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
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <CheckCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Continue to Profile Setup'
                        )}
                    </button>
                </form>

                {/* Switch to Login */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
