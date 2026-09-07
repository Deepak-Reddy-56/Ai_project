import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, Code2, ChevronRight, RefreshCw } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { getCustomAnalyzeResponse } from '../data/demoResponses';
import { askAI } from '../services/aiService';

const LANGUAGES = [
  { id: 'python',     label: 'Python' },
  { id: 'java',       label: 'Java' },
  { id: 'cpp',        label: 'C++' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'c',          label: 'C' },
  { id: 'csharp',     label: 'C#' },
  { id: 'go',         label: 'Go' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'ruby',       label: 'Ruby' },
  { id: 'rust',       label: 'Rust' },
];

const LEVELS = [
  { id: 'beginner',     label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced',     label: 'Advanced' },
];

const PRESETS = [
  {
    label: 'Python (Correct)',
    language: 'python',
    code: `numbers = [1, 2, 3, 4, 5]\n\nfor number in numbers:\n    print(number)`,
  },
  {
    label: 'Python (Incorrect)',
    language: 'python',
    code: `numbers = [10, 20, 30]\n\nfor i in range(len(numbers)):\n    print(numbers[i + 1])`,
  },
  {
    label: 'C++ (Type & Syntax Error)',
    language: 'cpp',
    code: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 10;\n    string y = "5";\n\n    cout << x + y;\n\n    return 0;\n]`,
  },
  {
    label: 'Python (Uncertain Context)',
    language: 'python',
    code: `result = calculate_total(items)\nprint(result)`,
  },
];

const LOADING_MESSAGES = [
  'Analyzing your code structure...',
  'Looking for potential issues...',
  'Preparing your explanation...',
];

export default function CodeExplainer() {
  const [code, setCode]         = useState(PRESETS[0].code);
  const [language, setLanguage] = useState('python');
  const [level, setLevel]       = useState('beginner');
  const [question, setQuestion] = useState('');

  const [isLoading, setIsLoading]           = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isExplainingMore, setIsExplainingMore] = useState(false);
  const [offlineNotice, setOfflineNotice]   = useState(null);

  const [analysisResult, setAnalysisResult]       = useState(null);
  const [detailedExplanation, setDetailedExplanation] = useState(null);

  // Rotate loading messages
  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1200);
    } else {
      setLoadingMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Parse JSON or text response from Gemini
  const parseResponseData = (rawText) => {
    if (!rawText) return null;
    try {
      let clean = rawText.trim();
      if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');

      const obj = JSON.parse(clean);
      return {
        status:      obj.status      || 'correct',
        summary:     obj.summary     || '',
        issue:       obj.issue       || '',
        why:         obj.why         || '',
        fix:         obj.fix         || '',
        explanation: obj.explanation || '',
        followUp:    obj.followUp    || obj.follow_up || '',
      };
    } catch {
      const lower = rawText.toLowerCase();
      const status =
        lower.includes('error') || lower.includes('bug') || lower.includes('issue') ||
        lower.includes('indexerror') || lower.includes('typeerror')
          ? 'issue'
          : 'correct';
      return {
        status,
        summary:     'Analysis of code structure',
        issue:       status === 'issue' ? rawText : '',
        why:         '',
        fix:         '',
        explanation: status === 'correct' ? rawText : '',
        followUp:    '',
      };
    }
  };

  const handleAnalyze = async () => {
    if (!code.trim()) { alert('Please enter or paste some code first!'); return; }
    setIsLoading(true);
    setAnalysisResult(null);
    setDetailedExplanation(null);
    setOfflineNotice(null);

    try {
      const aiResult = await askAI({ mode: 'analyze', question: question.trim(), code, language, level });
      if (aiResult.success && aiResult.response) {
        setAnalysisResult(parseResponseData(aiResult.response));
      } else {
        setOfflineNotice(aiResult.error || 'Server unavailable');
        setAnalysisResult(getCustomAnalyzeResponse(code, language));
      }
    } catch (err) {
      console.error('Analyze failed:', err);
      setOfflineNotice(err.message);
      setAnalysisResult(getCustomAnalyzeResponse(code, language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchExplanation = async () => {
    if (!code.trim()) return;
    setIsExplainingMore(true);
    try {
      const aiResult = await askAI({ mode: 'explain', question: 'Explain this code in detail for a beginner student.', code, language, level });
      if (aiResult.success && aiResult.response) {
        setDetailedExplanation(aiResult.response);
      } else {
        setDetailedExplanation('*(Offline Fallback Explanation)*\n\nThis code processes operations line by line. Review the variable declarations, loop conditions, and data types used.');
      }
    } catch (err) {
      setDetailedExplanation(`⚠️ Unable to fetch explanation: ${err.message}`);
    } finally {
      setIsExplainingMore(false);
    }
  };

  const loadPreset = (preset) => {
    setCode(preset.code);
    setLanguage(preset.language);
    setQuestion('');
    setAnalysisResult(null);
    setDetailedExplanation(null);
    setOfflineNotice(null);
  };

  // Render markdown-ish text with code blocks
  const renderFormattedText = (text) => {
    if (!text) return null;
    const blocks = text.split('```');
    return blocks.map((block, idx) => {
      if (idx % 2 === 1) {
        const lines      = block.split('\n');
        const langHeader = lines[0].trim();
        const codeText   = lines.slice(langHeader ? 1 : 0).join('\n').trim();
        return (
          <div key={idx} className="result-code-block">
            <div className="result-code-header">{langHeader.toUpperCase() || language.toUpperCase()}</div>
            <pre className="result-code-body"><code>{codeText || block}</code></pre>
          </div>
        );
      }
      const lines = block.split('\n');
      return (
        <div key={idx} className="result-text-chunk">
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} style={{ height: '6px' }} />;
            const fmt = line
              .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');
            return <p key={lIdx} dangerouslySetInnerHTML={{ __html: fmt }} className="result-paragraph" />;
          })}
        </div>
      );
    });
  };

  return (
    <div className="companion-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <h1 className="page-title">Code Companion</h1>
        <p className="page-subtitle">Paste your code and I'll figure out what you need help with.</p>
      </div>

      {/* ── Controls Toolbar ── */}
      <div className="companion-toolbar">
        <div className="toolbar-controls">
          <div className="control-group">
            <label htmlFor="language-select" className="control-label">Language</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="control-select"
            >
              {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="level-select" className="control-label">Level</label>
            <select
              id="level-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="control-select"
            >
              {LEVELS.map((lvl) => <option key={lvl.id} value={lvl.id}>{lvl.label}</option>)}
            </select>
          </div>
        </div>

        <div className="toolbar-presets">
          <span className="presets-label">Samples:</span>
          <div className="presets-list">
            {PRESETS.map((p, idx) => (
              <button key={idx} onClick={() => loadPreset(p)} className="preset-btn">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="companion-grid">

        {/* Left: Editor + Question + Button */}
        <div className="editor-col">
          <CodeEditor
            code={code}
            onChange={(val) => setCode(val)}
            language={language}
            placeholder={`// Write or paste your ${language.toUpperCase()} code here...`}
          />

          <div className="question-field">
            <label htmlFor="optional-question-input" className="question-label">
              <HelpCircle size={13} />
              Anything specific you want to know? <span className="label-optional">(optional)</span>
            </label>
            <input
              id="optional-question-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Why does this loop start at 0? / How do I fix this error?"
              className="question-input"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="analyze-btn"
            aria-busy={isLoading}
          >
            <Sparkles size={17} className="analyze-btn-icon" />
            {isLoading ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </div>

        {/* Right: Results */}
        <div className="results-col">
          {/* Offline banner */}
          {offlineNotice && (
            <div className="offline-banner" role="alert">
              ⚠️ AI tutor is temporarily unavailable. Using offline fallback. ({offlineNotice})
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner" aria-hidden="true" />
              <p className="loading-text">{LOADING_MESSAGES[loadingMsgIndex]}</p>
              <span className="loading-sub">Examining code logic and concepts</span>
            </div>

          /* Empty state */
          ) : !analysisResult ? (
            <div className="empty-state">
              <Code2 size={36} className="empty-icon" aria-hidden="true" />
              <p className="empty-title">Ready for Analysis</p>
              <p className="empty-sub">
                Select your language, paste your code, and click <strong>Analyze Code</strong>.
              </p>
            </div>

          /* Results */
          ) : (
            <div className="analysis-results">

              {/* Status badge */}
              {analysisResult.status === 'correct' && (
                <div className="status-badge badge-green">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <div>
                    <div className="badge-title">🟢 Code Looks Good</div>
                    <div className="badge-sub">No issues found based on my analysis.</div>
                  </div>
                </div>
              )}
              {analysisResult.status === 'issue' && (
                <div className="status-badge badge-red">
                  <AlertTriangle size={18} aria-hidden="true" />
                  <div>
                    <div className="badge-title">🔴 Potential Issue Detected</div>
                    <div className="badge-sub">I found a likely problem in this snippet.</div>
                  </div>
                </div>
              )}
              {analysisResult.status === 'uncertain' && (
                <div className="status-badge badge-amber">
                  <AlertCircle size={18} aria-hidden="true" />
                  <div>
                    <div className="badge-title">🟡 Something to Check</div>
                    <div className="badge-sub">This code may work, but there's a potential caveat.</div>
                  </div>
                </div>
              )}

              {/* Result sections */}
              <div className="result-sections">
                {analysisResult.summary && (
                  <div className="result-card">
                    <h4 className="result-card-heading">What your code does</h4>
                    {renderFormattedText(analysisResult.summary)}
                  </div>
                )}

                {analysisResult.issue && (
                  <div className="result-card result-card-issue">
                    <h4 className="result-card-heading heading-red">What went wrong</h4>
                    {renderFormattedText(analysisResult.issue)}
                  </div>
                )}

                {analysisResult.why && (
                  <div className="result-card">
                    <h4 className="result-card-heading">Why it happens</h4>
                    {renderFormattedText(analysisResult.why)}
                  </div>
                )}

                {analysisResult.fix && (
                  <div className="result-card">
                    <h4 className="result-card-heading">Suggested fix</h4>
                    <div className="fix-block">
                      <pre className="fix-pre"><code>{analysisResult.fix}</code></pre>
                    </div>
                  </div>
                )}

                {analysisResult.explanation && (
                  <div className="result-card">
                    <h4 className="result-card-heading">How it works &amp; Key concepts</h4>
                    {renderFormattedText(analysisResult.explanation)}
                  </div>
                )}

                {/* Yes, explain it — only for issue status */}
                {analysisResult.status === 'issue' && (
                  <div className="explain-more-card">
                    <h4 className="explain-more-title">Want me to explain the code too?</h4>
                    <p className="explain-more-desc">I can break down how this program works step-by-step.</p>

                    {detailedExplanation ? (
                      <div className="expanded-explanation">
                        <h5 className="expanded-label">Detailed Explanation</h5>
                        {renderFormattedText(detailedExplanation)}
                      </div>
                    ) : (
                      <button
                        onClick={handleFetchExplanation}
                        disabled={isExplainingMore}
                        className="explain-btn"
                      >
                        {isExplainingMore ? (
                          <><RefreshCw size={14} className="spin-icon" /><span>Fetching explanation...</span></>
                        ) : (
                          <><ChevronRight size={15} /><span>Yes, explain it</span></>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {analysisResult.followUp && (
                  <div className="result-card result-card-followup">
                    <h4 className="result-card-heading heading-accent">Try this next</h4>
                    {renderFormattedText(analysisResult.followUp)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ── Page ── */
        .companion-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: pageEnter 0.3s ease-out;
        }

        /* ── Toolbar ── */
        .companion-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding: 12px 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }

        .toolbar-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .control-select {
          background: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 0.84rem;
          outline: none;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .control-select:focus {
          border-color: var(--border-focus);
        }

        .toolbar-presets {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .presets-label {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          white-space: nowrap;
        }

        .presets-list {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .preset-btn {
          background: var(--bg-input);
          border: 1px solid var(--border);
          padding: 5px 11px;
          border-radius: var(--radius-sm);
          font-size: 0.76rem;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
        }

        .preset-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        /* ── Main Grid ── */
        .companion-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: start;
        }

        /* ── Editor column ── */
        .editor-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .question-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .question-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .question-label svg { color: var(--accent); }

        .label-optional {
          color: var(--text-tertiary);
          font-weight: 400;
        }

        .question-input {
          padding: 9px 13px;
          font-family: var(--font-sans);
          font-size: 0.87rem;
          color: var(--text-primary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-input);
          outline: none;
          transition: border-color 0.15s;
          width: 100%;
        }

        .question-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .question-input::placeholder {
          color: var(--text-tertiary);
        }

        /* Analyze button */
        .analyze-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-md);
          background: var(--accent);
          color: #fff;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: var(--transition-fast);
          letter-spacing: 0.01em;
        }

        .analyze-btn:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
        }

        .analyze-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .analyze-btn-icon {
          color: #fde68a;
        }

        /* ── Results column ── */
        .results-col {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          min-height: 460px;
          display: flex;
          flex-direction: column;
        }

        /* Offline banner */
        .offline-banner {
          background: rgba(220, 38, 38, 0.07);
          border-bottom: 1px solid rgba(220, 38, 38, 0.2);
          color: #fca5a5;
          padding: 10px 16px;
          font-size: 0.8rem;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        /* Loading */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 12px;
          padding: 40px 20px;
          color: var(--text-secondary);
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 2px solid rgba(37, 99, 235, 0.15);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-text {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .loading-sub {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          gap: 10px;
          text-align: center;
          padding: 48px 24px;
          color: var(--text-secondary);
        }

        .empty-icon { color: var(--accent); opacity: 0.4; }
        .empty-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
        .empty-sub { font-size: 0.85rem; max-width: 280px; line-height: 1.55; }

        /* Analysis results */
        .analysis-results {
          display: flex;
          flex-direction: column;
          gap: 0;
          flex: 1;
        }

        /* Status badges */
        .status-badge {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px 16px;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          border-bottom: 1px solid;
          flex-shrink: 0;
        }

        .badge-green {
          background: var(--status-green-bg);
          border-bottom-color: var(--status-green-border);
          color: #4ade80;
        }
        .badge-red {
          background: var(--status-red-bg);
          border-bottom-color: var(--status-red-border);
          color: #f87171;
        }
        .badge-amber {
          background: var(--status-amber-bg);
          border-bottom-color: var(--status-amber-border);
          color: #fbbf24;
        }

        .status-badge svg { flex-shrink: 0; margin-top: 2px; }

        .badge-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .badge-sub {
          font-size: 0.8rem;
          opacity: 0.85;
        }

        /* Result sections */
        .result-sections {
          display: flex;
          flex-direction: column;
          gap: 0;
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          gap: 12px;
        }

        .result-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 13px 15px;
        }

        .result-card-issue {
          border-color: var(--status-red-border);
          background: var(--status-red-bg);
        }

        .result-card-followup {
          border-color: rgba(13, 148, 136, 0.2);
          background: rgba(13, 148, 136, 0.04);
        }

        .result-card-heading {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .heading-red    { color: #f87171; }
        .heading-accent { color: var(--accent-teal); }

        .result-paragraph {
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .result-text-chunk { margin-bottom: 4px; }

        .result-code-block {
          border-radius: 6px;
          overflow: hidden;
          margin: 8px 0;
          border: 1px solid var(--border);
        }

        .result-code-header {
          padding: 5px 12px;
          background: #161b22;
          border-bottom: 1px solid var(--border);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
          font-family: var(--font-mono);
        }

        .result-code-body {
          padding: 10px 12px;
          margin: 0;
          overflow-x: auto;
          background: var(--bg-input);
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: #c9d1d9;
          line-height: 1.6;
        }

        /* Fix block */
        .fix-block {
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 6px;
          overflow-x: auto;
          padding: 10px 13px;
        }

        .fix-pre {
          margin: 0;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: #79c0ff;
          line-height: 1.6;
        }

        /* Explain more card */
        .explain-more-card {
          background: var(--accent-subtle);
          border: 1px solid var(--accent-border);
          border-radius: var(--radius-md);
          padding: 13px 15px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .explain-more-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .explain-more-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .explain-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          padding: 7px 14px;
          border-radius: var(--radius-md);
          background: var(--accent);
          border: none;
          color: #fff;
          font-family: var(--font-sans);
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .explain-btn:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .explain-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .spin-icon {
          animation: spin 0.75s linear infinite;
        }

        .expanded-explanation {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--accent-border);
        }

        .expanded-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .companion-grid {
            grid-template-columns: 1fr;
          }
          .toolbar-presets {
            width: 100%;
          }
          .companion-toolbar {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .toolbar-controls { gap: 12px; }
          .presets-list { gap: 5px; }
        }
      `}</style>
    </div>
  );
}
