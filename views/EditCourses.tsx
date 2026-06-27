import React, { useState, useEffect } from 'react';
import { COURSE_STRUCTURE } from '../types';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Check, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EditCoursesProps {
  onBack: () => void;
}

type SemKey = 'First Semester' | 'Second Semester';

export const EditCourses: React.FC<EditCoursesProps> = ({ onBack }) => {
  const { profile, updateProfile } = useAuth();

  const level = profile?.level ?? '200 Level';
  const semester = (profile?.semester ?? 'First Semester') as SemKey;

  const [selected, setSelected] = useState<Set<string>>(new Set(profile?.courses ?? []));
  const [dbCourses, setDbCourses] = useState<Set<string>>(new Set());
  const [dbLoading, setDbLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set([level]));

  // Fetch courses that actually exist in the database
  useEffect(() => {
    supabase
      .from('courses')
      .select('course_name')
      .then(({ data }) => {
        const names = new Set((data ?? []).map((r: { course_name: string }) => r.course_name));
        setDbCourses(names);
        setDbLoading(false);
      });
  }, []);

  const toggle = (course: string) => {
    if (!dbCourses.has(course)) return; // can't select unavailable courses
    const next = new Set(selected);
    next.has(course) ? next.delete(course) : next.add(course);
    setSelected(next);
  };

  const toggleLevel = (lvl: string) => {
    const next = new Set(expandedLevels);
    next.has(lvl) ? next.delete(lvl) : next.add(lvl);
    setExpandedLevels(next);
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    await updateProfile({ courses: Array.from(selected) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 1000);
  };

  const CourseRow = ({ course }: { course: string }) => {
    const available = dbCourses.has(course);
    const checked = selected.has(course);
    return (
      <label
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
          available
            ? 'border-slate-200 dark:border-slate-700 cursor-pointer hover:border-slate-900 dark:hover:border-white'
            : 'border-slate-100 dark:border-slate-800 cursor-not-allowed opacity-50'
        }`}
        onClick={() => toggle(course)}
      >
        <div
          className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
            checked
              ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
          }`}
        >
          {checked && <Check size={12} className="text-white dark:text-slate-900" />}
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{course}</span>
        {!available && (
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            Coming soon
          </span>
        )}
      </label>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Edit Courses</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            {level} · {semester} · {selected.size} selected
          </p>
        </div>
      </div>

      {dbLoading ? (
        <div className="py-16 text-center">
          <Loader size={28} className="animate-spin text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-3">Checking available courses…</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Courses marked <span className="font-semibold text-slate-700 dark:text-slate-300">"Coming soon"</span> are not yet in the question bank. You can still select them; they won't show content until added.
          </p>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">All Levels</span>
              <span className="text-sm text-slate-900 dark:text-white font-semibold">{selected.size} selected</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[60vh] overflow-y-auto">
              {Object.entries(COURSE_STRUCTURE).map(([lvl, semData]) => {
                const isCurrentLevel = lvl === level;
                const isExpanded = expandedLevels.has(lvl);

                return (
                  <div key={lvl}>
                    <button
                      onClick={() => toggleLevel(lvl)}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${
                        isCurrentLevel
                          ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700/60'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm ${isCurrentLevel ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                          {lvl}
                        </span>
                        {isCurrentLevel && (
                          <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      {isExpanded
                        ? <ChevronUp size={18} className="text-slate-400" />
                        : <ChevronDown size={18} className="text-slate-400" />
                      }
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-5">
                        {(['First Semester', 'Second Semester'] as SemKey[]).map((sem) => {
                          const s = semData[sem];
                          const isCurrentSem = isCurrentLevel && sem === semester;
                          const allCourses = [...s.compulsory, ...s.electives];
                          if (allCourses.length === 0) return null;

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

                              {s.compulsory.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2">
                                    Compulsory
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {s.compulsory.map((c) => <CourseRow key={c} course={c} />)}
                                  </div>
                                </div>
                              )}

                              {s.electives.length > 0 && (
                                <div>
                                  <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2">
                                    Electives
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {s.electives.map((c) => <CourseRow key={c} course={c} />)}
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

          <button
            onClick={handleSave}
            disabled={selected.size === 0 || saving || saved}
            className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? (
              <><Check size={18} /> Saved!</>
            ) : saving ? (
              <><Loader size={18} className="animate-spin" /> Saving…</>
            ) : (
              `Save ${selected.size} Course${selected.size !== 1 ? 's' : ''}`
            )}
          </button>
        </>
      )}
    </div>
  );
};
