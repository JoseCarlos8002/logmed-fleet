
import { GoogleGenAI } from "@google/genai";

export async function analyzeFleetStatus(fleetSummary: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing");
    return "Análise indisponível (Chave de API ausente).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Analise o seguinte resumo da frota logística hospitalar e sugira 3 ações de otimização:\n\n${fleetSummary}`,
      config: {
        systemInstruction: "Você é um especialista em logística hospitalar. Seja direto, prático e focado em eficiência e redução de custos.",
      },
    });
    return response.text();
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "Não foi possível realizar a análise no momento.";
  }
}
