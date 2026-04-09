
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyDatdJGGLf7vvyOxIEbJQR_uTMpHQeB0-g';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function testChat() {
    try {
        console.log('Testing chat with key:', API_KEY.substring(0, 10) + '...');
        const result = await model.generateContent("Hello, are you working?");
        const response = result.response.text();
        console.log('Success! Response:', response);
    } catch (error) {
        console.error('Chat Failed:', error.message);
        if (error.message.includes('403')) {
            console.error('Key is invalid or lacks permissions.');
        } else if (error.message.includes('404')) {
            console.error('Model not found (check region/model name).');
        }
    }
}

testChat();
