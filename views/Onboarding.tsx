import React, { useState, useEffect } from 'react';
import { UserProfile, COURSE_STRUCTURE } from '../types';
import { Button } from '../components/Button';
import { Check, ChevronDown, ChevronUp, BookOpen, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

type SemKey = 'First Semester' | 'Second Semester';

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [level, setLevel] = useState('200 Level');
  const [semester, setSemester] = useState<SemKey>('First Semester');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  // Auto-select compulsory courses for current level + semester when entering step 2
  useEffect(() => {
    if (step === 2) {
      const semData = COURSE_STRUCTURE[level]?.[semester];
      if (semData) {
        setSelectedCourses(new Set(semData.compulsory));
        setExpandedLevels(new Set([level]));
      }
    }
  }, [step, level, semester]);

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
      semester,
      courses: Array.from(selectedCourses),
      hasOnboarded: true,
    });
  };

  const firstName = name.split(' ')[0];

  const CourseCheckbox = ({ course }: { course: string }) => (
    <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all">
      <div
        className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
          selectedCourses.has(course)
            ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
        }`}
      >
        {selectedCourses.has(course) && (
          <Check size={12} className="text-white dark:text-slate-900" />
        )}
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={selectedCourses.has(course)}
        onChange={() => toggleCourse(course)}
      />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{course}</span>
    </label>
  );

  // ────────────────────────────────────────────
  // Step 1 — Name, University, Level, Semester
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

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <label htmlFor="semester" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Semester
                </label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value as SemKey)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none transition-all"
                >
                  <option value="First Semester">First Semester</option>
                  <option value="Second Semester">Second Semester</option>
                </select>
              </div>
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
              Pre-selected compulsory courses for{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {level} · {semester}
              </span>.
              Add electives and any carryover courses below.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Course List</span>
              <span className="text-sm text-slate-900 dark:text-white font-medium">{selectedCourses.size} Selected</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto">
              {Object.entries(COURSE_STRUCTURE).map(([lvl, semesterData]) => {
                const isCurrentLevel = lvl === level;
                const isExpanded = expandedLevels.has(lvl);

                return (
                  <div key={lvl} className="bg-white dark:bg-slate-900">
                    <button
                      onClick={() => toggleLevelExpand(lvl)}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${
                        isCurrentLevel
                          ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700/60'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm ${isCurrentLevel ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {lvl}
                        </span>
                        {isCurrentLevel && (
                          <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-full">
                            My Level
                          </span>
                        )}
                      </div>
                      {isExpanded
                        ? <ChevronUp size={18} className="text-slate-400 dark:text-slate-500" />
                        : <ChevronDown size={18} className="text-slate-400 dark:text-slate-500" />
                      }
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 space-y-5">
                        {(['First Semester', 'Second Semester'] as SemKey[]).map((sem) => {
                          const semData = semesterData[sem];
                          const isCurrentSem = isCurrentLevel && sem === semester;
                          const hasCourses = semData.compulsory.length > 0 || semData.electives.length > 0;
                          if (!hasCourses) return null;

                          return (
                            <div key={sem} className="mt-3">
                              <div className="flex items-center gap-2 mb-3">
                                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                  {sem}
                                </h4>
                                {isCurrentSem && (
                                  <span className="text-[9px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                    Current
                                  </span>
                                )}
                              </div>

                              {semData.compulsory.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2">
                                    Compulsory
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {semData.compulsory.map((course) => (
                                      <CourseCheckbox key={course} course={course} />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {semData.electives.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2">
                                    Electives
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {semData.electives.map((course) => (
                                      <CourseCheckbox key={course} course={course} />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
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
  // Step 3 — Personalised Welcome
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
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Your study plan · {level} · {semester}
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from(selectedCourses).map((course) => (
              <div key={course} className="px-5 py-3.5 flex items-center gap-3">
                <BookOpen size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
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
          className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
        >
          Enter Learned <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
