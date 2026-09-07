/**
 * Voice Service: Speech-to-Text abstraction using Web Speech API
 * Supports one-click microphone activation, continuous background wake phrase detection ("Hey Assistant"),
 * and automatic session recovery.
 */

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

const DEFAULT_WAKE_PHRASES = ['hey assistant', 'ok assistant', 'assistant', 'hello assistant'];

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isHandsFreeActive = false;
    this.wakePhrases = DEFAULT_WAKE_PHRASES;
    this.activeCallbacks = null;
    this.shouldRestartHandsFree = false;
  }

  isSupported() {
    return Boolean(SpeechRecognition);
  }

  /**
   * Starts speech recognition session
   */
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
      if (onError) onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    this.stopListening();

    this.activeCallbacks = { onTranscript, onInterim, onError, onEnd, onWakePhrase };
    this.wakePhrases = wakePhrases;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = continuous;
      this.recognition.interimResults = true;
      this.recognition.lang = lang;

      let finalTranscript = '';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const currentCombined = (finalTranscript + interimTranscript).trim().toLowerCase();

        // Check for wake phrase matches
        let matchedPhrase = null;
        for (const phrase of this.wakePhrases) {
          if (currentCombined.includes(phrase)) {
            matchedPhrase = phrase;
            break;
          }
        }

        if (matchedPhrase && onWakePhrase) {
          // Extract text following the wake phrase
          const phraseIndex = currentCombined.indexOf(matchedPhrase);
          const rawAfterWake = (finalTranscript + interimTranscript).slice(phraseIndex + matchedPhrase.length).trim();
          onWakePhrase(rawAfterWake);
          // Reset buffer
          finalTranscript = '';
          return;
        }

        if (onInterim && interimTranscript) {
          onInterim(interimTranscript);
        }

        if (onTranscript && finalTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[VoiceService] SpeechRecognition error:', event.error);
        if (event.error === 'aborted' || event.error === 'no-speech') {
          // Benign errors in continuous/background mode
          return;
        }

        let errorMsg = `Voice recognition error: ${event.error}`;
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          errorMsg = 'Microphone permission denied. Please allow microphone access in your browser.';
          this.shouldRestartHandsFree = false;
        }

        if (onError) onError(errorMsg);
      };

      this.recognition.onend = () => {
        this.isListening = false;

        // In continuous hands-free mode, seamlessly restart if it ended naturally
        if (this.shouldRestartHandsFree && this.activeCallbacks) {
          setTimeout(() => {
            if (this.shouldRestartHandsFree) {
              this.startListening({
                ...this.activeCallbacks,
                continuous: true,
                wakePhrases: this.wakePhrases
              });
            }
          }, 300);
        } else if (onEnd) {
          onEnd();
        }
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error('[VoiceService] Failed to start recognition:', err);
      this.isListening = false;
      if (onError) onError(err.message || 'Failed to start microphone.');
      return false;
    }
  }

  /**
   * Enables continuous background listening for "Hey Assistant" wake phrase
   */
  startHandsFreeMode({ onWake, onInterim, onError }) {
    this.shouldRestartHandsFree = true;
    this.isHandsFreeActive = true;

    return this.startListening({
      continuous: true,
      onWakePhrase: (queryAfterWake) => {
        if (onWake) onWake(queryAfterWake);
      },
      onInterim: (interim) => {
        if (onInterim) onInterim(interim);
      },
      onError: (err) => {
        if (onError) onError(err);
      }
    });
  }

  /**
   * Disables hands-free background listening
   */
  stopHandsFreeMode() {
    this.shouldRestartHandsFree = false;
    this.isHandsFreeActive = false;
    this.stopListening();
  }

  /**
   * Stops any ongoing recognition
   */
  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.isListening = false;
  }
}

export const voiceService = new VoiceService();
export default voiceService;
