/**
 * Simple Material Ingestion Script
 * 
 * This script uploads your existing JSON question files to Pinecone
 * WITHOUT needing the Pinecone API key in .env.local
 * 
 * Usage: node scripts/upload_to_pinecone.mjs YOUR_PINECONE_API_KEY
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';

// --- Get API Keys ---
const PINECONE_API_KEY = process.argv[2];
const GEMINI_API_KEY = 'AIzaSyCYI_yxVzfdaTFgg_vmZqtmiJn3s_3MFqQ'; // From your .env.local

if (!PINECONE_API_KEY) {
    console.log('❌ Usage: node scripts/upload_to_pinecone.mjs YOUR_PINECONE_API_KEY');
    console.log('\nGet your Pinecone API key from: https://app.pinecone.io/');
    process.exit(1);
}

const PINECONE_INDEX_NAME = 'reforma';

console.log('🚀 Initializing...\n');
console.log('📊 Target Index:', PINECONE_INDEX_NAME);
console.log('🤖 Embedding Model: text-embedding-004 (768 dimensions)\n');

// Initialize clients
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX_NAME);

// --- Helper Functions ---

async function generateEmbedding(text) {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('⚠️  Embedding error:', error.message);
        return null;
    }
}

function padTo1024(embedding) {
    if (embedding.length === 1024) return embedding;
    const padded = new Array(1024).fill(0);
    for (let i = 0; i < Math.min(embedding.length, 1024); i++) {
        padded[i] = embedding[i];
    }
    return padded;
}

async function processQuestion(question, course, topic, index) {
    const { question_data } = question;

    const embeddingText = `
Course: ${course}
Topic: ${topic}
Question: ${question_data.text}
Options: ${question_data.options.join(', ')}
Explanation: ${question_data.explanation || ''}
    `.trim();

    const embedding = await generateEmbedding(embeddingText);
    if (!embedding) return null;

    const paddedEmbedding = padTo1024(embedding);

    return {
        id: `${course.toLowerCase().replace(/\s+/g, '-')}-${topic.toLowerCase().replace(/\s+/g, '-')}-${index}`,
        values: paddedEmbedding,
        metadata: {
            course,
            topic,
            question_text: question_data.text,
            type: 'question',
            source: 'question_bank',
            correct_answer: question_data.correctAnswerIndex,
            explanation: question_data.explanation || ''
        }
    };
}

async function upsertBatch(vectors) {
    if (vectors.length === 0) return;
    try {
        await index.namespace('questions').upsert(vectors);
        console.log(`   ✓ Uploaded ${vectors.length} vectors`);
    } catch (error) {
        console.error(`   ❌ Upload error:`, error.message);
    }
}

async function processFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 ${fileName}`);

    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (!Array.isArray(rawData) || rawData.length === 0) {
        console.log('   ⚠️  Empty or invalid file');
        return 0;
    }

    const { course, topic } = rawData[0];
    console.log(`   📚 ${course} → ${topic || 'General'}`);
    console.log(`   📝 ${rawData.length} questions`);

    const vectors = [];

    for (let i = 0; i < rawData.length; i++) {
        const vector = await processQuestion(rawData[i], course, topic, i);
        if (vector) vectors.push(vector);

        if ((i + 1) % 10 === 0) {
            process.stdout.write(`\r   Progress: ${i + 1}/${rawData.length}`);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\r   Progress: ${vectors.length}/${rawData.length}`);

    // Upload in batches of 100
    for (let i = 0; i < vectors.length; i += 100) {
        const batch = vectors.slice(i, i + 100);
        await upsertBatch(batch);
    }

    return vectors.length;
}

async function main() {
    const dataDir = path.resolve(process.cwd(), 'data');

    const files = fs.readdirSync(dataDir)
        .filter(f => f.endsWith('.json') && f !== 'courseContent.ts' && f !== 'mcqData.ts')
        .map(f => path.join(dataDir, f));

    console.log(`📁 Found ${files.length} JSON files\n`);
    console.log('='.repeat(60));

    let totalUploaded = 0;

    for (const file of files) {
        try {
            const count = await processFile(file);
            totalUploaded += count;
        } catch (error) {
            console.error(`\n❌ Error processing ${path.basename(file)}:`, error.message);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Upload Complete!`);
    console.log(`📊 Total vectors uploaded: ${totalUploaded}`);
    console.log(`📁 Files processed: ${files.length}`);
    console.log('\n💡 Next: Run "node scripts/test_pinecone.mjs" to verify');
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
});
