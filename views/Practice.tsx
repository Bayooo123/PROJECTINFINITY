import React, { useState, useEffect } from 'react';
import { UserProfile, LEARNING_FACTS } from '../types';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import {
  CheckCircle,
  AlertCircle,
  Play,
  Award,
  BookOpen,
  ListFilter,
  ArrowLeft,
  ArrowRight,
  Timer,
  Layers,
  Zap,
  Loader,
} from 'lucide-react';


interface PracticeProps {
  user: UserProfile;
  onQuizStateChange?: (active: boolean) => void;
  preselect?: { course: string; topic: string };
}

type Phase = 'SELECTION' | 'LOADING' | 'QUIZ' | 'RESULT';
type QuizMode = 'QUICK' | 'MARATHON';

const QUIZ_MODES: Record<QuizMode, { label: string; count: number; timeMinutes: number; description: string; icon: React.ReactNode }> = {
  QUICK: {
    label: 'Quick Drill',
    count: 20,
    timeMinutes: 20,
    description: '20 questions on one topic. Pick a topic and drill it.',
    icon: <BookOpen size={20} />,
  },
  MARATHON: {
    label: 'Exam Marathon',
    count: 50,
    timeMinutes: 45,
    description: 'Drawn from every topic in the course. Full exam simulation.',
    icon: <Layers size={20} />,
  },
};

function saveSessionToStorage(course: string, mode: string, score: number, total: number, topic?: string) {
  localStorage.setItem(
    'learned_last_session',
    JSON.stringify({ course, mode, score: `${score}/${total}`, topic: topic !== 'All Topics' ? topic : undefined })
  );

  // Accumulate total questions answered
  const prev = parseInt(localStorage.getItem('learned_total_questions') || '0', 10);
  localStorage.setItem('learned_total_questions', String(prev + total));

  // Save per-course score history for Profile averages
  const key = `learned_course_scores_${course.replace(/\s+/g, '_')}`;
  const existing: number[] = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push(Math.round((score / total) * 100));
  localStorage.setItem(key, JSON.stringify(existing));
}

export const Practice: React.FC<PracticeProps> = ({ user, onQuizStateChange, preselect }) => {
  const [phase, setPhase] = useState<Phase>('SELECTION');
  const [selectedCourse, setSelectedCourse] = useState(preselect?.course ?? '');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [quizMode, setQuizMode] = useState<QuizMode>('QUICK');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [randomTip, setRandomTip] = useState<{ title: string; content: string } | null>(null);
  const [availableTopics, setAvailableTopics] = useState<{ id: string; title: string }[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [marathonCount, setMarathonCount] = useState<50 | 100>(50);

  // Load topics from courses → course_topics → mcq_questions
  useEffect(() => {
    if (!selectedCourse) { setAvailableTopics([]); return; }
    setTopicsLoading(true);
    setSelectedTopicId('');

    const fetchTopics = async () => {
      const { data: courseRows } = await supabase
        .from('courses')
        .select('id')
        .eq('course_name', selectedCourse)
        .limit(1);

      if (!courseRows?.length) { setTopicsLoading(false); return; }

      const { data: ctRows } = await supabase
        .from('course_topics')
        .select('topic_id, topic_title')
        .eq('course_id', courseRows[0].id)
        .order('topic_number');

      setAvailableTopics((ctRows ?? []).map(r => ({ id: r.topic_id, title: r.topic_title })));
      setTopicsLoading(false);
    };

    fetchTopics();
  }, [selectedCourse]);

  // Apply preselect topic once topics are loaded
  useEffect(() => {
    if (preselect?.topic && availableTopics.length > 0 && !selectedTopicId) {
      const match = availableTopics.find(t => t.title === preselect.topic);
      if (match) setSelectedTopicId(match.id);
    }
  }, [availableTopics]);

  const userCourses =
    user.courses && user.courses.length > 0
      ? user.courses
      : ['Company Law', 'Constitutional Law', 'Criminal Law'];

  // Notify parent when quiz active state changes
  useEffect(() => {
    onQuizStateChange?.(phase === 'QUIZ');
  }, [phase, onQuizStateChange]);

  // Timer
  useEffect(() => {
    let timer: number;
    if (phase === 'QUIZ' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  // Reset topic selection when switching modes
  useEffect(() => {
    setSelectedTopicId('');
  }, [quizMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canStart = selectedCourse && availableTopics.length > 0 && (quizMode === 'MARATHON' || selectedTopicId);

  const handleStartQuiz = async () => {
    if (!canStart) return;
    setPhase('LOADING');
    setError(null);

    try {
      const count = quizMode === 'MARATHON' ? marathonCount : QUIZ_MODES[quizMode].count;
      const timeMinutes = quizMode === 'MARATHON' ? (marathonCount === 100 ? 75 : 45) : QUIZ_MODES[quizMode].timeMinutes;

      // Determine which topic_ids to query
      const topicIds = quizMode === 'MARATHON'
        ? availableTopics.map(t => t.id)
        : [selectedTopicId];

      // Count available questions
      const { count: total } = await supabase
        .from('mcq_questions')
        .select('*', { count: 'exact', head: true })
        .in('topic_id', topicIds);

      if (!total || total === 0) {
        throw new Error('No questions available for this selection. Try another topic or check back later.');
      }

      // Random offset for variety
      const offset = total > count ? Math.floor(Math.random() * (total - count)) : 0;
      const { data, error: fetchErr } = await supabase
        .from('mcq_questions')
        .select('question, option_a, option_b, option_c, option_d, correct_answer, explanation')
        .in('topic_id', topicIds)
        .range(offset, offset + count - 1);

      if (fetchErr || !data?.length) throw new Error('Failed to load questions. Please try again.');

      // Map to quiz format
      const mapped = data.map(row => ({
        text: row.question,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        correctAnswer: ['A', 'B', 'C', 'D'].indexOf(row.correct_answer),
        explanation: row.explanation,
      }));

      setTimeLeft(timeMinutes * 60);
      setQuestions(mapped);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setScore(0);
      setPhase('QUIZ');
    } catch (err: any) {
      setError(err.message || 'Failed to load questions. Please try again.');
      setPhase('SELECTION');
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    let newScore = 0;
    questions.forEach((q, idx) => {
      const correctIdx = q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswerIndex;
      if (userAnswers[idx] === correctIdx) newScore += 1;
    });
    setScore(newScore);
    setRandomTip(LEARNING_FACTS[Math.floor(Math.random() * LEARNING_FACTS.length)]);
    const topicTitle = availableTopics.find(t => t.id === selectedTopicId)?.title;
    saveSessionToStorage(selectedCourse, QUIZ_MODES[quizMode].label, newScore, questions.length, quizMode === 'QUICK' ? topicTitle : undefined);
    setPhase('RESULT');
  };

  const resetQuiz = () => {
    setPhase('SELECTION');
    setSelectedCourse('');
    setSelectedTopicId('');
    setQuestions([]);
    setUserAnswers({});
  };

  // ────────────────────────────────────────────
  // VIEW: Selection — progressive disclosure
  // ────────────────────────────────────────────
  if (phase === 'SELECTION') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <header>
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">Practice</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Simulate real examinations to reinforce your legal understanding.
          </p>
        </header>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          {/* Step 1: Course */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-300">
              1. Select Course
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {userCourses.map((course) => (
                <button
                  key={course}
                  onClick={() => {
                    setSelectedCourse(course);
                    setSelectedTopicId('');
                  }}
                  className={`text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedCourse === course
                      ? 'border-slate-900 dark:border-slate-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ring-1 ring-slate-900 dark:ring-slate-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-medium truncate">{course}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Mode — unlocks when course is picked */}
          {selectedCourse && (
            <div className="space-y-3 animate-fade-slide-in">
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-300">
                2. Select Mode
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(QUIZ_MODES) as QuizMode[]).map((mode) => {
                  const config = QUIZ_MODES[mode];
                  const isSelected = quizMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setQuizMode(mode)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-slate-900 dark:border-slate-400 bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-900 dark:ring-slate-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className={`mb-2 ${isSelected ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                        {config.icon}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">{config.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        {mode === 'MARATHON' ? '50 or 100 Qs · All Topics' : `${config.count} Qs · ${config.timeMinutes} Mins`}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-tight">
                        {config.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2b: Marathon count picker */}
          {selectedCourse && quizMode === 'MARATHON' && (
            <div className="space-y-3 animate-fade-slide-in">
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-300">
                3. Number of Questions
              </label>
              <div className="flex gap-3">
                {([50, 100] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setMarathonCount(n)}
                    className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-all ${
                      marathonCount === n
                        ? 'border-slate-900 dark:border-slate-400 bg-slate-900 dark:bg-slate-700 text-white dark:text-white ring-1 ring-slate-900 dark:ring-slate-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    {n} Questions
                    <span className="block text-xs font-normal mt-0.5 opacity-70">
                      {n === 50 ? '~45 mins' : '~75 mins'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Topic — unlocks for Quick Drill only */}
          {selectedCourse && quizMode === 'QUICK' && (
            <div className="space-y-3 animate-fade-slide-in">
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-300">
                3. Select Topic
              </label>
              {topicsLoading ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-2">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">Loading topics from question bank…</span>
                </div>
              ) : availableTopics.length === 0 ? (
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No questions in the bank yet for <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedCourse}</span>.
                    An admin can add them via the Question Bank Generator.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Select a Topic --</option>
                    {availableTopics.map((t) => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                    <ListFilter size={20} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Start Button — visible once mode is chosen */}
          {selectedCourse && (
            <div className="animate-fade-slide-in">
              <Button
                onClick={handleStartQuiz}
                disabled={!canStart}
                fullWidth
                variant="primary"
                className="py-4 text-lg"
              >
                <span className="flex items-center gap-2">
                  Start {QUIZ_MODES[quizMode].label} <Play size={20} fill="currentColor" />
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // VIEW: Loading
  // ────────────────────────────────────────────
  if (phase === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 dark:border-slate-700 rounded-full" />
          <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-900 dark:border-white rounded-full border-t-transparent animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-slate-900 dark:text-white">Preparing Exam Paper</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Curating questions on {quizMode === 'MARATHON' ? 'all topics' : (availableTopics.find(t => t.id === selectedTopicId)?.title ?? 'selected topic')}…
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // VIEW: Quiz
  // ────────────────────────────────────────────
  if (phase === 'QUIZ') {
    const question = questions[currentQuestionIndex];
    const selectedOption = userAnswers[currentQuestionIndex];
    const modeConfig = QUIZ_MODES[quizMode];

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Quiz header with timer */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-0 z-10 gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Q {currentQuestionIndex + 1} / {questions.length}
            </span>
            <div className="hidden md:block text-sm text-slate-400 dark:text-slate-500">
              {modeConfig.label}
            </div>
          </div>

          <div className="hidden md:flex flex-1 mx-8 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 dark:bg-slate-50 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div
            className={`flex items-center gap-2 font-mono font-bold text-xl ${
              timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Timer size={24} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex-grow">
          <h3 className="text-xl md:text-2xl font-serif font-medium text-slate-900 dark:text-white mb-8 leading-relaxed">
            {question.text || question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option: string, idx: number) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                    isSelected
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-900 dark:ring-white'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'border-slate-900 dark:border-white dot-center'
                        : 'border-slate-400 dark:border-slate-500'
                    }`}
                  />
                  <span className="text-base text-slate-900 dark:text-slate-200">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <Button
            onClick={handlePrevQuestion}
            variant="ghost"
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNextQuestion} variant="primary" className="flex items-center gap-2">
              Next <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmitQuiz} variant="secondary" className="flex items-center gap-2">
              Submit Exam <CheckCircle size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // VIEW: Result
  // ────────────────────────────────────────────
  if (phase === 'RESULT') {
    const percentage = Math.round((score / questions.length) * 100);
    let message = 'Keep practicing to improve your mastery.';
    if (percentage >= 80) message = 'Excellent mastery of the concepts!';
    else if (percentage >= 60) message = 'Good job! Review the missed areas.';

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-900 dark:bg-slate-200" />
          <Award
            size={64}
            className={`mx-auto ${percentage >= 60 ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}
          />

          <div>
            <h2 className="text-5xl font-serif font-bold text-slate-900 dark:text-white">{percentage}%</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
              You scored {score} out of {questions.length}
            </p>
          </div>

          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{message}</p>

          {randomTip && (
            <div className="mt-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-left">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm mb-1">
                <Zap size={14} /> Study Tip: {randomTip.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{randomTip.content}</p>
            </div>
          )}

          <div className="pt-4 flex justify-center">
            <Button onClick={resetQuiz} variant="primary">
              Take Another Exam
            </Button>
          </div>
        </div>

        {/* Answer review */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Review Answers</h3>

          <div className="grid gap-6">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              const correctIdx = q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswerIndex;
              const isCorrect = userAnswer === correctIdx;

              return (
                <div
                  key={idx}
                  className={`bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 shadow-sm ${
                    isCorrect ? 'border-l-green-500' : 'border-l-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="font-bold text-slate-400 dark:text-slate-500 text-sm mt-1">Q{idx + 1}</span>
                    <h4 className="font-medium text-slate-900 dark:text-white text-lg">{q.question || q.text}</h4>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isCorrect
                          ? 'text-green-700 dark:text-green-400 font-medium'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isCorrect ? <CheckCircle size={16} /> : <BookOpen size={16} />}
                      <span>
                        Your Answer:{' '}
                        {userAnswer === undefined ? 'Skipped' : q.options[userAnswer]}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-medium">
                        <CheckCircle size={16} />
                        <span>Correct Answer: {q.options[correctIdx]}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex gap-3">
                    <BookOpen size={18} className="flex-shrink-0 text-slate-400 dark:text-slate-500 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Explanation: </span>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
