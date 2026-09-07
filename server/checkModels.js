import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
  console.log('⚠️ GEMINI_API_KEY is missing or set to placeholder in server/.env');
  console.log('Please paste your valid Gemini API key into server/.env to run model auto-detection.');
  process.exit(1);
}

async function listAvailableModels() {
  try {
    console.log('🔍 Querying Google Gemini API for available models...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || `HTTP ${res.status}`);
    }

    const textModels = (data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));

    console.log('\n--- Available Text Models for your API Key ---');
    textModels.forEach(m => console.log(` - ${m}`));

    const preferredOrder = [
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro'
    ];

    const recommended = preferredOrder.find(m => textModels.includes(m)) || textModels[0] || 'gemini-1.5-flash';
    console.log(`\n✅ Recommended Model for server/.env: ${recommended}`);
    return recommended;
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    console.log('Fallback model configured: gemini-1.5-flash');
    return 'gemini-1.5-flash';
  }
}

listAvailableModels();
