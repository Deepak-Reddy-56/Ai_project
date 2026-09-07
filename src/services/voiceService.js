const isDesktop = typeof window !== 'undefined' && Boolean(window.desktopAssistant?.isDesktop);
const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

const DEFAULT_WAKE_PHRASES = ['hey assistant', 'okay assistant', 'ok assistant', 'hello assistant'];

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findWakePhrase(text, phrases) {
  const normalized = normalize(text);
  for (const phrase of phrases) {
    const target = normalize(phrase);
    if (target && normalized.includes(target)) return target;
  }
  if (/^assistant\b/.test(normalized)) return 'assistant';
  return null;
}

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isHandsFreeActive = false;
    this.wakePhrases = DEFAULT_WAKE_PHRASES;
    this.activeCallbacks = null;
    this.lastError = null;
    this.sessionId = 0;
    this.desktopReady = !isDesktop;
    this.desktopWakeBuffer = '';

    if (isDesktop && window.desktopAssistant?.onVoiceEvent) {
      window.desktopAssistant.onVoiceEvent((payload) => this.handleNativeVoiceEvent(payload));
    }
  }

  isSupported() {
    return isDesktop
      ? Boolean(window.desktopAssistant?.startVoice)
      : Boolean(SpeechRecognition);
  }

  async ensureDesktopReady() {
    if (!isDesktop) return true;
    if (!window.desktopAssistant?.startVoice) throw new Error('Desktop voice bridge is unavailable.');
    await window.desktopAssistant.startVoice();
    this.desktopReady = true;
    return true;
  }

  handleNativeVoiceEvent(payload = {}) {
    const callbacks = this.activeCallbacks;

    if (payload.type === 'ready') {
      this.desktopReady = true;
      this.lastError = null;
      callbacks?.onInterim?.('');
      return;
    }

    if (payload.type === 'status') {
      if (payload.state === 'starting-python' || payload.state === 'loading-model') {
        callbacks?.onInterim?.('Starting local voice engine...');
      }
      return;
    }

    if (payload.type === 'device') {
      return;
    }

    if (payload.type === 'listening') {
      this.desktopReady = true;
      return;
    }

    if (payload.type === 'audio-level' || payload.type === 'audio-status') {
      return;
    }

    if (payload.type === 'recognized') {
      const text = String(payload.text || '').trim();
      if (!text || !callbacks) return;

      if (callbacks.onWakePhrase) {
        this.desktopWakeBuffer = `${this.desktopWakeBuffer} ${text}`.trim().slice(-320);
        const phrase = findWakePhrase(this.desktopWakeBuffer, this.wakePhrases);
        if (!phrase) return;

        const bufferNormalized = normalize(this.desktopWakeBuffer);
        const phraseIndex = bufferNormalized.indexOf(phrase);
        const afterWake = bufferNormalized.slice(phraseIndex + phrase.length).trim();
        this.desktopWakeBuffer = '';
        callbacks.onInterim?.('');
        callbacks.onWakePhrase?.(afterWake);
        return;
      }

      callbacks.onInterim?.('');
      callbacks.onTranscript?.(text);
      this.isListening = false;
      this.activeCallbacks = null;
      return;
    }

    if (payload.type === 'error') {
      this.lastError = 'native-error';
      this.desktopReady = false;
      this.isListening = false;
      callbacks?.onError?.(payload.message || 'Local Whisper voice engine failed.');
      return;
    }

    if (payload.type === 'end') {
      this.desktopReady = false;
      this.isListening = false;
      callbacks?.onEnd?.();
    }
  }

  async startListening({
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
        ? 'Local Whisper desktop voice input is unavailable.'
        : 'Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    const currentSession = ++this.sessionId;
    this.lastError = null;
    this.wakePhrases = wakePhrases;
    this.activeCallbacks = { onTranscript, onInterim, onError, onEnd, onWakePhrase, continuous, lang };

    if (isDesktop) {
      try {
        await this.ensureDesktopReady();
        if (currentSession !== this.sessionId) return false;
        this.recognition = { native: true, session: currentSession };
        this.isListening = true;
        if (onWakePhrase) this.desktopWakeBuffer = '';
        return true;
      } catch (err) {
        this.recognition = null;
        this.isListening = false;
        this.activeCallbacks = null;
        onError?.(err.message || 'Failed to start local Whisper voice input.');
        return false;
      }
    }

    this.stopListening({ preserveHandsFree: true });
    this.activeCallbacks = { onTranscript, onInterim, onError, onEnd, onWakePhrase, continuous, lang };

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
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += `${transcript} `;
          else interim += transcript;
        }
        if (interim) onInterim?.(interim);
        if (finalTranscript) onTranscript?.(finalTranscript.trim());
      };
      recognition.onerror = (event) => {
        if (this.sessionId !== currentSession) return;
        const errorType = event?.error || 'unknown';
        this.lastError = errorType;
        if (errorType === 'network') onError?.('Chrome speech recognition could not reach its recognition service.');
        else if (['not-allowed', 'permission-denied', 'service-not-allowed'].includes(errorType)) onError?.('Microphone access is blocked. Allow microphone access in Chrome.');
        else if (errorType !== 'aborted' && errorType !== 'no-speech') onError?.(`Voice recognition error: ${errorType}`);
      };
      recognition.onend = () => {
        if (this.sessionId !== currentSession) return;
        this.isListening = false;
        onEnd?.();
      };
      recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      this.activeCallbacks = null;
      onError?.(err.message || 'Failed to start microphone.');
      return false;
    }
  }

  startHandsFreeMode({ onWake, onInterim, onError }) {
    this.isHandsFreeActive = true;
    this.lastError = null;
    return this.startListening({
      continuous: true,
      onWakePhrase: onWake,
      onInterim,
      onError,
    });
  }

  stopHandsFreeMode() {
    this.isHandsFreeActive = false;
    this.desktopWakeBuffer = '';
    this.stopListening();
  }

  stopListening({ preserveHandsFree = false } = {}) {
    if (!preserveHandsFree) this.isHandsFreeActive = false;
    this.sessionId += 1;
    this.isListening = false;
    this.desktopWakeBuffer = '';

    const recognition = this.recognition;
    this.recognition = null;

    if (!isDesktop && recognition) {
      try { recognition.abort(); } catch { /* ignore */ }
      this.activeCallbacks = null;
    } else if (!preserveHandsFree) {
      this.activeCallbacks = null;
    }
  }
}

export const voiceService = new VoiceService();
export default voiceService;
