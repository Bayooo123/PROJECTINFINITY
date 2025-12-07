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

async function listCourses() {
    const { data, error } = await supabase
        .from('course_materials')
        .select('course');

    if (error) {
        console.error(error);
        return;
    }

    const courses = [...new Set(data.map(item => item.course))].sort();
    console.log("--- COURSES WITH MATERIALS ---");
    courses.forEach(c => console.log(`- ${c}`));
}

listCourses();
