
import React, { useState, useEffect } from 'react';
import { COURSE_TOPICS, QuizQuestion, UserProfile, LEARNING_FACTS } from '../types';
import { generateQuizQuestions } from '../services/geminiService';
import { Button } from '../components/Button';
import { CheckCircle, XCircle, AlertCircle, Play, Award, BookOpen, ListFilter, Clock, ArrowLeft, ArrowRight, Timer, Zap, Layers } from 'lucide-react';

interface PracticeProps {
  user: UserProfile;
}

type Phase = 'SELECTION' | 'LOADING' | 'QUIZ' | 'RESULT';
type QuizMode = 'STANDARD' | 'SPEED' | 'MARATHON';

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
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [quizMode, setQuizMode] = useState<QuizMode>('STANDARD');
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Store user answers: { questionIndex: selectedOptionIndex }
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  // Timer state in seconds
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [randomTip, setRandomTip] = useState<{title: string, content: string} | null>(null);

  const availableTopics = selectedCourse ? (COURSE_TOPICS[selectedCourse] || []) : [];

  // Ensure backwards compatibility if user has no courses array (from old localstorage)
  const userCourses = user.courses && user.courses.length > 0 
    ? user.courses 
    : ["Company Law", "Constitutional Law", "Criminal Law"]; // Fallback

  // Timer effect
  useEffect(() => {
    let timer: number;
    if (phase === 'QUIZ' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
             // Time is up
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

  const handleStartQuiz = async () => {
    if (!selectedCourse || !topic) return;
    
    setPhase('LOADING');
    setError(null);
    
    const modeConfig = QUIZ_MODES[quizMode];
    
    try {
      const generatedQuestions = await generateQuizQuestions(
        selectedCourse, 
        topic, 
        user.level,
        modeConfig.count
      );
      
      if (generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setScore(0);
        setTimeLeft(modeConfig.timeMinutes * 60);
        setPhase('QUIZ');
      } else {
        setError("Failed to generate questions. Please try a different topic.");
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
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Calculate score
    let newScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        newScore += 1;
      }
    });
    setScore(newScore);
    
    // Select a random learning tip
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
    setQuizMode('STANDARD');
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          {/* Course Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-900">1. Select Course</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {userCourses.map((course) => (
                <button
                  key={course}
                  onClick={() => handleCourseSelect(course)}
                  className={`text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedCourse === course
                      ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                      : 'border-slate-200 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <div className="font-medium truncate">{course}</div>
                </button>
              ))}
            </div>
          </div>

           {/* Mode Selection */}
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
                    className={`relative p-4 rounded-xl border text-left transition-all ${
                      isSelected 
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

          {/* Topic Selection - Only for Standard Mode */}
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

          <Button 
            onClick={handleStartQuiz} 
            disabled={!selectedCourse || !topic} 
            fullWidth
            variant="primary"
            className="py-4 text-lg"
          >
            <span className="flex items-center gap-2">
              Start {QUIZ_MODES[quizMode].label} <Play size={20} fill="currentColor" />
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
            Curating {modeConfig.count} questions on <span className="font-semibold text-amber-700">{topic === 'All Topics' ? 'All Topics' : topic}</span>...
          </p>
          {modeConfig.count > 20 && (
            <p className="text-xs text-slate-400 animate-pulse">This may take a moment due to the large number of questions.</p>
          )}
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
                {modeConfig.label}
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
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                    isSelected 
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' 
                      : 'border-slate-200 hover:border-slate-400 bg-white'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-slate-900 dot-center' : 'border-slate-400'
                  }`}>
                  </div>
                  <span className="text-base">{option}</span>
                </button>
              );
            })}
          </div>
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
          <div>
            <h2 className="text-5xl font-serif font-bold text-slate-900">{percentage}%</h2>
            <p className="text-lg text-slate-600 mt-1">You scored {score} out of {questions.length}</p>
          </div>
          <p className="text-slate-500 max-w-sm mx-auto">{message}</p>
          
          <div className="pt-4 flex justify-center">
            <Button onClick={resetQuiz} variant="primary">
               Take Another Exam
            </Button>
          </div>
        </div>

        {/* Did You Know? Tip */}
        {randomTip && (
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-slate-800 opacity-20">
               <Zap size={150} />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs tracking-wider uppercase">
                  <BookOpen size={14} />
                  <span>Did You Know?</span>
               </div>
               <h4 className="text-xl font-serif font-bold mb-2">{randomTip.title}</h4>
               <p className="text-slate-300 text-sm leading-relaxed">{randomTip.content}</p>
            </div>
          </div>
        )}

        {/* Detailed Review */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-2xl font-serif font-bold text-slate-900">Review Answers</h3>
             <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Correct</div>
                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Incorrect</div>
             </div>
          </div>
          
          <div className="grid gap-6">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              const isCorrect = userAnswer === q.correctAnswerIndex;
              const isSkipped = userAnswer === undefined;

              return (
                <div key={idx} className={`bg-white p-6 rounded-xl border-l-4 shadow-sm ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="font-bold text-slate-400 text-sm mt-1">Q{idx + 1}</span>
                    <h4 className="font-medium text-slate-900 text-lg">{q.question}</h4>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className={`flex items-center gap-2 text-sm ${isCorrect ? 'text-green-700 font-medium' : 'text-red-600'}`}>
                      {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      <span>Your Answer: {isSkipped ? 'Skipped' : q.options[userAnswer]}</span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                        <CheckCircle size={16} />
                        <span>Correct Answer: {q.options[q.correctAnswerIndex]}</span>
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
