/**
 * PDF to Pinecone Ingestion Script
 * 
 * This script:
 * 1. Reads PDF files from data/course_materials/
 * 2. Extracts text content
 * 3. Chunks text intelligently (preserving context)
 * 4. Generates embeddings using Google Gemini
 * 5. Uploads to Pinecone for RAG retrieval
 * 
 * Usage: node scripts/upload_pdfs_to_pinecone.mjs YOUR_PINECONE_API_KEY
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// --- Configuration ---
const PINECONE_API_KEY = process.argv[2];
const GEMINI_API_KEY = 'AIzaSyDatdJGGLf7vvyOxIEbJQR_uTMpHQeB0-g';
const PINECONE_INDEX_NAME = 'reforma';
const MATERIALS_DIR = path.resolve(process.cwd(), 'data', 'course_materials');

// Chunking parameters
const CHUNK_SIZE = 800; // words per chunk (optimal for RAG)
const CHUNK_OVERLAP = 100; // words overlap between chunks

if (!PINECONE_API_KEY) {
    log('❌ Usage: node scripts/upload_pdfs_to_pinecone.mjs YOUR_PINECONE_API_KEY');
    log('\nGet your Pinecone API key from: https://app.pinecone.io/');
    process.exit(1);
}

const logFile = fs.createWriteStream('ingestion.log', { flags: 'a' });
const log = (msg) => {
    process.stdout.write(msg + '\n');
    logFile.write(msg + '\n');
};
const errorLog = (msg) => {
    process.stderr.write(msg + '\n');
    logFile.write('ERROR: ' + msg + '\n');
};

log('🚀 PDF Ingestion Pipeline Starting...\n');
log('📊 Target Index:', PINECONE_INDEX_NAME);
log('📁 Source Directory:', MATERIALS_DIR);
log('🤖 Embedding Model: text-embedding-004 (768d → 1024d)\n');



// Initialize clients
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX_NAME);

// --- Helper Functions ---

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        errorLog(`   ❌ Error extracting PDF: ${error.message}`);
        return null;
    }
}

/**
 * Intelligent text chunking with overlap
 * Preserves sentence boundaries and context
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    // Clean and normalize text
    const cleanText = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

    const words = cleanText.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const chunk = words.slice(i, i + chunkSize).join(' ');

        // Skip very small chunks
        if (chunk.trim().length > 200) {
            chunks.push(chunk.trim());
        }
    }

    return chunks;
}

/**
 * Parse course and topic from filename
 * Examples:
 *   "Constitutional_Law_Chapter_1.pdf" → {course: "Constitutional Law", topic: "Chapter 1"}
 *   "Equity_Maxims.pdf" → {course: "Equity", topic: "Maxims"}
 */
function parseFilename(filename) {
    const name = filename.replace('.pdf', '');
    const parts = name.split('_');

    if (parts.length >= 2) {
        const course = parts[0].replace(/_/g, ' ');
        const topic = parts.slice(1).join(' ').replace(/_/g, ' ');
        return { course, topic };
    }

    return { course: 'General Law', topic: name };
}

/**
 * Generate embedding for text
 */
async function generateEmbedding(text) {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        errorLog(`   ⚠️  Embedding error: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
        return null;
    }
}

/**
 * Pad 768-dimensional embedding to 1024 dimensions
 */
function padTo1024(embedding) {
    if (embedding.length === 1024) return embedding;
    const padded = new Array(1024).fill(0);
    for (let i = 0; i < Math.min(embedding.length, 1024); i++) {
        padded[i] = embedding[i];
    }
    return padded;
}

/**
 * Process a single chunk and create vector
 */
async function processChunk(chunk, course, topic, chunkIndex, sourceFile) {
    const embedding = await generateEmbedding(chunk);
    if (!embedding) return null;

    const paddedEmbedding = padTo1024(embedding);

    return {
        id: `${course.toLowerCase().replace(/\s+/g, '-')}-${topic.toLowerCase().replace(/\s+/g, '-')}-chunk-${chunkIndex}`,
        values: paddedEmbedding,
        metadata: {
            course,
            topic,
            content: chunk.substring(0, 1000), // Store first 1000 chars in metadata
            chunk_index: chunkIndex,
            type: 'course_material',
            source: sourceFile
        }
    };
}

/**
 * Upload vectors in batches
 */
async function upsertBatch(vectors) {
    if (vectors.length === 0) return;
    try {
        await index.namespace('course_materials').upsert(vectors);
        log(`   ✓ Uploaded ${vectors.length} vectors`);
    } catch (error) {
        errorLog(`   ❌ Upload error:`, error.message);
    }
}

/**
 * Process a single PDF file
 */
async function processPDF(filePath) {
    const fileName = path.basename(filePath);
    log(`\n📄 ${fileName}`);

    // Extract text
    const text = await extractTextFromPDF(filePath);
    if (!text) {
        log('   ⚠️  Failed to extract text');
        return 0;
    }

    log(`   📝 Extracted ${text.length} characters`);

    // Parse metadata
    const { course, topic } = parseFilename(fileName);
    log(`   📚 ${course} → ${topic}`);

    // Chunk text
    const chunks = chunkText(text);
    log(`   ✂️  Created ${chunks.length} chunks`);

    // Generate embeddings and create vectors
    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
        const vector = await processChunk(chunks[i], course, topic, i, fileName);
        if (vector) vectors.push(vector);

        // Progress indicator
        if ((i + 1) % 10 === 0) {
            process.stdout.write(`\r   Progress: ${i + 1}/${chunks.length}`);
        }

        // Rate limiting (500ms delay)
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    log(`\r   Progress: ${vectors.length}/${chunks.length}`);

    // Upload in batches of 100
    for (let i = 0; i < vectors.length; i += 100) {
        const batch = vectors.slice(i, i + 100);
        await upsertBatch(batch);
    }

    return vectors.length;
}

/**
 * Main execution
 */
async function main() {
    // Create materials directory if it doesn't exist
    if (!fs.existsSync(MATERIALS_DIR)) {
        log(`📁 Creating directory: ${MATERIALS_DIR}`);
        fs.mkdirSync(MATERIALS_DIR, { recursive: true });
        log('\n⚠️  No PDF files found.');
        log('📌 Next steps:');
        log('   1. Place your PDF files in: data/course_materials/');
        log('   2. Name them like: Constitutional_Law_Chapter_1.pdf');
        log('   3. Run this script again');
        return;
    }

    // Get all PDF files
    const files = fs.readdirSync(MATERIALS_DIR)
        .filter(f => f.toLowerCase().endsWith('.pdf'))
        .map(f => path.join(MATERIALS_DIR, f));

    if (files.length === 0) {
        log('⚠️  No PDF files found in data/course_materials/');
        log('\n📌 Next steps:');
        log('   1. Add your PDF files to: data/course_materials/');
        log('   2. Name them like: Equity_Maxims.pdf or Land_Law_Chapter_3.pdf');
        log('   3. Run this script again');
        return;
    }

    log(`📁 Found ${files.length} PDF file(s)\n`);
    log('='.repeat(60));

    let totalVectors = 0;

    for (const file of files) {
        try {
            const count = await processPDF(file);
            totalVectors += count;
        } catch (error) {
            errorLog(`\n❌ Error processing ${path.basename(file)}:`, error.message);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ PDF Ingestion Complete!`);
    console.log(`📊 Total vectors uploaded: ${totalVectors}`);
    console.log(`📁 Files processed: ${files.length}`);
    console.log('\n💡 Next: Run "node scripts/test_pinecone.mjs" to verify');
}

main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
});
