const { GoogleGenAI } = require("@google/genai");
 const dotenv = require('dotenv');
dotenv.config();
 const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY });
 //console.log(process.env.GEMINI_API_KEY)


module.exports = { genAI };
