import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

// SINGLE CENTRAL MODEL CONFIGURATION
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

/**
 * System Instruction for the Beginner Programming Tutor
 */
export const SYSTEM_INSTRUCTION = `
You are "Your Friendly Code Companion" — an encouraging, patient, and expert programming tutor.
Your primary role is to help students learn and understand programming concepts, not just generate code.

General Principles:
1. Be friendly, encouraging, and clear.
2. Assume the learner may be a complete beginner unless specified otherwise.
3. Explain programming concepts clearly using simple language and jargon-free analogies.
4. Explain WHY code works, why an error happens, or why a fix is needed.
5. NEVER invent syntax errors or bugs that do not exist in the user's code.
6. Clearly distinguish between:
   - Syntax errors (code grammar mistakes that prevent running)
   - Runtime errors (crashes that happen during execution)
   - Logical errors (code runs but gives wrong output)
   - Style/Best Practice improvements
7. Use Markdown fenced code blocks (e.g., \`\`\`python ... \`\`\`) with clean, well-commented code.
8. Format responses with headings, bullet points, and clear spacing.
9. Keep explanations structured, readable, and focused on pedagogy over raw answers.
`;

/**
 * Helper to construct level-specific instructions
 */
function getLevelGuidance(level = 'beginner') {
  switch (level.toLowerCase()) {
    case 'intermediate':
      return 'Target level: Intermediate. Use concise technical terms, but still explain subtle nuances.';
    case 'advanced':
      return 'Target level: Advanced. Provide deep algorithmic or structural insights.';
    case 'beginner':
    default:
      return 'Target level: Beginner. Use simple language, relatable real-world analogies, step-by-step breakdowns, and avoid unexplained jargon.';
  }
}

/**
 * Mode Prompt Builder
 */
export function buildPrompt({ mode, language = 'python', code = '', question = '', level = 'beginner' }) {
  const levelGuidance = getLevelGuidance(level);
  const langUpper = language.toUpperCase();

  switch (mode) {
    case 'chat':
      return `
[SYSTEM CONTEXT: Mode = CHAT | Language = ${langUpper}]
${levelGuidance}

USER QUESTION / PROMPT:
${question || 'Help me learn programming concepts.'}

Provide a helpful, conversational tutoring response. Answer the question directly, use an analogy if applicable, and provide a short code example formatted in Markdown if relevant.
`;

    case 'explain':
      return `
[SYSTEM CONTEXT: Mode = EXPLAIN | Language = ${langUpper}]
${levelGuidance}

CODE TO EXPLAIN:
\`\`\`${language}
${code}
\`\`\`

Explain this code clearly for a student:
1. High-level summary of what the code does.
2. Step-by-step line breakdown.
3. Core concepts used (e.g. loops, variables, functions).
4. A small practical takeaway or example.
`;

    case 'debug':
      return `
[SYSTEM CONTEXT: Mode = DEBUG | Language = ${langUpper}]
${levelGuidance}

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

${question ? `USER CONCERN: ${question}` : ''}

Carefully inspect the code above.
- If there are syntax errors, runtime errors, or logical bugs:
  1. State the exact problem found.
  2. Explain WHY it happens in plain language.
  3. Show how to fix it with corrected code.
- If the code is COMPLETELY CORRECT:
  Explicitly confirm that the code is syntactically correct and will run without errors. Optionally suggest minor readability improvements separately.
- NEVER invent an error if none exists.
`;

    case 'hint':
      return `
[SYSTEM CONTEXT: Mode = EDUCATIONAL HINT | Language = ${langUpper}]
${levelGuidance}

CODE / PROBLEM:
\`\`\`${language}
${code}
\`\`\`
${question ? `QUESTION: ${question}` : ''}

EDUCATIONAL INSTRUCTION:
Do NOT give away the complete code solution immediately.
Give ONE clear, helpful hint or guiding question that prompts the student to discover the fix or answer themselves.
`;

    case 'simplify':
      return `
[SYSTEM CONTEXT: Mode = SIMPLIFY | Language = ${langUpper}]
${levelGuidance}

CODE TO SIMPLIFY:
\`\`\`${language}
${code}
\`\`\`

Rewrite this code to make it as clean, readable, and beginner-friendly as possible without changing its original behavior.
Explain:
1. What was simplified or refactored.
2. Why the new version is easier to read and maintain.
3. Provide the simplified code block.
`;

    case 'example':
      return `
[SYSTEM CONTEXT: Mode = EXAMPLE GENERATION | Language = ${langUpper}]
${levelGuidance}

CONCEPT / CODE SNIPPET:
${code ? `\`\`\`${language}\n${code}\n\`\`\`` : ''}
${question ? `CONCEPT: ${question}` : ''}

Provide a clean, beginner-friendly practical code demonstration in ${langUpper}. Include clear comments and explain what each part does.
`;

    case 'analyze':
      return `
[SYSTEM CONTEXT: Mode = ANALYZE CODE | Language = ${langUpper}]
${levelGuidance}

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

${question ? `USER QUESTION / CONCERN: "${question}"` : ''}

═══════════════════════════════════════════
CLASSIFICATION RULES — FOLLOW EXACTLY
═══════════════════════════════════════════

You must assign EXACTLY ONE of these three status values: "correct", "issue", or "uncertain".

─────────────────────────────────────────
STATUS "correct"
─────────────────────────────────────────
Use "correct" when the code is syntactically valid and logically reasonable given
the available information.

The following are NOT errors. Do NOT return "issue" for any of these alone:
  - Style preferences or alternative implementations that also work
  - Missing comments, docstrings, or documentation
  - Lack of optimization or performance improvements
  - Code that could be written more concisely but still functions correctly
  - Unused variables that do not cause an actual runtime problem in this snippet
  - Hypothetical edge cases without clear evidence they apply to this exact code
  - Features that could be added but were not requested

When status is "correct":
  - Set "issue", "why", and "fix" to empty strings "".
  - Provide a friendly, thorough explanation in "explanation".

─────────────────────────────────────────
STATUS "issue"
─────────────────────────────────────────
Use "issue" ONLY when you can point to a specific, concrete problem in the submitted
snippet itself. Valid reasons:
  - Clear syntax error that prevents parsing (e.g., missing colon, unclosed bracket)
  - Invalid language construct for ${langUpper}
  - Definite type mismatch that causes a compile or runtime error
  - Definite out-of-bounds access provable from the code (not hypothetical)
  - Undefined identifier clearly used without any definition in the snippet
  - Logical contradiction making the code provably wrong for all inputs
  - Clearly unreachable or invalid construct

SAFETY GATE — Before returning "issue", ask yourself:
  "Can I point to a specific line or token in this submitted snippet that is
   concretely wrong — not just something I would do differently?"

If the answer is NO → do NOT return "issue". Return "correct" or "uncertain" instead.

When status is "issue":
  - Describe the actual problem precisely in "issue".
  - Explain why it occurs pedagogically in "why".
  - Provide corrected code in "fix".

─────────────────────────────────────────
STATUS "uncertain"
─────────────────────────────────────────
Use "uncertain" when correctness depends on information NOT present in the snippet:
  - Functions, variables, or classes defined in other files not shown
  - Correctness depends on runtime environment, library version, or input data
  - The snippet is syntactically complete but clearly relies on external context

IMPORTANT: Missing context is NOT an error. Do NOT return "issue" because context
is missing. Missing context → "uncertain".

When status is "uncertain":
  - Explain exactly what information is missing in "issue".
  - Do NOT claim there is definitely an error.

═══════════════════════════════════════════
USER QUESTION HANDLING
═══════════════════════════════════════════

If the user asks "Why isn't this working?", do NOT assume an error exists.
Analyze the actual code independently, then:
  - Return "correct" if the code appears fine (user may be confused about behavior).
  - Return "issue" only if a concrete problem is found in the snippet.
  - Return "uncertain" if missing context is the likely cause.

Address the user's question in "summary" or "explanation".

═══════════════════════════════════════════
INCOMPLETE CODE
═══════════════════════════════════════════

If the code is syntactically incomplete (unclosed brackets, partial statements) → "issue".
If the code is syntactically valid but relies on omitted external context → "uncertain".

═══════════════════════════════════════════
RESPONSE FORMAT
═══════════════════════════════════════════

Respond ONLY with a valid JSON object. No markdown wrapper, no extra text.
{
  "status": "correct" | "issue" | "uncertain",
  "summary": "High-level description of what the code is intended to do",
  "issue": "Specific description of the concrete problem found (empty string if status is correct)",
  "why": "Pedagogical explanation of why the problem occurs (empty string if status is correct)",
  "fix": "Corrected code snippet with comments (empty string if status is correct)",
  "explanation": "Beginner-friendly step-by-step walkthrough of how the code works",
  "followUp": "Suggested takeaway or try-this-next prompt for the student"
}

Allowed status values: "correct", "issue", "uncertain" — no others.
NEVER claim the code was compiled, executed, or verified by a runtime system.
Use observational language: "Code looks good based on my analysis" or "Based on this snippet..."
`;

    default:
      return `
[SYSTEM CONTEXT: Mode = TUTOR | Language = ${langUpper}]
${levelGuidance}

INPUT:
${question}
${code ? `\`\`\`${language}\n${code}\n\`\`\`` : ''}
`;
  }
}
