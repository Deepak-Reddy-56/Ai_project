import React from 'react';
import { ArrowRight, MessageSquare, Code2, Search } from 'lucide-react';

export default function Home({ setCurrentPage }) {
  return (
    <div className="home-page">

      {/* ── Hero ────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-badge">AI Programming Tutor</span>
        </div>

        <h1 className="hero-headline">
          Learn to code by<br />
          <span className="hero-accent">understanding</span> your code.
        </h1>

        <p className="hero-body">
          Your AI programming companion explains concepts, analyzes your code,
          finds potential issues, and helps you learn step by step.
        </p>

        <div className="hero-ctas">
          <button
            onClick={() => setCurrentPage('explainer')}
            className="btn btn-primary hero-cta-primary"
          >
            <Code2 size={17} />
            Try Code Companion
          </button>
          <button
            onClick={() => setCurrentPage('chat')}
            className="btn btn-secondary"
          >
            <MessageSquare size={17} />
            Ask the Tutor
          </button>
        </div>
      </section>

      {/* ── Product Preview ──────────────────────────── */}
      <section className="preview-section">
        <div className="preview-card">
          {/* Left: Code */}
          <div className="preview-editor">
            <div className="preview-tab-bar">
              <span className="preview-tab active">script.py</span>
            </div>
            <pre className="preview-code">{`numbers = [10, 20, 30]

for i in range(len(numbers)):
    print(numbers[i + 1])`}</pre>
          </div>

          {/* Divider arrow */}
          <div className="preview-arrow">
            <ArrowRight size={20} />
          </div>

          {/* Right: AI Result */}
          <div className="preview-result">
            <div className="preview-status-badge red">
              🔴 Potential Issue Detected
            </div>
            <div className="preview-result-section">
              <span className="preview-label">What went wrong</span>
              <p>IndexError: list index out of range on the last iteration.</p>
            </div>
            <div className="preview-result-section">
              <span className="preview-label">Why it happens</span>
              <p>On the last loop, <code className="inline-code">i + 1</code> exceeds the list bounds.</p>
            </div>
            <div className="preview-result-section">
              <span className="preview-label">Suggested fix</span>
              <pre className="preview-fix-code">{"print(numbers[i])"}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Feature Strip ──────────────────────────── */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon-wrap">
              <MessageSquare size={20} />
            </div>
            <h3 className="feature-title">Ask</h3>
            <p className="feature-desc">
              Get beginner-friendly programming explanations in plain English.
            </p>
            <button
              onClick={() => setCurrentPage('chat')}
              className="feature-cta"
            >
              Ask the Tutor <ArrowRight size={14} />
            </button>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap accent">
              <Code2 size={20} />
            </div>
            <h3 className="feature-title">Analyze</h3>
            <p className="feature-desc">
              Paste code and let Code Companion identify issues or explain how it works.
            </p>
            <button
              onClick={() => setCurrentPage('explainer')}
              className="feature-cta"
            >
              Analyze Code <ArrowRight size={14} />
            </button>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <Search size={20} />
            </div>
            <h3 className="feature-title">Learn</h3>
            <p className="feature-desc">
              Turn confusing code into concepts you can actually understand and remember.
            </p>
            <button
              onClick={() => setCurrentPage('topics')}
              className="feature-cta"
            >
              Browse Topics <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      <style>{`
        .home-page {
          display: flex;
          flex-direction: column;
          gap: 56px;
          animation: pageEnter 0.3s ease-out;
        }

        /* ── Hero ── */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
          padding: 48px 0 16px;
          max-width: 680px;
        }

        .hero-eyebrow {
          display: flex;
        }

        .eyebrow-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 99px;
          border: 1px solid var(--accent-border);
          background: var(--accent-subtle);
          color: var(--accent);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          font-family: var(--font-sans);
        }

        .hero-headline {
          font-size: clamp(2rem, 4vw, 3rem);
          font-family: var(--font-heading);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .hero-accent {
          color: var(--accent);
        }

        .hero-body {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.65;
          max-width: 560px;
        }

        .hero-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-cta-primary {
          padding: 11px 22px;
          font-size: 0.95rem;
        }

        /* ── Preview Card ── */
        .preview-section {
          width: 100%;
        }

        .preview-card {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .preview-editor {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
        }

        .preview-tab-bar {
          background: #161b22;
          border-bottom: 1px solid var(--border);
          padding: 0 16px;
          display: flex;
        }

        .preview-tab {
          display: inline-flex;
          padding: 10px 0;
          font-size: 0.78rem;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
        }

        .preview-tab.active {
          color: var(--text-primary);
          border-bottom-color: var(--accent);
        }

        .preview-code {
          padding: 20px;
          font-family: var(--font-mono);
          font-size: 0.82rem;
          color: #c9d1d9;
          line-height: 1.7;
          background: var(--bg-input);
          flex: 1;
          margin: 0;
          overflow-x: auto;
        }

        .preview-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          color: var(--text-tertiary);
          background: var(--bg-surface);
        }

        .preview-result {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .preview-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          width: fit-content;
        }

        .preview-status-badge.red {
          background: var(--status-red-bg);
          border: 1px solid var(--status-red-border);
          color: #f87171;
        }

        .preview-result-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .preview-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
        }

        .preview-result-section p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .preview-fix-code {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: #79c0ff;
          background: rgba(121, 192, 255, 0.05);
          border: 1px solid rgba(121, 192, 255, 0.12);
          border-radius: 5px;
          padding: 8px 10px;
          margin: 0;
        }

        /* ── Feature Strip ── */
        .features-section {
          padding-bottom: 8px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .feature-item {
          background: var(--bg-surface);
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: background 0.15s;
        }

        .feature-item:hover {
          background: var(--bg-elevated);
        }

        .feature-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          margin-bottom: 2px;
        }

        .feature-icon-wrap.accent {
          background: var(--accent-subtle);
          border-color: var(--accent-border);
          color: var(--accent);
        }

        .feature-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-heading);
        }

        .feature-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.55;
          flex: 1;
        }

        .feature-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--accent);
          font-size: 0.82rem;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          padding: 0;
          margin-top: 4px;
          transition: gap 0.15s;
        }

        .feature-cta:hover { gap: 10px; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .preview-card {
            grid-template-columns: 1fr;
          }
          .preview-editor {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .preview-arrow {
            display: none;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .hero {
            padding-top: 32px;
          }
          .hero-ctas {
            flex-direction: column;
            width: 100%;
          }
          .hero-ctas .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
