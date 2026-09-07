import React, { useState, useEffect, useCallback, useRef } from 'react';
import AssistantTrigger from './AssistantTrigger';
import AssistantPanel from './AssistantPanel';
import voiceService from '../../services/voiceService';
import speechService from '../../services/speechService';
import contextService from '../../services/contextService';
import { askAssistant } from '../../services/assistantService';
import './assistant.css';

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [screenshot, setScreenshot] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [autoSpeak] = useState(true);
  const isDesktop = typeof window !== 'undefined' && Boolean(window.desktopAssistant?.isDesktop);
  const isAssistantShell = isDesktop && typeof window !== 'undefined' && window.location.hash === '#assistant';
  const [isHandsFree, setIsHandsFree] = useState(() => {
    if (typeof window !== 'undefined' && window.desktopAssistant?.isDesktop) {
      return window.location.hash === '#assistant';
    }
    try { return localStorage.getItem('assistant_handsfree') === 'true'; } catch { return false; }
  });
  const [errorMessage, setErrorMessage] = useState('');

  const messagesRef = useRef(messages);
  const stateRef = useRef(state);
  const isHandsFreeRef = useRef(isHandsFree);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
    try { localStorage.setItem('assistant_handsfree', String(isHandsFree)); } catch { /* ignore */ }
  }, [isHandsFree]);

  const playWakeChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.start(); osc.stop(ctx.currentTime + 0.22);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      try {
        const sel = window.getSelection()?.toString()?.trim();
        if (sel && sel.length > 3) setSelectedText(sel);
      } catch { /* ignore */ }
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => () => {
    voiceService.stopListening();
    speechService.stop();
  }, []);

  const restartHandsFree = useCallback(() => {
    if (!isHandsFreeRef.current || !voiceService.isSupported()) return;
    voiceService.startHandsFreeMode({
      onWake: (queryAfterWake) => {
        playWakeChime();
        if (isDesktop) window.desktopAssistant?.show?.();
        setIsOpen(true);
        if (queryAfterWake?.trim()) handleSendMessage(queryAfterWake.trim());
        else handleToggleListen();
      },
      onInterim: (interim) => {
        if (stateRef.current === 'listening') setInterimTranscript(interim);
      },
      onError: (err) => {
        console.warn('[VoiceAssistant] Hands-free listener notice:', err);
        setErrorMessage(err);
      }
    });
  }, [playWakeChime, isDesktop]);

  const handleSendMessage = useCallback(async (queryText = '') => {
    const promptToSend = queryText.trim();
    if (!promptToSend && !screenshot && !selectedText && !isDesktop) return;

    voiceService.stopListening();
    setInterimTranscript('');
    setErrorMessage('');
    setState('analyzing');

    let attachedScreenshot = screenshot;
    if (isDesktop && !attachedScreenshot) {
      try {
        const captured = await contextService.captureScreen();
        attachedScreenshot = captured?.screenshot || null;
      } catch (err) {
        console.warn('[VoiceAssistant] Desktop capture failed:', err);
      }
    }

    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: userMsgId,
      role: 'user',
      text: promptToSend || (attachedScreenshot ? 'Analyze this screen capture' : 'Explain selected text'),
      hasScreenshot: Boolean(attachedScreenshot)
    }]);

    const pageContext = contextService.getPageContext();
    if (selectedText) pageContext.selectedText = selectedText;
    if (isDesktop) pageContext.source = 'desktop';

    setScreenshot(null);
    setSelectedText('');

    try {
      const historyPayload = messagesRef.current.slice(-4).map((m) => ({ role: m.role, text: m.text }));
      const result = await askAssistant({
        prompt: promptToSend,
        screenshot: attachedScreenshot,
        context: pageContext,
        history: historyPayload
      });
      if (!result.success) throw new Error(result.error || 'Failed to get response from assistant');

      setMessages((prev) => [...prev, {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: result.response,
        spokenText: result.spokenText || ''
      }]);

      const finishTurn = () => {
        setState('idle');
        if (isHandsFreeRef.current) restartHandsFree();
      };

      if (!isMuted && autoSpeak && result.spokenText) {
        setState('speaking');
        speechService.speak(result.spokenText, {
          onStart: () => setState('speaking'), onEnd: finishTurn, onError: finishTurn
        });
      } else finishTurn();
    } catch (err) {
      console.error('[VoiceAssistant] Error:', err);
      setState('error');
      setErrorMessage(err.message || 'Error communicating with assistant.');
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Assistant Error:** ${err.message || 'Unable to complete request. Please verify the backend server is running.'}`
      }]);
      if (isHandsFreeRef.current) restartHandsFree();
    }
  }, [screenshot, selectedText, isMuted, autoSpeak, isDesktop, restartHandsFree]);

  const handleToggleListen = useCallback(() => {
    if (stateRef.current === 'listening') {
      voiceService.stopListening(); setState('idle'); setInterimTranscript('');
      if (isHandsFreeRef.current) restartHandsFree();
      return;
    }
    if (stateRef.current === 'speaking') speechService.stop();
    setIsOpen(true); setErrorMessage(''); setState('listening'); setInterimTranscript('');
    const started = voiceService.startListening({
      onInterim: setInterimTranscript,
      onTranscript: (finalText) => {
        setInterimTranscript('');
        if (finalText?.trim()) handleSendMessage(finalText.trim());
        else { setState('idle'); if (isHandsFreeRef.current) restartHandsFree(); }
      },
      onError: (errMsg) => { setState('error'); setErrorMessage(errMsg); setInterimTranscript(''); },
      onEnd: () => {
        if (stateRef.current === 'listening') { setState('idle'); setInterimTranscript(''); }
      }
    });
    if (!started) setState('idle');
  }, [handleSendMessage, restartHandsFree]);

  const handleToggleHandsFree = useCallback(() => {
    const nextVal = !isHandsFree;
    setIsHandsFree(nextVal);
    if (nextVal) {
      isHandsFreeRef.current = true;
      restartHandsFree();
    } else {
      isHandsFreeRef.current = false;
      voiceService.stopHandsFreeMode();
    }
  }, [isHandsFree, restartHandsFree]);

  // Only the dedicated Electron assistant shell owns the always-on native
  // wake listener. The main Electron application window stays quiet so we don't
  // spawn duplicate Windows recognizers.
  useEffect(() => {
    if (isAssistantShell && isHandsFree && voiceService.isSupported()) restartHandsFree();
  }, [isAssistantShell, isHandsFree, restartHandsFree]);

  useEffect(() => {
    if (!isAssistantShell || !window.desktopAssistant?.onActivate) return undefined;
    return window.desktopAssistant.onActivate(() => {
      setIsOpen(true);
      if (stateRef.current !== 'listening') handleToggleListen();
    });
  }, [isAssistantShell, handleToggleListen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) { e.preventDefault(); handleToggleListen(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleListen]);

  const handleCaptureScreen = async () => {
    try {
      setErrorMessage('');
      const result = await contextService.captureScreen();
      if (result?.screenshot) { setScreenshot(result.screenshot); setIsOpen(true); }
    } catch (err) { setErrorMessage('Screen capture failed: ' + (err.message || 'Permission denied')); }
  };

  const handleRemoveScreenshot = () => setScreenshot(null);
  const handleRemoveSelectedText = () => setSelectedText('');
  const handleToggleMute = () => {
    const nextMuted = !isMuted; setIsMuted(nextMuted); speechService.setMuted(nextMuted);
  };
  const handleClearChat = () => {
    speechService.stop(); voiceService.stopListening(); setMessages([]); setScreenshot(null); setSelectedText(''); setErrorMessage(''); setState('idle');
    if (isHandsFreeRef.current) restartHandsFree();
  };
  const handleReplaySpeech = (text) => {
    if (!text) return;
    speechService.stop(); setState('speaking');
    speechService.speak(text, {
      onStart: () => setState('speaking'),
      onEnd: () => { setState('idle'); if (isHandsFreeRef.current) restartHandsFree(); },
      onError: () => { setState('idle'); if (isHandsFreeRef.current) restartHandsFree(); }
    });
  };

  return (
    <div className="assistant-floating-container">
      <AssistantPanel
        isOpen={isOpen}
        state={state}
        messages={messages}
        screenshot={screenshot}
        selectedText={selectedText}
        interimTranscript={interimTranscript}
        isMuted={isMuted}
        isHandsFree={isHandsFree}
        errorMessage={errorMessage}
        onClose={() => {
          setIsOpen(false);
          speechService.stop();
          if (isDesktop) {
            voiceService.stopListening({ preserveHandsFree: true });
            window.desktopAssistant?.hide?.();
            if (isAssistantShell && isHandsFreeRef.current) setTimeout(() => restartHandsFree(), 0);
          } else {
            voiceService.stopListening();
          }
        }}
        onToggleListen={handleToggleListen}
        onToggleHandsFree={handleToggleHandsFree}
        onCaptureScreen={handleCaptureScreen}
        onRemoveScreenshot={handleRemoveScreenshot}
        onRemoveSelectedText={handleRemoveSelectedText}
        onToggleMute={handleToggleMute}
        onClearChat={handleClearChat}
        onSendMessage={handleSendMessage}
        onReplaySpeech={handleReplaySpeech}
        onDismissError={() => setErrorMessage('')}
      />
      {!isAssistantShell && (
        <AssistantTrigger isOpen={isOpen} state={state} isHandsFree={isHandsFree} hasScreenshot={Boolean(screenshot)} onClick={() => {
          setIsOpen(true);
          if (isDesktop) window.desktopAssistant?.show?.();
        }} />
      )}
    </div>
  );
}
