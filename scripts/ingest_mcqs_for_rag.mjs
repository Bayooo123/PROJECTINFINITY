import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
const GEMINI_API_KEY = env['VITE_GEMINI_API_KEY'];
const PINECONE_INDEX_NAME = env['VITE_PINECONE_INDEX_NAME'] || 'reforma';
const DATA_DIR = path.resolve(process.cwd(), 'data');

if (!PINECONE_API_KEY || !GEMINI_API_KEY) {
    console.error('❌ API keys missing in .env.local');
    process.exit(1);
}

// Initialize clients
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX_NAME);

/**
 * Pad 768-dimensional Gemini embeddings to 1024 dimensions
 */
function padTo1024(embedding) {
    if (embedding.length === 1024) return embedding;
    const padded = new Array(1024).fill(0);
    for (let i = 0; i < Math.min(embedding.length, 1024); i++) {
        padded[i] = embedding[i];
    }
    return padded;
}

async function generateEmbedding(text) {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error(`  ⚠️  Embedding error:`, error.message);
        return null;
    }
}

async function ingestMCQs() {
    console.log('🚀 MCQ Ingestion for RAG Starting...\n');

    const files = fs.readdirSync(DATA_DIR)
        .filter(f => f.endsWith('_batch.json'));

    if (files.length === 0) {
        console.log('⚠️  No *_batch.json files found in data/');
        return;
    }

    console.log(`📁 Found ${files.length} MCQ batch files\n`);

    let totalUploaded = 0;

    for (const file of files) {
        console.log(`Processing: ${file}`);
        const rawData = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
        let data;
        try {
            data = JSON.parse(rawData);
        } catch (e) {
            console.error(`  ❌ Invalid JSON in ${file}`);
            continue;
        }

        if (!Array.isArray(data)) continue;

        const vectors = [];
        for (const item of data) {
            const course = item.course || 'General';
            const topic = item.topic || 'General';
            const questionText = item.question_data?.text || item.text;

            if (!questionText) continue;

            const embedding = await generateEmbedding(questionText);
            if (!embedding) continue;

            vectors.push({
                id: `mcq_${uuidv4()}`,
                values: padTo1024(embedding),
                metadata: {
                    type: 'past_question', // Use same type for RAG compatibility
                    course,
                    topic,
                    question_text: questionText,
                    source: file
                }
            });

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));

            if (vectors.length >= 50) {
                await index.upsert(vectors);
                totalUploaded += vectors.length;
                console.log(`   ✓ Uploaded ${vectors.length} vectors (Total: ${totalUploaded})`);
                vectors.length = 0;
            }
        }

        if (vectors.length > 0) {
            await index.upsert(vectors);
            totalUploaded += vectors.length;
            console.log(`   ✓ Uploaded ${vectors.length} vectors (Total: ${totalUploaded})`);
        }
    }

    console.log(`\n✅ Ingestion Complete! Total vectors: ${totalUploaded}`);
}

ingestMCQs().catch(console.error);
