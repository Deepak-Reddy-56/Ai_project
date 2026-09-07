/**
 * Assistant Service: Client for communication with the Express /api/assistant endpoint
 */

const API_ENDPOINT = '/api/assistant';
const DIRECT_BACKEND_ENDPOINT = 'http://localhost:5000/api/assistant';

/**
 * Sends a multimodal query with context and optional screenshot to the assistant API.
 * 
 * @param {Object} payload
 * @param {string} payload.prompt - User's query or instruction
 * @param {string} [payload.screenshot] - Optional base64 screenshot data URL
 * @param {Object} [payload.context] - Metadata context (title, url, selectedText, visibleText)
 * @param {Array} [payload.history] - Recent conversation turns
 * 
 * @returns {Promise<{success: boolean, response?: string, spokenText?: string, error?: string, model?: string}>}
 */
export async function askAssistant({ prompt = '', screenshot = null, context = {}, history = [] }) {
  console.log(`[Assistant Client] Sending query | Has screenshot: ${Boolean(screenshot)} | Prompt length: ${prompt.length}`);

  const bodyData = JSON.stringify({
    prompt,
    screenshot,
    context,
    history
  });

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: bodyData
  };

  try {
    let response;
    try {
      // Primary proxy call through Vite
      response = await fetch(API_ENDPOINT, requestOptions);
    } catch (proxyErr) {
      console.warn('[Assistant Client] Proxy endpoint failed, falling back to direct endpoint:', proxyErr.message);
      response = await fetch(DIRECT_BACKEND_ENDPOINT, requestOptions);
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `Server responded with status ${response.status}`
      };
    }

    return {
      success: true,
      response: data.response,
      spokenText: data.spokenText || '',
      model: data.model
    };
  } catch (err) {
    console.error('[Assistant Client] Network error:', err);
    return {
      success: false,
      error: err.message || 'Unable to connect to assistant service. Please check your server.'
    };
  }
}
