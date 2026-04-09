
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyDfAd9YmUhVlbCOM7H341PbdV8oQDqoVZ8';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function testEmbedding() {
    try {
        console.log('Testing embedding with key:', API_KEY.substring(0, 10) + '...');
        const result = await model.embedContent("Hello world");
        const values = result.embedding.values;
        console.log('Success! Embedding generated. Length:', values.length);
    } catch (error) {
        console.error('Embedding Failed:', error.message);
    }
}

testEmbedding();
