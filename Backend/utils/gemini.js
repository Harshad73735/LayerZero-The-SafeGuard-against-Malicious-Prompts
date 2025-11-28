import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});


const getGeminiResponse = async (message) => {
    try {
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "API request failed.";
    }
    };
    
export default getGeminiResponse;