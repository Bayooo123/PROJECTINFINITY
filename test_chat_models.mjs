
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyDfAd9YmUhVlbCOM7H341PbdV8oQDqoVZ8';
const genAI = new GoogleGenerativeAI(API_KEY);

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ ${modelName} Success:`, result.response.text());
        return true;
    } catch (error) {
        console.error(`❌ ${modelName} Failed:`, error.message);
        return false;
    }
}

async function runTests() {
    await testModel("gemini-2.0-flash-exp");
    await testModel("gemini-1.5-flash");
    await testModel("gemini-pro");
}

runTests();
