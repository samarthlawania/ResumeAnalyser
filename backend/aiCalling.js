const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config();
const {genAI}  = require('./geminiClient');


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
 async function callGemini(prompt) {

  const model = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  console.log(model.text)
  return model.text; 
}
const promptTemplate = (text) => `
You are a professional resume reviewer. Here's a resume text:

---
${text}
---

1. Identify any issues with formatting, clarity, grammar, or content.
2. Suggest improvements to enhance its ATS (Applicant Tracking System) score.
3. Provide an improved version of the resume text (same structure, better wording).
4.ATS score out of 100
- Feedback on what is missing
- Keywords the resume should include

Return the response in this JSON format:
{
  "issues": [],
  "suggestions": [],
  "enhancedResume": "",
  "atsscorebefore":"",
  "atsscoreafter":""
}
`;




async function analyzeResume(text) {
  const prompt = promptTemplate(text);
  const fallbackResponse = {
    issues: ["Failed to generate resume analysis."],
    suggestions: [],
    enhancedResume: text,
  };

    

  try {
    const geminiResult = await callGemini(prompt);
    return JSON.parse(geminiResult.replace(/^```json\n/, "").replace(/\n```$/, ""));
  } catch (err) {
    console.error("Gemini also failed:", err.message);
    return fallbackResponse;
  } 
}


module.exports = { analyzeResume };
