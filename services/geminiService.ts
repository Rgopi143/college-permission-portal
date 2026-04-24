
import { GoogleGenAI } from "@google/genai";
import { WorkflowRequest } from "../types";

export class GeminiService {
  constructor() {
    // We no longer initialize the AI client in the constructor to ensure 
    // the most up-to-date API key is used when requests are made.
  }

  async analyzeRequests(requests: WorkflowRequest[]): Promise<string> {
    const summary = requests.map(r => `${r.type}: ${r.reason} (${r.status})`).join('\n');
    
    try {
      // Use the provided Supabase API key
      const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96amphYWZreWJhZ3ZrZGJhamh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzYyMTYsImV4cCI6MjA5MjE1MjIxNn0.3PH4A3a8U1ZmXJbtMXPclky1EQwq41s9-VInJwBLdwg";
      const ai = new GoogleGenAI({ apiKey });
      // Use 'gemini-3-flash-preview' for basic text summarization tasks.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these college approval requests and provide a one-paragraph summary of the common trends or issues: \n${summary}`,
        config: {
          // Setting thinkingBudget to 0 for low-latency tasks that don't require complex reasoning.
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      // Access the generated text directly via the .text property.
      return response.text || "Unable to generate insight at this time.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "AI Insight temporarily unavailable.";
    }
  }

  async getSmartReasoning(reason: string): Promise<string> {
    try {
      // Create a fresh instance for each request to ensure the active API key is picked up.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Use 'gemini-3-flash-preview' for quick evaluations of text input.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `The following is a student's reason for a permission request. Briefly evaluate if this sounds like a legitimate academic or emergency concern: "${reason}"`,
      });
      // Access the generated text directly via the .text property.
      return response.text || "No specific insight.";
    } catch (error) {
      return "Insight unavailable.";
    }
  }
}

export const geminiService = new GeminiService();
