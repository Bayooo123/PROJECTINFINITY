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

const PINECONE_API_KEY = process.argv[2] || env['VITE_PINECONE_API_KEY'];
const PINECONE_INDEX_NAME = env['VITE_PINECONE_INDEX_NAME'] || 'reforma';

if (!PINECONE_API_KEY) {
    console.error('❌ VITE_PINECONE_API_KEY not found in .env.local');
    process.exit(1);
}

async function testPinecone() {
    try {
        console.log('🔍 Testing Pinecone connection...\n');

        // Initialize client
        const pinecone = new Pinecone({
            apiKey: PINECONE_API_KEY
        });

        console.log('✓ Connected to Pinecone');

        // Get index
        const index = pinecone.index(PINECONE_INDEX_NAME);
        console.log(`✓ Index '${PINECONE_INDEX_NAME}' initialized`);

        // Get stats
        const stats = await index.describeIndexStats();
        console.log(`✓ Index stats:`, JSON.stringify(stats, null, 2));
        fs.writeFileSync('stats.json', JSON.stringify(stats, null, 2));

        console.log('\n✅ Pinecone connection successful!');
        console.log('\nNext steps:');
        console.log('1. Run ingestion scripts to populate the index');
        console.log('2. Test RAG queries in the Study Room');

    } catch (error) {
        console.error('❌ Pinecone connection failed:', error.message);
        process.exit(1);
    }
}

testPinecone();
