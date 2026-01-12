
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
const TOPICS_TO_POPULATE = {
    "Company Law": [
        "Corporate Affairs Commission",
        "Formation of Companies",
        "Capacity and Powers of the Company"
    ],
    "Constitutional Law": [
        "Separation of Powers",
        "Rule of Law",
        "Federalism in Nigeria"
    ],
    "Criminal Law": [
        "General Principles of Criminal Liability",
        "Homicide (Murder & Manslaughter)"
    ]
};
const TARGET_COUNT = 20;

// --- Load Env ---
let env = {};

const loadEnv = (filename) => {
    const filePath = path.resolve(process.cwd(), filename);
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            content.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    let value = parts.slice(1).join('=').trim();
                    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.substring(1, value.length - 1);
                    }
                    env[key] = value;
                }
            });
            console.log(`Loaded ${filename}`);
        } catch (e) {
            console.error(`Error reading ${filename}`, e);
        }
    }
};

loadEnv('.env');
loadEnv('.env.local');

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];
const GEMINI_KEY = env['VITE_AI_STUDIO_API_KEY'] || env['VITE_GEMINI_API_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY) {
    console.error("Missing credentials in .env or .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const aiStudio = new GoogleGenerativeAI(GEMINI_KEY);
// Switching to gemini-1.5-flash-001 which is the most reliable versioned endpoint
const model = aiStudio.getGenerativeModel({ model: "gemini-1.5-flash-001" });

// --- Logic ---

async function generateQuestions(course, topic, count) {
    const prompt = `You are an expert Nigerian law examiner.
TASK: Generate ${count} multiple-choice questions for law students.
COURSE: ${course}
TOPIC: ${topic}

REQUIREMENTS:
1. Questions must be based on Nigerian legal principles, cases, and statutes
2. Each question must have exactly 4 options (A, B, C, D)
3. Questions should be exam-standard difficulty
4. Include clear explanations citing relevant cases/statutes
5. IMPORTANT: Return ONLY a raw JSON array. No markdown, no backticks, no comments.

JSON STRUCTURE:
[
  {
    "id": "unique_id",
    "text": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswerIndex": 0,
    "explanation": "Explanation cite"
  }
]`;

    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();

        // Clean up any potential markdown formatting
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Handle potential starting [ and ending ] if there's noise
        const startIdx = text.indexOf('[');
        const endIdx = text.lastIndexOf(']');
        if (startIdx !== -1 && endIdx !== -1) {
            text = text.substring(startIdx, endIdx + 1);
        }

        return JSON.parse(text);
    } catch (e) {
        console.error(`Generation failed for ${course}/${topic}:`, e.message);
        return [];
    }
}

async function run() {
    console.log("Starting Bank Population with gemini-1.5-flash-001...");

    for (const [course, topics] of Object.entries(TOPICS_TO_POPULATE)) {
        console.log(`\nCourse: ${course}`);

        for (const topic of topics) {
            const { data, count, error } = await supabase
                .from('question_bank')
                .select('*', { count: 'exact', head: true })
                .eq('course', course)
                .eq('topic', topic);

            if (error) {
                console.error(`DB Error for ${topic}:`, error.message);
                continue;
            }

            console.log(`  - Topic: ${topic} [Current: ${count}/20]`);

            if (count < TARGET_COUNT) {
                const needed = TARGET_COUNT - count;
                const batchSize = 5;
                let generated = 0;

                while (generated < needed) {
                    const toGen = Math.min(batchSize, needed - generated);
                    console.log(`    -> Generating ${toGen}...`);

                    const questions = await generateQuestions(course, topic, toGen);

                    if (questions && questions.length > 0) {
                        const rows = questions.map(q => ({
                            course,
                            topic,
                            type: 'objective',
                            question_data: q
                        }));

                        const { error: insertError } = await supabase
                            .from('question_bank')
                            .insert(rows);

                        if (insertError) {
                            console.error("    Insert Error:", insertError.message);
                            break;
                        } else {
                            generated += rows.length;
                            console.log(`    Saved ${rows.length}. Total: ${count + generated}`);
                        }
                    } else {
                        console.warn("    AI returned empty. Retrying...");
                    }
                    // Rate limit buffer
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }
    }
    console.log("\nFinished population run.");
}

run();
