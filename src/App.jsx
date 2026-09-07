import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Chat from './pages/Chat';
import CodeExplainer from './pages/CodeExplainer';
import Topics from './pages/Topics';
import About from './pages/About';
import VoiceAssistant from './components/assistant/VoiceAssistant';
import './components/assistant/pointer-fix.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      window.location.hash = 'home';
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: 'center' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '32px 24px', maxWidth: '500px', width: '100%' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '12px', color: '#f87171' }}>⚠️ Application Recovery Mode</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>A temporary browser rendering issue occurred. Click below to reset local state and restore Code Companion.</p>
            <button onClick={this.handleReset} style={{ padding: '12px 24px', borderRadius: '8px', background: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>Reset State &amp; Reload Application</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedTopicId, setSelectedTopicId] = useState('python-1');
  const isDesktopAssistant = typeof window !== 'undefined' && window.desktopAssistant?.isDesktop && window.location.hash === '#assistant';

  if (isDesktopAssistant) {
    return <ErrorBoundary><VoiceAssistant /></ErrorBoundary>;
  }

  useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.replace('#', '');
        if (['home', 'chat', 'explainer', 'topics', 'about'].includes(hash)) setCurrentPage(hash);
        else setCurrentPage('home');
      } catch (err) {
        console.warn('Hash parsing warning:', err);
        setCurrentPage('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handlePageChange = (pageId) => {
    try {
      setCurrentPage(pageId);
      window.location.hash = pageId;
    } catch (err) {
      console.warn('Page change warning:', err);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home setCurrentPage={handlePageChange} setSelectedTopicId={setSelectedTopicId} />;
      case 'chat': return <Chat />;
      case 'explainer': return <CodeExplainer />;
      case 'topics': return <Topics selectedTopicId={selectedTopicId} setSelectedTopicId={setSelectedTopicId} />;
      case 'about': return <About />;
      default: return <Home setCurrentPage={handlePageChange} setSelectedTopicId={setSelectedTopicId} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Navbar currentPage={currentPage} setCurrentPage={handlePageChange} />
        <main className="main-content">{renderPage()}</main>
        <Footer setCurrentPage={handlePageChange} />
        <VoiceAssistant />
      </div>
    </ErrorBoundary>
  );
}
