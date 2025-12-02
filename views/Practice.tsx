import React, { useState, useEffect } from 'react';
import { COURSE_TOPICS, QuizQuestion, UserProfile, LEARNING_FACTS } from '../types';
import { generateQuizQuestions, generateCoccinQuestions } from '../services/geminiService';
import { Button } from '../components/Button';
import { CheckCircle, XCircle, AlertCircle, Play, Award, BookOpen, ListFilter, Clock, ArrowLeft, ArrowRight, Timer, Zap, Layers, CheckSquare, FileText } from 'lucide-react';

interface PracticeProps {
  user: UserProfile;
}

type Phase = 'SELECTION' | 'LOADING' | 'QUIZ' | 'RESULT';
type QuizMode = 'STANDARD' | 'SPEED' | 'MARATHON';
type PracticeType = 'STANDARD' | 'COCCIN';
type CoccinType = 'theory' | 'objective';

const QUIZ_MODES: Record<QuizMode, { label: string, count: number, timeMinutes: number, description: string, icon: React.ReactNode }> = {
  STANDARD: {
    label: 'Standard Practice',
    count: 20,
    timeMinutes: 20,
    description: '20 questions in 20 minutes. Focus on a specific topic.',
    icon: <BookOpen size={20} />
  },
  SPEED: {
    label: 'Speed Drill',
    count: 50,
    timeMinutes: 25,
    description: '50 questions in 25 minutes. High intensity review across all topics.',
    icon: <Zap size={20} />
  },
  MARATHON: {
    label: 'Exam Marathon',
    count: 100,
    timeMinutes: 50,
    description: '100 questions in 50 minutes. Full syllabus simulation.',
    icon: <Layers size={20} />
  }
};

export const Practice: React.FC<PracticeProps> = ({ user }) => {
  const [phase, setPhase] = useState<Phase>('SELECTION');
  const [practiceType, setPracticeType] = useState<PracticeType>('STANDARD');

  // Standard Mode State
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [quizMode, setQuizMode] = useState<QuizMode>('STANDARD');

  // COCCIN Mode State
  const [coccinCourses, setCoccinCourses] = useState<string[]>([]);
  const [coccinType, setCoccinType] = useState<CoccinType>('objective');

  // Quiz State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}); // For Objective
  const [showTheoryAnswer, setShowTheoryAnswer] = useState(false); // For Theory

  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [randomTip, setRandomTip] = useState<{ title: string, content: string } | null>(null);

  const availableTopics = selectedCourse ? (COURSE_TOPICS[selectedCourse] || []) : [];

  const userCourses = user.courses && user.courses.length > 0
    ? user.courses
    : ["Company Law", "Constitutional Law", "Criminal Law"];

  // Timer effect
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

  // Reset topic when mode changes
  useEffect(() => {
    if (quizMode === 'SPEED' || quizMode === 'MARATHON') {
      setTopic('All Topics');
    } else if (quizMode === 'STANDARD' && topic === 'All Topics') {
      setTopic('');
    }
  }, [quizMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCoccinCourseToggle = (course: string) => {
    setCoccinCourses(prev => {
      if (prev.includes(course)) return prev.filter(c => c !== course);
      if (prev.length >= 2) return prev; // Max 2
      return [...prev, course];
    });
  };

  const handleStartQuiz = async () => {
    setPhase('LOADING');
    setError(null);

    try {
      let generatedQuestions = [];

      if (practiceType === 'STANDARD') {
        if (!selectedCourse || !topic) return;
        const modeConfig = QUIZ_MODES[quizMode];
        generatedQuestions = await generateQuizQuestions(
          selectedCourse,
          topic,
          modeConfig.count
        );
        setTimeLeft(modeConfig.timeMinutes * 60);
      } else {
        // COCCIN Mode
        if (coccinCourses.length !== 2) {
          setError("Please select exactly 2 courses.");
          setPhase('SELECTION');
          return;
        }
        generatedQuestions = await generateCoccinQuestions(coccinCourses, coccinType);
        // Set time based on type
        setTimeLeft(coccinType === 'objective' ? 15 * 60 : 30 * 60); // 15 mins for 10 obj, 30 mins for 4 theory
      }

      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setShowTheoryAnswer(false);
        setScore(0);
        setPhase('QUIZ');
      } else {
        setError("Failed to generate questions. Please try again.");
        setPhase('SELECTION');
      }
    } catch (err) {
      setError("Connection error. Please check your internet and try again.");
      setPhase('SELECTION');
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowTheoryAnswer(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowTheoryAnswer(false);
    }
  };

  const handleSubmitQuiz = () => {
    if (practiceType === 'STANDARD' || coccinType === 'objective') {
      let newScore = 0;
      questions.forEach((q, idx) => {
        // Handle varying data structures
        const correctIdx = q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswerIndex;
        if (userAnswers[idx] === correctIdx) {
          newScore += 1;
        }
      });
      setScore(newScore);
    }

    const tip = LEARNING_FACTS[Math.floor(Math.random() * LEARNING_FACTS.length)];
    setRandomTip(tip);
    setPhase('RESULT');
  };

  const resetQuiz = () => {
    setPhase('SELECTION');
    setSelectedCourse('');
    setTopic('');
    setQuestions([]);
    setUserAnswers({});
    setCoccinCourses([]);
    setPracticeType('STANDARD');
  };

  const handleCourseSelect = (course: string) => {
    setSelectedCourse(course);
    // Reset topic if we switch courses, unless we are in a mode that forces All Topics
    if (quizMode === 'STANDARD') {
      setTopic('');
    }
  };

  // ------------------------------------------------
  // VIEW: Selection
  // ------------------------------------------------
  if (phase === 'SELECTION') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <header className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Practice Area</h2>
          <p className="text-slate-600">Simulate real examinations to reinforce your legal understanding.</p>
        </header>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => setPracticeType('STANDARD')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${practiceType === 'STANDARD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Standard Practice
          </button>
          <button
            onClick={() => setPracticeType('COCCIN')}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${practiceType === 'COCCIN' ? 'bg-amber-100 text-amber-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            COCCIN Simulator
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-8">

          {practiceType === 'STANDARD' ? (
            <>
              {/* STANDARD MODE UI */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-900">1. Select Course</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {userCourses.map((course) => (
                    <button
                      key={course}
                      onClick={() => { setSelectedCourse(course); if (quizMode === 'STANDARD') setTopic(''); }}
                      className={`text-left px-4 py-3 rounded-lg border transition-all ${selectedCourse === course
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                          : 'border-slate-200 hover:border-slate-400 text-slate-700'
                        }`}
                    >
                      <div className="font-medium truncate">{course}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`space-y-3 transition-opacity duration-300 ${selectedCourse ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <label className="block text-sm font-medium text-slate-900">2. Select Exam Mode</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(Object.keys(QUIZ_MODES) as QuizMode[]).map((mode) => {
                    const config = QUIZ_MODES[mode];
                    const isSelected = quizMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => setQuizMode(mode)}
                        className={`relative p-4 rounded-xl border text-left transition-all ${isSelected
                            ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                      >
                        <div className={`mb-2 ${isSelected ? 'text-amber-600' : 'text-slate-500'}`}>
                          {config.icon}
                        </div>
                        <div className="font-bold text-slate-900">{config.label}</div>
                        <div className="text-xs text-slate-500 mt-1 font-medium">
                          {config.count} Qs • {config.timeMinutes} Mins
                        </div>
                        <p className="text-xs text-slate-400 mt-2 leading-tight">
                          {config.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {quizMode === 'STANDARD' && (
                <div className={`space-y-3 transition-opacity duration-300 ${selectedCourse ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label className="block text-sm font-medium text-slate-900">3. Select Topic</label>
                  <div className="relative">
                    <select
                      value={topic === 'All Topics' ? '' : topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-3 pr-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none appearance-none bg-white disabled:bg-slate-50"
                      disabled={!selectedCourse}
                    >
                      <option value="">-- Select a Topic --</option>
                      {availableTopics.map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                      <ListFilter size={20} />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* COCCIN MODE UI */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-900">1. Select 2 Courses</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {userCourses.map((course) => {
                    const isSelected = coccinCourses.includes(course);
                    return (
                      <button
                        key={course}
                        onClick={() => handleCoccinCourseToggle(course)}
                        className={`text-left px-4 py-3 rounded-lg border transition-all ${isSelected
                            ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                            : 'border-slate-200 hover:border-slate-400 text-slate-700'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium truncate">{course}</div>
                          {isSelected && <CheckCircle size={16} className="text-amber-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 text-right">{coccinCourses.length}/2 Selected</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-900">2. Question Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCoccinType('objective')}
                    className={`p-4 rounded-xl border text-left transition-all ${coccinType === 'objective'
                        ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600'
                        : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <CheckSquare className={`mb-2 ${coccinType === 'objective' ? 'text-amber-600' : 'text-slate-500'}`} />
                    <div className="font-bold text-slate-900">Objective</div>
                    <p className="text-xs text-slate-500 mt-1">10 Multiple Choice Questions</p>
                  </button>
                  <button
                    onClick={() => setCoccinType('theory')}
                    className={`p-4 rounded-xl border text-left transition-all ${coccinType === 'theory'
                        ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600'
                        : 'border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <FileText className={`mb-2 ${coccinType === 'theory' ? 'text-amber-600' : 'text-slate-500'}`} />
                    <div className="font-bold text-slate-900">Theory</div>
                    <p className="text-xs text-slate-500 mt-1">4 Theory Questions with Key Points</p>
                  </button>
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleStartQuiz}
            disabled={practiceType === 'STANDARD' ? (!selectedCourse || !topic) : (coccinCourses.length !== 2)}
            fullWidth
            variant="primary"
            className="py-4 text-lg"
          >
            <span className="flex items-center gap-2">
              Start {practiceType === 'STANDARD' ? QUIZ_MODES[quizMode].label : 'COCCIN Simulation'} <Play size={20} fill="currentColor" />
            </span>
          </Button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // VIEW: Loading
  // ------------------------------------------------
  if (phase === 'LOADING') {
    const modeConfig = QUIZ_MODES[quizMode];
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-amber-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-medium text-slate-900">Preparing Exam Paper</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {practiceType === 'STANDARD'
              ? `Curating questions on ${topic === 'All Topics' ? 'All Topics' : topic}...`
              : `Generating ${coccinType} questions for ${coccinCourses.join(' & ')}...`
            }
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // VIEW: Quiz
  // ------------------------------------------------
  if (phase === 'QUIZ') {
    const question = questions[currentQuestionIndex];
    const selectedOption = userAnswers[currentQuestionIndex];
    const modeConfig = QUIZ_MODES[quizMode];

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Header with Timer */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-10 gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Q {currentQuestionIndex + 1} / {questions.length}
            </span>
            <div className="hidden md:block text-sm text-slate-400">
              {practiceType === 'STANDARD' ? modeConfig.label : 'COCCIN Simulator'}
            </div>
          </div>

          {/* Progress Bar for larger screens */}
          <div className="hidden md:flex flex-1 mx-8 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
            <Timer size={24} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex-grow">
          <h3 className="text-xl md:text-2xl font-serif font-medium text-slate-900 mb-8 leading-relaxed">
            {question.text || question.question}
          </h3>

          {/* OBJECTIVE MODE */}
          {(practiceType === 'STANDARD' || coccinType === 'objective') && (
            <div className="space-y-3">
              {question.options.map((option: string, idx: number) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${isSelected
                        ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                      }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-slate-900 dot-center' : 'border-slate-400'
                      }`}>
                    </div>
                    <span className="text-base">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* THEORY MODE */}
          {practiceType === 'COCCIN' && coccinType === 'theory' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4">Marking Scheme / Key Points</h4>
                {showTheoryAnswer ? (
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    {question.keyPoints?.map((point: string, i: number) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <Button onClick={() => setShowTheoryAnswer(true)} variant="secondary">
                      Reveal Key Points
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
          <Button
            onClick={handlePrevQuestion}
            variant="ghost"
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              variant="primary"
              className="flex items-center gap-2"
            >
              Next <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitQuiz}
              variant="secondary"
              className="flex items-center gap-2"
            >
              Submit Exam <CheckCircle size={16} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // VIEW: Result
  // ------------------------------------------------
  if (phase === 'RESULT') {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "Keep practicing to improve your mastery.";
    if (percentage >= 80) message = "Excellent mastery of the concepts!";
    else if (percentage >= 60) message = "Good job! Review the missed areas.";

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Score Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-slate-900"></div>
          <div className="relative inline-block">
            <Award size={64} className={`mx-auto ${percentage >= 60 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>

          {/* Only show score for Objective/Standard */}
          {(practiceType === 'STANDARD' || coccinType === 'objective') ? (
            <div>
              <h2 className="text-5xl font-serif font-bold text-slate-900">{percentage}%</h2>
              <p className="text-lg text-slate-600 mt-1">You scored {score} out of {questions.length}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-serif font-bold text-slate-900">Session Complete</h2>
              <p className="text-lg text-slate-600 mt-1">Review the key points for self-assessment.</p>
            </div>
          )}

          <p className="text-slate-500 max-w-sm mx-auto">{message}</p>

          <div className="pt-4 flex justify-center">
            <Button onClick={resetQuiz} variant="primary">
              Take Another Exam
            </Button>
          </div>
        </div>

        {/* Detailed Review */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-bold text-slate-900">Review Answers</h3>
          </div>

          <div className="grid gap-6">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              // Handle both data structures (standard vs coccin)
              const correctIdx = q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswerIndex;
              const isCorrect = userAnswer === correctIdx;
              const isSkipped = userAnswer === undefined;

              if (practiceType === 'COCCIN' && coccinType === 'theory') {
                return (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="font-bold text-slate-400 text-sm mt-1">Q{idx + 1}</span>
                      <h4 className="font-medium text-slate-900 text-lg">{q.text}</h4>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h5 className="font-bold text-sm text-slate-900 mb-2">Key Points:</h5>
                      <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                        {q.keyPoints?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className={`bg-white p-6 rounded-xl border-l-4 shadow-sm ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="font-bold text-slate-400 text-sm mt-1">Q{idx + 1}</span>
                    <h4 className="font-medium text-slate-900 text-lg">{q.question || q.text}</h4>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className={`flex items-center gap-2 text-sm ${isCorrect ? 'text-green-700 font-medium' : 'text-red-600'}`}>
                      {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span>Your Answer: {isSkipped ? 'Skipped' : q.options[userAnswer]}</span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                        <CheckCircle size={16} />
                        <span>Correct Answer: {q.options[correctIdx]}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 leading-relaxed flex gap-3">
                    <BookOpen size={18} className="flex-shrink-0 text-slate-400 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-900">Explanation: </span>
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
