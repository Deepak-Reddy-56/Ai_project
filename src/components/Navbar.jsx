import React, { useState } from 'react';
import { Code2, Menu, X } from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home',      label: 'Home' },
    { id: 'chat',      label: 'AI Tutor' },
    { id: 'explainer', label: 'Code Companion' },
    { id: 'topics',    label: 'Topics' },
    { id: 'about',     label: 'About' },
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <button
          className="navbar-brand"
          onClick={() => handleNavClick('home')}
          aria-label="Go to Home"
        >
          <div className="brand-logo">
            <Code2 size={18} />
          </div>
          <span className="brand-text">Code<span className="brand-accent">Companion</span></span>
        </button>

        {/* Desktop links */}
        <ul className="nav-links" role="list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="mobile-drawer" role="menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              onClick={() => handleNavClick(item.id)}
              className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(15, 17, 23, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          width: 100%;
        }

        .navbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        /* Brand */
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          text-decoration: none;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 7px;
          background: var(--accent-subtle);
          border: 1px solid var(--accent-border);
          color: var(--accent);
          flex-shrink: 0;
        }

        .brand-text {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .brand-accent {
          color: var(--accent);
        }

        /* Desktop links */
        .nav-links {
          display: flex;
          list-style: none;
          gap: 2px;
          align-items: center;
          margin-left: auto;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          padding: 6px 13px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-link:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        .nav-link.active {
          color: var(--accent);
          background: var(--accent-subtle);
          font-weight: 600;
        }

        /* Mobile toggle */
        .mobile-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          background: none;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          transition: var(--transition-fast);
          flex-shrink: 0;
        }

        .mobile-toggle:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        /* Mobile drawer */
        .mobile-drawer {
          display: flex;
          flex-direction: column;
          border-top: 1px solid var(--border);
          padding: 12px 16px;
          background: var(--bg-surface);
          animation: slideDown 0.18s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mobile-nav-link {
          display: block;
          width: 100%;
          text-align: left;
          padding: 11px 12px;
          border-radius: 7px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .mobile-nav-link:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .mobile-nav-link.active {
          color: var(--accent);
          font-weight: 600;
          background: var(--accent-subtle);
        }

        @media (max-width: 768px) {
          .nav-links { display: none; }
          .mobile-toggle { display: flex; }
        }
      `}</style>
    </nav>
  );
}
