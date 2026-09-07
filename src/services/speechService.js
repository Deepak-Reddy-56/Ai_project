/**
 * Speech Service: Text-to-Speech abstraction using Web Speech Synthesis API
 */

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.voices = [];
    this.isMuted = false;

    if (this.synth) {
      this.loadVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  isSupported() {
    return Boolean(this.synth);
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  getVoices() {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  /**
   * Cleans markdown formatting to produce clean, natural spoken speech
   */
  cleanTextForSpeech(text = '') {
    if (!text) return '';

    return text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, 'Code example omitted.')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown images ![alt](url) -> alt
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove bold/italics
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      // Remove headers #
      .replace(/^#{1,6}\s+/gm, '')
      // Remove blockquotes >
      .replace(/^>\s+/gm, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove list markers
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Collapse repeated whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Speaks the provided text
   * 
   * @param {string} text - The text or markdown to speak
   * @param {Object} [options]
   * @param {Function} [options.onStart] - Callback when speech begins
   * @param {Function} [options.onEnd] - Callback when speech ends
   * @param {Function} [options.onError] - Callback on speech error
   * @param {number} [options.rate=1.0] - Speech rate (0.5 to 2)
   * @param {number} [options.pitch=1.0] - Speech pitch (0 to 2)
   * @param {string} [options.voiceURI] - Preferred voice URI
   */
  speak(text, {
    onStart,
    onEnd,
    onError,
    rate = 1.0,
    pitch = 1.0,
    voiceURI = null
  } = {}) {
    if (!this.isSupported() || this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    // Stop any current utterance
    this.stop();

    const spokenText = this.cleanTextForSpeech(text);
    if (!spokenText) {
      if (onEnd) onEnd();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = Math.max(0.5, Math.min(2.0, rate));
      utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

      const availableVoices = this.getVoices();
      if (voiceURI) {
        const found = availableVoices.find(v => v.voiceURI === voiceURI);
        if (found) utterance.voice = found;
      } else {
        // Preferred natural English voice selector
        const preferredVoice = availableVoices.find(v =>
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny')) &&
          v.lang.startsWith('en')
        ) || availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];

        if (preferredVoice) utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (event) => {
        console.warn('[SpeechService] Speech synthesis error:', event.error);
        this.currentUtterance = null;
        if (event.error !== 'canceled' && onError) {
          onError(event.error);
        } else if (onEnd) {
          onEnd();
        }
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (err) {
      console.error('[SpeechService] Speak failed:', err);
      this.currentUtterance = null;
      if (onError) onError(err.message);
    }
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  isSpeaking() {
    return Boolean(this.synth && (this.synth.speaking || this.synth.pending));
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.isMuted) {
      this.stop();
    }
  }
}

export const speechService = new SpeechService();
export default speechService;
