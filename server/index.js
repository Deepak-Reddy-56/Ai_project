import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL, SYSTEM_INSTRUCTION, buildPrompt } from './tutorPrompt.js';
import { ASSISTANT_SYSTEM_INSTRUCTION, buildAssistantContents, parseAssistantOutput } from './assistantPrompt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for local Vite development server
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;

if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
    console.log(`✨ Google GenAI Client initialized with target model: ${process.env.GEMINI_MODEL || GEMINI_MODEL}`);
  } catch (err) {
    console.error('⚠️ Error initializing GoogleGenAI client:', err.message);
  }
} else {
  console.log('⚠️ GEMINI_API_KEY is not configured in server/.env. Server will run in fallback error mode until key is provided.');
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  const currentModel = process.env.GEMINI_MODEL || GEMINI_MODEL;
  res.json({
    status: 'ok',
    model: currentModel,
    hasApiKey: Boolean(apiKey && apiKey !== 'YOUR_GEMINI_API_KEY')
  });
});

/**
 * Primary AI Tutor Endpoint
 * POST /api/ai
 */
app.post('/api/ai', async (req, res) => {
  try {
    console.log('[AI] Request received');

    const {
      mode = 'chat',
      language = 'python',
      code = '',
      level = 'beginner'
    } = req.body;

    // Normalize question vs message
    const question = req.body.question || req.body.message || '';

    const activeModel = process.env.GEMINI_MODEL || GEMINI_MODEL || 'gemini-3.6-flash';

    console.log(`[AI] Mode: ${mode}`);
    console.log(`[AI] Model: ${activeModel}`);

    const currentKey = process.env.GEMINI_API_KEY;
    if (!currentKey || currentKey === 'YOUR_GEMINI_API_KEY') {
      console.log('[AI] Gemini request failed: Missing API Key');
      return res.status(400).json({
        success: false,
        error: 'Gemini API key is missing or not set in server/.env. Please paste your key into server/.env.'
      });
    }

    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey: currentKey });
    }

    // Input validation
    if (!question.trim() && !code.trim()) {
      console.log('[AI] Gemini request failed: No question or code provided');
      return res.status(400).json({
        success: false,
        error: 'Please provide either code or a question for the AI tutor.'
      });
    }

    // Build model prompt
    const promptText = buildPrompt({ mode, language, code, question, level });

    let outputText = '';

    try {
      if (aiClient.interactions && typeof aiClient.interactions.create === 'function') {
        const interactionResponse = await aiClient.interactions.create({
          model: activeModel,
          input: promptText,
          system_instruction: SYSTEM_INSTRUCTION
        });

        outputText = interactionResponse.output_text;
        if (!outputText && interactionResponse.steps) {
          const modelStep = interactionResponse.steps.find(s => s.type === 'model_output');
          if (modelStep?.content?.[0]?.text) {
            outputText = modelStep.content[0].text;
          }
        }
      } else {
        const response = await aiClient.models.generateContent({
          model: activeModel,
          contents: promptText,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION
          }
        });
        outputText = response.text;
      }
    } catch (genAiError) {
      console.warn('⚠️ Interactions API call failed, falling back to generateContent:', genAiError.message);
      const fallbackResponse = await aiClient.models.generateContent({
        model: activeModel,
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });
      outputText = fallbackResponse.text;
    }

    if (!outputText) {
      throw new Error('Received empty response from Gemini API.');
    }

    console.log('[AI] Gemini request successful');

    return res.json({
      success: true,
      response: outputText,
      model: activeModel
    });

  } catch (error) {
    console.error(`[AI] Gemini request failed: ${error.message || error}`);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while communicating with the Gemini API.'
    });
  }
});

/**
 * Context-Aware Multimodal Assistant Endpoint
 * POST /api/assistant
 */
app.post('/api/assistant', async (req, res) => {
  try {
    console.log('[Assistant] Request received');
    const {
      prompt = '',
      screenshot = null,
      context = {},
      history = []
    } = req.body;

    const currentKey = process.env.GEMINI_API_KEY;
    if (!currentKey || currentKey === 'YOUR_GEMINI_API_KEY') {
      return res.status(400).json({
        success: false,
        error: 'Gemini API key is missing or not set. Please provide a valid key in server/.env.'
      });
    }

    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey: currentKey });
    }

    if (!prompt.trim() && !screenshot && (!context || !context.selectedText)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a question, selected text, or screen capture.'
      });
    }

    const activeModel = process.env.GEMINI_MODEL || GEMINI_MODEL || 'gemini-2.5-flash';
    console.log(`[Assistant] Model: ${activeModel} | Has Screenshot: ${Boolean(screenshot)} | Has Selection: ${Boolean(context?.selectedText)}`);

    const contents = buildAssistantContents({ prompt, screenshot, context, history });
    let outputText = '';

    try {
      const response = await aiClient.models.generateContent({
        model: activeModel,
        contents,
        config: {
          systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION
        }
      });
      outputText = response.text;
    } catch (apiError) {
      console.warn('⚠️ Primary model generateContent failed in assistant endpoint:', apiError.message);
      if (activeModel !== 'gemini-3.6-flash') {
        console.log('🔄 Attempting fallback to gemini-3.6-flash...');
        const fallbackResponse = await aiClient.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION
          }
        });
        outputText = fallbackResponse.text;
      } else {
        throw apiError;
      }
    }

    if (!outputText) {
      throw new Error('Received empty response from Gemini assistant.');
    }

    const { response: markdownResponse, spokenText } = parseAssistantOutput(outputText);

    console.log('[Assistant] Request completed successfully');
    return res.json({
      success: true,
      response: markdownResponse,
      spokenText,
      model: activeModel
    });
  } catch (error) {
    console.error(`[Assistant] Request failed: ${error.message || error}`);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while processing assistant request.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Code Companion Backend running on http://localhost:${PORT}`);
  console.log(`Target Gemini Model: ${process.env.GEMINI_MODEL || GEMINI_MODEL}`);
});
