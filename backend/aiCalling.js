const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config();
const {genAI}  = require('./geminiClient');


// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
 async function callGemini(prompt) {

  const model = await genAI.models.generateContent({
    model: "gemini-1.5-pro",
    contents: prompt,
  });

  console.log(model.text)
  return model.text; 
}
const promptTemplate = (text) => `
You are an expert resume reviewer and ATS specialist.

Given the following resume text:

---
${text}
---

Perform the following tasks **without adding any new skills, projects, or roles** that are not explicitly mentioned:

1. Identify formatting, clarity, grammar, or content issues.
2. Suggest improvements specifically aimed at increasing ATS (Applicant Tracking System) compatibility. Base these on real-world ATS keyword requirements for relevant job roles (e.g., software engineer, data analyst).
3. Rewrite the resume text with better structure, wording, and ATS optimization — but **only using the information already present** in the original text.
4. Evaluate the resume's ATS score **before and after** improvements, out of 100.

Output the response in the following JSON format:

{
  "issues": [],
  "suggestions": [],
  "enhancedResume": "",
  "atsscorebefore": "",
  "atsscoreafter": "",
  "missingElements": [],
  "recommendedKeywords": []
}

Constraints:
- Do not invent or assume any experiences, skills, or qualifications.
- Be concise and professional in your feedback.
- Only analyze and suggest — never fabricate
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
