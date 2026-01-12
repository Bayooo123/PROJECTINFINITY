import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabase';
import {
  generateStandardQuestions,
  generateCoccinObjective,
  generateCoccinTheory,
  generateQuestionsWithRetry
} from './aiStudioService';

// Access the API key from Vite environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_AI_STUDIO_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found in environment variables. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

// Models
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// --- RAG Helper Functions ---

/**
 * Import manually prepared questions into the question bank.
 */
export const importQuestionsToBank = async (
  rows: any[]
): Promise<{ success: boolean; count: number; message?: string }> => {
  try {
    const { error } = await supabase
      .from('question_bank')
      .insert(rows);

    if (error) {
      console.error("Error importing to question bank:", error);
      return { success: false, count: 0, message: error.message };
    }

    return { success: true, count: rows.length };
  } catch (error: any) {
    console.error("Import error:", error);
    return { success: false, count: 0, message: error.message || "Unknown error" };
  }
};

export const generateEmbedding = async (text: string): Promise<number[] | null> => {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
};

/**
 * Searches for relevant course materials in Supabase.
 */
export const searchCourseMaterials = async (queryEmbedding: number[], course?: string) => {
  const { data, error } = await supabase.rpc('match_course_materials', {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: 3,
    filter_course: course || null
  });

  if (error) {
    console.error("Error searching course materials:", error);
    return [];
  }
  return data || [];
};

/**
 * Searches for relevant past questions in Supabase.
 */
export const searchPastQuestions = async (queryEmbedding: number[], course?: string) => {
  const { data, error } = await supabase.rpc('match_past_questions', {
    query_embedding: queryEmbedding,
    match_threshold: 0.5,
    match_count: 3,
    filter_course: course || null
  });

  if (error) {
    console.error("Error searching past questions:", error);
    return [];
  }
  return data || [];
};

/**
 * Searches for a semantically similar query in the study_cache.
 */
export const searchStudyCache = async (queryEmbedding: number[], course?: string) => {
  const { data, error } = await supabase.rpc('match_study_cache', {
    query_embedding: queryEmbedding,
    match_threshold: 0.92, // High similarity required for reuse
    match_count: 1,
    filter_course: course || null
  });

  if (error) {
    console.error("Error searching study cache:", error);
    return null;
  }
  return data && data.length > 0 ? data[0] : null;
};

/**
 * Saves a high-quality Q&A pair to the study_cache for future reuse.
 */
export const saveToStudyCache = async (
  queryText: string,
  queryEmbedding: number[],
  responseText: string,
  courseContext?: string
) => {
  try {
    const { error } = await supabase
      .from('study_cache')
      .insert({
        query_text: queryText,
        query_embedding: queryEmbedding,
        response_text: responseText,
        course_context: courseContext,
        is_verified: true
      });

    if (error) console.error("Error saving to study cache:", error);
  } catch (err) {
    console.error("Cache save error:", err);
  }
};

// --- Main Chat Function ---

export const chatWithGemini = async (
  message: string,
  history: ChatMessage[],
  courseContext?: string
): Promise<string> => {
  if (!API_KEY) {
    return "I'm sorry, but I haven't been configured with an API key yet. Please check the settings.";
  }

  try {
    // 1. Generate Embedding for the user's question
    const embedding = await generateEmbedding(message);

    if (embedding) {
      // 2. CHECK SEMANTIC CACHE FIRST
      // Optimization: Serve cached response if similarity is very high.
      const cachedMatch = await searchStudyCache(embedding, courseContext);
      if (cachedMatch) {
        console.log("Serving from Study Cache! Similarity:", cachedMatch.similarity);
        return cachedMatch.response_text;
      }
    }

    let contextText = "";
    let pastQuestionsText = "";

    if (embedding) {
      // 3. Parallel Search: Course Materials & Past Questions (RAG)
      const [materials, pastQuestions] = await Promise.all([
        searchCourseMaterials(embedding, courseContext),
        searchPastQuestions(embedding, courseContext)
      ]);

      // Format retrieved materials
      if (materials && materials.length > 0) {
        contextText = materials.map((m: any) => `[Source: ${m.topic}]\n${m.content}`).join("\n\n");
      }

      // Format retrieved past questions
      if (pastQuestions && pastQuestions.length > 0) {
        pastQuestionsText = pastQuestions.map((q: any) => `[${q.year}]: ${q.question_text}`).join("\n");
      }
    }

    // 4. Construct the "Exam-Smart" System Prompt
    const systemPrompt = `
      You are an expert law tutor for Nigerian law students.
      
      CONTEXT FROM COURSE MATERIALS:
      ${contextText ? contextText : "No specific course materials found for this query."}

      RELEVANT PAST EXAM QUESTIONS:
      ${pastQuestionsText ? pastQuestionsText : "No relevant past questions found."}

      INSTRUCTIONS:
      1. Answer the student's question primarily using the CONTEXT provided above. 
      2. If PAST EXAM QUESTIONS are provided, analyze them to provide **exam-focused recommendations**.
      3. Provide a specific "Study Tip" or "Exam Strategy" grounded in the provided materials.
      4. Be precise, cite relevant Nigerian cases and statutes.
      5. Keep the tone encouraging and academic.
    `;

    // Start chat with history
    const chat = chatModel.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to act as an expert law tutor using the provided context and past questions." }],
        },
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      ],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    // 5. ASYNC CACHE POPULATION
    // Population strategy: Store successful responses for future reuse.
    if (embedding && responseText.length > 50) {
      // We don't await this to keep response time low
      saveToStudyCache(message, embedding, responseText, courseContext);
    }

    return responseText;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
};

// --- Practice Area Functions ---

export const generateQuizQuestions = async (
  course: string,
  topic: string,
  count: number = 5
): Promise<any[]> => {
  try {
    // 1. Try fetching from Question Bank first (Strict Production Mode)
    const { data, error } = await supabase
      .from('question_bank')
      .select('question_data')
      .eq('course', course)
      .eq('topic', topic)
      .eq('type', 'objective')
      .limit(count);

    if (data && data.length >= count) {
      console.log("Fetched questions from Bank!");
      return data.map(row => row.question_data);
    }

    console.warn(`Bank insufficient for ${course} - ${topic}. Requested ${count}, found ${data?.length || 0}.`);

    // STRICT PRODUCTION MODE: Do NOT generate live.
    return data ? data.map(row => row.question_data) : [];
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

export const generateCoccinQuestions = async (
  courses: string[],
  type: 'theory' | 'objective',
  count: number = 10
): Promise<any> => {
  try {
    // 1. Try fetching from Question Bank
    const questionsPerCourse = Math.ceil(count / courses.length);
    let bankQuestions: any[] = [];
    let allFound = true;

    for (const course of courses) {
      const { data } = await supabase
        .from('question_bank')
        .select('question_data')
        .eq('course', course)
        .eq('type', type)
        .limit(questionsPerCourse);

      if (data && data.length >= questionsPerCourse) {
        bankQuestions = [...bankQuestions, ...data.map(r => r.question_data)];
      } else {
        allFound = false;
        break;
      }
    }

    if (allFound && bankQuestions.length > 0) {
      console.log(`Fetched COCCIN ${type} questions from Bank!`);
      return bankQuestions.slice(0, count);
    }

    console.warn(`Bank insufficient for COCCIN ${type}. Switching to partial return.`);

    // STRICT PRODUCTION MODE: Do NOT generate live.
    return bankQuestions;
  } catch (error) {
    console.error("Error generating COCCIN questions:", error);
    throw error;
  }
};

export const batchGenerateAndSaveQuestions = async (
  course: string,
  topic: string,
  type: 'theory' | 'objective',
  count: number
): Promise<{ success: boolean; count: number; message?: string }> => {
  if (!API_KEY) return { success: false, count: 0, message: "API Key missing" };

  try {
    // Reusing the robust COCCIN logic for admin batching
    const questions = await generateCoccinQuestions([course], type, count);

    if (!questions || questions.length === 0) {
      return { success: false, count: 0, message: "No questions in bank/available." };
    }

    const rowsToInsert = questions.map((q: any) => ({
      course,
      topic,
      type,
      question_data: q
    }));

    const { error } = await supabase
      .from('question_bank')
      .insert(rowsToInsert);

    if (error) {
      console.error("Error saving to question bank:", error);
      return { success: false, count: 0, message: error.message };
    }

    return { success: true, count: questions.length };

  } catch (error: any) {
    console.error("Batch generation error:", error);
    return { success: false, count: 0, message: error.message || "Unknown error" };
  }
};
