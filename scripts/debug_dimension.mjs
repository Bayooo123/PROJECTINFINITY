import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from '../services/geminiService.js';
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

// Copy env to process.env for geminiService if needed
Object.keys(env).forEach(key => {
    if (!process.env[key]) process.env[key] = env[key];
});

// Mock import.meta.env for geminiService (which might be using Vite globals)
if (typeof import.meta === 'undefined') {
    // This is tricky in Node.js without ESM support for import.meta.env
}

const PINECONE_API_KEY = env['VITE_PINECONE_API_KEY'];
const PINECONE_INDEX_NAME = env['VITE_PINECONE_INDEX_NAME'] || 'reforma';

async function testSearch() {
    try {
        const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
        const index = pinecone.index(PINECONE_INDEX_NAME);

        console.log('Generating 768-D embedding...');
        const dummyEmbedding = new Array(768).fill(0.1);

        console.log(`Querying index '${PINECONE_INDEX_NAME}' with 768-D vector...`);
        try {
            const results = await index.namespace('course_materials').query({
                vector: dummyEmbedding,
                topK: 1,
                includeMetadata: true
            });
            console.log('✓ Search successful! Results:', results.matches.length);
        } catch (err) {
            console.log('❌ Search failed as expected:', err.message);
        }

        console.log('\nQuerying with 1024-D padded vector...');
        const paddedEmbedding = new Array(1024).fill(0);
        for (let i = 0; i < 768; i++) paddedEmbedding[i] = 0.1;

        try {
            const results = await index.namespace('course_materials').query({
                vector: paddedEmbedding,
                topK: 1,
                includeMetadata: true
            });
            console.log('✓ Search successful with 1024-D! Results:', results.matches.length);
        } catch (err) {
            console.log('❌ Search with 1024-D also failed:', err.message);
        }

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

testSearch();
