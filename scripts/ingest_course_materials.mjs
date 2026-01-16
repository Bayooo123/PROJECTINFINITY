import { upsertCourseMaterials } from '../services/pineconeService.js';
import { generateEmbedding } from '../services/geminiService.js';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Intelligent Document Chunking Script
 * 
 * This script reads PDF/TXT files from data/course_materials/
 * and chunks them into optimal sizes for RAG retrieval.
 * 
 * Usage:
 *   node scripts/ingest_course_materials.mjs
 */

const MATERIALS_DIR = path.resolve(process.cwd(), 'data', 'course_materials');
const CHUNK_SIZE = 600; // words per chunk
const CHUNK_OVERLAP = 50; // words overlap between chunks

/**
 * Simple text chunker (works with .txt files)
 * For PDF support, you'd integrate pdf-parse or similar
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim().length > 100) { // Skip very small chunks
            chunks.push(chunk);
        }
    }

    return chunks;
}

/**
 * Extract course and topic from filename
 * Example: "Constitutional_Law_Separation_of_Powers.txt"
 */
function parseFilename(filename) {
    const parts = filename.replace('.txt', '').split('_');

    // Assume format: Course_Topic.txt or Course_Topic_Subtopic.txt
    if (parts.length >= 2) {
        const course = parts[0].replace(/_/g, ' ');
        const topic = parts.slice(1).join(' ').replace(/_/g, ' ');
        return { course, topic };
    }

    return { course: 'General', topic: filename };
}

async function ingestMaterials() {
    console.log('📚 Starting Course Materials Ingestion...\n');

    if (!fs.existsSync(MATERIALS_DIR)) {
        console.log(`Creating directory: ${MATERIALS_DIR}`);
        fs.mkdirSync(MATERIALS_DIR, { recursive: true });
        console.log('\n⚠️  No materials found. Please add .txt files to data/course_materials/');
        console.log('   Example: data/course_materials/Constitutional_Law_Separation_of_Powers.txt');
        return;
    }

    const files = fs.readdirSync(MATERIALS_DIR).filter(f => f.endsWith('.txt'));

    if (files.length === 0) {
        console.log('⚠️  No .txt files found in data/course_materials/');
        console.log('   Please add course material files and try again.');
        return;
    }

    console.log(`Found ${files.length} material file(s)\n`);

    let totalChunks = 0;

    for (const file of files) {
        console.log(`Processing: ${file}`);
        const filePath = path.join(MATERIALS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        const { course, topic } = parseFilename(file);
        const chunks = chunkText(content);

        console.log(`  Course: ${course}`);
        console.log(`  Topic: ${topic}`);
        console.log(`  Chunks: ${chunks.length}`);

        // Prepare materials for Pinecone
        const materials = chunks.map((chunk, index) => ({
            id: `mat_${uuidv4()}`,
            course,
            topic,
            content: chunk,
            chunkIndex: index,
            source: file
        }));

        // Batch upsert (100 at a time to avoid rate limits)
        const batchSize = 100;
        for (let i = 0; i < materials.length; i += batchSize) {
            const batch = materials.slice(i, i + batchSize);
            await upsertCourseMaterials(batch);
            console.log(`  ✓ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(materials.length / batchSize)}`);
        }

        totalChunks += chunks.length;
        console.log();
    }

    console.log(`\n✅ Ingestion complete!`);
    console.log(`   Total chunks uploaded: ${totalChunks}`);
    console.log(`   Files processed: ${files.length}`);
}

ingestMaterials().catch(console.error);
