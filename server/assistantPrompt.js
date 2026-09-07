/**
 * Assistant Prompt & Multimodal Content Builder for Context-Aware Voice Assistant
 */

export const ASSISTANT_SYSTEM_INSTRUCTION = `
You are an intelligent, context-aware visual and voice AI assistant.
You help users by answering their programming questions, debugging errors, and explaining concepts using any supplied screen or page context as SILENT BACKGROUND EVIDENCE.

CRITICAL CONTEXT RULES:
1. Silent Background Context:
   - Screen capture, page title, URL, and visible DOM text are BACKGROUND EVIDENCE ONLY. They are NOT the response itself.
   - Do NOT automatically announce, describe, or summarize what page, module, or screen the user is viewing simply because context was captured.
   - Use screen and page context purely to answer the user's specific question.
2. Direct Answers:
   - Answer the user's actual question directly, immediately, and naturally.
   - Example (User: "What is wrong with this code?"):
     CORRECT: "The issue is on line 8 where..."
     INCORRECT: "You are currently viewing Module 1 of Python. In your editor on the screen, on line 8..."
   - Example (User: "What am I looking at?" or "Explain this screen"):
     CORRECT: "You are looking at..." (allowed because user explicitly asked to describe the screen).
3. Forbidden Meta-Labels:
   - NEVER prepend responses with labels such as "Context Observation", "Screen Context", "Visual Observation", "Page Context", "You are currently viewing...", or "I can see that you are...".
4. Zero Hallucination:
   - NEVER invent errors, syntax bugs, or missing code that are not genuinely present.
   - If the code has no bugs, state clearly that it looks correct.
5. Format for Voice + Visual:
   - Enclose a short, direct spoken answer (1-2 conversational sentences, answering the user's query directly without meta-commentary about seeing their screen) inside <speech>...</speech> tags at the very start.
   - Follow immediately with your clean visual response using markdown (code blocks, bullet points, bold) for the floating assistant panel.
`;

/**
 * Builds the multimodal content payload for the Gemini API call.
 * 
 * @param {Object} options
 * @param {string} options.prompt - User's query or instruction
 * @param {string} [options.screenshot] - Base64 encoded screenshot (data:image/jpeg;base64,... or raw base64)
 * @param {Object} [options.context] - Metadata context (title, url, selectedText, visibleText)
 * @param {Array} [options.history] - Optional recent conversation history
 * @returns {Array|string} contents array for Gemini generateContent
 */
export function buildAssistantContents({ prompt = '', screenshot = null, context = {}, history = [] }) {
  const parts = [];

  // 1. If screenshot is provided, extract base64 data and mimeType
  if (screenshot) {
    let mimeType = 'image/jpeg';
    let base64Data = screenshot;

    if (screenshot.startsWith('data:')) {
      const match = screenshot.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    parts.push({
      inlineData: {
        mimeType,
        data: base64Data
      }
    });
  }

  // 2. Format contextual metadata as silent background reference
  const contextSections = [];
  if (context.title) {
    contextSections.push(`Page Title: "${context.title}"`);
  }
  if (context.url) {
    contextSections.push(`URL: ${context.url}`);
  }
  if (context.selectedText && context.selectedText.trim()) {
    contextSections.push(`User Selected Text:\n"""\n${context.selectedText.trim()}\n"""`);
  }
  if (context.visibleText && context.visibleText.trim()) {
    const snippet = context.visibleText.trim().slice(0, 1500);
    contextSections.push(`Page Visible Text:\n"""\n${snippet}\n"""`);
  }

  let fullPrompt = '';
  if (contextSections.length > 0) {
    fullPrompt += `[BACKGROUND CONTEXT - Silent reference only. Do NOT describe or announce this unless specifically asked.]\n${contextSections.join('\n\n')}\n\n`;
  }

  // 3. Conversation history context (last 3-4 turns)
  if (Array.isArray(history) && history.length > 0) {
    const historyText = history
      .slice(-4)
      .map(item => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.text}`)
      .join('\n');
    fullPrompt += `[CONVERSATION HISTORY]\n${historyText}\n\n`;
  }

  // 4. User's active prompt
  const query = prompt.trim() || (screenshot ? 'Explain what is on my screen.' : 'How can I help you today?');
  fullPrompt += `[USER QUESTION]\n${query}`;

  parts.push({
    text: fullPrompt
  });

  return parts;
}

/**
 * Parses the Gemini model output to separate spoken summary from full visual response
 */
export function parseAssistantOutput(rawText = '') {
  let spokenText = '';
  let visualMarkdown = rawText;

  const speechMatch = rawText.match(/<speech>([\s\S]*?)<\/speech>/i);
  if (speechMatch) {
    spokenText = speechMatch[1].trim();
    visualMarkdown = rawText.replace(/<speech>[\s\S]*?<\/speech>/i, '').trim();
  } else {
    // Fallback: take first paragraph or sentence without markdown
    const firstParagraph = rawText.split(/\n\n+/)[0] || rawText;
    spokenText = firstParagraph
      .replace(/[*_#`~[\]]/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    if (spokenText.length > 180) {
      spokenText = spokenText.slice(0, 180) + '...';
    }
  }

  return {
    response: visualMarkdown,
    spokenText
  };
}
