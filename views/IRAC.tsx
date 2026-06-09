import React, { useState } from 'react';
import { IRACInterface, ScenarioSubmission } from '../components/IRACInterface';
import { UserProfile } from '../lib/supabase';
import { Scale, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';

interface IRACProps {
  user: UserProfile;
}

export const IRAC: React.FC<IRACProps> = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (data: ScenarioSubmission) => {
    console.log('IRAC submission:', data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-2">
            Analysis submitted.
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Your structured reasoning has been recorded.
          </p>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="primary" className="flex items-center gap-2 mx-auto">
          <RotateCcw size={16} /> Practice Another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6">
      <header className="px-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Scale size={26} className="text-amber-600" />
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
            IRAC Practice
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm ml-[38px]">
          Structure your legal reasoning through Issue, Rule, Application, and Conclusion.
        </p>
      </header>

      <IRACInterface
        scenarioId="SC-PRACTICE"
        onSubmit={handleSubmit}
      />
    </div>
  );
};
