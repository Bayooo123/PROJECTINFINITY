import React, { useState, useEffect } from 'react';
import { IRACInterface, ScenarioSubmission } from '../components/IRACInterface';
import { UserProfile, supabase, ProblemQuestion } from '../lib/supabase';
import { Scale, CheckCircle2, RotateCcw, Loader, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

interface IRACProps {
  user: UserProfile;
}

const DIFFICULTIES = ['All', 'Introductory', 'Intermediate', 'Advanced', 'Complex'] as const;

interface Topic {
  id: string;
  name: string;
}

export const IRAC: React.FC<IRACProps> = ({ user }) => {
  const { user: authUser } = useAuth();
  const [phase, setPhase] = useState<'pick' | 'active' | 'submitted'>('pick');
  const [selectedCourse, setSelectedCourse] = useState<string>(user.courses[0] ?? '');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [question, setQuestion] = useState<ProblemQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch topics from DB whenever course changes
  useEffect(() => {
    if (!selectedCourse) { setTopics([]); return; }
    setTopicsLoading(true);
    setSelectedTopicId('');
    setTopics([]);

    const fetchTopics = async () => {
      // Get course id
      const { data: courseRow } = await supabase
        .from('courses')
        .select('id')
        .eq('course_name', selectedCourse)
        .single();

      if (!courseRow) { setTopicsLoading(false); return; }

      // Get topic_ids for this course
      const { data: ctRows } = await supabase
        .from('course_topics')
        .select('topic_id')
        .eq('course_id', courseRow.id);

      if (!ctRows || ctRows.length === 0) { setTopicsLoading(false); return; }

      const topicIds = ctRows.map((r: { topic_id: string }) => r.topic_id);

      // Get topic names from the topics table
      const { data: topicRows } = await supabase
        .from('topics')
        .select('id, name')
        .in('id', topicIds)
        .order('name');

      setTopics((topicRows as Topic[]) ?? []);
      setTopicsLoading(false);
    };

    fetchTopics();
  }, [selectedCourse]);

  const loadQuestion = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    setError(null);
    try {
      // Get course id
      const { data: courseRow, error: courseErr } = await supabase
        .from('courses')
        .select('id')
        .eq('course_name', selectedCourse)
        .single();
      if (courseErr || !courseRow) throw new Error('Course not found in question bank.');

      // Determine which topic_ids to query
      let topicIds: string[];
      if (selectedTopicId) {
        topicIds = [selectedTopicId];
      } else {
        const { data: ctRows, error: topicsErr } = await supabase
          .from('course_topics')
          .select('topic_id')
          .eq('course_id', courseRow.id);
        if (topicsErr || !ctRows || ctRows.length === 0)
          throw new Error('No topics found for this course.');
        topicIds = ctRows.map((t: { topic_id: string }) => t.topic_id);
      }

      // Count available questions
      let countQuery = supabase
        .from('problem_questions')
        .select('*', { count: 'exact', head: true })
        .in('topic_id', topicIds);
      if (selectedDifficulty !== 'All')
        countQuery = countQuery.eq('difficulty', selectedDifficulty);

      const { count, error: countErr } = await countQuery;
      if (countErr || count === null || count === 0)
        throw new Error('No questions available for this selection. Try a different topic or difficulty.');

      // Fetch a random question
      const randomOffset = Math.floor(Math.random() * count);
      let qQuery = supabase
        .from('problem_questions')
        .select('*')
        .in('topic_id', topicIds);
      if (selectedDifficulty !== 'All')
        qQuery = qQuery.eq('difficulty', selectedDifficulty);

      const { data: qRows, error: qErr } = await qQuery.range(randomOffset, randomOffset);
      if (qErr || !qRows || qRows.length === 0) throw new Error('Failed to load question. Please try again.');

      setQuestion(qRows[0] as ProblemQuestion);
      setPhase('active');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ScenarioSubmission) => {
    if (!question) return;
    if (authUser) {
      await supabase.from('irac_submissions').insert({
        user_id: authUser.id,
        problem_question_id: question.id,
        entries: data.entries,
      });
    }
    setPhase('submitted');
  };

  const selectedTopicName = topics.find(t => t.id === selectedTopicId)?.name;

  const reset = () => {
    setQuestion(null);
    setPhase('pick');
  };

  // ── Submitted ──────────────────────────────────────────────
  if (phase === 'submitted' && question) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Analysis submitted.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Your reasoning has been saved. Compare it with the model answer below.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 bg-slate-900 dark:bg-slate-800 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Model Answer</p>
            <p className="text-sm font-semibold">
              {selectedCourse}{selectedTopicName ? ` · ${selectedTopicName}` : ''} · {question.difficulty}
            </p>
          </div>
          <div className="px-5 py-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {question.model_answer}
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={reset} variant="outline" className="flex-1">
            Back to courses
          </Button>
          <Button
            onClick={() => setPhase('active')}
            variant="primary"
            className="flex-1 flex items-center gap-2 justify-center"
          >
            <RotateCcw size={15} /> Retry this question
          </Button>
        </div>
      </div>
    );
  }

  // ── Active ─────────────────────────────────────────────────
  if (phase === 'active' && question) {
    return (
      <div className="max-w-7xl mx-auto py-6">
        <header className="px-4 sm:px-6 mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Scale size={22} className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white truncate">
                {selectedCourse}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {selectedTopicName ? `${selectedTopicName} · ` : ''}{question.difficulty}{question.marks ? ` · ${question.marks} marks` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
          >
            ← New question
          </button>
        </header>

        <div className="mx-4 sm:mx-6 mb-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Instruction
          </p>
          <p className="text-sm leading-snug">{question.instruction}</p>
        </div>

        <IRACInterface
          scenarioId={question.id}
          scenarioText={question.scenario}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  // ── Pick ────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Scale size={26} className="text-slate-500 dark:text-slate-400" />
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
            IRAC Practice
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Structure your legal reasoning on real Nigerian law problems.
        </p>
      </div>

      <div className="space-y-6">
        {/* Course */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Course</p>
          <div className="space-y-2">
            {user.courses.map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedCourse === course
                    ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                {course}
              </button>
            ))}
          </div>
        </div>

        {/* Topic — loads from DB after course is picked */}
        {selectedCourse && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Topic</p>
            {topicsLoading ? (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-2">
                <Loader size={15} className="animate-spin" />
                <span className="text-sm">Loading topics…</span>
              </div>
            ) : topics.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                No topics found for this course yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTopicId('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedTopicId === ''
                      ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'
                  }`}
                >
                  All Topics
                </button>
                {topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTopicId(t.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedTopicId === t.id
                        ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Difficulty */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  selectedDifficulty === d
                    ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          onClick={loadQuestion}
          disabled={!selectedCourse || loading}
          className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader size={18} className="animate-spin" /> Loading question…</>
          ) : (
            <>Load Question <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
};
