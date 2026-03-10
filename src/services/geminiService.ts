import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getAiInstance() {
  if (!aiInstance) {
    // Check window.__GEMINI_API_KEY__ first (injected by server in production), then fallback to process.env (Vite dev)
    let apiKey = (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__) || process.env.GEMINI_API_KEY;
    
    // Defensive check for common issues
    if (typeof apiKey === 'string') {
      apiKey = apiKey.trim();
      
      // Remove surrounding quotes if any
      apiKey = apiKey.replace(/^["']|["']$/g, '');
      
      // Fix common copy-paste errors (e.g. leading 'y' as seen in some deployment commands)
      if (apiKey.startsWith('yAIza')) {
        console.warn('Detected potentially invalid leading "y" in Gemini API key. Stripping it.');
        apiKey = apiKey.substring(1);
      }

      // Handle common placeholder or accidental stringified values
      if (apiKey === 'undefined' || apiKey === 'null' || apiKey === '' || apiKey.includes('YOUR_API_KEY')) {
        apiKey = undefined;
      }
    }

    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing or invalid. Please ensure it is set in your environment variables.');
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}
