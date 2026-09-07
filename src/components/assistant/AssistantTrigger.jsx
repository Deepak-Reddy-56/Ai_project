import React from 'react';
import { Sparkles, Mic, Volume2, Monitor, AlertCircle } from 'lucide-react';

export default function AssistantTrigger({
  state = 'idle',
  hasScreenshot = false,
  isOpen = false,
  onClick
}) {
  if (isOpen) return null;

  const getStateText = () => {
    switch (state) {
      case 'listening':
        return 'Listening...';
      case 'analyzing':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      case 'error':
        return 'Assistant (Error)';
      default:
        return 'Voice Assistant';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic size={18} />;
      case 'analyzing':
        return <Sparkles size={18} className="animate-spin" />;
      case 'speaking':
        return <Volume2 size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      default:
        return <Sparkles size={18} />;
    }
  };

  return (
    <button
      className={`assistant-trigger-btn is-${state}`}
      onClick={onClick}
      aria-label="Open Voice & Context Assistant"
      title="Open Voice & Context Assistant"
    >
      <div className="trigger-icon-wrap">
        {getIcon()}
      </div>

      <span className="trigger-label">{getStateText()}</span>

      {hasScreenshot && (
        <span className="trigger-context-badge" title="Screen context attached">
          <Monitor size={12} />
          <span>Screen</span>
        </span>
      )}
    </button>
  );
}
