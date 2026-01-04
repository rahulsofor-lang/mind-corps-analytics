
import { GoogleGenAI } from "@google/genai";

export const analyzeDataWithGemini = async (dashboardData: any) => {
  try {
    // Correctly initialize with the named parameter and direct process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following business dashboard data and provide 3 key insights and 1 recommendation in a concise bullet-point format. 
      Data: ${JSON.stringify(dashboardData)}`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    // Extracting text output from response using the .text property.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate AI insights at this time. Please check your API key configuration.";
  }
};
