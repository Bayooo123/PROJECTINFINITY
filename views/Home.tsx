import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { AppView } from '../types';
import { Flame, BookOpen, Scale, ChevronRight, Loader, CheckCircle, Zap } from 'lucide-react';

interface HomeProps {
  user: UserProfile;
  onNavigate: (view: AppView) => void;
  onStartQuiz: (course: string, topic: string) => void;
}

interface NeedToKnowPoint {
  point_number: number;
  heading: string;
  body: string;
}

interface WeeklyTopic {
  id: string;
  title: string;
  number: number;
}

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

function markTodayInStreak() {
  const { count, days } = getStreakData();
  const todayIdx = (new Date().getDay() + 6) % 7;
  if (days[todayIdx]) return;
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

export const Home: React.FC<HomeProps> = ({ user, onNavigate, onStartQuiz }) => {
  const { count: streakCount, days: streakDays } = getStreakData();
  const lastSession = getLastSession();
  const totalQuestions = getTotalQuestions();
  const accuracy = getOverallAccuracy();
  const activeDays = getActiveDays(streakDays);
  const firstName = user.name.split(' ')[0];
  const todayIdx = (new Date().getDay() + 6) % 7;

  // Weekly Focus
  const [focusCourse, setFocusCourse] = useState(user.courses[0] ?? '');
  const [weeklyTopic, setWeeklyTopic] = useState<WeeklyTopic | null>(null);
  const [points, setPoints] = useState<NeedToKnowPoint[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [focusLoading, setFocusLoading] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (!focusCourse) return;
    setFocusLoading(true);
    setCardIndex(0);
    setWeeklyTopic(null);
    setPoints([]);

    const fetchFocus = async () => {
      const { data: courseRow } = await supabase
        .from('courses')
        .select('id')
        .eq('course_name', focusCourse)
        .maybeSingle();
      if (!courseRow) { setFocusLoading(false); return; }

      const { data: topicRows } = await supabase
        .from('course_topics')
        .select('topic_id, topic_title, topic_number')
        .eq('course_id', courseRow.id)
        .order('topic_number');
      if (!topicRows || topicRows.length === 0) { setFocusLoading(false); return; }

      const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
      const t = topicRows[weekNum % topicRows.length];
      setWeeklyTopic({ id: t.topic_id, title: t.topic_title, number: t.topic_number });

      const { data: pointRows } = await supabase
        .from('topic_need_to_know')
        .select('point_number, heading, body')
        .eq('topic_id', t.topic_id)
        .order('point_number');
      setPoints(pointRows ?? []);
      setFocusLoading(false);
    };

    fetchFocus();
  }, [focusCourse]);

  const prevCard = () => setCardIndex(i => Math.max(0, i - 1));
  const nextCard = () => setCardIndex(i => Math.min(points.length, i + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextCard();
    if (diff < -50) prevCard();
  };

  const handleTestYourself = () => {
    markTodayInStreak();
    if (weeklyTopic) onStartQuiz(focusCourse, weeklyTopic.title);
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
          <span className="text-xs text-slate-400 dark:text-slate-500">Keep it lit</span>
        </div>
        <div className="flex gap-2">
          {DAY_LABELS.map((label, i) => {
            const isDone = streakDays[i];
            const isToday = i === todayIdx;
            let cls = '';
            if (isDone) cls = 'bg-slate-900 dark:bg-white text-white dark:text-slate-900';
            else if (isToday) cls = 'border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white bg-transparent';
            else cls = 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600';
            return (
              <div
                key={i}
                className={`flex-1 aspect-square rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${cls}`}
              >
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Weekly Focus ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
          Weekly Focus
        </p>

        {/* Course switcher pills — horizontal scroll */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 mb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {user.courses.map((c) => (
            <button
              key={c}
              onClick={() => setFocusCourse(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                focusCourse === c
                  ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {focusLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 flex items-center justify-center">
            <Loader size={22} className="animate-spin text-slate-400 dark:text-slate-600" />
          </div>
        ) : !weeklyTopic || points.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">
              No content available for this course yet.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-3">
              Topic {weeklyTopic.number} — {weeklyTopic.title}
            </p>

            {cardIndex < points.length ? (
              <div
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col select-none"
                style={{ minHeight: 240 }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 block">
                  Point {points[cardIndex].point_number} of {points.length}
                </span>
                <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                  {points[cardIndex].heading}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                  {points[cardIndex].body}
                </p>

                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={prevCard}
                    disabled={cardIndex === 0}
                    className="text-sm font-semibold text-slate-500 dark:text-slate-400 disabled:opacity-25 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    ← Prev
                  </button>

                  {/* Dot indicators — one per point + end card */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: points.length + 1 }, (_, i) => (
                      <div
                        key={i}
                        className={`rounded-full transition-all duration-200 ${
                          i === cardIndex
                            ? 'w-4 h-1.5 bg-slate-900 dark:bg-white'
                            : 'w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextCard}
                    className="text-sm font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              /* End card */
              <div
                className="bg-slate-900 dark:bg-slate-100 rounded-2xl p-6 text-center select-none"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="w-12 h-12 bg-white/10 dark:bg-black/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} className="text-white dark:text-slate-800" />
                </div>
                <p className="text-white/60 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                  All {points.length} points covered
                </p>
                <h3 className="text-white dark:text-slate-900 font-serif font-bold text-lg mb-5 leading-snug">
                  {weeklyTopic.title}
                </h3>

                {/* Dot indicators on end card */}
                <div className="flex items-center justify-center gap-1.5 mb-5">
                  {Array.from({ length: points.length + 1 }, (_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-200 ${
                        i === cardIndex
                          ? 'w-4 h-1.5 bg-white dark:bg-slate-800'
                          : 'w-1.5 h-1.5 bg-white/30 dark:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleTestYourself}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mb-3"
                >
                  <Zap size={16} /> Test yourself on this topic
                </button>
                <button
                  onClick={() => setCardIndex(0)}
                  className="text-white/50 dark:text-slate-500 text-xs hover:text-white/80 dark:hover:text-slate-700 transition-colors"
                >
                  Review points again
                </button>
              </div>
            )}
          </>
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
