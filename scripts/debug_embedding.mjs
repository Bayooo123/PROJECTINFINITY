
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyCYI_yxVzfdaTFgg_vmZqtmiJn3s_3MFqQ';

async function testEmbedding() {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        console.log('Testing embedding...');
        const result = await model.embedContent("Hello world");
        console.log('Embedding success! Vector length:', result.embedding.values.length);
    } catch (error) {
        console.error('Embedding failed:', error.message);
    }
}

testEmbedding();
