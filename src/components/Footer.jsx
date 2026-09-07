import React from 'react';
import { Code2 } from 'lucide-react';

export default function Footer({ setCurrentPage }) {
  const handleNav = (pageId) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <button className="footer-logo" onClick={() => handleNav('home')} aria-label="Go to home">
            <Code2 size={16} />
            <span>Code Companion</span>
          </button>
          <p className="footer-tagline">Learn. Understand. Build.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <button onClick={() => handleNav('home')}      className="footer-link">Home</button>
          <button onClick={() => handleNav('chat')}      className="footer-link">AI Tutor</button>
          <button onClick={() => handleNav('explainer')} className="footer-link">Code Companion</button>
          <button onClick={() => handleNav('topics')}    className="footer-link">Topics</button>
          <button onClick={() => handleNav('about')}     className="footer-link">About</button>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Code Companion · AI-powered programming education</p>
      </div>

      <style>{`
        .footer {
          background: var(--bg-surface);
          border-top: 1px solid var(--border);
          margin-top: auto;
          width: 100%;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 40px;
          flex-wrap: wrap;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          transition: var(--transition-fast);
        }

        .footer-logo:hover { color: var(--accent); }
        .footer-logo svg { color: var(--accent); }

        .footer-tagline {
          font-size: 0.82rem;
          color: var(--text-tertiary);
          font-style: italic;
        }

        .footer-nav {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }

        .footer-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-family: var(--font-sans);
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 5px;
          transition: var(--transition-fast);
        }

        .footer-link:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.04);
          font-size: 0.78rem;
          color: var(--text-tertiary);
        }

        @media (max-width: 640px) {
          .footer-inner {
            flex-direction: column;
            gap: 24px;
          }
          .footer-nav {
            gap: 4px;
          }
        }
      `}</style>
    </footer>
  );
}
