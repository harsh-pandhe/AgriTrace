import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: 'AIzaSyBfbWa1DGSoHNTsKoQxeH9DZJHhMnPPtFM' }), // <--- Paste your actual key string here directly
  ],
});