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
  const [errorMessage, setErrorMessage] = useState('');

  const messagesRef = useRef(messages);
  const stateRef = useRef(state);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Track selection changes across the page when assistant is open
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

    // Stop listening if mic was active
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

    // Capture current screenshot reference and then clear state to avoid stale attachments
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

      // Speak response if autoSpeak is enabled and audio is not muted
      if (!isMuted && autoSpeak && result.spokenText) {
        setState('speaking');
        speechService.speak(result.spokenText, {
          onStart: () => setState('speaking'),
          onEnd: () => setState('idle'),
          onError: () => setState('idle')
        });
      } else {
        setState('idle');
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
      return;
    }

    // If currently speaking, stop speech first
    if (stateRef.current === 'speaking') {
      speechService.stop();
    }

    // Ensure panel is open
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
      },
      // Architectural wake-phrase support
      wakePhrase: 'hey assistant',
      onWakePhrase: (queryAfterWake) => {
        if (queryAfterWake && queryAfterWake.trim()) {
          handleSendMessage(queryAfterWake.trim());
        }
      }
    });

    if (!started) {
      setState('idle');
    }
  }, [handleSendMessage]);

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
  };

  const handleReplaySpeech = (text) => {
    if (!text) return;
    speechService.stop();
    setState('speaking');
    speechService.speak(text, {
      onStart: () => setState('speaking'),
      onEnd: () => setState('idle'),
      onError: () => setState('idle')
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
        errorMessage={errorMessage}
        onClose={() => {
          setIsOpen(false);
          speechService.stop();
          voiceService.stopListening();
        }}
        onToggleListen={handleToggleListen}
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
        hasScreenshot={Boolean(screenshot)}
        onClick={() => setIsOpen(true)}
      />
    </div>
  );
}
