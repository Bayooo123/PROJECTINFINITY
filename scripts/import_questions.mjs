
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * Learned Question Bank Importer
 * 
 * Use this script to manually feed questions into the system.
 * 
 * Format for data/my_questions.json:
 * [
 *   {
 *     "course": "Company Law",
 *     "topic": "Formation of Companies",
 *     "type": "objective",
 *     "question_data": {
 *       "text": "What is the minimum number of members for a private company under CAMA 2020?",
 *       "options": ["1", "2", "5", "50"],
 *       "correctAnswerIndex": 0,
 *       "explanation": "Section 18(1) of CAMA 2020 allows for single-member companies."
 *     }
 *   }
 * ]
 */

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

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing credentials in .env or .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function importQuestions() {
    const customPath = process.argv[2];
    const filePath = customPath
        ? path.resolve(process.cwd(), customPath)
        : path.resolve(process.cwd(), 'data/my_questions.json');

    if (!fs.existsSync(filePath)) {
        console.error("Error: 'data/my_questions.json' not found.");
        console.log("Please create a 'data' folder and put your 'my_questions.json' file there.");
        return;
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const questions = JSON.parse(fileContent);

        console.log(`Ready to import ${questions.length} questions...`);

        const { data, error } = await supabase
            .from('question_bank')
            .insert(questions);

        if (error) {
            console.error("Import failed:", error.message);
        } else {
            console.log(`Successfully imported ${questions.length} questions to the bank!`);
        }
    } catch (e) {
        console.error("Error during import:", e.message);
    }
}

importQuestions();
