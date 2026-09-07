import React from 'react';
import { Mic, MicOff, Sparkles, Volume2, Monitor, AlertCircle } from 'lucide-react';

export default function AssistantTrigger({
  state = 'idle',
  hasScreenshot = false,
  isOpen = false,
  isHandsFree = false,
  onClick,
  onToggleHandsFree
}) {
  const getStateLabel = () => {
    if (isHandsFree && state === 'idle') return 'Voice ready';
    switch (state) {
      case 'listening': return 'Listening';
      case 'analyzing': return 'Thinking';
      case 'speaking': return 'Speaking';
      case 'error': return 'Attention';
      default: return 'Assistant';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'listening': return <Mic size={17} />;
      case 'analyzing': return <Sparkles size={17} className="assistant-trigger-spin" />;
      case 'speaking': return <Volume2 size={17} />;
      case 'error': return <AlertCircle size={17} />;
      default: return isHandsFree ? <Mic size={17} /> : <MicOff size={17} />;
    }
  };

  return (
    <div className={`assistant-trigger-shell ${isOpen ? 'is-open' : ''}`}>
      <button
        className={`assistant-trigger-btn is-${state} ${isHandsFree ? 'hands-free' : ''}`}
        onClick={onClick}
        aria-label="Open voice assistant"
        title="Open voice assistant"
      >
        <span className="trigger-signal" aria-hidden="true" />
        <span className="trigger-icon-wrap">{getIcon()}</span>
        <span className="trigger-copy">
          <span className="trigger-name">Assistant</span>
          <span className="trigger-label">{getStateLabel()}</span>
        </span>
        {hasScreenshot && (
          <span className="trigger-context-badge" title="Screen context attached">
            <Monitor size={11} />
          </span>
        )}
      </button>

      {!isOpen && (
        <button
          className={`hands-free-toggle ${isHandsFree ? 'active' : ''}`}
          onClick={onToggleHandsFree}
          title={isHandsFree ? 'Turn off Hey Assistant voice activation' : 'Enable Hey Assistant voice activation'}
          aria-label={isHandsFree ? 'Turn off hands-free voice activation' : 'Enable hands-free voice activation'}
        >
          <span className="hands-free-dot" />
          <span>{isHandsFree ? 'Hey Assistant on' : 'Enable voice'}</span>
        </button>
      )}
    </div>
  );
}
