/**
 * Frontend AI Service for communicating with the Code Companion Express Backend
 */

const API_ENDPOINT = '/api/ai';
const DIRECT_BACKEND_ENDPOINT = 'http://localhost:5000/api/ai';

/**
 * Sends a structured request to the AI backend.
 * 
 * @param {Object} payload
 * @param {string} payload.mode - 'chat' | 'explain' | 'debug' | 'hint' | 'simplify' | 'example'
 * @param {string} [payload.language='python'] - Programming language
 * @param {string} [payload.code=''] - Source code snippet
 * @param {string} [payload.question=''] - User question or prompt
 * @param {string} [payload.message=''] - Alternative key for user question
 * @param {string} [payload.level='beginner'] - 'beginner' | 'intermediate' | 'advanced'
 * 
 * @returns {Promise<{success: boolean, response?: string, error?: string, model?: string}>}
 */
export async function askAI(payload) {
  const mode = payload.mode || 'chat';
  const question = payload.question || payload.message || '';
  const code = payload.code || '';
  const language = payload.language || 'python';
  const level = payload.level || 'beginner';

  console.log(`[Frontend AI] Sending request | Mode: ${mode}`);

  try {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode,
        language,
        code,
        question,
        level
      })
    };

    let response;
    try {
      // Primary call using Vite server proxy /api/ai
      response = await fetch(API_ENDPOINT, requestOptions);
    } catch (proxyError) {
      console.warn('[Frontend AI] Proxy endpoint failed, trying direct endpoint:', proxyError.message);
      // Fallback direct call to Express port 5000 if proxy fails
      response = await fetch(DIRECT_BACKEND_ENDPOINT, requestOptions);
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.warn('[Frontend AI] Response received with error:', data.error || `HTTP ${response.status}`);
      return {
        success: false,
        error: data.error || `Server responded with status ${response.status}`
      };
    }

    console.log(`[Frontend AI] Response received successfully | Model: ${data.model || 'gemini-3.6-flash'}`);

    return {
      success: true,
      response: data.response,
      model: data.model
    };

  } catch (error) {
    console.warn('[Frontend AI] Network Error:', error.message);
    return {
      success: false,
      error: error.message || 'Unable to connect to the backend AI service.'
    };
  }
}
