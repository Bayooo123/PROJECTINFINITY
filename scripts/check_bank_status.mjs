
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
                    // Remove quotes if present
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

async function checkStatus() {
    console.log("--- LEARNED QUESTION BANK STATUS ---");

    const { data: rows, error } = await supabase
        .from('question_bank')
        .select('course, topic');

    if (error) {
        console.error("Error fetching bank status:", error.message);
        return;
    }

    const total = rows.length;
    console.log(`Total Questions in Bank: ${total}`);

    const breakdown = rows.reduce((acc, curr) => {
        acc[curr.course] = acc[curr.course] || {};
        acc[curr.course][curr.topic] = (acc[curr.course][curr.topic] || 0) + 1;
        return acc;
    }, {});

    console.log("\nDetailed Breakdown:");
    if (total === 0) {
        console.log("  (Bank is currently empty)");
    } else {
        for (const [course, topics] of Object.entries(breakdown)) {
            console.log(`\n[${course}]`);
            for (const [topic, count] of Object.entries(topics)) {
                const progress = (count / 20) * 100;
                const bar = "█".repeat(Math.round(progress / 10)) + "░".repeat(10 - Math.round(progress / 10));
                console.log(`  - ${topic.padEnd(35)}: ${count}/20 [${bar}] ${progress.toFixed(0)}%`);
            }
        }
    }

    console.log("\n------------------------------------");
}

checkStatus();
