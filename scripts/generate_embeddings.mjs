/**
 * Embedding Generation Script for Study Materials
 * 
 * This script:
 * 1. Reads study materials from JSON files in data/
 * 2. Generates embeddings using Google Gemini API
 * 3. Upserts vectors to Pinecone for RAG retrieval
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';

// --- Load Environment Variables ---
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

const GEMINI_API_KEY = env['VITE_GEMINI_API_KEY'] || env['VITE_AI_STUDIO_API_KEY'];
const PINECONE_API_KEY = env['VITE_PINECONE_API_KEY'];
const PINECONE_INDEX_NAME = env['VITE_PINECONE_INDEX_NAME'] || 'reforma';

if (!GEMINI_API_KEY || !PINECONE_API_KEY) {
    console.error('❌ Missing required API keys in .env.local');
    console.error('Required: VITE_GEMINI_API_KEY, VITE_PINECONE_API_KEY');
    process.exit(1);
}

// Initialize clients
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX_NAME);

// --- Helper Functions ---

/**
 * Generate embedding for a given text
 */
async function generateEmbedding(text) {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error.message);
        return null;
    }
}

/**
 * Pad embedding vector to match Pinecone dimension requirements
 * Pinecone index expects 1024 dimensions, but text-embedding-004 produces 768
 */
function padEmbedding(embedding, targetDim = 1024) {
    if (embedding.length === targetDim) return embedding;

    const padded = new Array(targetDim).fill(0);
    for (let i = 0; i < Math.min(embedding.length, targetDim); i++) {
        padded[i] = embedding[i];
    }
    return padded;
}

/**
 * Process a single question and create embedding
 */
async function processQuestion(question, course, topic, index) {
    const { question_data } = question;

    // Create rich text for embedding (includes question + options + explanation)
    const embeddingText = `
        Course: ${course}
        Topic: ${topic}
        Question: ${question_data.text}
        Options: ${question_data.options.join(', ')}
        Explanation: ${question_data.explanation || ''}
    `.trim();

    const embedding = await generateEmbedding(embeddingText);

    if (!embedding) {
        console.warn(`⚠️  Failed to generate embedding for question: ${question_data.text.substring(0, 50)}...`);
        return null;
    }

    // Pad embedding to match Pinecone dimensions
    const paddedEmbedding = padEmbedding(embedding);

    return {
        id: `${course.toLowerCase().replace(/\s+/g, '-')}-${topic.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        values: paddedEmbedding,
        metadata: {
            course,
            topic,
            question_text: question_data.text,
            type: 'question',
            source: 'question_bank',
            options: JSON.stringify(question_data.options),
            correct_answer: question_data.correctAnswerIndex,
            explanation: question_data.explanation || ''
        }
    };
}

/**
 * Batch upsert vectors to Pinecone
 */
async function upsertBatch(vectors, namespace = 'questions') {
    if (vectors.length === 0) return;

    try {
        await index.namespace(namespace).upsert(vectors);
        console.log(`✓ Upserted ${vectors.length} vectors to namespace '${namespace}'`);
    } catch (error) {
        console.error(`❌ Error upserting batch:`, error.message);
    }
}

/**
 * Process a JSON file containing questions
 */
async function processQuestionFile(filePath) {
    console.log(`\n📄 Processing: ${path.basename(filePath)}`);

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!Array.isArray(rawData) || rawData.length === 0) {
        console.warn('⚠️  File is empty or invalid format');
        return;
    }

    // Extract course and topic from first question
    const { course, topic } = rawData[0];
    console.log(`   Course: ${course}`);
    console.log(`   Topic: ${topic || 'General'}`);
    console.log(`   Questions: ${rawData.length}`);

    const vectors = [];

    for (let i = 0; i < rawData.length; i++) {
        const question = rawData[i];
        const vector = await processQuestion(question, course, topic, i);

        if (vector) {
            vectors.push(vector);
        }

        // Progress indicator
        if ((i + 1) % 10 === 0) {
            console.log(`   Progress: ${i + 1}/${rawData.length}`);
        }

        // Rate limiting: small delay between API calls
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Upsert in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
        const batch = vectors.slice(i, i + BATCH_SIZE);
        await upsertBatch(batch, 'questions');
    }

    console.log(`✅ Completed: ${vectors.length}/${rawData.length} vectors created`);
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting Embedding Generation Pipeline\n');
    console.log(`📊 Target Index: ${PINECONE_INDEX_NAME}`);
    console.log(`🤖 Embedding Model: text-embedding-004 (768d → padded to 1024d)\n`);

    const dataDir = path.resolve(process.cwd(), 'data');

    // Get all JSON files in data directory
    const files = fs.readdirSync(dataDir)
        .filter(file => file.endsWith('.json') && file !== 'courseContent.ts' && file !== 'mcqData.ts')
        .map(file => path.join(dataDir, file));

    console.log(`📁 Found ${files.length} JSON files to process\n`);

    let totalProcessed = 0;

    for (const file of files) {
        try {
            await processQuestionFile(file);
            totalProcessed++;
        } catch (error) {
            console.error(`❌ Error processing ${path.basename(file)}:`, error.message);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Pipeline Complete!`);
    console.log(`📊 Files Processed: ${totalProcessed}/${files.length}`);
    console.log('='.repeat(60));
    console.log('\nNext Steps:');
    console.log('1. Run: node scripts/test_pinecone.mjs (to verify upload)');
    console.log('2. Test RAG queries in the Study Room');
}

main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
