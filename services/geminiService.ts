import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Challenge, Category } from "../types";

// Fallback if env is missing, though app is designed to work offline mostly.
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const challengeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "Der Titel der Challenge (kurz, imperativ)." },
    description: { type: Type.STRING, description: "Eine kurze Erklärung (1-2 Sätze)." },
    durationSeconds: { type: Type.INTEGER, description: "Dauer in Sekunden (0, 30, 60, 120, 180, 300)." },
    category: { 
      type: Type.STRING, 
      enum: [Category.MOVEMENT, Category.BREATHING, Category.FOCUS, Category.JOURNALING, Category.TIDYING],
      description: "Die Kategorie der Challenge."
    }
  },
  required: ["text", "description", "durationSeconds", "category"]
};

export const generateAiChallenge = async (): Promise<Challenge | null> => {
  if (!API_KEY) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
        responseSchema: challengeSchema,
        systemInstruction: `Du bist ein Coach für Mikro-Gewohnheiten. Erstelle eine EINZIGE, zufällige, sehr einfache 'Micro-Challenge' auf Deutsch.
        Ziel: Produktivität steigern, Stress senken oder Achtsamkeit fördern.
        Wichtig: Es muss sofort machbar sein, ohne Vorbereitung.`,
      },
      contents: [
        { role: 'user', parts: [{ text: "Generiere eine neue Challenge." }] }
      ]
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: `ai-${Date.now()}`,
        text: data.text,
        description: data.description,
        durationSeconds: data.durationSeconds,
        category: data.category as Category,
        isAiGenerated: true
      };
    }
    return null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
