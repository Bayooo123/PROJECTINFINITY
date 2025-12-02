import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabase';
import { COCCIN_TOPICS } from '../types';

// Access the API key from Vite environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
 * Generates a vector embedding for a given text using Gemini.
 */
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
    match_threshold: 0.5, // Minimum similarity
    match_count: 3,       // Number of chunks to retrieve
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

    let contextText = "";
    let pastQuestionsText = "";

    if (embedding) {
      // 2. Parallel Search: Course Materials & Past Questions
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

    // 3. Construct the "Exam-Smart" System Prompt
    const systemPrompt = `
      You are an expert law tutor for Nigerian law students.
      
      CONTEXT FROM COURSE MATERIALS:
      ${contextText ? contextText : "No specific course materials found for this query."}

      RELEVANT PAST EXAM QUESTIONS:
      ${pastQuestionsText ? pastQuestionsText : "No relevant past questions found."}

      INSTRUCTIONS:
      1. Answer the student's question primarily using the CONTEXT provided above. If the context is empty, use your general legal knowledge but mention that you are doing so.
      2. If PAST EXAM QUESTIONS are provided, analyze them to provide **exam-focused recommendations**. Mention how this topic is typically tested (e.g., "This topic appeared in the ${pastQuestionsText ? 'past' : ''} exam...").
      3. Provide a specific "Study Tip" or "Exam Strategy" based on the provided materials and questions.
      4. Be precise, cite relevant Nigerian cases and statutes if applicable.
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
    const response = result.response;
    return response.text();

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
};

export const generateQuizQuestions = async (
  course: string,
  topic: string,
  count: number = 5
): Promise<any[]> => {
  if (!API_KEY) return [];

  try {
    const prompt = `Generate ${count} multiple-choice questions for the law course "${course}" specifically about "${topic}".
    Focus on Nigerian legal principles, cases, and statutes.
    
    Return ONLY a raw JSON array (no markdown formatting) with objects having this structure:
    {
      "id": "unique_id",
      "text": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why the answer is correct"
    }`;

    const result = await chatModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const generateCoccinQuestions = async (
  courses: string[],
  type: 'theory' | 'objective',
  count: number = 10
): Promise<any> => {
  if (!API_KEY) return null;

  let allContext = "";
  let topicsList: string[] = [];

  // 1. Robust Context Retrieval (with Timeout)
  try {
    const contextPromise = (async () => {
      let ctx = "";
      for (const course of courses) {
        const courseTopics = COCCIN_TOPICS[course] || [course];
        topicsList = [...topicsList, ...courseTopics];

        // Limit to 2 topics per course to be faster
        const searchTopics = courseTopics.sort(() => 0.5 - Math.random()).slice(0, 2);

        for (const topic of searchTopics) {
          try {
            const embedding = await generateEmbedding(topic);
            if (embedding) {
              const materials = await searchCourseMaterials(embedding, course);
              if (materials && materials.length > 0) {
                ctx += `\n[Course: ${course} | Topic: ${topic}]\n${materials[0].content.substring(0, 300)}...\n`;
              }
            }
          } catch (e) {
            console.warn(`Skipping topic ${topic} due to error`, e);
          }
        }
      }
      return ctx;
    })();

    // Race against a 4-second timeout
    const timeoutPromise = new Promise<string>((resolve) => setTimeout(() => resolve(""), 4000));

    allContext = await Promise.race([contextPromise, timeoutPromise]);
    if (!allContext) console.log("Context retrieval timed out or empty, proceeding with general knowledge.");

  } catch (err) {
    console.error("Context retrieval failed:", err);
    // Fallback: Ensure topicsList is populated even if context fails
    courses.forEach(c => {
      topicsList = [...topicsList, ...(COCCIN_TOPICS[c] || [c])];
    });
  }

  // 2. Generation with Retry Strategy
  const generate = async (isRetry = false) => {
    const prompt = isRetry
      ? `Generate ${count} ${type} questions for Nigerian law students on: ${courses.join(', ')}. Return ONLY valid JSON array. Structure: ${type === 'objective' ? '[{id, text, options[], correctAnswer, explanation}]' : '[{id, text, keyPoints[]}]'}`
      : `
          You are an expert law examiner for Nigerian law students.
          TASK: Generate ${count} ${type === 'objective' ? 'multiple-choice questions' : 'theory questions'} for a mock exam.
          COURSES: ${courses.join(' and ')}
          FOCUS TOPICS: ${topicsList.slice(0, 10).join(', ')}...
          CONTEXT: ${allContext.substring(0, 2000)}
          INSTRUCTIONS:
          1. Questions must be based on Nigerian Law.
          2. Return ONLY the raw JSON array.
          3. Structure for '${type}': ${type === 'objective' ? 'id, text, options (4), correctAnswer (index), explanation' : 'id, text, keyPoints (array)'}.
        `;

    const result = await chatModel.generateContent(prompt);
    const text = result.response.text();
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  };

  try {
    return await generate(false);
  } catch (error) {
    console.warn("First generation attempt failed, retrying with simple prompt...", error);
    try {
      return await generate(true);
    } catch (retryError) {
      console.error("All generation attempts failed:", retryError);
      return [];
    }
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
    // 1. Generate Questions using existing logic (reusing the robust function)
    // We pass [course] as an array because the function expects an array
    const questions = await generateCoccinQuestions([course], type, count);

    if (!questions || questions.length === 0) {
      return { success: false, count: 0, message: "AI failed to generate questions." };
    }

    // 2. Prepare for Batch Insert
    const rowsToInsert = questions.map((q: any) => ({
      course,
      topic,
      type,
      question_data: q // Store the full JSON object
    }));

    // 3. Insert into Supabase
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
