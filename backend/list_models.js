require('dotenv').config();

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        const models = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent')).map(m => m.name);
        console.log("Available generateContent models:");
        console.log(models);
    } catch(e) {
        console.error(e);
    }
}
listModels();
