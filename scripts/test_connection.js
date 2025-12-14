
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

console.log(`URL Found: ${supabaseUrl}`);
// console.log(`Key Found: ${supabaseKey ? 'Yes (Hidden)' : 'No'}`);

async function testConnection() {
    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing credentials.");
        return;
    }

    try {
        // Try a simple fetch to the health endpoint or root
        console.log("Pinging Supabase URL...");
        const response = await fetch(`${supabaseUrl}/rest/v1/`, { // checking rest endpoint
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        console.log(`Response Status: ${response.status}`);
        if (response.ok) {
            console.log("Connection Successful!");
        } else {
            console.log("Connection Failed (HTTP Error).");
            const text = await response.text();
            console.log("Response:", text);
        }

    } catch (e) {
        console.error("FETCH ERROR:", e.code || e.message);
        if (e.cause) console.error("Cause:", e.cause);
    }
}

testConnection();
