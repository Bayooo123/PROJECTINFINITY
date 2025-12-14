
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = '';
let envContent = '';

try {
    envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key === 'VITE_AI_STUDIO_API_KEY') apiKey = value;
        }
    });
} catch (e) {
    console.error("Could not read .env.local");
}

if (!apiKey) {
    console.error('MISSING: VITE_AI_STUDIO_API_KEY in .env.local');
    // Check for VITE_GEMINI_API_KEY
    if (envContent.includes('VITE_GEMINI_API_KEY=')) {
        console.log('FOUND: VITE_GEMINI_API_KEY (can use as fallback)');

        // Extract it to test if it works with the model
        const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
        if (match) {
            apiKey = match[1].trim();
            console.log("Attempting to use VITE_GEMINI_API_KEY for testing...");
        }
    } else {
        console.error('MISSING: VITE_GEMINI_API_KEY also missing');
    }
} else {
    console.log('FOUND: VITE_AI_STUDIO_API_KEY');
}

async function testGen() {
    if (!apiKey) return;

    const aiStudio = new GoogleGenerativeAI(apiKey);
    const model = aiStudio.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    console.log("Attempting to generate 1 question...");
    const prompt = `Generate 1 multiple-choice question on Nigerian Constitutional Law. Return ONLY JSON array: [{"id":"1", "text": "...", "options": ["..."], "correctAnswer": 0, "explanation": "..."}]`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("Generation Success!");
        console.log("Output:", text.substring(0, 200) + "...");
    } catch (e) {
        // Simulate the service logic here to verify it works
        const errorMsg = e.toString().toLowerCase();
        const isRateLimit = errorMsg.includes('429') ||
            errorMsg.includes('quota') ||
            errorMsg.includes('resource exhausted');

        if (isRateLimit) {
            console.log("\n[VERIFIED] Caught Rate Limit Error:");
            console.log(" -> 'Service is currently busy (Rate Limit). Please wait a minute and try again.'");
        } else {
            console.error("Generation FAILED (Other):", e.message);
        }
    }
}

testGen();
