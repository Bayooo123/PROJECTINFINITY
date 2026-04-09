import { Pinecone } from '@pinecone-database/pinecone';
import * as fs from 'fs';
import * as path from 'path';

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

const PINECONE_API_KEY = env['VITE_PINECONE_API_KEY'];
const PINECONE_INDEX_NAME = env['VITE_PINECONE_INDEX_NAME'] || 'reforma';

async function testSearch() {
    try {
        const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
        const index = pinecone.index(PINECONE_INDEX_NAME);

        console.log('--- Test 1: 768-D Query ---');
        const dummy768 = new Array(768).fill(0.1);
        try {
            const results = await index.namespace('course_materials').query({
                vector: dummy768,
                topK: 1
            });
            console.log('✓ 768-D Search successful! Results:', results.matches.length);
        } catch (err) {
            console.log('❌ 768-D Search failed:', err.message);
        }

        console.log('\n--- Test 2: 1024-D Query ---');
        const dummy1024 = new Array(1024).fill(0);
        for (let i = 0; i < 768; i++) dummy1024[i] = 0.1;
        try {
            const results = await index.namespace('course_materials').query({
                vector: dummy1024,
                topK: 1
            });
            console.log('✓ 1024-D Search successful! Results:', results.matches.length);
        } catch (err) {
            console.log('❌ 1024-D Search failed:', err.message);
        }

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

testSearch();
