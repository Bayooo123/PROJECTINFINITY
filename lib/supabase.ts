import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Authentication features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
    id: string;
    name: string;
    university: string;
    level: string;
    courses: string[];
    created_at?: string;
    updated_at?: string;
}

export interface QuizHistory {
    id?: string;
    user_id: string;
    course: string;
    topic?: string;
    quiz_mode: string;
    total_questions: number;
    correct_answers: number;
    score_percentage: number;
    time_taken_seconds?: number;
    completed_at?: string;
}

export interface UserProgress {
    id?: string;
    user_id: string;
    course: string;
    topics_completed: string[];
    total_quizzes_taken: number;
    total_questions_answered: number;
    total_correct_answers: number;
    last_practiced_at?: string;
    created_at?: string;
    updated_at?: string;
}
