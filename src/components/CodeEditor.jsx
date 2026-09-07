import React, { useRef } from 'react';
import { Copy, Trash2 } from 'lucide-react';

function getFilename(lang = 'python') {
  switch ((lang || 'python').toLowerCase()) {
    case 'java':                return 'Main.java';
    case 'cpp': case 'c++':    return 'main.cpp';
    case 'javascript': case 'js': return 'app.js';
    case 'typescript': case 'ts': return 'app.ts';
    case 'c':                   return 'main.c';
    case 'csharp': case 'c#':  return 'Program.cs';
    case 'go':                  return 'main.go';
    case 'rust':                return 'main.rs';
    case 'ruby':                return 'script.rb';
    case 'php':                 return 'index.php';
    case 'python': default:     return 'script.py';
  }
}

export default function CodeEditor({ code, onChange, placeholder, language = 'python' }) {
  const lineNumbersRef = useRef(null);
  const lineCount   = Math.max(code.split('\n').length, 1);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    // Brief visual feedback is handled via the OS clipboard — no alert needed
  };

  const handleClear = () => onChange('');

  const filename = getFilename(language);

  return (
    <div className="editor-wrap">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="editor-tab">
          <span className="editor-tab-dot" />
          <span className="editor-tab-name">{filename}</span>
        </div>
        <div className="editor-actions">
          <button onClick={handleCopy}  className="editor-action-btn" title="Copy code" aria-label="Copy code">
            <Copy size={13} />
            <span>Copy</span>
          </button>
          <button onClick={handleClear} className="editor-action-btn editor-action-clear" title="Clear code" aria-label="Clear code">
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="editor-body">
        {/* Line numbers */}
        <div ref={lineNumbersRef} className="editor-gutter" aria-hidden="true">
          {lineNumbers.map((n) => (
            <div key={n} className="editor-line-num">{n}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder={placeholder || '# Paste or write your code here...'}
          className="editor-textarea"
          spellCheck="false"
          aria-label="Code input"
          aria-multiline="true"
        />
      </div>

      <style>{`
        .editor-wrap {
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg-input);
          box-shadow: var(--shadow-sm);
        }

        /* Toolbar */
        .editor-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 14px;
          height: 38px;
          background: #161b22;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        .editor-tab {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .editor-tab-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.7;
        }

        .editor-tab-name {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .editor-actions {
          display: flex;
          gap: 4px;
        }

        .editor-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          font-size: 0.75rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: var(--transition-fast);
        }

        .editor-action-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .editor-action-clear:hover {
          color: #f87171;
          background: rgba(248, 113, 113, 0.07);
        }

        /* Body */
        .editor-body {
          display: flex;
          height: 340px;
        }

        /* Gutter */
        .editor-gutter {
          width: 44px;
          padding: 14px 0;
          background: #0d1117;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding-right: 10px;
          user-select: none;
          overflow-y: hidden;
          flex-shrink: 0;
        }

        .editor-line-num {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: #3d4451;
          height: 22px;
          display: flex;
          align-items: center;
          line-height: 1;
        }

        /* Textarea */
        .editor-textarea {
          flex: 1;
          background: transparent;
          color: #c9d1d9;
          border: none;
          outline: none;
          resize: none;
          padding: 14px 16px;
          font-family: var(--font-mono);
          font-size: 0.84rem;
          line-height: 22px;
          overflow-y: auto;
          white-space: pre;
          tab-size: 4;
          caret-color: var(--accent);
        }

        .editor-textarea::placeholder {
          color: #3d4451;
          font-style: italic;
        }

        .editor-textarea:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
