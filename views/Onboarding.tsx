import React, { useState, useEffect } from 'react';
import { UserProfile, COURSE_STRUCTURE } from '../types';
import { Button } from '../components/Button';
import { Check, ChevronDown, ChevronUp, BookOpen, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [level, setLevel] = useState('100 Level');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  // Auto-select compulsory courses when level changes
  useEffect(() => {
    if (step === 2) {
      const levelData = COURSE_STRUCTURE[level];
      if (levelData) {
        setSelectedCourses(new Set(levelData.compulsory));
        setExpandedLevels(new Set([level]));
      }
    }
  }, [step, level]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && university) setStep(2);
  };

  const toggleCourse = (course: string) => {
    const next = new Set(selectedCourses);
    next.has(course) ? next.delete(course) : next.add(course);
    setSelectedCourses(next);
  };

  const toggleLevelExpand = (lvl: string) => {
    const next = new Set(expandedLevels);
    next.has(lvl) ? next.delete(lvl) : next.add(lvl);
    setExpandedLevels(next);
  };

  const handleFinalSubmit = () => {
    onComplete({
      name,
      university,
      level,
      courses: Array.from(selectedCourses),
      hasOnboarded: true,
    });
  };

  const firstName = name.split(' ')[0];

  // ────────────────────────────────────────────
  // Step 1 — Name, University, Level
  // ────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-100 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-6">
              <img src="logo_banner.png" alt="Learned" className="h-20 w-auto rounded-xl" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              Welcome to Learned
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Your daily Nigerian law study companion.
            </p>
          </div>

          <form
            onSubmit={handleStep1Submit}
            className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none transition-all"
                placeholder="e.g. Chisom Adebayo"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="university" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                University
              </label>
              <input
                type="text"
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none transition-all"
                placeholder="e.g. University of Lagos"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="level" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Level
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none transition-all"
              >
                <option value="100 Level">100 Level</option>
                <option value="200 Level">200 Level</option>
                <option value="300 Level">300 Level</option>
                <option value="400 Level">400 Level</option>
                <option value="500 Level">500 Level</option>
                <option value="Law School">Law School</option>
              </select>
            </div>

            <Button type="submit" fullWidth className="mt-2">
              Next Step
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // Step 2 — Course Selection
  // ────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12 bg-stone-100 dark:bg-slate-950">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
              Select Your Courses
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We've pre-selected compulsory courses for{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{level}</span>.
              Add your electives and any carryover courses.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Course List</span>
              <span className="text-sm text-amber-600 font-medium">{selectedCourses.size} Selected</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto">
              {Object.entries(COURSE_STRUCTURE).map(([lvl, data]) => {
                const isCurrentLevel = lvl === level;
                const isExpanded = expandedLevels.has(lvl);

                return (
                  <div key={lvl} className="bg-white dark:bg-slate-900">
                    <button
                      onClick={() => toggleLevelExpand(lvl)}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${
                        isCurrentLevel
                          ? 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-50/80 dark:hover:bg-amber-900/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold text-sm ${
                            isCurrentLevel
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {lvl}
                        </span>
                        {isCurrentLevel && (
                          <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                            My Level
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-slate-400 dark:text-slate-500" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 dark:text-slate-500" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 space-y-4">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mt-3">
                            Compulsory
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {data.compulsory.map((course) => (
                              <label
                                key={course}
                                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-all"
                              >
                                <div
                                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                    selectedCourses.has(course)
                                      ? 'bg-amber-600 border-amber-600'
                                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                  }`}
                                >
                                  {selectedCourses.has(course) && <Check size={12} className="text-white" />}
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={selectedCourses.has(course)}
                                  onChange={() => toggleCourse(course)}
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{course}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {data.electives.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mt-4">
                              Electives
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {data.electives.map((course) => (
                                <label
                                  key={course}
                                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-all"
                                >
                                  <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                      selectedCourses.has(course)
                                        ? 'bg-amber-600 border-amber-600'
                                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                    }`}
                                  >
                                    {selectedCourses.has(course) && <Check size={12} className="text-white" />}
                                  </div>
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedCourses.has(course)}
                                    onChange={() => toggleCourse(course)}
                                  />
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{course}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button fullWidth onClick={() => setStep(3)} disabled={selectedCourses.size === 0}>
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // Step 3 — Personalised Welcome (replaces manifesto)
  // ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-100 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
            You're ready, {firstName}.
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Your study plan</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from(selectedCourses).map((course) => (
              <div key={course} className="px-5 py-3.5 flex items-center gap-3">
                <BookOpen size={16} className="text-amber-500 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{course}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 text-base">
            Your first breakdown is waiting.
          </p>
        </div>

        <button
          onClick={handleFinalSubmit}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
        >
          Enter Learned <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
