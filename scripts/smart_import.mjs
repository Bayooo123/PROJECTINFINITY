
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

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
        } catch (e) { }
    }
};

loadEnv('.env');
loadEnv('.env.local');

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];
const GEMINI_KEY = env['VITE_GEMINI_API_KEY'] || env['VITE_AI_STUDIO_API_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY) {
    console.error("Missing credentials in .env or .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const aiStudio = new GoogleGenerativeAI(GEMINI_KEY);
console.log("Initializing Gemini model...");
const model = aiStudio.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateTopicTitle(course, questionSamples) {
    console.log(`Generating title for ${course} batch...`);
    const prompt = `
    You are an expert Nigerian law academic.
    COURSE: ${course}
    QUESTION SAMPLES:
    ${questionSamples.join("\n---\n")}

    TASK:
    Based on these questions, generate a concise, academically precise topic title.
    Standards:
    - Use legal nomenclature (e.g., 'Doctrine of...', 'Principles of...').
    - Reflect historical or doctrinal perspectives where appropriate.
    - Max 8 words.

    EXAMPLE: 'Meaning, Nature, Origin, and Reception of Equity'

    RETURN ONLY THE TITLE. No quotes, no preamble.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim().replace(/['"]/g, '');
    } catch (error) {
        console.error("Error generating topic title:", error.message);
        return "General Legal Principles";
    }
}

async function logAutoTopic(course, title, sample) {
    await supabase.from('auto_topic_logs').insert({
        course,
        generated_title: title,
        source_sample: sample.substring(0, 500)
    });
}

async function smartImport() {
    const filePath = path.resolve(process.cwd(), 'data/my_questions.json');
    if (!fs.existsSync(filePath)) {
        console.error("data/my_questions.json not found.");
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Starting smart import of ${rawData.length} questions...`);

    // Group by Course and Topic (or lack thereof)
    const batches = {};
    for (const q of rawData) {
        const course = q.course || "General Law";
        const topic = q.topic || "AUTO_GENERATE";
        const key = `${course}|${topic}`;
        batches[key] = batches[key] || [];
        batches[key].push(q);
    }

    for (const [key, questions] of Object.entries(batches)) {
        const [course, topicLabel] = key.split('|');
        let finalTopic = topicLabel;

        if (topicLabel === "AUTO_GENERATE") {
            console.log(`\nFound batch for ${course} without topic. Generating academic title...`);
            const samples = questions.slice(0, 5).map(q => q.question_data.text);
            finalTopic = await generateTopicTitle(course, samples);
            console.log(`-> Generated Title: "${finalTopic}"`);

            await logAutoTopic(course, finalTopic, samples.join("\n"));
        }

        console.log(`Importing ${questions.length} questions to [${course}] -> [${finalTopic}]...`);

        const rows = questions.map(q => ({
            course: q.course,
            topic: finalTopic,
            type: q.type || 'objective',
            question_data: q.question_data
        }));

        const { error } = await supabase.from('question_bank').insert(rows);
        if (error) {
            console.error(`Failed to import batch:`, error.message);
        } else {
            console.log(`Successfully imported ${rows.length} questions.`);
        }
    }

    console.log("\nSmart Import Completed.");
}

smartImport();
