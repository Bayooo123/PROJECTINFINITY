import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateEmbedding } from '../services/geminiService';
import { Upload, FileText, BookOpen, CheckCircle, AlertCircle, Loader, FileUp } from 'lucide-react';
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import { UserProfile, COURSE_STRUCTURE, LAW_COURSES } from '../types';

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = pdfWorker;

export const AdminUpload: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'materials' | 'questions'>('materials');
    const [selectedCourses, setSelectedCourses] = useState<string[]>(['Constitutional Law']);
    const [topic, setTopic] = useState('');
    const [year, setYear] = useState('');
    const [content, setContent] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    // Use shared LAW_COURSES
    const courses = LAW_COURSES.sort();

    const toggleCourse = (course: string) => {
        setSelectedCourses(prev =>
            prev.includes(course)
                ? prev.filter(c => c !== course)
                : [...prev, course]
        );
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }
        return fullText;
    };

    const extractTextFromDocx = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsUploading(true);
        setStatus({ type: 'success', message: 'Extracting text from file...' });

        try {
            let extractedText = '';
            if (file.type === 'application/pdf') {
                extractedText = await extractTextFromPdf(file);
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                extractedText = await extractTextFromDocx(file);
            } else {
                // Plain text
                extractedText = await file.text();
            }

            setContent(extractedText);

            // Auto-fill topic if empty
            if (!topic && activeTab === 'materials') {
                setTopic(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
            }

            setStatus(null);
        } catch (error) {
            console.error("Extraction error:", error);
            setStatus({ type: 'error', message: 'Failed to extract text from file.' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        if (selectedCourses.length === 0) {
            setStatus({ type: 'error', message: 'Please select at least one course.' });
            return;
        }

        setIsUploading(true);
        setStatus(null);

        try {
            // 1. Generate Embedding
            const embedding = await generateEmbedding(content);

            if (!embedding) {
                throw new Error("Failed to generate embedding. AI service might be down.");
            }

            // 2. Insert into Supabase for EACH selected course
            const finalTopic = topic.trim() || fileName || "General";

            const promises = selectedCourses.map(course => {
                if (activeTab === 'materials') {
                    return supabase.from('course_materials').insert({
                        course,
                        topic: finalTopic,
                        content,
                        embedding
                    });
                } else {
                    return supabase.from('past_questions').insert({
                        course,
                        year,
                        question_text: content,
                        embedding
                    });
                }
            });

            const results = await Promise.all(promises);
            const errors = results.filter(r => r.error).map(r => r.error?.message);

            if (errors.length > 0) {
                throw new Error(`Failed to upload for some courses: ${errors.join(', ')}`);
            }

            setStatus({ type: 'success', message: `Uploaded successfully to ${selectedCourses.length} course(s)!` });
            setContent(''); // Clear content on success
            setFileName(null);
            if (activeTab === 'materials') setTopic('');
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
                <div className="grid grid-cols-1 gap-6">
                    {/* Course Selection (Multi-select) */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Select Applicable Courses</label>
                        <div className="flex flex-wrap gap-2">
                            {courses.map(c => {
                                const isSelected = selectedCourses.includes(c);
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => toggleCourse(c)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${isSelected
                                                ? 'bg-amber-100 border-amber-600 text-amber-800 font-medium'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedCourses.length === 0 && (
                            <p className="text-xs text-red-500">Please select at least one course.</p>
                        )}
                    </div>

                    {/* Dynamic Field: Topic or Year */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {activeTab === 'materials' ? 'Topic (Optional)' : 'Exam Year'}
                        </label>
                        <input
                            type="text"
                            value={activeTab === 'materials' ? topic : year}
                            onChange={(e) => activeTab === 'materials' ? setTopic(e.target.value) : setYear(e.target.value)}
                            placeholder={activeTab === 'materials' ? "e.g., Separation of Powers (or leave blank)" : "e.g., 2023"}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                            required={activeTab === 'questions'}
                        />
                    </div>
                </div>

                {/* File Upload Area */}
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-amber-500 transition-colors bg-slate-50 text-center cursor-pointer relative">
                    <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                        <FileUp size={32} className="text-amber-600" />
                        <p className="font-medium text-slate-700">Click to upload PDF, Word, or Text file</p>
                        <p className="text-xs">Text will be automatically extracted.</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        {activeTab === 'materials' ? 'Extracted Content' : 'Question Text'}
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Content will appear here after upload, or you can type manually..."
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
