import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';

export default function ChatBox({ messages, onSendMessage, isTyping, onClearChat }) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="chatbox">
      {/* Header bar */}
      <div className="chatbox-header">
        <div className="chatbox-status">
          <span className="status-dot" aria-hidden="true" />
          <span className="chatbox-header-label">Tutor Session</span>
        </div>
        {messages.length > 2 && (
          <button onClick={onClearChat} className="clear-btn" title="Clear conversation">
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Message thread */}
      <div className="chat-thread" role="log" aria-live="polite">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="typing-row">
            <div className="typing-bubble">
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a coding question... (Enter to send)"
          className="chat-input"
          rows={1}
          disabled={isTyping}
          aria-label="Chat message input"
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!inputValue.trim() || isTyping}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>

      <style>{`
        .chatbox {
          display: flex;
          flex-direction: column;
          height: 600px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        /* Header */
        .chatbox-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-elevated);
        }

        .chatbox-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
        }

        .chatbox-header-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }

        .clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: 1px solid var(--border);
          border-radius: 5px;
          color: var(--text-tertiary);
          font-size: 0.78rem;
          font-family: var(--font-sans);
          padding: 4px 10px;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .clear-btn:hover {
          color: #f87171;
          border-color: rgba(248, 113, 113, 0.3);
          background: rgba(248, 113, 113, 0.05);
        }

        /* Thread */
        .chat-thread {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Typing indicator */
        .typing-row {
          display: flex;
          align-items: center;
          padding: 8px 0;
        }

        .typing-bubble {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 10px 14px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 12px;
          border-top-left-radius: 3px;
        }

        .typing-bubble span {
          width: 5px;
          height: 5px;
          background: var(--text-tertiary);
          border-radius: 50%;
          animation: typingPulse 1.3s infinite ease-in-out;
        }

        .typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
        .typing-bubble span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes typingPulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%            { opacity: 1;    transform: scale(1); }
        }

        /* Input area */
        .chat-input-area {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-top: 1px solid var(--border);
          background: var(--bg-elevated);
        }

        .chat-input {
          flex: 1;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          padding: 10px 14px;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          line-height: 1.5;
          outline: none;
          resize: none;
          min-height: 42px;
          max-height: 120px;
          transition: border-color 0.15s;
        }

        .chat-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .chat-input::placeholder {
          color: var(--text-tertiary);
        }

        .send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          border: none;
          background: var(--accent);
          color: white;
          cursor: pointer;
          transition: var(--transition-fast);
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: scale(1.04);
        }

        .send-btn:disabled {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-tertiary);
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}
