/**
 * Voice Service: Speech-to-Text abstraction using Web Speech API
 * Supports one-click microphone activation, interim results, and optional wake phrase detection.
 */

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

class VoiceService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.wakePhrase = 'hey assistant';
  }

  isSupported() {
    return Boolean(SpeechRecognition);
  }

  /**
   * Starts listening for speech input
   * 
   * @param {Object} options
   * @param {Function} options.onTranscript - Callback for finalized transcript
   * @param {Function} [options.onInterim] - Callback for interim/in-progress transcript
   * @param {Function} [options.onError] - Error callback with user-friendly message
   * @param {Function} [options.onEnd] - Recognition ended callback
   * @param {Function} [options.onWakePhrase] - Triggered when wake phrase is detected
   * @param {boolean} [options.continuous=false] - Continuous listening mode
   * @param {string} [options.lang='en-US'] - Speech recognition language
   * @param {string} [options.wakePhrase] - Custom wake phrase to listen for
   */
  startListening({
    onTranscript,
    onInterim,
    onError,
    onEnd,
    onWakePhrase,
    continuous = false,
    lang = 'en-US',
    wakePhrase = 'hey assistant'
  } = {}) {
    if (!this.isSupported()) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return false;
    }

    // Stop any existing session
    this.stopListening();

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = continuous;
      this.recognition.interimResults = true;
      this.recognition.lang = lang;
      this.wakePhrase = (wakePhrase || 'hey assistant').toLowerCase().trim();

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

        const currentCombined = (finalTranscript + interimTranscript).trim();

        // Optional wake-phrase check
        if (this.wakePhrase && currentCombined.toLowerCase().includes(this.wakePhrase)) {
          if (onWakePhrase) {
            const stripped = currentCombined.replace(new RegExp(this.wakePhrase, 'gi'), '').trim();
            onWakePhrase(stripped);
          }
        }

        if (onInterim && interimTranscript) {
          onInterim(interimTranscript);
        }

        if (onTranscript && finalTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[VoiceService] Recognition error:', event.error);
        let errorMsg = 'An error occurred during voice recognition.';

        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            errorMsg = 'Microphone permission denied. Please allow microphone access in your browser settings.';
            break;
          case 'no-speech':
            errorMsg = 'No speech was detected. Click the microphone to try again.';
            break;
          case 'audio-capture':
            errorMsg = 'No microphone device was detected.';
            break;
          case 'network':
            errorMsg = 'Network error during speech recognition.';
            break;
          case 'aborted':
            // Normal abort when user stops manually, don't trigger alarm
            return;
          default:
            errorMsg = `Voice recognition error: ${event.error}`;
        }

        if (onError) onError(errorMsg);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error('[VoiceService] Failed to start speech recognition:', err);
      this.isListening = false;
      if (onError) onError(err.message || 'Failed to start microphone.');
      return false;
    }
  }

  /**
   * Stops listening
   */
  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore errors on abort
      }
      this.recognition = null;
    }
    this.isListening = false;
  }
}

export const voiceService = new VoiceService();
export default voiceService;
