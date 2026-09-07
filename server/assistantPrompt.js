/**
 * Assistant Prompt & Multimodal Content Builder for Context-Aware Voice Assistant
 */

export const ASSISTANT_SYSTEM_INSTRUCTION = `
You are an intelligent, context-aware visual and voice AI assistant.
You help users by analyzing what they are looking at on their screen (code, terminal errors, documentation, web pages, diagrams, PDFs, IDEs) together with their spoken or written questions.

Core Guidelines:
1. Grounded in Context: Always prioritize the visual screenshot and context (page title, selected text, visible DOM text) provided.
2. Distinguish Observation vs. Inference:
   - State clearly what you actually observe (e.g. "I see a TypeError on line 42", "The terminal shows a 404 response").
   - Clearly separate your deductions and recommended fixes from observed facts.
3. Zero Hallucination: NEVER invent errors, syntax bugs, or missing code that are not genuinely present. If the screenshot or context is unclear, cropped, or insufficient, acknowledge it honestly and request clarity.
4. Generality: Support any screen context — Python, JavaScript, terminals, browser pages, documentation, formulas, architecture diagrams, or textbooks.
5. Format for Voice + Visual:
   - Always enclose a short, natural, speech-friendly answer (1-2 clear conversational sentences, no code blocks or markdown symbols) inside <speech>...</speech> tags at the very start of your response. This will be spoken aloud to the user.
   - Follow immediately with your detailed visual response using clean GitHub-flavored markdown, headings, bullet points, and syntax-highlighted code blocks for the user to read in their floating assistant panel.
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

  // 2. Format contextual metadata (selection, visible DOM text, title, URL)
  const contextSections = [];
  if (context.title) {
    contextSections.push(`Page/Screen Title: "${context.title}"`);
  }
  if (context.url) {
    contextSections.push(`URL/Location: ${context.url}`);
  }
  if (context.selectedText && context.selectedText.trim()) {
    contextSections.push(`User Selected Text:\n"""\n${context.selectedText.trim()}\n"""`);
  }
  if (context.visibleText && context.visibleText.trim()) {
    // Keep visible text snippet reasonable (e.g. first 2000 chars)
    const snippet = context.visibleText.trim().slice(0, 2000);
    contextSections.push(`Visible Screen / DOM Text (excerpt):\n"""\n${snippet}\n"""`);
  }

  let fullPrompt = '';
  if (contextSections.length > 0) {
    fullPrompt += `[ACTIVE CONTEXT METADATA]\n${contextSections.join('\n\n')}\n\n`;
  }

  // 3. Conversation history context (last 2-3 turns if available)
  if (Array.isArray(history) && history.length > 0) {
    const historyText = history
      .slice(-4)
      .map(item => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.text}`)
      .join('\n');
    fullPrompt += `[RECENT CONVERSATION HISTORY]\n${historyText}\n\n`;
  }

  // 4. User's active prompt
  const query = prompt.trim() || (screenshot ? 'Please analyze what is on my screen and explain it.' : 'Hello, how can I help you today?');
  fullPrompt += `[USER QUESTION / INSTRUCTION]\n${query}`;

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
