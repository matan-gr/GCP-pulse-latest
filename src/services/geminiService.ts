import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getAiInstance() {
  if (!aiInstance) {
    // Check window.__GEMINI_API_KEY__ first (injected by server in production), then fallback to process.env (Vite dev)
    const apiKey = (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__) || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}
