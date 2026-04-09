
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
    let allCourses = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('question_bank')
            .select('course')
            .range(from, from + pageSize - 1);

        if (error) {
            console.error("Error fetching courses:", error.message);
            break;
        }

        allCourses = allCourses.concat(data.map(r => r.course));
        if (data.length < pageSize) {
            hasMore = false;
        } else {
            from += pageSize;
        }
    }

    const uniqueCourses = [...new Set(allCourses)];
    console.log("Found courses:", uniqueCourses);

    const totalCounts = {};
    for (const course of uniqueCourses) {
        const { count, error } = await supabase
            .from('question_bank')
            .select('*', { count: 'exact', head: true })
            .eq('course', course);

        if (error) {
            console.error(`Error counting ${course}:`, error.message);
        } else {
            totalCounts[course] = count;
        }
    }

    console.log("Total counts per Course:", totalCounts);
    fs.writeFileSync('bank_report_summary.txt', JSON.stringify(totalCounts, null, 2));
}

verify();
