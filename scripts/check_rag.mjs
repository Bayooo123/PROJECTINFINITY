import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
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
} catch (e) {
    console.error("Could not read .env.local");
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase keys in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMaterials() {
    console.log("Checking 'course_materials' table...");
    const { data, error } = await supabase
        .from('course_materials')
        .select('course, topic, metadata');

    if (error) {
        console.error('Error fetching materials:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log("No documents found in the database.");
        return;
    }

    console.log(`Found ${data.length} total chunks.`);

    // Group by course and topic
    const grouped = {};
    data.forEach(item => {
        const key = `${item.course} | ${item.topic}`;
        if (!grouped[key]) grouped[key] = 0;
        grouped[key]++;
    });

    console.log("\n--- Uploaded Documents Summary ---");
    Object.entries(grouped).forEach(([key, count]) => {
        console.log(`${key} (${count} chunks)`);
    });
}

checkMaterials();
