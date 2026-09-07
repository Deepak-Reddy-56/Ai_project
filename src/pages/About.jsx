import React from 'react';
import { Code2, MessageSquare, BookOpen, Cpu, Layers, ArrowRight } from 'lucide-react';

const TECH_STACK = [
  { label: 'Frontend',    value: 'React + Vite',             note: 'Single-page application' },
  { label: 'Backend',     value: 'Node.js + Express',         note: 'REST API server' },
  { label: 'AI Engine',   value: 'Google Gemini',             note: 'gemini-3.6-flash via @google/genai' },
  { label: 'Language',    value: 'JavaScript (ES Modules)',   note: 'Frontend & backend' },
  { label: 'Styling',     value: 'Vanilla CSS',               note: 'Custom design system' },
  { label: 'Icons',       value: 'Lucide React',              note: 'UI icon library' },
];

const FEATURES = [
  {
    icon: Code2,
    title: 'Code Companion',
    desc: 'Paste any code snippet and get structured AI feedback: what it does, whether there\'s an issue, and how to fix or improve it.',
    color: '#2563eb',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor Chat',
    desc: 'Ask programming questions in plain English and get clear, beginner-friendly explanations with working code examples.',
    color: '#0d9488',
  },
  {
    icon: BookOpen,
    title: 'Learning Topics',
    desc: 'Browse structured concept guides covering variables, loops, functions, OOP, debugging, and more — each with analogies and demos.',
    color: '#7c3aed',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'You paste code or ask a question', desc: 'No setup needed. Just write or paste directly into the interface.' },
  { step: '02', title: 'Code Companion sends it to Gemini', desc: 'Your input is sent to the backend, which builds a structured pedagogical prompt.' },
  { step: '03', title: 'Gemini analyzes and responds', desc: 'The AI returns a structured response: status, explanation, issue, fix, and follow-up learning.' },
  { step: '04', title: 'You see organized feedback', desc: 'The UI renders the response clearly — no raw JSON, no walls of text, just readable learning guidance.' },
];

export default function About() {
  return (
    <div className="about-page">

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">About Code Companion</h1>
        <p className="page-subtitle">An AI-powered programming tutor built to help beginners actually understand their code.</p>
      </div>

      {/* What is it */}
      <section className="about-section">
        <div className="about-card about-intro-card">
          <div className="intro-icon">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="about-card-title">What is Code Companion?</h2>
            <p className="about-card-text">
              Code Companion is an AI programming tutor designed specifically for learners who want to 
              <strong> understand</strong> their code, not just get answers.
            </p>
            <p className="about-card-text" style={{ marginTop: '10px' }}>
              Most tools give you a solution. Code Companion gives you the <em>why</em> behind it — 
              explaining what your code does, what might be wrong, why the error happens, and how 
              to think about fixing it.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="about-section">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="feature-card">
                <div className="feature-card-icon" style={{ background: `${f.color}12`, borderColor: `${f.color}25`, color: f.color }}>
                  <Icon size={20} />
                </div>
                <h3 className="feature-card-title">{f.title}</h3>
                <p className="feature-card-desc">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="about-section">
        <h2 className="section-title">How It Works</h2>
        <div className="how-grid">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={i} className="how-item">
              <div className="how-step-num">{item.step}</div>
              <div className="how-content">
                <h3 className="how-title">{item.title}</h3>
                <p className="how-desc">{item.desc}</p>
              </div>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="how-arrow"><ArrowRight size={16} /></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="about-section">
        <h2 className="section-title">Technology</h2>
        <div className="tech-card">
          <div className="tech-header">
            <Layers size={16} />
            <span>Tech Stack</span>
          </div>
          <div className="tech-table">
            {TECH_STACK.map((item) => (
              <div key={item.label} className="tech-row">
                <span className="tech-label">{item.label}</span>
                <div className="tech-right">
                  <span className="tech-value">{item.value}</span>
                  <span className="tech-note">{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design principles */}
      <section className="about-section">
        <div className="principle-banner">
          <h2 className="principle-title">"The user should never have to think: should I click Explain or Debug?"</h2>
          <p className="principle-sub">
            Code Companion is built around one core insight: learners don't know if their code is correct 
            or broken — that's exactly why they need help. So the entire experience starts with 
            a single action: <strong>Analyze Code</strong>.
          </p>
        </div>
      </section>

      <style>{`
        .about-page {
          display: flex;
          flex-direction: column;
          gap: 40px;
          animation: pageEnter 0.3s ease-out;
          max-width: 900px;
        }

        .about-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: var(--font-heading);
          letter-spacing: -0.01em;
        }

        /* Intro card */
        .about-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
        }

        .about-intro-card {
          display: flex;
          gap: 18px;
          align-items: flex-start;
        }

        .intro-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: var(--accent-subtle);
          border: 1px solid var(--accent-border);
          color: var(--accent);
          flex-shrink: 0;
        }

        .about-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .about-card-text {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        .about-card-text strong { color: var(--text-primary); }
        .about-card-text em    { color: var(--accent); font-style: normal; font-weight: 600; }

        /* Features grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .feature-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: var(--transition-fast);
        }

        .feature-card:hover {
          border-color: var(--border-hover);
          background: var(--bg-elevated);
        }

        .feature-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 9px;
          border: 1px solid;
        }

        .feature-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .feature-card-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        /* How it works */
        .how-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
        }

        .how-item {
          background: var(--bg-surface);
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .how-step-num {
          font-size: 0.7rem;
          font-weight: 800;
          font-family: var(--font-mono);
          color: var(--accent);
          letter-spacing: 0.05em;
        }

        .how-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .how-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        .how-arrow {
          display: none; /* handled by grid gap */
        }

        /* Tech stack */
        .tech-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .tech-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 18px;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .tech-table {
          display: flex;
          flex-direction: column;
        }

        .tech-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          gap: 16px;
        }

        .tech-row:last-child { border-bottom: none; }

        .tech-label {
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-secondary);
          min-width: 90px;
        }

        .tech-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .tech-value {
          font-size: 0.88rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .tech-note {
          font-size: 0.77rem;
          color: var(--text-tertiary);
        }

        /* Principle banner */
        .principle-banner {
          background: var(--accent-subtle);
          border: 1px solid var(--accent-border);
          border-radius: var(--radius-lg);
          padding: 28px 32px;
        }

        .principle-title {
          font-size: 1.2rem;
          font-style: italic;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 14px;
          line-height: 1.4;
        }

        .principle-sub {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.65;
          max-width: 720px;
        }

        .principle-sub strong { color: var(--text-primary); }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          .how-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .how-grid {
            grid-template-columns: 1fr;
          }
          .about-intro-card {
            flex-direction: column;
          }
          .principle-banner {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
