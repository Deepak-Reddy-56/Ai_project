import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Cpu,
  Zap,
  Coffee,
  Code,
  Layers,
  Box,
  BookOpen,
  CheckCircle2,
  Circle,
  Lightbulb,
  AlertTriangle,
  Check,
  Copy
} from 'lucide-react';
import { LANGUAGES, LEARNING_DATA } from '../data/learningLibraryData';

const ICON_MAP = {
  Terminal,
  Cpu,
  Zap,
  Coffee,
  Code,
  Layers,
  Box,
  BookOpen,
  CheckCircle2,
  Circle,
  Lightbulb,
  AlertTriangle,
  Check,
  Copy
};

const STORAGE_KEY = 'code_companion_learning_progress_v1';

export default function Topics({ selectedTopicId, setSelectedTopicId }) {
  // 1. Language state (default to Python)
  const [selectedLang, setSelectedLang] = useState('python');
  
  // 2. Progress state stored in localStorage { python: ['python-1'], cpp: [] }
  const [progressData, setProgressData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch {
      return {};
    }
  });

  // 3. Active topic selection
  const currentLangModules = LEARNING_DATA[selectedLang] || LEARNING_DATA.python;
  const [activeModuleId, setActiveModuleId] = useState(currentLangModules[0].id);

  // Sync active module if language changes or initial mount
  const activeModule = currentLangModules.find((m) => m.id === activeModuleId) || currentLangModules[0];
  const [copied, setCopied] = useState(false);

  // Save progress to localStorage whenever progressData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    } catch (e) {
      console.warn('Unable to save progress to localStorage:', e);
    }
  }, [progressData]);

  // Handle switching language
  const handleSelectLanguage = (langId) => {
    setSelectedLang(langId);
    const firstModuleOfLang = (LEARNING_DATA[langId] || LEARNING_DATA.python)[0];
    setActiveModuleId(firstModuleOfLang.id);
    if (setSelectedTopicId) {
      setSelectedTopicId(firstModuleOfLang.id);
    }
  };

  // Handle selecting module
  const handleSelectModule = (moduleId) => {
    setActiveModuleId(moduleId);
    if (setSelectedTopicId) {
      setSelectedTopicId(moduleId);
    }
  };

  // Toggle module completion status
  const toggleModuleCompletion = (moduleId) => {
    setProgressData((prev) => {
      const langCompleted = Array.isArray(prev?.[selectedLang]) ? prev[selectedLang] : [];
      const isCompleted = langCompleted.includes(moduleId);
      const updatedLangCompleted = isCompleted
        ? langCompleted.filter((id) => id !== moduleId)
        : [...langCompleted, moduleId];

      return {
        ...prev,
        [selectedLang]: updatedLangCompleted,
      };
    });
  };

  // Copy code helper
  const handleCopyCode = (codeText) => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress metrics for current language
  const completedForLang = Array.isArray(progressData?.[selectedLang]) ? progressData[selectedLang] : [];
  const totalModules = currentLangModules.length;
  const completedCount = currentLangModules.filter((m) => completedForLang.includes(m.id)).length;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  const activeLangConfig = LANGUAGES.find((l) => l.id === selectedLang) || LANGUAGES[0];
  const ActiveIcon = ICON_MAP[activeLangConfig.icon] || BookOpen;
  const isCurrentCompleted = activeModule ? completedForLang.includes(activeModule.id) : false;

  return (
    <div className="learning-library-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <h1 className="page-title">Learning Library</h1>
        <p className="page-subtitle">Choose a programming language and master core concepts step-by-step.</p>
      </div>

      {/* ── Language Selector ── */}
      <div className="language-selector-bar">
        <span className="selector-label">Select Language:</span>
        <div className="language-chips-grid">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.id;
            const langModules = LEARNING_DATA[lang.id] || [];
            const langDone = Array.isArray(progressData?.[lang.id]) ? progressData[lang.id].length : 0;
            const LangIcon = ICON_MAP[lang.icon] || Code;

            return (
              <button
                key={lang.id}
                onClick={() => handleSelectLanguage(lang.id)}
                className={`lang-chip ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
              >
                <LangIcon size={16} className="lang-chip-icon" style={{ color: lang.color }} />
                <span className="lang-chip-name">{lang.label}</span>
                <span className="lang-chip-badge">{langDone}/{langModules.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Progress Banner ── */}
      <div className="progress-banner">
        <div className="progress-info">
          <div className="progress-title-row">
            <ActiveIcon size={18} style={{ color: activeLangConfig.color }} />
            <h3 className="progress-lang-title">{activeLangConfig.label} Learning Roadmap</h3>
            <span className="progress-tag">{activeLangConfig.tag}</span>
          </div>
          <span className="progress-count-text">
            <strong>{completedCount}</strong> of <strong>{totalModules}</strong> modules completed ({progressPercent}%)
          </span>
        </div>

        <div className="progress-bar-wrapper" aria-label={`Progress: ${progressPercent}%`}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%`, backgroundColor: activeLangConfig.color }}
          />
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="library-layout">

        {/* Roadmap Sidebar */}
        <aside className="roadmap-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-label">Roadmap Modules</span>
            <span className="sidebar-sublabel">{activeLangConfig.label}</span>
          </div>
          <ul className="sidebar-list" role="list">
            {currentLangModules.map((module, idx) => {
              const isModuleActive = activeModule.id === module.id;
              const isModuleDone   = completedForLang.includes(module.id);

              return (
                <li key={module.id}>
                  <button
                    onClick={() => handleSelectModule(module.id)}
                    className={`sidebar-module-item ${isModuleActive ? 'active' : ''} ${isModuleDone ? 'completed' : ''}`}
                  >
                    <div className="module-item-status">
                      {isModuleDone ? (
                        <CheckCircle2 size={16} className="check-icon-done" />
                      ) : (
                        <span className="module-index">{idx + 1}</span>
                      )}
                    </div>
                    <span className="module-item-title">{module.title.replace(/^Module \d+ — /, '')}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Module Content Pane */}
        <main className="module-detail">

          {/* Module Detail Header */}
          <div className="module-header">
            <div className="module-title-area">
              <span className="module-badge" style={{ color: activeLangConfig.color, borderColor: `${activeLangConfig.color}40` }}>
                {activeLangConfig.label.toUpperCase()}
              </span>
              <h2 className="module-title">{activeModule.title}</h2>
              <p className="module-desc">{activeModule.description}</p>
            </div>

            <button
              onClick={() => toggleModuleCompletion(activeModule.id)}
              className={`completion-toggle-btn ${isCurrentCompleted ? 'completed' : ''}`}
            >
              {isCurrentCompleted ? (
                <><CheckCircle2 size={16} /><span>✓ Completed</span></>
              ) : (
                <><Circle size={16} /><span>Mark as Complete</span></>
              )}
            </button>
          </div>

          {/* Module Detail Body */}
          <div className="module-body">

            {/* Explanation */}
            <section className="detail-section">
              <h4 className="section-heading">Concept Explanation</h4>
              <p className="section-text">{activeModule.summary}</p>
            </section>

            {/* Why It Matters */}
            {activeModule.why && (
              <section className="detail-section why-section">
                <h4 className="section-heading">Why This Matters</h4>
                <p className="section-text">{activeModule.why}</p>
              </section>
            )}

            {/* Real-world Analogy */}
            {activeModule.analogy && (
              <section className="detail-section analogy-section" style={{ borderColor: `${activeLangConfig.color}40` }}>
                <div className="analogy-header">
                  <Lightbulb size={16} style={{ color: activeLangConfig.color }} />
                  <h4 className="analogy-label" style={{ color: activeLangConfig.color }}>Real-world Analogy</h4>
                </div>
                <p className="analogy-text">{activeModule.analogy}</p>
              </section>
            )}

            {/* Key Elements */}
            {activeModule.concepts && activeModule.concepts.length > 0 && (
              <section className="detail-section">
                <h4 className="section-heading">Key Takeaways &amp; Components</h4>
                <ul className="concepts-list">
                  {activeModule.concepts.map((c, i) => (
                    <li key={i} className="concept-item">
                      <span className="concept-dot" style={{ backgroundColor: activeLangConfig.color }} />
                      <div>
                        <strong className="concept-name">{c.name}</strong>
                        <p className="concept-desc">{c.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Code Demonstration */}
            <section className="detail-section">
              <div className="code-header-row">
                <h4 className="section-heading">Code Example ({activeLangConfig.label})</h4>
                <button onClick={() => handleCopyCode(activeModule.codeExample)} className="copy-btn">
                  {copied ? (
                    <><Check size={13} className="copy-success" /><span>Copied!</span></>
                  ) : (
                    <><Copy size={13} /><span>Copy Code</span></>
                  )}
                </button>
              </div>
              <div className="code-block-container">
                <div className="code-block-header">{selectedLang.toUpperCase()}</div>
                <pre className="code-block-body"><code>{activeModule.codeExample}</code></pre>
              </div>
            </section>

            {/* Tips & Gotchas */}
            {activeModule.tips && (
              <section className="detail-section tip-section">
                <div className="tip-header">
                  <AlertTriangle size={16} className="tip-icon" />
                  <h4 className="tip-label">Beginner Tip &amp; Common Gotcha</h4>
                </div>
                <p className="tip-text">{activeModule.tips}</p>
              </section>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .learning-library-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: pageEnter 0.3s ease-out;
        }

        /* ── Language Selector ── */
        .language-selector-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 14px 16px;
        }

        .selector-label {
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
        }

        .language-chips-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .lang-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-input);
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .lang-chip:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }

        .lang-chip.selected {
          border-color: var(--accent);
          background: var(--accent-subtle);
          color: var(--text-primary);
          box-shadow: 0 0 0 1px var(--accent);
        }

        .lang-chip-badge {
          font-size: 0.72rem;
          padding: 2px 6px;
          border-radius: 99px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-tertiary);
        }

        /* ── Progress Banner ── */
        .progress-banner {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .progress-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-lang-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .progress-tag {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-tertiary);
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--bg-input);
          border: 1px solid var(--border);
        }

        .progress-count-text {
          font-size: 0.84rem;
          color: var(--text-secondary);
        }

        .progress-bar-wrapper {
          width: 100%;
          height: 8px;
          background: var(--bg-input);
          border-radius: 99px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        /* ── Main Layout ── */
        .library-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 20px;
          align-items: start;
        }

        /* ── Sidebar ── */
        .roadmap-sidebar {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 14px;
          position: sticky;
          top: 76px;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px 10px 4px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 8px;
        }

        .sidebar-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-tertiary);
        }

        .sidebar-sublabel {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--accent);
        }

        .sidebar-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .sidebar-module-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          text-align: left;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 7px;
          padding: 8px 10px;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: var(--transition-fast);
        }

        .sidebar-module-item:hover {
          background: var(--bg-input);
          border-color: var(--border);
        }

        .sidebar-module-item.active {
          background: var(--accent-subtle);
          border-color: var(--accent-border);
        }

        .module-item-status {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .check-icon-done {
          color: #4ade80;
        }

        .module-index {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-tertiary);
        }

        .module-item-title {
          font-size: 0.84rem;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .sidebar-module-item.completed .module-item-title {
          color: var(--text-secondary);
        }

        /* ── Detail Pane ── */
        .module-detail {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }

        .module-title-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .module-badge {
          display: inline-block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          border: 1px solid;
          padding: 2px 7px;
          border-radius: 4px;
          width: fit-content;
        }

        .module-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .module-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Completion toggle button */
        .completion-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--bg-input);
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.83rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          white-space: nowrap;
        }

        .completion-toggle-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }

        .completion-toggle-btn.completed {
          background: var(--status-green-bg);
          border-color: var(--status-green-border);
          color: #4ade80;
        }

        /* Module body */
        .module-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .detail-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-heading {
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-tertiary);
        }

        .section-text {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        /* Analogy */
        .analogy-section {
          border-left: 3px solid;
          padding: 14px 18px;
          background: var(--bg-elevated);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          gap: 6px;
        }

        .analogy-header {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .analogy-label {
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .analogy-text {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-style: italic;
          line-height: 1.6;
        }

        /* Concepts list */
        .concepts-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .concept-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }

        .concept-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-top: 7px;
          flex-shrink: 0;
        }

        .concept-name {
          font-size: 0.9rem;
          color: var(--text-primary);
          display: block;
          margin-bottom: 2px;
        }

        .concept-desc {
          font-size: 0.83rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Code block */
        .code-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: 1px solid var(--border);
          padding: 5px 11px;
          border-radius: 5px;
          color: var(--text-secondary);
          font-size: 0.77rem;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .copy-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .copy-success { color: #4ade80; }

        .code-block-container {
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg-input);
        }

        .code-block-header {
          padding: 7px 14px;
          background: #161b22;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .code-block-body {
          padding: 16px;
          margin: 0;
          overflow-x: auto;
        }

        .code-block-body code {
          font-family: var(--font-mono);
          font-size: 0.84rem;
          color: #c9d1d9;
          line-height: 1.65;
        }

        /* Tip */
        .tip-section {
          border: 1px solid rgba(217, 119, 6, 0.2);
          background: rgba(217, 119, 6, 0.04);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          gap: 7px;
        }

        .tip-header {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #fbbf24;
        }

        .tip-icon { color: #fbbf24; }

        .tip-label {
          font-size: 0.84rem;
          font-weight: 600;
        }

        .tip-text {
          font-size: 0.87rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .library-layout {
            grid-template-columns: 1fr;
          }
          .roadmap-sidebar {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
