import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Monitor,
  Send,
  X,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function AssistantPanel({
  isOpen,
  state,
  messages,
  screenshot,
  selectedText,
  interimTranscript,
  isMuted,
  errorMessage,
  onClose,
  onToggleListen,
  onCaptureScreen,
  onRemoveScreenshot,
  onRemoveSelectedText,
  onToggleMute,
  onClearChat,
  onSendMessage,
  onReplaySpeech,
  onDismissError
}) {
  const [inputText, setInputText] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll messages container
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, state, interimTranscript, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !screenshot && !selectedText) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleCopyCode = (code, id) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    }
  };

  const renderFormattedContent = (rawText, msgId) => {
    if (!rawText) return null;

    // Split on code blocks ```
    const segments = rawText.split('```');

    return segments.map((segment, index) => {
      // Code block
      if (index % 2 === 1) {
        const firstNewLine = segment.indexOf('\n');
        let lang = 'code';
        let codeBody = segment;

        if (firstNewLine !== -1) {
          const possibleLang = segment.slice(0, firstNewLine).trim();
          if (possibleLang.length > 0 && possibleLang.length < 15) {
            lang = possibleLang;
            codeBody = segment.slice(firstNewLine + 1);
          }
        }

        const codeId = `${msgId}-code-${index}`;
        const isCopied = copiedCodeId === codeId;

        return (
          <div key={codeId} className="assistant-code-block" style={{
            margin: '8px 0',
            background: '#0a0e17',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 10px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.72rem',
              color: '#8b949e',
              fontFamily: 'monospace'
            }}>
              <span>{lang.toUpperCase()}</span>
              <button
                onClick={() => handleCopyCode(codeBody.trim(), codeId)}
                className="msg-action-btn"
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
              >
                {isCopied ? <Check size={11} color="#10b981" /> : <Copy size={11} />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre style={{
              margin: 0,
              padding: '8px 12px',
              overflowX: 'auto',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8rem',
              color: '#f0f6fc',
              lineHeight: 1.45
            }}>
              <code>{codeBody.trim()}</code>
            </pre>
          </div>
        );
      }

      // Regular text formatting
      const lines = segment.split('\n');
      return (
        <div key={`text-${index}`}>
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lineIdx} style={{ height: '6px' }} />;

            // Headings
            if (trimmed.startsWith('### ')) {
              return <h4 key={lineIdx} style={{ fontSize: '0.92rem', color: '#93c5fd', margin: '8px 0 4px', fontWeight: 600 }}>{trimmed.slice(4)}</h4>;
            }
            if (trimmed.startsWith('## ')) {
              return <h3 key={lineIdx} style={{ fontSize: '1rem', color: '#60a5fa', margin: '10px 0 4px', fontWeight: 700 }}>{trimmed.slice(3)}</h3>;
            }
            if (trimmed.startsWith('# ')) {
              return <h2 key={lineIdx} style={{ fontSize: '1.05rem', color: '#f0f6fc', margin: '12px 0 6px', fontWeight: 800 }}>{trimmed.slice(2)}</h2>;
            }

            // Bullet points
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const bulletText = trimmed.slice(2);
              return (
                <div key={lineIdx} style={{ display: 'flex', gap: '6px', margin: '3px 0', paddingLeft: '4px' }}>
                  <span style={{ color: '#60a5fa' }}>•</span>
                  <span>{formatInlineMarkdown(bulletText)}</span>
                </div>
              );
            }

            return (
              <p key={lineIdx} style={{ margin: '4px 0' }}>
                {formatInlineMarkdown(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const formatInlineMarkdown = (str) => {
    // Render bold **text** and inline `code`
    const parts = [];
    let remaining = str;
    let key = 0;

    while (remaining.length > 0) {
      // Check for inline code
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code key={key++} style={{
            background: 'rgba(0,0,0,0.4)',
            color: '#93c5fd',
            padding: '1px 5px',
            borderRadius: '4px',
            fontSize: '0.82em',
            fontFamily: 'monospace'
          }}>
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Check for bold **text**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={key++} style={{ color: '#f0f6fc', fontWeight: 600 }}>
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Normal char
      const nextCode = remaining.indexOf('`');
      const nextBold = remaining.indexOf('**');
      let nextSpecial = -1;

      if (nextCode !== -1 && nextBold !== -1) {
        nextSpecial = Math.min(nextCode, nextBold);
      } else if (nextCode !== -1) {
        nextSpecial = nextCode;
      } else if (nextBold !== -1) {
        nextSpecial = nextBold;
      }

      if (nextSpecial === -1) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      } else if (nextSpecial === 0) {
        // Just take 1 char to avoid infinite loop
        parts.push(<span key={key++}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      } else {
        parts.push(<span key={key++}>{remaining.slice(0, nextSpecial)}</span>);
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  return (
    <div className="assistant-panel" role="dialog" aria-label="AI Voice & Context Assistant">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="assistant-panel-header">
        <div className="panel-header-title">
          <div className="assistant-avatar">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="assistant-name">Context Assistant</div>
            <div className="assistant-status-pill">
              <span className={`status-dot ${state}`} />
              <span>
                {state === 'listening' ? 'Listening...' :
                 state === 'analyzing' ? 'Thinking...' :
                 state === 'speaking' ? 'Speaking...' :
                 state === 'error' ? 'Error' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        <div className="panel-header-actions">
          {/* Mute/Unmute Speech */}
          <button
            onClick={onToggleMute}
            className={`panel-icon-btn ${isMuted ? '' : 'is-active'}`}
            title={isMuted ? 'Unmute voice output' : 'Mute voice output'}
            aria-label="Toggle voice sound"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Clear chat */}
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="panel-icon-btn"
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Close / Minimize */}
          <button
            onClick={onClose}
            className="panel-icon-btn"
            title="Minimize Assistant"
            aria-label="Minimize Assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Context Preview Strip (Attached screenshot or selection) ─ */}
      {(screenshot || selectedText) && (
        <div className="assistant-context-strip">
          {screenshot && (
            <div className="screenshot-preview-card">
              <img src={screenshot} alt="Captured screen context" className="screenshot-thumb" />
              <div className="screenshot-info">
                <div className="screenshot-title">Screen Attached</div>
                <div className="screenshot-sub">Ready to analyze with your question</div>
              </div>
              <button
                onClick={onCaptureScreen}
                className="context-remove-btn"
                title="Retake screenshot"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={onRemoveScreenshot}
                className="context-remove-btn"
                title="Remove screenshot"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {selectedText && (
            <div className="context-row">
              <span className="context-chip" title={selectedText}>
                <span>Selected: &quot;{selectedText.length > 35 ? selectedText.slice(0, 35) + '...' : selectedText}&quot;</span>
              </span>
              <button
                onClick={onRemoveSelectedText}
                className="context-remove-btn"
                title="Remove selected text context"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Error Banner ────────────────────────────────── */}
      {errorMessage && (
        <div className="assistant-error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={onDismissError}
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Messages Stream ─────────────────────────────── */}
      <div className="assistant-messages-area">
        {messages.length === 0 ? (
          <div className="assistant-welcome">
            <div className="welcome-icon-box">
              <Sparkles size={24} />
            </div>
            <h3 className="welcome-heading">How can I help you?</h3>
            <p className="welcome-desc">
              I can inspect whatever is on your screen, answer programming questions, debug errors, and speak answers aloud.
            </p>

            <div className="quick-chips-group">
              <button
                className="quick-action-chip"
                onClick={() => {
                  if (!screenshot) {
                    onCaptureScreen().then(() => onSendMessage('Explain what is on my screen.'));
                  } else {
                    onSendMessage('Explain what is on my screen.');
                  }
                }}
              >
                <Monitor size={13} />
                <span>Explain this screen</span>
              </button>
              <button
                className="quick-action-chip"
                onClick={() => {
                  if (!screenshot) {
                    onCaptureScreen().then(() => onSendMessage('Check for any bugs or potential issues.'));
                  } else {
                    onSendMessage('Check for any bugs or potential issues.');
                  }
                }}
              >
                <Sparkles size={13} />
                <span>Find bugs / errors</span>
              </button>
              <button
                className="quick-action-chip"
                onClick={() => onSendMessage('Summarize the main concepts on this page.')}
              >
                <span>Summarize page</span>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                {renderFormattedContent(msg.text, msg.id)}

                {msg.role === 'assistant' && (
                  <div className="assistant-message-actions">
                    {msg.spokenText && (
                      <button
                        onClick={() => onReplaySpeech(msg.spokenText)}
                        className="msg-action-btn"
                        title="Speak response"
                      >
                        <Volume2 size={12} />
                        <span>Listen</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCopyCode(msg.text, `msg-text-${msg.id}`)}
                      className="msg-action-btn"
                      title="Copy full text"
                    >
                      {copiedCodeId === `msg-text-${msg.id}` ? (
                        <Check size={12} color="#10b981" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{copiedCodeId === `msg-text-${msg.id}` ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Analyzing state */}
        {state === 'analyzing' && (
          <div className="analyzing-indicator">
            <div className="analyzing-spinner" />
            <span>Analyzing visual and voice context...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Live Listening Wave ─────────────────────────── */}
      {state === 'listening' && (
        <div className="live-listening-bar">
          <div className="sound-waves">
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
            <div className="wave-bar" />
          </div>
          <span className="interim-text">
            {interimTranscript || 'Listening... Speak your question now'}
          </span>
        </div>
      )}

      {/* ── Input Controls Footer ───────────────────────── */}
      <div className="assistant-panel-footer">
        <form onSubmit={handleSubmit} className="input-row">
          {/* One-click Microphone Button */}
          <button
            type="button"
            onClick={onToggleListen}
            className={`mic-action-btn ${state === 'listening' ? 'is-active' : ''}`}
            title={state === 'listening' ? 'Click to stop listening' : 'One-click voice input'}
            aria-label="Toggle microphone"
          >
            {state === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Screen Capture Button */}
          <button
            type="button"
            onClick={onCaptureScreen}
            className={`screen-action-btn ${screenshot ? 'has-screenshot' : ''}`}
            title={screenshot ? 'Screen captured (click to retake)' : 'Capture screen frame for AI context'}
            aria-label="Capture screen frame"
          >
            <Monitor size={18} />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={state === 'listening' ? 'Listening...' : 'Type or speak a question...'}
            className="assistant-input"
            disabled={state === 'analyzing'}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !screenshot && !selectedText) || state === 'analyzing'}
            className="send-action-btn"
            title="Send query"
            aria-label="Send query"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
