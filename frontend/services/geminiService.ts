import { GoogleGenerativeAI } from "@google/generative-ai";
/* 
// The API key is obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenerativeAI({ apiKey: process.env.API_KEY });

export const getFinancialTip = async (context: 'auth' | 'dashboard' = 'auth') => {
  try {
    const prompt = context === 'dashboard' 
      ? 'Give me one short, advanced financial tip for wealth building. Max 15 words.'
      : 'Give me one short, encouraging financial tip for someone starting out. Max 15 words.';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });
    
    // Accessing .text property directly as per SDK requirements
    return response.text || "Track every dollar to master your financial future.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Consistently saving small amounts leads to large wealth over time.";
  }
};
 */