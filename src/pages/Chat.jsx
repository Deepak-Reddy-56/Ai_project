import React, { useState } from 'react';
import ChatBox from '../components/ChatBox';
import { chatResponses } from '../data/demoResponses';
import { askAI } from '../services/aiService';

const SUGGESTED_PROMPTS = [
  { label: 'Explain recursion to a beginner', query: 'Explain recursion to a beginner using a simple real-life analogy and a small Python example.' },
  { label: 'Explain loops like I\'m a beginner', query: 'Explain how for loops work in Python with a simple example.' },
  { label: 'What is a function?', query: 'What is a function in programming? Explain with a real-world analogy.' },
  { label: 'List vs Tuple — difference?', query: 'What is the difference between a list and a tuple in Python?' },
];

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hi! I\'m your **Code Companion** AI Tutor.\n\nAsk me any programming question — I\'ll explain it in plain English with examples you can actually understand.',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (text) => {
    const userMessage = { id: `msg-${Date.now()}-user`, sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const aiResult = await askAI({ mode: 'chat', question: text, language: 'python', level: 'beginner' });

      let responseText = '';
      if (aiResult.success && aiResult.response) {
        responseText = aiResult.response;
      } else {
        console.warn('⚠️ Gemini unavailable, using fallback:', aiResult.error);
        const cleanText = text.toLowerCase().trim();
        const matchedKey = Object.keys(chatResponses).find((key) => cleanText.includes(key));
        const notice = `⚠️ AI tutor is temporarily unavailable. Using offline fallback. (${aiResult.error || 'Server unavailable'})\n\n`;
        responseText = matchedKey
          ? `${notice}${chatResponses[matchedKey]}`
          : `${notice}Topics I can help with locally:\n- **variables**\n- **loops**\n- **lists**\n- **functions**\n- **OOP**\n- **debugging**`;
      }

      setMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}-assistant`, sender: 'assistant', text: responseText },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}-assistant`, sender: 'assistant', text: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Chat cleared. What would you like to learn about next?',
      },
    ]);
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">AI Tutor</h1>
        <p className="page-subtitle">Ask questions, learn concepts, and get unstuck.</p>
      </div>

      {/* Suggested prompts */}
      <div className="prompts-bar">
        <span className="prompts-label">Try asking:</span>
        <div className="prompts-list">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p.query)}
              disabled={isTyping}
              className="prompt-chip"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat box */}
      <ChatBox
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        onClearChat={handleClearChat}
      />

      <style>{`
        .chat-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: pageEnter 0.3s ease-out;
        }

        /* Prompt chips */
        .prompts-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .prompts-label {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          font-weight: 500;
          white-space: nowrap;
        }

        .prompts-list {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .prompt-chip {
          display: inline-flex;
          align-items: center;
          padding: 6px 13px;
          border-radius: 99px;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-family: var(--font-sans);
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
        }

        .prompt-chip:hover:not(:disabled) {
          border-color: var(--accent-border);
          color: var(--text-primary);
          background: var(--accent-subtle);
        }

        .prompt-chip:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
