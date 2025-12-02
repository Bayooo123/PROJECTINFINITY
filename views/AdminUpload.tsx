import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateEmbedding } from '../services/geminiService';
import { Upload, FileText, BookOpen, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const AdminUpload: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'materials' | 'questions'>('materials');
    const [course, setCourse] = useState('Constitutional Law');
    const [topic, setTopic] = useState('');
    const [year, setYear] = useState('');
    const [content, setContent] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const courses = [
        "Constitutional Law",
        "Criminal Law",
        "Contract Law",
        "Commercial Law",
        "Legal Method",
        "Equity and Trusts",
        "Land Law",
        "Company Law",
        "Law of Torts",
        "Evidence"
    ];

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsUploading(true);
        setStatus(null);

        try {
            // 1. Generate Embedding
            const embedding = await generateEmbedding(content);

            if (!embedding) {
                throw new Error("Failed to generate embedding. AI service might be down.");
            }

            // 2. Insert into Supabase
            if (activeTab === 'materials') {
                const { error } = await supabase.from('course_materials').insert({
                    course,
                    topic,
                    content,
                    embedding
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.from('past_questions').insert({
                    course,
                    year,
                    question_text: content,
                    embedding
                });
                if (error) throw error;
            }

            setStatus({ type: 'success', message: 'Uploaded successfully!' });
            setContent(''); // Clear content on success
        } catch (error: any) {
            console.error("Upload error:", error);
            setStatus({ type: 'error', message: error.message || 'Upload failed.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <header>
                <h2 className="text-3xl font-serif font-bold text-slate-900">Knowledge Base Admin</h2>
                <p className="text-slate-600">Upload course materials and past questions to train the AI.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('materials')}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'materials'
                            ? 'text-amber-600 border-b-2 border-amber-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Course Materials
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'questions'
                            ? 'text-amber-600 border-b-2 border-amber-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Past Questions
                </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Course Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Course</label>
                        <select
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        >
                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Dynamic Field: Topic or Year */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {activeTab === 'materials' ? 'Topic / Chapter' : 'Exam Year'}
                        </label>
                        <input
                            type="text"
                            value={activeTab === 'materials' ? topic : year}
                            onChange={(e) => activeTab === 'materials' ? setTopic(e.target.value) : setYear(e.target.value)}
                            placeholder={activeTab === 'materials' ? "e.g., Separation of Powers" : "e.g., 2023"}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        {activeTab === 'materials' ? 'Text Content' : 'Question Text'}
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={activeTab === 'materials'
                            ? "Paste the text from your textbook, handout, or notes here..."
                            : "Paste the full exam question here..."}
                        className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-mono text-sm"
                        required
                    />
                    <p className="text-xs text-slate-500 text-right">
                        {content.length} characters
                    </p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm font-medium">{status.message}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isUploading || !content.trim()}
                    className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all"
                >
                    {isUploading ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            Processing & Vectorizing...
                        </>
                    ) : (
                        <>
                            <Upload size={20} />
                            Upload to Database
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
