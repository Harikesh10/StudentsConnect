const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent("hello");
        console.log(result.response.text());
    } catch (e) {
        console.error("ERROR", e.status, e.statusText);
    }
}
test();
