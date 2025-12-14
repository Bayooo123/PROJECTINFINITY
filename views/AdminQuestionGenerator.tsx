import React, { useState } from 'react';
import { COCCIN_COURSES, COCCIN_TOPICS } from '../types';
import { batchGenerateAndSaveQuestions, importQuestionsToBank } from '../services/geminiService';
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

    const [importJson, setImportJson] = useState('');
    const [activeTab, setActiveTab] = useState<'generate' | 'import'>('generate');

    const handleImport = async () => {
        if (!selectedCourse || !selectedTopic || !importJson) return;
        setIsGenerating(true);
        setStatus(null);

        try {
            // 1. Parse JSON
            let parsedQuestions;
            try {
                parsedQuestions = JSON.parse(importJson);
                if (!Array.isArray(parsedQuestions)) throw new Error("Input must be a JSON array [...]");
            } catch (e) {
                setStatus({ type: 'error', message: "Invalid JSON format. Please check your syntax." });
                setIsGenerating(false);
                return;
            }

            // 2. Transform/Validate
            const rowsToInsert = parsedQuestions.map((q: any) => ({
                course: selectedCourse,
                topic: selectedTopic,
                type: questionType,
                question_data: q,
                is_verified: true, // Imported questions are assumed verified by the user
                created_at: new Date()
            }));

            // 3. Insert
            // We need to import supabase locally or pass it in. Assuming geminiService can handle batch or we use direct supabase here.
            // For cleaner architecture, let's use the same service function but we need to export the saver or just do it here.
            // Let's use a new helper in geminiService or just do it inline since supabase is available in global scope if imported? 
            // Actually, best to keep DB logic in service. 
            // Let's call a new service function: importQuestionsToBank

            // Re-using the batch saver logic but bypassing generation
            // We can add `importQuestionsToBank` to geminiService.ts next.
            // For now, let's assume we will add it.

            // @ts-ignore
            import { importQuestionsToBank } from '../services/geminiService';
            const result = await importQuestionsToBank(rowsToInsert);

            if (result.success) {
                setStatus({ type: 'success', message: `Successfully imported ${result.count} questions!` });
                setImportJson(''); // Clear on success
            } else {
                setStatus({ type: 'error', message: result.message || "Failed to save." });
            }

        } catch (err) {
            console.error(err);
            setStatus({ type: 'error', message: "Import failed. Check console." });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <header className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <Database className="text-amber-600" /> Question Bank Manager
                </h2>
                <div className="flex gap-4 mt-4 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'generate' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500'}`}
                    >
                        AI Generator
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'import' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500'}`}
                    >
                        Manual Import (JSON)
                    </button>
                </div>
            </header>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">

                {/* Common Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-900">Target Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => { setSelectedCourse(e.target.value); setSelectedTopic(''); }}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                        >
                            <option value="">-- Select Course --</option>
                            {COCCIN_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-900">Target Topic</label>
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
                </div>

                {activeTab === 'generate' ? (
                    // GENERATOR UI
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-900">Question Type</label>
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
                                <label className="block text-sm font-medium text-slate-900">Quantity</label>
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
                    </>
                ) : (
                    // IMPORT UI
                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                            <h4 className="font-bold text-amber-900 mb-2">How to use NotebookLLM</h4>
                            <p className="text-sm text-amber-800 mb-2">
                                Upload your PDF/Doc to NotebookLLM and prompt it:
                            </p>
                            <code className="block bg-white/50 p-2 rounded text-amber-900 text-xs font-mono">
                                "Generate 20 multiple choice questions on [Topic]. Output ONLY a valid JSON array where each object has: text, options (array of 4 strings), correctAnswer (0-3), and explanation."
                            </code>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-900">Paste JSON Array</label>
                            <textarea
                                value={importJson}
                                onChange={(e) => setImportJson(e.target.value)}
                                placeholder={`[\n  {\n    "text": "What is...?",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswer": 0,\n    "explanation": "..."\n  }\n]`}
                                className="w-full h-64 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none font-mono text-sm"
                            />
                        </div>

                        <Button
                            onClick={handleImport}
                            disabled={!selectedCourse || !selectedTopic || !importJson || isGenerating}
                            fullWidth
                            variant="primary"
                            className="py-4 text-lg"
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin" /> Importing...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Save size={20} /> Import Questions
                                </span>
                            )}
                        </Button>
                    </div>
                )}

                {/* Status Messages */}
                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="font-medium">{status.message}</p>
                    </div>
                )}

            </div>
        </div>
    );
};
