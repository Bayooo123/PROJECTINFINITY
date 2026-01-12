
import { createClient } from '@supabase/supabase-js';
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

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function reset() {
    const args = process.argv.slice(2);
    const courses = args.length > 0
        ? args
        : ['Land Law', 'Equity and Trusts', 'Law of Contract', 'Constitutional Law'];

    console.log(`Resetting bank for: ${courses.join(', ')}...`);

    for (const course of courses) {
        const { error } = await supabase
            .from('question_bank')
            .delete()
            .eq('course', course);

        if (error) {
            console.error(`Error deleting ${course}:`, error.message);
        } else {
            console.log(`Cleared ${course} entries.`);
        }
    }
}

reset();
