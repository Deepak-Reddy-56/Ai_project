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
  const [state, setState] = useState('idle'); // 'idle' | 'listening' | 'analyzing' | 'speaking' | 'error'
  const [messages, setMessages] = useState([]);
  const [screenshot, setScreenshot] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [autoSpeak] = useState(true);
  const [isHandsFree, setIsHandsFree] = useState(() => {
    try {
      return localStorage.getItem('assistant_handsfree') === 'true';
    } catch {
      return false;
    }
  });
  const [errorMessage, setErrorMessage] = useState('');

  const messagesRef = useRef(messages);
  const stateRef = useRef(state);
  const isHandsFreeRef = useRef(isHandsFree);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
    try {
      localStorage.setItem('assistant_handsfree', String(isHandsFree));
    } catch {
      // ignore
    }
  }, [isHandsFree]);

  // Audio chime when wake phrase is detected
  const playWakeChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // AudioContext might be restricted until user interaction
    }
  }, []);

  // Track selection changes across the page when assistant is mounted
  useEffect(() => {
    const handleMouseUp = () => {
      try {
        const sel = window.getSelection()?.toString()?.trim();
        if (sel && sel.length > 3) {
          setSelectedText(sel);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      voiceService.stopListening();
      speechService.stop();
    };
  }, []);

  /**
   * Core send message handler
   */
  const handleSendMessage = useCallback(async (queryText = '') => {
    const promptToSend = queryText.trim();
    if (!promptToSend && !screenshot && !selectedText) {
      return;
    }

    // Stop listening while analyzing
    voiceService.stopListening();
    setInterimTranscript('');
    setErrorMessage('');
    setState('analyzing');

    // Add user message to thread
    const userMsgId = `user-${Date.now()}`;
    const userMessage = {
      id: userMsgId,
      role: 'user',
      text: promptToSend || (screenshot ? 'Analyze this screen capture' : 'Explain selected text'),
      hasScreenshot: Boolean(screenshot)
    };

    setMessages((prev) => [...prev, userMessage]);

    // Acquire DOM page context
    const pageContext = contextService.getPageContext();
    if (selectedText) {
      pageContext.selectedText = selectedText;
    }

    // Clear single-use attachments
    const attachedScreenshot = screenshot;
    setScreenshot(null);
    setSelectedText('');

    try {
      const historyPayload = messagesRef.current.slice(-4).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const result = await askAssistant({
        prompt: promptToSend,
        screenshot: attachedScreenshot,
        context: pageContext,
        history: historyPayload
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to get response from assistant');
      }

      const assistantMsgId = `asst-${Date.now()}`;
      const assistantMessage = {
        id: assistantMsgId,
        role: 'assistant',
        text: result.response,
        spokenText: result.spokenText || ''
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Complete speech and resume hands-free listening if enabled
      const finishTurn = () => {
        setState('idle');
        if (isHandsFreeRef.current) {
          restartHandsFree();
        }
      };

      if (!isMuted && autoSpeak && result.spokenText) {
        setState('speaking');
        speechService.speak(result.spokenText, {
          onStart: () => setState('speaking'),
          onEnd: finishTurn,
          onError: finishTurn
        });
      } else {
        finishTurn();
      }
    } catch (err) {
      console.error('[VoiceAssistant] Error:', err);
      setState('error');
      setErrorMessage(err.message || 'Error communicating with assistant.');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Assistant Error:** ${err.message || 'Unable to complete request. Please verify the backend server is running.'}`
        }
      ]);

      if (isHandsFreeRef.current) {
        restartHandsFree();
      }
    }
  }, [screenshot, selectedText, isMuted, autoSpeak]);

  /**
   * One-click Microphone Toggle
   */
  const handleToggleListen = useCallback(() => {
    // If currently listening, stop
    if (stateRef.current === 'listening') {
      voiceService.stopListening();
      setState('idle');
      setInterimTranscript('');
      if (isHandsFreeRef.current) {
        restartHandsFree();
      }
      return;
    }

    if (stateRef.current === 'speaking') {
      speechService.stop();
    }

    setIsOpen(true);
    setErrorMessage('');
    setState('listening');
    setInterimTranscript('');

    const started = voiceService.startListening({
      onInterim: (text) => {
        setInterimTranscript(text);
      },
      onTranscript: (finalText) => {
        setInterimTranscript('');
        if (finalText && finalText.trim()) {
          handleSendMessage(finalText.trim());
        } else {
          setState('idle');
          if (isHandsFreeRef.current) {
            restartHandsFree();
          }
        }
      },
      onError: (errMsg) => {
        setState('error');
        setErrorMessage(errMsg);
        setInterimTranscript('');
      },
      onEnd: () => {
        if (stateRef.current === 'listening') {
          setState('idle');
          setInterimTranscript('');
        }
      }
    });

    if (!started) {
      setState('idle');
    }
  }, [handleSendMessage]);

  /**
   * Helper to restart hands-free wake listening
   */
  const restartHandsFree = useCallback(() => {
    if (!isHandsFreeRef.current || !voiceService.isSupported()) return;

    voiceService.startHandsFreeMode({
      onWake: (queryAfterWake) => {
        playWakeChime();
        setIsOpen(true);

        if (queryAfterWake && queryAfterWake.trim()) {
          // User spoke entire query: "Hey assistant, what is X?"
          handleSendMessage(queryAfterWake.trim());
        } else {
          // User only said "Hey assistant" -> open and activate listening
          handleToggleListen();
        }
      },
      onInterim: (interim) => {
        if (stateRef.current === 'listening') {
          setInterimTranscript(interim);
        }
      },
      onError: (err) => {
        console.warn('[VoiceAssistant] Hands-free listener notice:', err);
      }
    });
  }, [playWakeChime, handleSendMessage, handleToggleListen]);

  /**
   * Toggle Hands-Free "Hey Assistant" mode
   */
  const handleToggleHandsFree = () => {
    const nextVal = !isHandsFree;
    setIsHandsFree(nextVal);

    if (nextVal) {
      isHandsFreeRef.current = true;
      restartHandsFree();
    } else {
      isHandsFreeRef.current = false;
      voiceService.stopHandsFreeMode();
    }
  };

  // Start hands-free on initial load if user had it enabled
  useEffect(() => {
    if (isHandsFree && voiceService.isSupported()) {
      restartHandsFree();
    }
  }, [isHandsFree, restartHandsFree]);

  // Global Keyboard Shortcut: Alt + A activates the assistant from ANY page!
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        handleToggleListen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleListen]);

  /**
   * On-demand Screen Capture
   */
  const handleCaptureScreen = async () => {
    try {
      setErrorMessage('');
      const result = await contextService.captureScreen();
      if (result && result.screenshot) {
        setScreenshot(result.screenshot);
        setIsOpen(true);
      }
    } catch (err) {
      setErrorMessage('Screen capture failed: ' + (err.message || 'Permission denied'));
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
  };

  const handleRemoveSelectedText = () => {
    setSelectedText('');
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    speechService.setMuted(nextMuted);
  };

  const handleClearChat = () => {
    speechService.stop();
    voiceService.stopListening();
    setMessages([]);
    setScreenshot(null);
    setSelectedText('');
    setErrorMessage('');
    setState('idle');
    if (isHandsFreeRef.current) {
      restartHandsFree();
    }
  };

  const handleReplaySpeech = (text) => {
    if (!text) return;
    speechService.stop();
    setState('speaking');
    speechService.speak(text, {
      onStart: () => setState('speaking'),
      onEnd: () => {
        setState('idle');
        if (isHandsFreeRef.current) restartHandsFree();
      },
      onError: () => {
        setState('idle');
        if (isHandsFreeRef.current) restartHandsFree();
      }
    });
  };

  return (
    <div className="assistant-floating-container">
      {/* Floating Panel */}
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
          if (!isHandsFreeRef.current) {
            voiceService.stopListening();
          } else {
            restartHandsFree();
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

      {/* Floating Trigger Button */}
      <AssistantTrigger
        isOpen={isOpen}
        state={state}
        isHandsFree={isHandsFree}
        hasScreenshot={Boolean(screenshot)}
        onClick={() => setIsOpen(true)}
      />
    </div>
  );
}
