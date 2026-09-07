/**
 * Voice Service abstraction.
 *
 * Browser mode uses the Web Speech API.
 * Electron desktop mode uses the native Windows SpeechRecognitionEngine bridge,
 * avoiding Chromium's remote SpeechRecognition service and its network errors.
 */

const isDesktop = typeof window !== 'undefined' && Boolean(window.desktopAssistant?.isDesktop);
const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

const DEFAULT_WAKE_PHRASES = ['hey assistant', 'ok assistant', 'assistant', 'hello assistant'];
const RETRYABLE_END_DELAY = 800;

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isHandsFreeActive = false;
    this.wakePhrases = DEFAULT_WAKE_PHRASES;
    this.activeCallbacks = null;
    this.shouldRestartHandsFree = false;
    this.restartTimer = null;
    this.lastError = null;
    this.sessionId = 0;
    this.nativeUnsubscribe = null;

    if (isDesktop && window.desktopAssistant?.onVoiceEvent) {
      this.nativeUnsubscribe = window.desktopAssistant.onVoiceEvent((payload) => {
        this.handleNativeVoiceEvent(payload);
      });
    }
  }

  isSupported() {
    return isDesktop ? Boolean(window.desktopAssistant?.startVoice) : Boolean(SpeechRecognition);
  }

  handleNativeVoiceEvent(payload = {}) {
    const callbacks = this.activeCallbacks;
    if (!callbacks) return;

    if (payload.type === 'ready') {
      this.isListening = true;
      this.lastError = null;
      return;
    }

    if (payload.type === 'hypothesis') {
      if (payload.text) callbacks.onInterim?.(payload.text);
      return;
    }

    if (payload.type === 'recognized') {
      const sourceText = String(payload.text || '').trim();
      if (!sourceText) return;

      const normalized = sourceText.toLowerCase();
      let matchedPhrase = null;
      for (const phrase of this.wakePhrases) {
        if (normalized.includes(phrase)) {
          matchedPhrase = phrase;
          break;
        }
      }

      // In hands-free desktop mode the recognizer is always listening, but it
      // must ignore ordinary speech until a wake phrase is heard.
      if (callbacks.onWakePhrase) {
        if (!matchedPhrase) return;
        const phraseIndex = normalized.indexOf(matchedPhrase);
        const rawAfterWake = sourceText.slice(phraseIndex + matchedPhrase.length).trim();
        this.stopNativeListening();
        callbacks.onInterim?.('');
        callbacks.onWakePhrase(rawAfterWake);
        return;
      }

      callbacks.onInterim?.('');
      callbacks.onTranscript?.(sourceText);
      this.stopNativeListening();
      return;
    }

    if (payload.type === 'error') {
      this.lastError = 'native-error';
      this.isListening = false;
      this.shouldRestartHandsFree = false;
      callbacks.onError?.(
        payload.message ||
        'Windows speech recognition could not start. Check that a microphone is connected and Windows Speech Recognition is available.'
      );
      return;
    }

    if (payload.type === 'end') {
      this.isListening = false;
      if (this.shouldRestartHandsFree && this.isHandsFreeActive && !this.lastError) {
        this.scheduleHandsFreeRestart();
        return;
      }
      callbacks.onEnd?.();
    }
  }

  startListening({
    onTranscript,
    onInterim,
    onError,
    onEnd,
    onWakePhrase,
    continuous = false,
    lang = 'en-US',
    wakePhrases = DEFAULT_WAKE_PHRASES
  } = {}) {
    if (!this.isSupported()) {
      onError?.(isDesktop
        ? 'Native desktop speech input is unavailable.'
        : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    this.clearRestartTimer();
    this.stopListening({ preserveHandsFree: true });

    const currentSession = ++this.sessionId;
    this.lastError = null;
    this.activeCallbacks = { onTranscript, onInterim, onError, onEnd, onWakePhrase, continuous, lang };
    this.wakePhrases = wakePhrases;

    if (isDesktop) {
      try {
        this.recognition = { native: true, session: currentSession };
        const started = window.desktopAssistant.startVoice();
        if (!started) {
          this.recognition = null;
          this.isListening = false;
          onError?.('Windows speech recognition could not start. Check microphone access in Windows Settings.');
          return false;
        }
        this.isListening = true;
        return true;
      } catch (err) {
        this.recognition = null;
        this.isListening = false;
        this.shouldRestartHandsFree = false;
        onError?.(err.message || 'Failed to start Windows speech recognition.');
        return false;
      }
    }

    try {
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = lang;

      let finalTranscript = '';

      recognition.onstart = () => {
        if (this.sessionId !== currentSession) return;
        this.isListening = true;
      };

      recognition.onresult = (event) => {
        if (this.sessionId !== currentSession) return;

        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += transcript + ' ';
          else interimTranscript += transcript;
        }

        const sourceText = `${finalTranscript}${interimTranscript}`.trim();
        const normalized = sourceText.toLowerCase();

        let matchedPhrase = null;
        for (const phrase of this.wakePhrases) {
          if (normalized.includes(phrase)) {
            matchedPhrase = phrase;
            break;
          }
        }

        if (matchedPhrase && onWakePhrase) {
          const phraseIndex = normalized.indexOf(matchedPhrase);
          const rawAfterWake = sourceText.slice(phraseIndex + matchedPhrase.length).trim();
          onWakePhrase(rawAfterWake);
          finalTranscript = '';
          return;
        }

        if (interimTranscript) onInterim?.(interimTranscript);
        if (finalTranscript) onTranscript?.(finalTranscript.trim());
      };

      recognition.onerror = (event) => {
        if (this.sessionId !== currentSession) return;

        const errorType = event?.error || 'unknown';
        console.warn('[VoiceService] SpeechRecognition error:', errorType);
        this.lastError = errorType;

        if (['network', 'not-allowed', 'service-not-allowed', 'permission-denied'].includes(errorType)) {
          this.shouldRestartHandsFree = false;
        }

        if (errorType === 'not-allowed' || errorType === 'permission-denied' || errorType === 'service-not-allowed') {
          onError?.('Microphone access is blocked. Allow microphone access for localhost in Chrome and try again.');
          return;
        }

        if (errorType === 'network') {
          onError?.('Chrome speech recognition could not reach its recognition service. Check your connection or try Chrome/Edge again.');
          return;
        }

        if (errorType === 'aborted' || errorType === 'no-speech') return;

        onError?.(`Voice recognition error: ${errorType}`);
      };

      recognition.onend = () => {
        if (this.sessionId !== currentSession) return;
        this.isListening = false;

        if (this.shouldRestartHandsFree && this.isHandsFreeActive && !this.lastError) {
          this.scheduleHandsFreeRestart();
          return;
        }

        onEnd?.();
      };

      recognition.start();
      return true;
    } catch (err) {
      if (this.sessionId !== currentSession) return false;
      console.error('[VoiceService] Failed to start recognition:', err);
      this.isListening = false;
      this.shouldRestartHandsFree = false;
      onError?.(err.message || 'Failed to start microphone.');
      return false;
    }
  }

  startHandsFreeMode({ onWake, onInterim, onError }) {
    this.clearRestartTimer();
    this.lastError = null;
    this.shouldRestartHandsFree = true;
    this.isHandsFreeActive = true;

    return this.startListening({
      continuous: true,
      onWakePhrase: onWake,
      onInterim,
      onError,
      onEnd: () => {
        if (this.shouldRestartHandsFree && this.isHandsFreeActive && !this.lastError) {
          this.scheduleHandsFreeRestart();
        }
      }
    });
  }

  scheduleHandsFreeRestart() {
    this.clearRestartTimer();
    this.restartTimer = setTimeout(() => {
      this.restartTimer = null;
      if (!this.shouldRestartHandsFree || !this.isHandsFreeActive || this.lastError) return;
      const callbacks = this.activeCallbacks;
      if (!callbacks) return;
      this.startListening({
        ...callbacks,
        continuous: true,
        wakePhrases: this.wakePhrases
      });
    }, RETRYABLE_END_DELAY);
  }

  clearRestartTimer() {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
  }

  stopNativeListening() {
    if (isDesktop && window.desktopAssistant?.stopVoice) {
      try { window.desktopAssistant.stopVoice(); } catch { /* ignore */ }
    }
    this.recognition = null;
    this.isListening = false;
  }

  stopHandsFreeMode() {
    this.shouldRestartHandsFree = false;
    this.isHandsFreeActive = false;
    this.clearRestartTimer();
    this.stopListening();
  }

  stopListening({ preserveHandsFree = false } = {}) {
    if (!preserveHandsFree) this.shouldRestartHandsFree = false;

    this.clearRestartTimer();
    this.sessionId += 1;

    const recognition = this.recognition;
    this.recognition = null;
    this.isListening = false;

    if (isDesktop && recognition?.native) {
      try { window.desktopAssistant.stopVoice(); } catch { /* ignore */ }
      return;
    }

    if (recognition) {
      try { recognition.abort(); } catch { /* ignore */ }
    }
  }
}

export const voiceService = new VoiceService();
export default voiceService;
