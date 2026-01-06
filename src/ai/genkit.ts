import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const genaiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!genaiKey) {
  // Fail fast in dev but do not leak secret values
  throw new Error('Missing server-side GOOGLE_GENAI_API_KEY. Set it in your environment variables.');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: genaiKey })],
  model: 'googleai/gemini-2.5-flash',
});
