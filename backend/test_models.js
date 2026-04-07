const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const fs = require('fs');

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        fs.writeFileSync('models.json', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("ERROR", e);
    }
}
test();
