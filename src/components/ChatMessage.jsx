import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ChatMessage({ message }) {
  const { sender, text } = message;
  const isAssistant = sender === 'assistant';
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parseMessageText = (rawText) => {
    if (!rawText) return null;

    const parts = rawText.split('```');
    return parts.map((part, index) => {
      // Code block (odd indices)
      if (index % 2 === 1) {
        const firstNewLine = part.indexOf('\n');
        let language = 'code';
        let codeContent = part;

        if (firstNewLine !== -1) {
          const possibleLang = part.substring(0, firstNewLine).trim();
          if (possibleLang.length > 0 && possibleLang.length < 15) {
            language = possibleLang;
            codeContent = part.substring(firstNewLine + 1);
          }
        }
        codeContent = codeContent.replace(/\n$/, '');

        return (
          <div key={index} className="msg-code-block">
            <div className="msg-code-header">
              <span className="msg-code-lang">{language.toUpperCase()}</span>
              <button
                onClick={() => handleCopy(codeContent, index)}
                className="msg-copy-btn"
                title="Copy code"
                aria-label="Copy code"
              >
                {copiedIndex === index ? (
                  <><Check size={12} className="copy-success" /><span>Copied!</span></>
                ) : (
                  <><Copy size={12} /><span>Copy</span></>
                )}
              </button>
            </div>
            <pre className="msg-code-pre">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Text segment
      const lines = part.split('\n').map((line, lineIdx) => {
        let fmt = line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');

        return (
          <span
            key={lineIdx}
            dangerouslySetInnerHTML={{ __html: fmt }}
            style={{
              display: 'block',
              minHeight: line === '' ? '10px' : 'auto',
              marginBottom: line !== '' ? '6px' : '0',
            }}
          />
        );
      });

      return <div key={index} className="msg-text-chunk">{lines}</div>;
    });
  };

  return (
    <div className={`msg-row ${isAssistant ? 'msg-assistant' : 'msg-user'}`}>
      <div className={`msg-avatar ${isAssistant ? 'avatar-assistant' : 'avatar-user'}`} aria-hidden="true">
        {isAssistant ? 'AI' : 'You'}
      </div>

      <div className={`msg-bubble ${isAssistant ? 'bubble-assistant' : 'bubble-user'}`}>
        <div className="msg-sender">{isAssistant ? 'Tutor' : 'You'}</div>
        <div className="msg-content">{parseMessageText(text)}</div>
      </div>

      <style>{`
        .msg-row {
          display: flex;
          gap: 11px;
          margin-bottom: 20px;
          align-items: flex-start;
          animation: fadeInUp 0.22s ease-out;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .msg-user {
          flex-direction: row-reverse;
        }

        .msg-avatar {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          font-family: var(--font-sans);
          letter-spacing: 0.02em;
        }

        .avatar-assistant {
          background: var(--accent-subtle);
          border: 1px solid var(--accent-border);
          color: var(--accent);
        }

        .avatar-user {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .msg-bubble {
          max-width: 76%;
          padding: 12px 14px;
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-primary);
          border-radius: 12px;
        }

        .bubble-assistant {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-top-left-radius: 3px;
        }

        .bubble-user {
          background: var(--accent-subtle);
          border: 1px solid var(--accent-border);
          border-top-right-radius: 3px;
        }

        .msg-sender {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
          color: var(--text-tertiary);
        }

        .msg-assistant .msg-sender { color: var(--accent); }
        .msg-user     .msg-sender { color: var(--text-secondary); text-align: right; }

        .msg-content {
          word-break: break-word;
        }

        /* Code blocks inside messages */
        .msg-code-block {
          border-radius: 7px;
          overflow: hidden;
          margin: 10px 0;
          border: 1px solid var(--border);
          background: var(--bg-input);
        }

        .msg-code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 12px;
          background: #161b22;
          border-bottom: 1px solid var(--border);
          font-size: 0.72rem;
          color: var(--text-tertiary);
        }

        .msg-code-lang {
          font-weight: 600;
          font-family: var(--font-mono);
          letter-spacing: 0.04em;
        }

        .msg-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.72rem;
          padding: 2px 6px;
          border-radius: 4px;
          transition: var(--transition-fast);
        }

        .msg-copy-btn:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.06);
        }

        .copy-success { color: #4ade80; }

        .msg-code-pre {
          padding: 12px;
          margin: 0;
          overflow-x: auto;
        }

        .msg-code-pre code {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: #c9d1d9;
          line-height: 1.6;
        }

        .msg-text-chunk {
          margin-bottom: 8px;
        }

        .msg-text-chunk:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 640px) {
          .msg-bubble { max-width: 88%; }
        }
      `}</style>
    </div>
  );
}
