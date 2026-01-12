
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

async function verify() {
    const { data, error } = await supabase.from('question_bank').select('course, topic');
    if (error) {
        fs.writeFileSync('bank_report.txt', "Error: " + error.message);
        return;
    }

    const counts = data.reduce((acc, curr) => {
        const key = `${curr.course} | ${curr.topic}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    fs.writeFileSync('bank_report.txt', JSON.stringify(counts, null, 2));
}

verify();
