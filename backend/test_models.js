const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
    const models = ["gemini-2.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"];
    
    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello");
            console.log(`✅ ${m} works! Response: ${result.response.text()}`);
        } catch (e) {
            console.log(`❌ ${m} failed: ${e.status} ${e.statusText}`);
        }
    }
}

testModels();
