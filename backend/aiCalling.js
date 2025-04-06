const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const promptTemplate = (text) => `
You are a professional resume reviewer. Here's a resume text:

---
${text}
---

1. Identify any issues with formatting, clarity, grammar, or content.
2. Suggest improvements to enhance its ATS (Applicant Tracking System) score.
3. Provide an improved version of the resume text (same structure, better wording).

Return the response in this JSON format:
{
  "issues": [],
  "suggestions": [],
  "enhancedResume": ""
}
`;

async function callChatModel(model, prompt) {
  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

async function analyzeResume(text) {
  const prompt = promptTemplate(text);

  let resultText;
  try {
    // Try GPT-4 first
    resultText = await callChatModel("gpt-4", prompt);
  } catch (err) {
    console.warn("GPT-4 failed, trying GPT-3.5...", err.message);
    try {
      resultText = await callChatModel("gpt-3.5-turbo", prompt);
    } catch (err2) {
      console.error("GPT-3.5 also failed:", err2.message);
      return {
        issues: ["Failed to generate resume analysis."],
        suggestions: [],
        enhancedResume: text,
      };
    }
  }

  // Parse the returned text
  try {
    return JSON.parse(resultText);
  } catch (e) {
    console.error("Failed to parse GPT response:", e);
    return {
      issues: ["Invalid format received from AI."],
      suggestions: [],
      enhancedResume: text,
    };
  }
}

module.exports = { analyzeResume };
