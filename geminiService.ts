
import { GoogleGenAI, Type } from "@google/genai";
import { ExamType, ExamStage, Question } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (
  exam: ExamType,
  stage: ExamStage,
  count: number = 10
): Promise<Question[]> => {
  const model = "gemini-3-flash-preview";

  const prompt = `Generate a practice quiz for ${exam} ${stage}. 
    Focus on the relevant syllabus:
    - If NTPC: General Awareness, Mathematics, and General Intelligence & Reasoning.
    - If JE Civil CBT 1: Mathematics, General Intelligence & Reasoning, General Awareness, and General Science.
    - If JE Civil CBT 2: Civil Engineering Technical subjects (Strength of Materials, Surveying, RCC, Fluid Mechanics, Steel, Highway), General Awareness, Environment, and Basics of Computers.
    
    Provide ${count} multiple-choice questions. Ensure they vary in difficulty and are based on previous year patterns.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Four options for the multiple-choice question"
            },
            correctAnswer: { 
              type: Type.INTEGER,
              description: "Index (0-3) of the correct answer in the options array"
            },
            explanation: { type: Type.STRING },
            subject: { type: Type.STRING }
          },
          required: ["id", "question", "options", "correctAnswer", "explanation", "subject"]
        }
      }
    }
  });

  try {
    const questions = JSON.parse(response.text || "[]");
    return questions;
  } catch (error) {
    console.error("Failed to parse quiz response:", error);
    return [];
  }
};
