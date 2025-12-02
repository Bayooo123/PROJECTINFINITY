import React, { useState } from 'react';
import { COCCIN_COURSES, COCCIN_TOPICS } from '../types';
import { batchGenerateAndSaveQuestions } from '../services/geminiService';
import { Button } from '../components/Button';
import { Database, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const AdminQuestionGenerator: React.FC = () => {
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [questionType, setQuestionType] = useState<'objective' | 'theory'>('objective');
    const [count, setCount] = useState<number>(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const availableTopics = selectedCourse ? (COCCIN_TOPICS[selectedCourse] || []) : [];

    const handleGenerate = async () => {
        if (!selectedCourse || !selectedTopic) return;

        setIsGenerating(true);
        setStatus(null);

        try {
            const result = await batchGenerateAndSaveQuestions(selectedCourse, selectedTopic, questionType, count);

            if (result.success) {
                setStatus({
                    type: 'success',
                    message: `Successfully generated and saved ${result.count} questions to the Bank!`
                });
            } else {
                setStatus({
                    type: 'error',
                    message: result.message || "Failed to save questions."
                });
            }
        } catch (err) {
            setStatus({ type: 'error', message: "An unexpected error occurred." });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <Database className="text-amber-600" /> Question Bank Generator
                </h2>
                <p className="text-slate-600">
                    Populate the database with high-quality questions derived from your RAG materials.
                    These questions will be served instantly to students during practice.
                </p>
            </header>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">

                {/* Course Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-900">1. Select Course</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => { setSelectedCourse(e.target.value); setSelectedTopic(''); }}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                    >
                        <option value="">-- Select Course --</option>
                        {COCCIN_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Topic Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-900">2. Select Topic</label>
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        disabled={!selectedCourse}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none bg-white disabled:bg-slate-50"
                    >
                        <option value="">-- Select Topic --</option>
                        {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-900">3. Question Type</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setQuestionType('objective')}
                                className={`flex-1 py-3 rounded-lg border font-medium transition-all ${questionType === 'objective' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                                Objective
                            </button>
                            <button
                                onClick={() => setQuestionType('theory')}
                                className={`flex-1 py-3 rounded-lg border font-medium transition-all ${questionType === 'theory' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
                            >
                                Theory
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-900">4. Quantity</label>
                        <select
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                        >
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                            <option value={20}>20 Questions</option>
                            <option value={50}>50 Questions (Batch)</option>
                        </select>
                    </div>
                </div>

                {/* Status Messages */}
                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="font-medium">{status.message}</p>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    onClick={handleGenerate}
                    disabled={!selectedCourse || !selectedTopic || isGenerating}
                    fullWidth
                    variant="primary"
                    className="py-4 text-lg"
                >
                    {isGenerating ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" /> Generating & Saving...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Save size={20} /> Generate Questions
                        </span>
                    )}
                </Button>

            </div>
        </div>
    );
};
