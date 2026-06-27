import React, { useState, useEffect } from 'react';
import { supabase, Suggestion } from '../lib/supabase';
import { ArrowLeft, Loader, MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';

interface AdminSuggestionsProps {
  onBack: () => void;
}

type SuggestionStatus = Suggestion['status'];

const STATUS_OPTIONS: { value: SuggestionStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'implemented', label: 'Implemented' },
];

const STATUS_CHIP: Record<SuggestionStatus, string> = {
  pending: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
  under_review: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  acknowledged: 'border border-slate-900 dark:border-white text-slate-900 dark:text-white',
  implemented: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export const AdminSuggestions: React.FC<AdminSuggestionsProps> = ({ onBack }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<SuggestionStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const fetchSuggestions = async () => {
    setLoading(true);
    const query = supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });
    const { data } = await query;
    setSuggestions((data as Suggestion[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const filtered =
    filterStatus === 'all'
      ? suggestions
      : suggestions.filter((s) => s.status === filterStatus);

  const handleUpdate = async (s: Suggestion) => {
    const response = responseText[s.id] ?? s.admin_response ?? '';
    setUpdating((p) => ({ ...p, [s.id]: true }));
    await supabase
      .from('suggestions')
      .update({
        status: s.status,
        admin_response: response || null,
      })
      .eq('id', s.id);
    setUpdating((p) => ({ ...p, [s.id]: false }));
    await fetchSuggestions();
    setExpandedId(null);
  };

  const setLocalStatus = (id: string, status: SuggestionStatus) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const counts = {
    all: suggestions.length,
    pending: suggestions.filter((s) => s.status === 'pending').length,
    under_review: suggestions.filter((s) => s.status === 'under_review').length,
    acknowledged: suggestions.filter((s) => s.status === 'acknowledged').length,
    implemented: suggestions.filter((s) => s.status === 'implemented').length,
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
          <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">
            Suggestion Box
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Admin view · {counts.all} total</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-all ${
            filterStatus === 'all'
              ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-400'
          }`}
        >
          All <span className="opacity-60">({counts.all})</span>
        </button>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterStatus(opt.value)}
            className={`px-3 py-1.5 rounded-full text-sm border font-medium transition-all ${
              filterStatus === opt.value
                ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-400'
            }`}
          >
            {opt.label} <span className="opacity-60">({counts[opt.value]})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader size={28} className="animate-spin text-slate-400 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <MessageSquare size={36} className="text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No suggestions in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const isOpen = expandedId === s.id;
            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : s.id)}
                  className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                        {s.category}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CHIP[s.status]}`}>
                        {STATUS_OPTIONS.find((o) => o.value === s.status)?.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {s.content}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                      {s.is_anonymous ? 'Anonymous' : s.display_name} · {formatDate(s.created_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-slate-400 dark:text-slate-500 mt-1">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Expanded panel */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                        Full suggestion
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {s.content}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                        Status
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setLocalStatus(s.id, opt.value)}
                            className={`px-3 py-1.5 rounded-full text-xs border font-semibold transition-all ${
                              s.status === opt.value
                                ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:border-slate-400'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                        Response to student (optional)
                      </p>
                      <textarea
                        rows={3}
                        value={responseText[s.id] ?? s.admin_response ?? ''}
                        onChange={(e) =>
                          setResponseText((prev) => ({ ...prev, [s.id]: e.target.value }))
                        }
                        placeholder="Write a response visible to the student…"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none text-sm resize-none transition-all"
                      />
                    </div>

                    <button
                      onClick={() => handleUpdate(s)}
                      disabled={updating[s.id]}
                      className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {updating[s.id] ? (
                        <><Loader size={16} className="animate-spin" /> Saving…</>
                      ) : (
                        <><Send size={16} /> Save Changes</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
