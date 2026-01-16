import { upsertPastQuestions } from '../services/pineconeService.js';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Past Questions Ingestion Script
 * 
 * This script reads JSON files from data/past_questions/
 * and uploads them to Pinecone for exam pattern analysis.
 * 
 * Expected JSON format:
 * [
 *   {
 *     "course": "Constitutional Law",
 *     "year": "2023",
 *     "section": "Section A",
 *     "question_text": "Discuss the doctrine of separation of powers..."
 *   }
 * ]
 * 
 * Usage:
 *   node scripts/ingest_past_questions.mjs
 */

const QUESTIONS_DIR = path.resolve(process.cwd(), 'data', 'past_questions');

async function ingestPastQuestions() {
    console.log('📝 Starting Past Questions Ingestion...\n');

    if (!fs.existsSync(QUESTIONS_DIR)) {
        console.log(`Creating directory: ${QUESTIONS_DIR}`);
        fs.mkdirSync(QUESTIONS_DIR, { recursive: true });
        console.log('\n⚠️  No past questions found. Please add JSON files to data/past_questions/');
        console.log('   Example: data/past_questions/constitutional_law_2023.json');
        return;
    }

    const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.log('⚠️  No .json files found in data/past_questions/');
        console.log('   Please add past question files and try again.');
        return;
    }

    console.log(`Found ${files.length} question file(s)\n`);

    let totalQuestions = 0;

    for (const file of files) {
        console.log(`Processing: ${file}`);
        const filePath = path.join(QUESTIONS_DIR, file);
        const rawData = fs.readFileSync(filePath, 'utf-8');

        let questions;
        try {
            questions = JSON.parse(rawData);
        } catch (error) {
            console.error(`  ❌ Invalid JSON in ${file}`);
            continue;
        }

        if (!Array.isArray(questions)) {
            console.error(`  ❌ Expected array in ${file}`);
            continue;
        }

        console.log(`  Questions: ${questions.length}`);

        // Prepare questions for Pinecone
        const formattedQuestions = questions.map(q => ({
            id: `pq_${uuidv4()}`,
            course: q.course || 'Unknown',
            year: q.year || 'Unknown',
            questionText: q.question_text || q.text || '',
            section: q.section || 'General'
        }));

        // Batch upsert (100 at a time)
        const batchSize = 100;
        for (let i = 0; i < formattedQuestions.length; i += batchSize) {
            const batch = formattedQuestions.slice(i, i + batchSize);
            await upsertPastQuestions(batch);
            console.log(`  ✓ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(formattedQuestions.length / batchSize)}`);
        }

        totalQuestions += questions.length;
        console.log();
    }

    console.log(`\n✅ Ingestion complete!`);
    console.log(`   Total questions uploaded: ${totalQuestions}`);
    console.log(`   Files processed: ${files.length}`);
}

ingestPastQuestions().catch(console.error);
