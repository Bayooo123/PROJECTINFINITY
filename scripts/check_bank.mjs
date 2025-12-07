import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key === 'VITE_SUPABASE_URL') supabaseUrl = value;
            if (key === 'VITE_SUPABASE_ANON_KEY') supabaseKey = value;
        }
    });
} catch (e) { }

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBank() {
    const { data, error } = await supabase
        .from('question_bank')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error("Error accessing question_bank:", error.message);
        if (error.code === '42P01') {
            console.log("Table 'question_bank' does NOT exist.");
        }
    } else {
        console.log("Table 'question_bank' exists and is accessible.");
    }
}

checkBank();
