import React from 'react';
import { Mic, MicOff, Sparkles, Volume2, Monitor, AlertCircle } from 'lucide-react';
import './jarvis.css';

export default function AssistantTrigger({
  state = 'idle',
  hasScreenshot = false,
  isOpen = false,
  isHandsFree = false,
  onClick
}) {
  const getStateLabel = () => {
    if (isHandsFree && state === 'idle') return 'Hey Assistant ready';
    switch (state) {
      case 'listening': return 'Listening';
      case 'analyzing': return 'Thinking';
      case 'speaking': return 'Speaking';
      case 'error': return 'Needs attention';
      default: return 'Open assistant';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'listening': return <Mic size={16} />;
      case 'analyzing': return <Sparkles size={16} className="assistant-trigger-spin" />;
      case 'speaking': return <Volume2 size={16} />;
      case 'error': return <AlertCircle size={16} />;
      default: return isHandsFree ? <Mic size={16} /> : <MicOff size={16} />;
    }
  };

  return (
    <button
      className={`assistant-trigger-btn is-${state} ${isHandsFree ? 'hands-free' : ''} ${isOpen ? 'is-open' : ''}`}
      onClick={onClick}
      aria-label="Open voice assistant"
      title={isHandsFree ? 'Hey Assistant is active. Open assistant.' : 'Open voice assistant'}
    >
      <span className="trigger-signal" aria-hidden="true" />
      <span className="trigger-icon-wrap">{getIcon()}</span>
      <span className="trigger-copy">
        <span className="trigger-name">Assistant</span>
        <span className="trigger-label">{getStateLabel()}</span>
      </span>
      {isHandsFree && <span className="trigger-ready-dot" aria-label="Voice activation enabled" />}
      {hasScreenshot && (
        <span className="trigger-context-badge" title="Screen context attached">
          <Monitor size={11} />
        </span>
      )}
    </button>
  );
}
