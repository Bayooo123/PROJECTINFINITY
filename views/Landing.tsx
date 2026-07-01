import React from 'react';
import { ArrowRight, BookOpen, Scale, Zap } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLogin, onSignup }) => {
  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-slate-950 flex flex-col">

      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <span className="text-sm font-bold tracking-[0.15em] text-slate-900 dark:text-white uppercase">
          Learned
        </span>
        <button
          onClick={onLogin}
          className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Log in
        </button>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-2xl mx-auto w-full">
        <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-6">
          For Nigerian Law Students
        </p>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight mb-6">
          Close the gap between what you study and what examiners expect.
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-lg">
          Learned is a study platform built around the habits that produce results — retrieval practice, IRAC mastery, and contextual insight drawn from students and lecturers across Nigeria.
        </p>
        <button
          onClick={onSignup}
          className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm px-8 py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all"
        >
          Get started — it's free <ArrowRight size={16} />
        </button>
      </section>

      {/* Features */}
      <section className="px-6 pb-16 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
              <Zap size={18} className="text-slate-700 dark:text-slate-300" />
            </div>
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">MCQ Practice</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Test yourself topic by topic across all your courses. Every retrieval strengthens your recall — that's the science behind it.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
              <Scale size={18} className="text-slate-700 dark:text-slate-300" />
            </div>
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">IRAC Questions</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Practise identifying legal issues, stating the rule, and applying it to facts. AI-assessed. The same skill you'll use in practice.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4">
              <BookOpen size={18} className="text-slate-700 dark:text-slate-300" />
            </div>
            <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Weekly Focus</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every week, the most important things to know across your courses are surfaced. No guessing where to direct your attention.
            </p>
          </div>

        </div>
      </section>

      {/* Vision strip */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-2xl mx-auto px-6 py-14 text-center">
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            Nobody learns alone. Learned is built as a collective intelligence system — a living knowledge base drawn from students and lecturers, past and present — so that every student on this platform benefits from the insight of everyone who came before them.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-3">
          Ready to study with purpose?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Join law students across Nigeria already using Learned.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onSignup}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm px-8 py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all"
          >
            Create an account <ArrowRight size={16} />
          </button>
          <button
            onClick={onLogin}
            className="inline-flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300 px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Log in
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 px-6 py-6 text-center">
        <p className="text-xs text-slate-400">© 2026 Learned · learned.reforma.ng</p>
      </footer>

    </div>
  );
};
