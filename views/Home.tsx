import React, { useState } from 'react';
import { UserProfile } from '../lib/supabase';
import { AppView } from '../types';
import { Flame, BookOpen, Scale, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';

interface HomeProps {
  user: UserProfile;
  onNavigate: (view: AppView) => void;
}

// Placeholder breakdown until the daily_breakdowns DB table is wired up.
const PLACEHOLDER_BREAKDOWN = {
  concept: 'Nemo Dat Quod Non Habet',
  course: 'Land Law',
  level: '300L',
  dayNumber: 1,
  definition:
    'You cannot give what you do not have. No person can transfer a better title to property than they themselves possess.',
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStreakData(): { count: number; days: boolean[] } {
  try {
    const raw = localStorage.getItem('learned_streak');
    if (!raw) return { count: 0, days: Array(7).fill(false) };
    return JSON.parse(raw);
  } catch {
    return { count: 0, days: Array(7).fill(false) };
  }
}

function getLastSession(): { course: string; score: string; mode: string } | null {
  try {
    const raw = localStorage.getItem('learned_last_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const Home: React.FC<HomeProps> = ({ user, onNavigate }) => {
  const [todayComplete, setTodayComplete] = useState(false);
  const { count: streakCount, days: streakDays } = getStreakData();
  const lastSession = getLastSession();
  const firstName = user.name.split(' ')[0];
  const breakdown = PLACEHOLDER_BREAKDOWN;

  const handleStartBreakdown = () => {
    // Mark today complete and bump streak in localStorage
    const updated = {
      count: streakCount + (todayComplete ? 0 : 1),
      days: streakDays.map((d: boolean, i: number) =>
        i === (new Date().getDay() + 6) % 7 ? true : d
      ),
    };
    localStorage.setItem('learned_streak', JSON.stringify(updated));
    setTodayComplete(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Greeting + Streak */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
          {getGreeting()}, {firstName}.
        </h1>
        <div className="flex items-center gap-2 mt-3">
          <Flame size={20} className="text-amber-500 flex-shrink-0" />
          <span className="text-xl font-bold text-amber-600">
            Day {streakCount} streak
          </span>
        </div>

        {/* 7-day dot calendar */}
        <div className="flex gap-2 mt-4">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                  streakDays[i]
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Daily Breakdown Card */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
          Today's Breakdown
        </p>

        {todayComplete ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 border-l-4 border-l-amber-500 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                  {breakdown.concept}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {breakdown.course} · {breakdown.level}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mt-3">
                  Streak continues. Come back tomorrow.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 rounded-xl p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 mb-3">
              {breakdown.course} · Day {breakdown.dayNumber}
            </p>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-3 leading-tight">
              {breakdown.concept}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              {breakdown.definition}
            </p>
            <button
              onClick={handleStartBreakdown}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Start Today's Breakdown <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Last Session */}
      {lastSession && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Last Session
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {lastSession.course}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lastSession.score} · {lastSession.mode}
              </p>
            </div>
            <button
              onClick={() => onNavigate(AppView.PRACTICE)}
              className="flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
            >
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Quick Access */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate(AppView.PRACTICE)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-5 text-left transition-colors shadow-sm"
        >
          <BookOpen size={22} className="text-slate-500 dark:text-slate-400 mb-3" />
          <p className="font-semibold text-slate-900 dark:text-white text-sm">Practice</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">MCQ drills</p>
        </button>
        <button
          onClick={() => onNavigate(AppView.IRAC)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-5 text-left transition-colors shadow-sm"
        >
          <Scale size={22} className="text-slate-500 dark:text-slate-400 mb-3" />
          <p className="font-semibold text-slate-900 dark:text-white text-sm">IRAC</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Legal reasoning</p>
        </button>
      </div>
    </div>
  );
};
