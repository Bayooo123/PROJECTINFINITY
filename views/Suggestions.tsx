import React, { useState, useEffect } from 'react';
import { supabase, Suggestion } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send, Loader, MessageSquare, CheckCircle2, Clock, Eye, Sparkles } from 'lucide-react';

interface SuggestionsProps {
  onBack: () => void;
}

const CATEGORIES = [
  'Content & Explanations',
  'Question Quality',
  'Study Tools',
  'Performance Tracking',
  'User Experience',
  'New Features',
  'Other',
];

const MAX_CHARS = 600;

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    className: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    icon: Eye,
  },
  acknowledged: {
    label: 'Acknowledged',
    className: 'border border-slate-900 dark:border-white text-slate-900 dark:text-white',
    icon: CheckCircle2,
  },
  implemented: {
    label: 'Implemented',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    icon: Sparkles,
  },
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const Suggestions: React.FC<SuggestionsProps> = ({ onBack }) => {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<'new' | 'submitted'>('new');

  // New suggestion form
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Submitted suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchSuggestions = async () => {
    if (!user) return;
    setLoadingSuggestions(true);
    const { data } = await supabase
      .from('suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setSuggestions((data as Suggestion[]) ?? []);
    setLoadingSuggestions(false);
  };

  useEffect(() => {
    if (tab === 'submitted') fetchSuggestions();
  }, [tab]);

  const handleSubmit = async () => {
    if (!content.trim() || !user || !profile) return;
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from('suggestions').insert({
      user_id: user.id,
      university: profile.university,
      display_name: isAnonymous ? null : profile.name,
      category,
      content: content.trim(),
      is_anonymous: isAnonymous,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError('Failed to submit. Please try again.');
    } else {
      setSubmitted(true);
      setContent('');
    }
  };

  const handleNewSuggestion = () => {
    setSubmitted(false);
    setCategory(CATEGORIES[0]);
    setContent('');
    setIsAnonymous(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Suggestion Box
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Help us improve your learning experience
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTab('new')}
          className={`pb-3 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'new'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          New Suggestion
        </button>
        <button
          onClick={() => setTab('submitted')}
          className={`pb-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'submitted'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          My Suggestions
        </button>
      </div>

      {/* ── New Suggestion ── */}
      {tab === 'new' && (
        <>
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-1">
                  Suggestion submitted.
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Thanks — your feedback helps us make Learned better for every student.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleNewSuggestion}
                  className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  Write another
                </button>
                <button
                  onClick={() => { setSubmitted(false); setTab('submitted'); }}
                  className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl text-sm font-semibold hover:bg-black dark:hover:bg-slate-100 transition-colors"
                >
                  View my submissions
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Category */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-all ${
                        category === cat
                          ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your suggestion</p>
                  <span className={`text-xs tabular-nums ${content.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {content.length}/{MAX_CHARS}
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                  rows={6}
                  placeholder="What would make your learning experience better? Describe the idea clearly — we read every submission."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 outline-none text-sm leading-relaxed resize-none transition-all"
                />
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Submit anonymously</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Your name won't be shown to administrators
                  </p>
                </div>
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    isAnonymous ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow transition-transform ${
                      isAnonymous ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {submitError && (
                <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                  {submitError}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!content.trim() || submitting}
                className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <><Loader size={18} className="animate-spin" /> Submitting…</>
                ) : (
                  <><Send size={18} /> Submit Suggestion</>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── My Suggestions ── */}
      {tab === 'submitted' && (
        <div className="space-y-4">
          {loadingSuggestions ? (
            <div className="py-12 text-center">
              <Loader size={28} className="animate-spin text-slate-400 mx-auto" />
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <MessageSquare size={36} className="text-slate-300 dark:text-slate-600 mx-auto" />
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">No suggestions yet</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  Your submissions will appear here after you send them.
                </p>
              </div>
              <button
                onClick={() => setTab('new')}
                className="mt-4 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-black dark:hover:bg-slate-100 transition-colors"
              >
                Write your first suggestion
              </button>
            </div>
          ) : (
            suggestions.map((s) => {
              const status = STATUS_CONFIG[s.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={s.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {s.category}
                        </span>
                        {s.is_anonymous && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">· Anonymous</span>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${status.className}`}>
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {s.content}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                      {formatDate(s.created_at)}
                    </p>
                  </div>

                  {s.admin_response && (
                    <div className="mx-5 mb-5 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-l-2 border-slate-900 dark:border-white">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                        Response from the Learned team
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {s.admin_response}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
