import React, { useState } from 'react';
import { UserProfile } from '../lib/supabase';
import { AppView } from '../types';
import { Flame, BookOpen, Scale, ArrowRight, ChevronRight } from 'lucide-react';

interface HomeProps {
  user: UserProfile;
  onNavigate: (view: AppView) => void;
}

// Placeholder until daily_breakdowns Supabase table is wired up
const PLACEHOLDER_BREAKDOWN = {
  concept: 'Nemo Dat Quod Non Habet',
  course: 'Land Law',
  level: '300L',
  dayNumber: 12,
  definition:
    'No person can transfer a better title to property than they themselves possess — you cannot give what you do not have.',
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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

function isTodayComplete(): boolean {
  const last = localStorage.getItem('learned_today_breakdown');
  return last === new Date().toISOString().slice(0, 10);
}

function markTodayComplete() {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem('learned_today_breakdown', today);
  const { count, days } = getStreakData();
  const todayIdx = (new Date().getDay() + 6) % 7;
  const updated = [...days];
  updated[todayIdx] = true;
  localStorage.setItem('learned_streak', JSON.stringify({ count: count + 1, days: updated }));
}

function getTotalQuestions(): number {
  return parseInt(localStorage.getItem('learned_total_questions') || '0', 10);
}

function getActiveDays(days: boolean[]): number {
  return days.filter(Boolean).length;
}

function getOverallAccuracy(): number | null {
  const all: number[] = [];
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('learned_course_scores_')) {
      try {
        const arr = JSON.parse(localStorage.getItem(key) || '[]') as number[];
        all.push(...arr);
      } catch { /* ignore */ }
    }
  }
  if (all.length === 0) return null;
  return Math.round(all.reduce((a, b) => a + b, 0) / all.length);
}

function getCourseAvg(course: string): number | null {
  try {
    const key = `learned_course_scores_${course.replace(/\s+/g, '_')}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]') as number[];
    if (arr.length === 0) return null;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  } catch {
    return null;
  }
}

function getLastSession(): { course: string; score: string; mode: string; topic?: string } | null {
  try {
    const raw = localStorage.getItem('learned_last_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const Home: React.FC<HomeProps> = ({ user, onNavigate }) => {
  const [todayDone, setTodayDone] = useState(isTodayComplete);
  const { count: streakCount, days: streakDays } = getStreakData();
  const lastSession = getLastSession();
  const totalQuestions = getTotalQuestions();
  const accuracy = getOverallAccuracy();
  const activeDays = getActiveDays(streakDays);
  const firstName = user.name.split(' ')[0];
  const todayIdx = (new Date().getDay() + 6) % 7;
  const breakdown = PLACEHOLDER_BREAKDOWN;

  const handleStartBreakdown = () => {
    markTodayComplete();
    setTodayDone(true);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-7 pb-10">

      {/* ── Greeting ── */}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{getGreeting()}</p>
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mt-0.5">
          {firstName}.
        </h1>
      </div>

      {/* ── Streak row ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-slate-400 dark:text-slate-500" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Day {streakCount} streak
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">Keep it lit 🔥</span>
        </div>

        {/* 7-day dot calendar */}
        <div className="flex gap-2">
          {DAY_LABELS.map((label, i) => {
            const isDone = streakDays[i];
            const isToday = i === todayIdx;
            let dotClass = '';
            if (isDone) {
              dotClass = 'bg-slate-900 dark:bg-white text-white dark:text-slate-900';
            } else if (isToday) {
              dotClass = 'border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white bg-transparent';
            } else {
              dotClass = 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600';
            }
            return (
              <div
                key={i}
                className={`flex-1 aspect-square rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${dotClass}`}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Today's Breakdown card ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
          Today's Breakdown
        </p>

        {todayDone ? (
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 border-l-4 border-l-slate-900 dark:border-l-white rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              {breakdown.course} · Day {breakdown.dayNumber}
            </p>
            <h2 className="text-xl font-serif font-bold italic text-slate-900 dark:text-white leading-snug mb-2">
              {breakdown.concept}
            </h2>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Streak continues. Come back tomorrow. ✓
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-slate-900 dark:border-l-white rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
              {breakdown.course} · Day {breakdown.dayNumber}
            </p>
            <h2 className="text-2xl font-serif font-bold italic text-slate-900 dark:text-white leading-snug mb-3">
              {breakdown.concept}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5">
              {breakdown.definition}
            </p>
            <button
              onClick={handleStartBreakdown}
              className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Start today's breakdown <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Pick up where you left off ── */}
      {lastSession && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Pick up where you left off
          </p>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-slate-500 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                {lastSession.course}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {lastSession.topic ? `${lastSession.topic} · ` : ''}{lastSession.mode} · last scored {lastSession.score}
              </p>
            </div>
            <button
              onClick={() => onNavigate(AppView.PRACTICE)}
              className="flex items-center gap-0.5 text-sm font-bold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
            >
              Resume <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── This week stats ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
          This Week
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuestions.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-tight">Questions answered</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {accuracy !== null ? `${accuracy}%` : '—'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-tight">Average accuracy</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeDays}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-tight">Active days</p>
          </div>
        </div>
      </div>

      {/* ── Your courses ── */}
      {user.courses && user.courses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Your Courses
            </p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{user.level}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {user.courses.map((course) => {
              const avg = getCourseAvg(course);
              return (
                <div key={course} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{course}</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                      {avg !== null ? `${avg}%` : '—'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-500"
                      style={{ width: avg !== null ? `${avg}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick access ── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate(AppView.PRACTICE)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-2xl p-5 text-left transition-colors shadow-sm"
        >
          <BookOpen size={22} className="text-slate-500 dark:text-slate-400 mb-3" />
          <p className="font-bold text-slate-900 dark:text-white text-sm">Practice</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">MCQ drills</p>
        </button>
        <button
          onClick={() => onNavigate(AppView.IRAC)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-2xl p-5 text-left transition-colors shadow-sm"
        >
          <Scale size={22} className="text-slate-500 dark:text-slate-400 mb-3" />
          <p className="font-bold text-slate-900 dark:text-white text-sm">IRAC</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Legal reasoning</p>
        </button>
      </div>

    </div>
  );
};
