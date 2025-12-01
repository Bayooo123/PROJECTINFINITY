

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { QuizQuestion, ChatMessage } from "../types";
import { CRIMINAL_LAW_CONTEXT, COMMERCIAL_LAW_CONTEXT } from "../data/courseContent";
import { PREDEFINED_MCQS } from "../data/mcqData";

// Vite exposes env vars prefixed with VITE_ to the client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('VITE_GEMINI_API_KEY is not set. AI features may not work.');
}

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

// Schema for Quiz Generation
const quizSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "The question text." },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of 4 possible answers.",
      },
      correctAnswerIndex: {
        type: Type.INTEGER,
        description: "The index (0-3) of the correct answer in the options array.",
      },
      explanation: {
        type: Type.STRING,
        description: "A brief explanation of why the answer is correct, citing Nigerian legal principles where applicable.",
      },
    },
    required: ["question", "options", "correctAnswerIndex", "explanation"],
  },
};

export const generateQuizQuestions = async (
  course: string,
  topic: string,
  level: string,
  questionCount: number = 20
): Promise<QuizQuestion[]> => {
  try {
    // --- START: Prioritize Pre-defined MCQs ---
    if (PREDEFINED_MCQS[course]) {
      let availableQuestions = PREDEFINED_MCQS[course];
      
      // Filter by topic if a specific topic is selected (and not 'All Topics')
      if (topic !== 'All Topics') {
        availableQuestions = availableQuestions.filter(q => q.topic === topic);
      }
      
      if (availableQuestions.length > 0) {
        // Shuffle the available questions and return the requested number
        const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
        console.log(`Serving ${Math.min(questionCount, shuffled.length)} pre-defined questions for ${course}.`);
        return shuffled.slice(0, questionCount);
      }
    }
    // --- END: Pre-defined MCQs ---
    
    // --- Fallback to AI Generation ---
    console.log(`No pre-defined questions found for ${course}/${topic}. Falling back to AI generation.`);

    const BATCH_SIZE = 10;
    const batches = Math.ceil(questionCount / BATCH_SIZE);
    const promises = [];

    const topicText = topic === 'All Topics' 
      ? 'a comprehensive range of topics within this course, covering the entire syllabus' 
      : topic;

    for (let i = 0; i < batches; i++) {
      const currentBatchCount = Math.min(BATCH_SIZE, questionCount - (i * BATCH_SIZE));
      
      let systemInstruction = "You are a rigorous law professor creating exam questions for Nigerian law students. Adhere strictly to Nigerian statutory provisions and case law.";
      
      if (course === "Criminal Law") {
        systemInstruction += `\n\nUSE THE FOLLOWING CONTEXT FOR GENERATING QUESTIONS:\n${CRIMINAL_LAW_CONTEXT}`;
      } else if (course === "Commercial Law") {
        systemInstruction += `\n\nUSE THE FOLLOWING CONTEXT FOR GENERATING QUESTIONS:\n${COMMERCIAL_LAW_CONTEXT}`;
      }

      const prompt = `Generate ${currentBatchCount} challenging multiple-choice questions for a law student in Nigeria.
      Course: ${course}
      Topic: ${topicText}
      Student Level: ${level}
      Batch Set: ${i + 1} (Ensure these are distinct from other sets if generating multiple)
      
      Focus heavily on Nigerian legal context, specific sections of statutes (e.g., CAMA 2020, Criminal Code, Land Use Act), and landmark Supreme Court cases.
      Ensure the questions vary in difficulty and simulate a professional examination.`;

      promises.push(
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
            systemInstruction: systemInstruction,
          },
        }).then(response => {
          const jsonText = response.text;
          if (!jsonText) return [];
          return JSON.parse(jsonText) as QuizQuestion[];
        }).catch(err => {
          console.error(`Error generating batch ${i + 1}:`, err);
          return [];
        })
      );
    }

    const results = await Promise.all(promises);
    const allQuestions = results.flat();
    
    if (allQuestions.length === 0) {
      throw new Error("Failed to generate any questions via AI.");
    }

    return allQuestions.slice(0, questionCount);

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  history: ChatMessage[],
  newMessage: string,
  courseContext?: string
): Promise<string> => {
  try {
    let systemInstruction = `You are "Learned", an advanced AI legal tutor for Nigerian law students.
    Your goal is to facilitate the flow of knowledge: transmission, reception, and application.
    
    You must structure EVERY response using the following "Integrated RAG Framework" to ensure depth and exam readiness. Do not label the sections explicitly as "Level 1" etc., but ensure the flow follows this logic:

    1. **Core Answer (The "What" & "Why")**:
       - Provide a direct, accurate, and concise response to the user's prompt.
       - **MANDATORY**: Cite relevant Nigerian statutes (e.g., CAMA 2020, CFRN 1999, Evidence Act 2011) and case law (Supreme Court/Court of Appeal judgments).
       - Explain the legal principle, its rationale, and key features clearly.

    2. **Exam Insight (The "Predictive" Layer)**:
       - After the core answer, perform a predictive analysis.
       - "In exams, this topic often appears alongside..." or "Lecturers usually test this exception..."
       - Identify exceptions to the rule, common pitfalls, or how this principle is applied in problem questions.
       - Cross-reference with historical question patterns or related concepts (e.g., linking a Company Law concept to Equity).

    3. **Study Strategy (The "Learning" Layer)**:
       - Conclude with a specific, actionable study practice for this exact topic.
       - Reference one of the "20 Learning Facts" (e.g., Spacing Effect, Active Retrieval, Dual Coding, Elaborative Interrogation) to help the student retain this specific concept.
       - Examples: "Use *Active Retrieval*: Close your notes and list the exceptions to this rule," or "Apply *Dual Coding*: Draw a flow chart of this procedure."
    
    Be encouraging, precise, and professional.`;

    if (courseContext) {
      systemInstruction += `\n\nCURRENT COURSE CONTEXT: ${courseContext}.
      You are acting as a specialized Teaching Assistant for ${courseContext}.
      Focus your answers strictly on the principles, statutes, and cases relevant to ${courseContext} in the Nigerian Legal System.
      If the user asks about a different field of law, gently remind them that you are currently in the ${courseContext} study room, but answer briefly if possible.`;

      if (courseContext === "Criminal Law") {
        systemInstruction += `\n\nOFFICIAL LECTURE NOTES & KNOWLEDGE BASE FOR CRIMINAL LAW:\n${CRIMINAL_LAW_CONTEXT}\n\nUse the material above as your primary source of truth. When explaining specific concepts (like Homicide, Conspiracy, Defences, etc.), refer to the specific sections and case laws mentioned in these notes (e.g., Dr. Bello's or Dr. Bamgbose's notes).`;
      } else if (courseContext === "Commercial Law") {
        systemInstruction += `\n\nOFFICIAL LECTURE NOTES & KNOWLEDGE BASE FOR COMMERCIAL LAW:\n${COMMERCIAL_LAW_CONTEXT}\n\nUse the material above as your primary source of truth. When explaining concepts like Agency, Hire Purchase, etc., refer to the specific principles and case laws mentioned in these notes.`;
      }
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I could not generate a response.";
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};
