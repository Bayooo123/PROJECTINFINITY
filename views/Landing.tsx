import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Play,
  Check,
  Flame,
  Signal,
  Wifi,
  Battery,
  User,
  BookOpen,
  CheckCircle2,
  Scale,
  Landmark,
  Gavel,
  ChevronRight,
  Users
} from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLogin, onSignup }) => {
  // Intersection Observer for scroll animation reveals
  useEffect(() => {
    document.documentElement.classList.add('js');
    const reveals = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => io.observe(el));

    // Failsafe: if the observer hasn't revealed an element shortly after load, show it anyway.
    const timer = setTimeout(() => {
      reveals.forEach((el) => el.classList.add('in'));
    }, 1200);

    return () => {
      clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  // Interactivity for the MCQ practice mockup card
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#f7f5f0] dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
      
      {/* ═══════════ NAV ═══════════ */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#f7f5f0]/80 dark:bg-slate-950/80 border-b border-slate-900/5 dark:border-white/5 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo_icon.png" alt="Learned" className="w-8 h-8 rounded-full" />
            <span className="font-serif text-xl font-black tracking-tight text-slate-900 dark:text-white">Learned</span>
          </div>
          <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#practice" className="hover:text-slate-900 dark:hover:text-white transition-colors">Practice</a>
            <a href="#irac" className="hover:text-slate-900 dark:hover:text-white transition-colors">Problem Questions</a>
            <a href="#focus" className="hover:text-slate-900 dark:hover:text-white transition-colors">Weekly Focus</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onLogin}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={onSignup}
              className="text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero-wash relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
          
          {/* Left Hero */}
          <div className="reveal">
            <div className="inline-flex items-center gap-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span className="text-[11px] font-bold tracking-[0.22em] text-slate-500 dark:text-slate-400 uppercase">
                Built for Nigerian law students · 200–500L
              </span>
            </div>

            <h1 className="font-serif font-black text-slate-900 dark:text-white leading-[1.04] tracking-tight text-[42px] sm:text-[54px] lg:text-[58px]">
              Close the gap between<br className="hidden sm:block" /> what you <span className="marker">study</span> and<br className="hidden sm:block" /> what examiners <span className="marker">expect.</span>
            </h1>

            <p className="mt-7 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Learned turns every course into focused retrieval practice — MCQ drills, Problem Questions, and the week's most examinable topics, surfaced so you always know where to aim.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={onSignup}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-[15px] px-7 py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all"
              >
                Get started — it's free
                <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
              </button>
              <a
                href="#practice"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold text-[15px] text-slate-700 dark:text-slate-300 px-5 py-4 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors text-center"
              >
                <Play className="w-4 h-4 text-amber-600" />
                See how it works
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6 text-[13px] text-slate-400 dark:text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-amber-600" />
                No card required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-amber-600" />
                Every core course
              </span>
            </div>
          </div>

          {/* Right Hero: phone illustration */}
          <div className="reveal relative flex justify-center lg:justify-end" style={{ transitionDelay: '0.12s' }}>
            
            {/* Floating accent card */}
            <div className="hidden lg:block absolute -left-6 top-24 z-20 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 w-[188px] rotate-[-5deg] hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-[13px] font-bold text-amber-600">12-day streak</span>
              </div>
              <div className="flex gap-1">
                <div className="h-1.5 flex-1 rounded-full bg-amber-500"></div>
                <div className="h-1.5 flex-1 rounded-full bg-amber-500"></div>
                <div className="h-1.5 flex-1 rounded-full bg-amber-500"></div>
                <div className="h-1.5 flex-1 rounded-full bg-amber-500"></div>
                <div className="h-1.5 flex-1 rounded-full bg-amber-200"></div>
                <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800"></div>
              </div>
            </div>

            {/* Mobile device shell */}
            <div className="device rotate-[3deg] hover:rotate-0 transition-transform duration-300">
              <div className="device-screen bg-slate-50">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1 text-slate-900">
                  <span className="text-[13px] font-semibold">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5" />
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4" />
                  </div>
                </div>
                {/* Header */}
                <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-slate-100 bg-white">
                  <div className="flex items-center gap-2">
                    <img src="/logo_icon.png" className="w-6 h-6 rounded-full" alt="" />
                    <span className="font-serif text-sm font-bold text-slate-900">Learned</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                </div>
                {/* Body */}
                <div className="px-5 py-4 space-y-4 text-left">
                  <div>
                    <p className="text-[11px] font-medium text-slate-400">Good morning</p>
                    <h2 className="font-serif text-xl font-black text-slate-900 leading-tight">Chisom.</h2>
                  </div>
                  {/* Today's Breakdown */}
                  <div className="bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-xl p-4 shadow-sm">
                    <p className="text-[9px] font-bold tracking-widest text-amber-600 uppercase mb-1.5">Land Law · Day 12</p>
                    <p className="font-serif text-[15px] font-bold italic text-slate-900 mb-1.5 leading-snug">Nemo Dat Quod Non Habet</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-3">You cannot transfer a better title than you yourself possess.</p>
                    <button
                      onClick={onSignup}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-semibold py-2 rounded-lg text-center transition-colors"
                    >
                      Start today's breakdown
                    </button>
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                      <p className="font-serif text-lg font-bold text-slate-900 leading-none tab-num">142</p>
                      <p className="text-[8.5px] text-slate-400 mt-1 leading-tight">Questions</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                      <p className="font-serif text-lg font-bold text-amber-600 leading-none tab-num">78%</p>
                      <p className="text-[8.5px] text-slate-400 mt-1 leading-tight">Accuracy</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                      <p className="font-serif text-lg font-bold text-slate-900 leading-none tab-num">5</p>
                      <p className="text-[8.5px] text-slate-400 mt-1 leading-tight">Active days</p>
                    </div>
                  </div>
                  {/* Resume Card */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-slate-900 leading-tight">Criminal Law</p>
                        <p className="text-[10px] text-slate-400">Homicide · 8/10</p>
                      </div>
                    </div>
                    <button onClick={onSignup} className="text-[11px] font-semibold text-amber-600 hover:text-amber-750 transition-colors">
                      Resume
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════ TRUST STRIP ═══════════ */}
      <section className="border-y border-slate-900/5 dark:border-white/5 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
          <div>
            <p className="font-serif text-3xl font-black text-slate-900 dark:text-white tab-num">200–500L</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-450 mt-1">Every level, every core course</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-black text-slate-900 dark:text-white">4 modes</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-450 mt-1">Standard · Speed · Marathon · Problem Questions</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-black text-slate-900 dark:text-white">Daily</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-450 mt-1">A new concept breakdown every day</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-black text-amber-600 dark:text-amber-500">Grounded</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-450 mt-1">Answers rooted in Nigerian law</p>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURE 1 · MCQ ═══════════ */}
      <section id="practice" className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        
        {/* Interactive MCQ Mockup Card */}
        <div className="reveal order-2 lg:order-1 flex justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 w-full max-w-md text-left transition-all">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-bold tracking-widest text-amber-600 dark:text-amber-500 uppercase">
                Criminal Law · Q7 of 10
              </span>
              <div className="flex items-center gap-2">
                {showExplanation && (
                  <button onClick={resetMcq} className="text-[10px] text-amber-600 hover:underline">
                    Reset Demo
                  </button>
                )}
                <span className="text-[11px] font-semibold text-slate-400 tab-num">02:14</span>
              </div>
            </div>
            <p className="text-[15px] font-semibold text-slate-900 dark:text-white leading-relaxed mb-5">
              Which mental element must the prosecution prove for a conviction of murder under the Criminal Code?
            </p>
            
            <div className="space-y-2.5">
              
              {/* Option A */}
              <div
                onClick={() => !showExplanation && setSelectedOption('negligence')}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                  selectedOption === 'negligence'
                    ? showExplanation
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  selectedOption === 'negligence'
                    ? showExplanation
                      ? 'border-red-500 bg-red-500'
                      : 'border-amber-500 bg-amber-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {selectedOption === 'negligence' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span className={`text-[14px] ${selectedOption === 'negligence' ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-650 dark:text-slate-300'}`}>
                  Negligence
                </span>
              </div>

              {/* Option B */}
              <div
                onClick={() => !showExplanation && setSelectedOption('malice')}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                  selectedOption === 'malice'
                    ? showExplanation
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                    : showExplanation
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  selectedOption === 'malice' || (showExplanation && selectedOption !== 'malice')
                    ? showExplanation
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-amber-500 bg-amber-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {(selectedOption === 'malice' || (showExplanation && selectedOption !== 'malice')) && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span className={`text-[14px] ${selectedOption === 'malice' ? 'font-semibold text-slate-900 dark:text-white' : showExplanation ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'text-slate-655 dark:text-slate-300'}`}>
                  Malice aforethought {showExplanation && '(Correct)'}
                </span>
              </div>

              {/* Option C */}
              <div
                onClick={() => !showExplanation && setSelectedOption('strict')}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                  selectedOption === 'strict'
                    ? showExplanation
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  selectedOption === 'strict'
                    ? showExplanation
                      ? 'border-red-500 bg-red-500'
                      : 'border-amber-500 bg-amber-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {selectedOption === 'strict' && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <span className={`text-[14px] ${selectedOption === 'strict' ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-655 dark:text-slate-300'}`}>
                  Strict liability
                </span>
              </div>

            </div>

            {/* Explanation box */}
            {showExplanation && (
              <div className="mt-4 p-4 rounded-xl border animate-fade-slide-in text-xs leading-relaxed bg-[#fbfbf9] dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                {selectedOption === 'malice' ? (
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1">Excellent Reasoning!</strong>
                    Under Section 316 of the Criminal Code, the prosecution must prove the existence of malice aforethought (intent to kill or cause grievous bodily harm) to secure a murder conviction.
                  </p>
                ) : (
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-red-500 block mb-1">Incorrect Option.</strong>
                    Negligence or strict liability are insufficient. Malice aforethought is the core mental element (mens rea) required for murder under Nigerian Criminal Law.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => {
                if (selectedOption) {
                  setShowExplanation(true);
                }
              }}
              disabled={!selectedOption || showExplanation}
              className={`mt-5 w-full text-[13px] font-semibold py-3 rounded-xl text-center transition-all ${
                showExplanation
                  ? 'bg-emerald-500 text-white cursor-default'
                  : selectedOption
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-95'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-450 dark:text-slate-550 cursor-not-allowed'
              }`}
            >
              {showExplanation ? 'Explanation unlocked' : 'Submit answer'}
            </button>
          </div>
        </div>

        {/* MCQ content info */}
        <div className="reveal order-1 lg:order-2 text-left">
          <p className="text-[11px] font-bold tracking-[0.2em] text-amber-600 dark:text-amber-500 uppercase mb-4">
            MCQ Practice
          </p>
          <h2 className="font-serif text-3xl lg:text-[40px] font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-5">
            Every question you answer makes the next exam easier.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-[17px] leading-relaxed mb-7 max-w-md">
            Drill topic by topic across all your courses. Choose a quick 10, a 50-question Speed drill, or a full 100-question Marathon. Retrieval is what moves knowledge into long-term memory — Learned just makes it a habit.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              Instant scoring with worked explanations
            </li>
            <li className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              Weak-topic review after every session
            </li>
            <li className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              Streaks that keep you coming back daily
            </li>
          </ul>
        </div>
      </section>

      {/* ═══════════ FEATURE 2 · IRAC (dark) ═══════════ */}
      <section id="irac" className="bg-slate-950 text-white transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          
          <div className="reveal text-left">
            <p className="text-[11px] font-bold tracking-[0.2em] text-amber-500 uppercase mb-4">
              Problem Questions
            </p>
            <h2 className="font-serif text-3xl lg:text-[40px] font-black leading-tight tracking-tight mb-5">
              Practise the skill exams actually test — not just recall.
            </h2>
            <p className="text-slate-300 text-[17px] leading-relaxed mb-7 max-w-md">
              Spot the issue, state the rule, apply it to the facts, and reach a conclusion. Learned assesses your structure and reasoning against Nigerian law — the same discipline you'll use in practice.
            </p>
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3 text-[15px] text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-amber-550 flex-shrink-0 mt-0.5" />
                Structured feedback on each Problem Question limb
              </li>
              <li className="flex items-start gap-3 text-[15px] text-slate-200">
                <CheckCircle2 className="w-5 h-5 text-amber-550 flex-shrink-0 mt-0.5" />
                Model answers grounded in real authority
              </li>
            </ul>
          </div>

          <div className="reveal flex justify-center" style={{ transitionDelay: '0.1s' }}>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6 w-full max-w-md text-left">
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5 italic">
                "Adaeze sells Bola a car she is still paying for under hire-purchase. Advise Bola on title."
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-450 text-[11px] font-bold flex items-center justify-center flex-shrink-0">I</span>
                  <p className="text-[13px] text-slate-200 leading-relaxed">Whether valid title passes where the seller has not completed payment.</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-450 text-[11px] font-bold flex items-center justify-center flex-shrink-0">R</span>
                  <p className="text-[13px] text-slate-200 leading-relaxed"><span className="italic">Nemo dat quod non habet</span> — no one gives what they do not have.</p>
                </div>
                <div className="flex gap-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-450 text-[11px] font-bold flex items-center justify-center flex-shrink-0">A</span>
                  <p className="text-[13px] text-slate-200 leading-relaxed">Adaeze holds no full title under hire-purchase, so she cannot pass it...</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[12px] font-medium text-slate-400">Reasoning score</span>
                <span className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-black text-amber-455 tab-num">8.5</span>
                  <span className="text-[12px] text-slate-500">/ 10</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════ FEATURE 3 · WEEKLY FOCUS ═══════════ */}
      <section id="focus" className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        
        <div className="reveal order-2 lg:order-1 flex justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 w-full max-w-md text-left">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-bold tracking-widest text-amber-600 dark:text-amber-500 uppercase">
                This week's focus
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Week 8</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  <Scale className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-slate-900 dark:text-white leading-tight">Consideration &amp; Privity</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Contract Law · high yield</p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 flex items-center justify-center flex-shrink-0">
                  <Landmark className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-slate-900 dark:text-white leading-tight">Fundamental Rights</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Constitutional Law</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 flex items-center justify-center flex-shrink-0">
                  <Gavel className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-slate-900 dark:text-white leading-tight">Actus Reus &amp; Mens Rea</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Criminal Law</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="reveal order-1 lg:order-2 text-left">
          <p className="text-[11px] font-bold tracking-[0.2em] text-amber-600 dark:text-amber-500 uppercase mb-4">
            Weekly Focus
          </p>
          <h2 className="font-serif text-3xl lg:text-[40px] font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-5">
            Never wonder where to aim your attention.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-[17px] leading-relaxed max-w-md">
            Every week, Learned surfaces the most examinable topics across your courses — drawn from what students and lecturers across Nigeria know actually comes up. You study what matters, not everything at once.
          </p>
        </div>
      </section>

      {/* ═══════════ VISION ═══════════ */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-900/5 dark:border-white/5 transition-colors">
        <div className="max-w-3xl mx-auto px-6 py-20 lg:py-24 text-center reveal">
          <Users className="w-8 h-8 text-amber-500 mx-auto mb-6" />
          <p className="font-serif text-2xl lg:text-[30px] font-black text-slate-900 dark:text-white leading-[1.35] tracking-tight">
            Nobody learns alone. Learned is a living knowledge base drawn from students and lecturers, past and present — so every student benefits from the insight of everyone who came before them.
          </p>
        </div>
      </section>

      {/* ═══════════ CLOSING CTA ═══════════ */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 hero-wash opacity-60"></div>
        <div className="relative max-w-3xl mx-auto px-6 py-24 text-center reveal">
          <h2 className="font-serif text-4xl lg:text-[52px] font-black text-white leading-tight tracking-tight mb-5">
            Ready to study with purpose?
          </h2>
          <p className="text-slate-400 text-lg mb-10">Join law students across Nigeria studying smarter with Learned.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto sm:max-w-none">
            <button
              onClick={onSignup}
              className="group inline-flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold text-[15px] px-8 py-4 rounded-xl hover:bg-amber-600 active:scale-95 transition-all"
            >
              Create your free account
              <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="inline-flex items-center justify-center text-[15px] font-semibold text-slate-300 px-8 py-4 rounded-xl border border-slate-700 hover:bg-white/5 transition-colors"
            >
              Log in
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-slate-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo_icon.png" alt="Learned" className="w-7 h-7 rounded-full opacity-90" />
            <span className="font-serif text-lg font-black text-white">Learned</span>
          </div>
          <p className="text-[13px] text-slate-550">© 2026 Learned · learned.reforma.ng</p>
        </div>
      </footer>

    </div>
  );
};
