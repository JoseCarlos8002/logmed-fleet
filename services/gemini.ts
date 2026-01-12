
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeFleetStatus(fleetSummary: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise o seguinte resumo da frota logística hospitalar e sugira 3 ações de otimização:\n\n${fleetSummary}`,
      config: {
        systemInstruction: "Você é um especialista em logística hospitalar. Seja direto, prático e focado em eficiência e redução de custos.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "Não foi possível realizar a análise no momento.";
  }
}
