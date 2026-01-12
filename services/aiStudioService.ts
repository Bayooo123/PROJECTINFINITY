/**
 * Google AI Studio Service
 * 
 * Dedicated service for question generation using the proven AI Studio API.
 * This service handles all question generation for Practice Area and COCCIN modes.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Use dedicated AI Studio API key
// Use dedicated AI Studio API key or fallback to general Gemini key
const AI_STUDIO_KEY = import.meta.env.VITE_AI_STUDIO_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

if (!AI_STUDIO_KEY) {
    console.warn("AI Studio API key not found. Question generation will use fallback.");
}

const aiStudio = new GoogleGenerativeAI(AI_STUDIO_KEY || '');

// Primary Model: Gemini 2.0 Flash Exp (Experimental, smarter, lower rate limits)
const primaryModel = aiStudio.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Fallback Model: Gemini 1.5 Flash (Stable, specific version)
const fallbackModel = aiStudio.getGenerativeModel({ model: "gemini-1.5-flash-001" });

// --- Type Definitions ---

export interface ObjectiveQuestion {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface TheoryQuestion {
    id: string;
    text: string;
    keyPoints: string[];
}


// --- Helper: Safe Content Generation with Fallback ---

const generateContentSafe = async (prompt: string): Promise<string> => {
    try {
        // Attempt 1: Primary Model
        const result = await primaryModel.generateContent(prompt);
        return result.response.text();

    } catch (error: any) {
        // Check if error is Rate Limit (429) or overloaded
        const msg = error.toString().toLowerCase();
        const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('dazzy') || msg.includes('exhausted');

        if (isRateLimit) {
            console.warn("Primary model rate-limited. Switching to Fallback (Gemini 1.5 Flash)...");
            try {
                // Attempt 2: Fallback Model
                const fallbackResult = await fallbackModel.generateContent(prompt);
                return fallbackResult.response.text();
            } catch (fallbackError: any) {
                console.error("Fallback model also failed:", fallbackError);
                throw fallbackError; // Throw original error to be mapped
            }
        }

        throw error; // Throw non-rate-limit errors immediately
    }
};


// --- Question Generation Functions ---

/**
 * Generate standard practice questions for a specific course and topic
 */
export const generateStandardQuestions = async (
    course: string,
    topic: string,
    count: number
): Promise<ObjectiveQuestion[]> => {
    if (!AI_STUDIO_KEY) {
        throw new Error("API Key is missing. Please check your configuration.");
    }

    try {
        const prompt = `You are an expert Nigerian law examiner.

TASK: Generate ${count} multiple-choice questions for law students.
COURSE: ${course}
TOPIC: ${topic}

REQUIREMENTS:
1. Questions must be based on Nigerian legal principles, cases, and statutes
2. Each question must have exactly 4 options (A, B, C, D)
3. Questions should be exam-standard difficulty
4. Include clear explanations citing relevant cases/statutes

OUTPUT FORMAT: Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "q1",
    "text": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation with case citations"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown formatting, no additional text. Ensure the JSON is valid.`;

        const text = await generateContentSafe(prompt);

        // Clean and parse response
        const jsonString = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        try {
            const questions = JSON.parse(jsonString);

            // Validate structure
            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error("AI returned an invalid format (not an array).");
            }

            return questions;
        } catch (jsonError) {
            console.error("JSON Parse Error:", jsonError, "Raw Text:", text);
            throw new Error("Failed to parse AI response. The AI might be busy or confused.");
        }

    } catch (error: any) {
        console.error("Error generating standard questions:", error);
        throw mapErrorToUserMessage(error);
    }
};

/**
 * Generate COCCIN objective (MCQ) questions
 */
export const generateCoccinObjective = async (
    courses: string[],
    count: number = 20
): Promise<ObjectiveQuestion[]> => {
    if (!AI_STUDIO_KEY) {
        throw new Error("API Key is missing. Please check your configuration.");
    }

    try {
        const prompt = `You are an expert Nigerian law examiner creating a COCCIN mock examination.

TASK: Generate ${count} multiple-choice questions for a COCCIN-style exam.
COURSES: ${courses.join(' and ')}

COCCIN EXAM STANDARDS:
- Questions test comprehensive understanding across multiple topics
- Mix of theoretical knowledge and practical application
- Based on Nigerian legal system, cases, and statutes
- Professional exam-level difficulty

REQUIREMENTS:
1. Generate ${Math.ceil(count / 2)} questions from each course
2. Each question must have exactly 4 options
3. Questions should cover different topics within each course
4. Include case law and statutory references in explanations

OUTPUT FORMAT: Return ONLY a valid JSON array:
[
  {
    "id": "q1",
    "text": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation with citations"
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown, no additional text.`;

        const text = await generateContentSafe(prompt);

        const jsonString = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        try {
            const questions = JSON.parse(jsonString);

            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error("AI returned an empty or invalid list of questions.");
            }
            return questions;

        } catch (jsonError) {
            console.error("COCCIN Objective Parse Error:", jsonError, "Raw Text:", text);
            throw new Error("Failed to process the exam paper. Please try again.");
        }

    } catch (error: any) {
        console.error("Error generating COCCIN objective questions:", error);
        throw mapErrorToUserMessage(error);
    }
};

/**
 * Generate COCCIN theory questions
 */
export const generateCoccinTheory = async (
    courses: string[],
    count: number = 2
): Promise<TheoryQuestion[]> => {
    if (!AI_STUDIO_KEY) {
        throw new Error("API Key is missing. Please check your configuration.");
    }

    try {
        const prompt = `You are an expert Nigerian law examiner creating COCCIN theory questions.

TASK: Generate ${count} essay/theory questions for a COCCIN-style exam.
COURSES: ${courses.join(' and ')}

COCCIN THEORY STANDARDS:
- Questions require comprehensive analysis and discussion
- Test deep understanding of legal principles
- Require application of case law and statutory provisions
- Professional exam-level complexity

REQUIREMENTS:
1. Generate ${Math.ceil(count / 2)} question(s) from each course
2. Questions should be broad enough for 45-minute answers
3. Include detailed marking scheme with key points
4. Reference relevant Nigerian cases and statutes

OUTPUT FORMAT: Return ONLY a valid JSON array:
[
  {
    "id": "t1",
    "text": "Theory question text",
    "keyPoints": [
      "Key point 1 with case citation",
      "Key point 2 with statutory reference",
      "Key point 3 with analysis requirement"
    ]
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown, no additional text.`;

        const text = await generateContentSafe(prompt);

        const jsonString = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        try {
            const questions = JSON.parse(jsonString);

            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error("AI returned an invalid theory question format.");
            }
            return questions;
        } catch (jsonError) {
            console.error("COCCIN Theory Parse Error:", jsonError, "Raw Text:", text);
            throw new Error("Failed to process theory questions. Please try again.");
        }

    } catch (error: any) {
        console.error("Error generating COCCIN theory questions:", error);
        throw mapErrorToUserMessage(error);
    }
};

/**
 * Helper to map technical errors to user-friendly messages
 */
const mapErrorToUserMessage = (error: any): Error => {
    const msg = error.toString().toLowerCase();

    if (msg.includes('api key')) return new Error("System Configuration Error: API Key missing or invalid.");
    if (msg.includes('fetch failed') || msg.includes('network')) return new Error("Network Error: Please check your internet connection.");
    if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) return new Error("System Busy: High traffic. Please check back in 1 minute.");
    if (msg.includes('safety') || msg.includes('blocked')) return new Error("Content Safety Error: The request was blocked by safety filters.");

    return error instanceof Error ? error : new Error("An unexpected error occurred.");
};

export const generateQuestionsWithRetry = async <T>(
    generatorFn: () => Promise<T>,
    maxRetries: number = 2
): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await generatorFn();
        } catch (error: any) {
            lastError = mapErrorToUserMessage(error);
            const errorMsg = lastError.message.toLowerCase();

            // Check for Rate Limits (429 or Quota Exceeded)
            const isRateLimit = errorMsg.includes('service busy') ||
                errorMsg.includes('429') ||
                errorMsg.includes('overloaded');

            console.warn(`Generation attempt ${attempt + 1} failed:`, error);

            if (isRateLimit) {
                // Immediate fail for rate limits if it's the last retry
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempt)));
                    continue;
                }
                // With fallback model, simpler failures now mean hard limits
            }

            // Don't retry for configuration errors
            if (errorMsg.includes('configuration') || errorMsg.includes('api key')) {
                throw lastError;
            }

            if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            }
        }
    }

    throw lastError || new Error("Failed to generate questions. Please ensure you are connected to the internet.");
};
