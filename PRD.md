# Context-Aware Voice Assistant - Product Requirements Document (PRD)

## 1. Objective
Implement a Context-Aware Voice Assistant feature for this repository.
The feature provides a generic, multimodal, voice-enabled assistant that understands the user's active context (screen capture, visible text, selected text, page title, URL) and can answer queries via speech and text using Gemini AI models.

## 2. Implementation Principle
The feature must provide:
- Voice (Speech-to-Text via Web Speech API / microphone abstraction with fallback)
- Context (Generic context acquisition: selected text, visible webpage text, page title, URL, screenshot via Display Media API)
- Gemini (Multimodal reasoning on backend)
- Floating Assistant (Polished, non-intrusive floating panel mounted globally)
- Optional Speech Output (Text-to-Speech via Web Speech Synthesis API)

Canonical Flow:
User speaks / types
→ Speech-to-text
→ Determine whether context is required
→ Acquire available context (screenshot, selected text, visible text, metadata)
→ Send question + context to backend (`POST /api/assistant`)
→ Gemini reasoning
→ Assistant response
→ Floating panel displays response + optional spoken response

## 3. Context Is Generic
- Conceptual support for websites, documentation, code, errors, PDFs, diagrams, terminal output, educational material, general screen content.
- No site-specific hardcoding (e.g. no LeetCode-specific conditions).
- Screenshots are captured on-demand with explicit permission, never continuously recorded or saved to disk.

## 4. Architecture & Frontend
- Reusable modular services:
  - `voiceService.js` (speech-to-text abstraction with start/stop listening, wake phrase hook)
  - `speechService.js` (text-to-speech abstraction with speak/stop/voices)
  - `contextService.js` (screen capture via getDisplayMedia, selection, page text, metadata)
  - `assistantService.js` (API communication with `/api/assistant`)
- Global mount: Assistant floating button and panel mounted at root level (e.g. in `App.jsx`) so it works across all routes (`/`, `/chat`, `/explainer`, `/topics`, `/about`).
- Existing routes and features must remain completely functional.

## 5. Backend
- Reuse existing Express server (`server/index.js`).
- New endpoint: `POST /api/assistant`.
- Multimodal support: Receives prompt/question, optional base64 image screenshot, optional page text, selection text, url/title, conversation history.
- Uses server-side `GEMINI_API_KEY` with `@google/genai` SDK or Google GenAI API.
- Dedicated assistant system prompt in `server/assistantPrompt.js` focused on:
  - reasoning from supplied context
  - distinguishing observation from inference
  - avoiding hallucinating visible content
  - never inventing bugs
  - acknowledging insufficient context
  - providing concise speech-friendly output summary + rich visual markdown output.

## 6. UI States & Experience
- States:
  - Idle
  - Listening
  - Analyzing
  - Speaking
  - Error
- Components:
  - Floating trigger button with state indicators (listening ripple, pulse, badge)
  - Draggable/dockable or floating collapsible panel
  - Visual status pill
  - Microphone toggle button
  - Screen capture toggle / capture preview thumbnail with clear/retake
  - Speech (TTS) audio toggle (mute/unmute assistant voice)
  - Transcript / message stream with markdown formatting and code highlighting
  - Context indicators (shows if screenshot or text context is attached)
  - Quick actions ("Explain this screen", "Find bugs", "Summarize", "What does this mean?")
  - Settings drawer/modal (wake phrase toggle/config, speech voice & rate, auto-speak toggle, privacy policy overview)

## 7. Wake Phrase
- Architecturally supported (configurable, e.g. "Hey Assistant").
- Graceful fallback to manual mic button activation when continuous listening is not active or supported.

## 8. Privacy & Security
- Explicit user consent for microphone and screen capture.
- No silent background recording.
- No persistence of screenshots or voice recordings on server or disk.
- Never log screenshot data or expose API keys on client.

## 9. Validation & Quality
- Build (`npm run build`) and lint (`npm run lint`) pass cleanly.
- Existing `/api/ai` endpoint and existing pages continue to work without regression.
