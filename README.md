# Your Friendly Code Companion

An interactive coding tutor and helper designed specifically for programming beginners, college students, and self-learners.

---

## 1. Problem Statement

Learning to program can be intimidating. Beginners often struggle with:
- **Dry, technical jargon** in standard documentation that feels overwhelming.
- **Cryptic compiler error messages** (like `SyntaxError` or `TypeError`) that fail to explain *what* went wrong and *how* to fix it.
- **Abstract concepts** (like recursion or Object-Oriented Programming) that lack relatable, real-world analogies.
- **Fragmented tools**, requiring students to jump between compilers, explanation sites, and search engines.

---

## 2. Proposed Solution

**Your Friendly Code Companion** bridges this gap by serving as a dedicated, conversational guide. It features:
- **Relatable Analogies**: Breaking down abstract computer science structures into daily concepts (e.g., viewing variables as labeled storage boxes).
- **Simple, Interactive Chatbot**: Translating complex questions into simple, jargon-free explanations.
- **Code Analyzer & Debugger**: An IDE-like space that identifies syntax issues, suggests simplifications, and offers code demonstrations.
- **Targeted Topic Guides**: Highlighting beginner "gotchas" and common errors alongside clean, copy-pasteable code examples.

---

## 3. Objectives

- **Demystify Computer Science**: Help beginners build a solid mental model of programming paradigms.
- **Provide Conversational Aid**: Offer interactive, chat-style responses to questions.
- **Simplify Diagnostics**: Explain code errors in clear, plain language.
- **Demonstrate Best Practices**: Guide users on how to refactor and simplify messy logic.
- **Facilitate Active Practice**: Provide editable code blocks and templates to encourage typing and experimentation.

---

## 4. Key Features Implemented

1. **Sleek Beginner Dashboard**: 
   - A modern dark-theme landing page with glassmorphism panels.
   - Quick portals to the Chatbot and Code Explainer.
   - A visual overview of 7 essential learning topics.
2. **Coding Chatbot**:
   - Simulated conversational interface with typing animations.
   - Intelligent keyword-based lookups (for loops, recursion, lists, variables).
   - Fast, clickable prompt suggestions for testing.
3. **Code Explainer & Debugger**:
   - Interactive IDE code editor pane with synchronized line numbers.
   - Multiple preset templates illustrating syntax and type errors.
   - Functional tabs: **Explain Code**, **Find Error**, **Simplify Code**, and **Give Example**.
   - Custom heuristic parser for user-submitted code snippets.
4. **Learning Topics Library**:
   - Interactive split view for Python Basics, Loops, Functions, OOP, Arrays, and Debugging.
   - Displays real-world analogies, conceptual summaries, copy-paste code blocks, and beginner gotchas.
5. **Interactive About & Documentation**:
   - Project specifications, objectives, and technology stack.
   - Animated **System Workflow stepper** detailing the request lifecycle.

---

## 5. Context-Aware Voice Assistant

A globally mounted, multimodal AI assistant capable of seeing what is on your screen and hearing your voice.

### Key Capabilities:
- **One-Click Voice Input**: Speech-to-Text using standard Web Speech API with real-time audio visualization and transcription preview.
- **On-Demand Screen Context**: One-click screen frame capture via `getDisplayMedia`. Frames are resized and compressed client-side to lightweight JPEG data before sending.
- **Generic DOM & Text Context**: Captures page title, current URL, active text selection, and sanitized DOM text excerpts across any page or window.
- **Gemini Multimodal Reasoning**: Powered by Google's Gemini models (e.g. `gemini-3.6-flash`), distinguishing observed facts from deductions without hallucinating bugs.
- **Text-to-Speech Output**: Integrated speech synthesis that reads out natural, conversational summaries alongside rich visual markdown with code copying.
- **Privacy First**: Screen sharing stream terminates immediately after single frame acquisition. No audio or video is stored on disk or server.

---

## 6. Technology Stack

- **Core Library**: React (v19)
- **Scaffolding/Bundle**: Vite (v8)
- **Styling**: Custom Vanilla CSS (Dark theme editorial system, responsive CSS grid/flexbox)
- **Icons**: Lucide React Icons
- **Backend**: Node.js / Express
- **AI Integration**: Google GenAI SDK (`@google/genai`) with Gemini multimodal support
- **Browser APIs**: Web Speech API (`webkitSpeechRecognition`), Web Speech Synthesis (`speechSynthesis`), Screen Capture API (`getDisplayMedia`)

---

## 7. System Architecture

```text
User Speech / Mic Click
          ↓
Speech-to-Text (voiceService)
          ↓
Context Acquisition (contextService)
[Single-frame compressed screenshot + selected text + DOM excerpt + title]
          ↓
Backend Multimodal API (/api/assistant)
          ↓
Gemini Reasoning & System Prompt (assistantPrompt.js)
          ↓
Structured Output ({ response: Markdown, spokenText: String })
          ↓
Floating Assistant Panel (VoiceAssistant.jsx)
          ↓
Text-to-Speech (speechService)
```

---

## 8. Instructions to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or above recommended).
- A valid Google Gemini API key.

### Configuration
1. Create a `server/.env` file (or configure `.env` in the root directory):
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.6-flash
   ```

### Installation
Install dependencies for both frontend and backend:
```bash
npm install
cd server && npm install && cd ..
```

### Running the Application
1. **Start the Express backend server:**
   ```bash
   npm run server
   ```
   The backend will start at `http://localhost:5000`.

2. **Start the Vite frontend development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

### Using the Voice Assistant
- Click the floating **Voice Assistant** button in the bottom-right corner to open the assistant.
- Click the **Microphone** icon for one-click voice recognition. Speak your query and the assistant will automatically process it.
- Click the **Monitor** icon to capture a frame from your screen, a specific window, or another browser tab.
- Click **Listen** on any assistant reply to replay the spoken audio.
- Click the **Mute/Unmute** icon in the header to toggle automatic voice playback.

### Browser Compatibility & Limitations
- **Speech Recognition**: The Web Speech API is natively supported in Google Chrome, Microsoft Edge, and Chromium-based browsers. Firefox and Safari require manual typing fallback.
- **Screen Capture**: Supported on desktop browsers. Captures a single frame per user click.

---

## 9. Future Desktop & Extension Direction
- **Browser Extension**: Injecting the assistant directly into any active web tab without requiring localhost hosting.
- **Electron Desktop Companion**: Global OS-level keyboard shortcut (e.g. `Cmd+Shift+Space`) and system-wide audio capture for coding inside VS Code, terminal windows, and local PDFs.

