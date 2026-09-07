/**
 * Context Service: Generic context acquisition layer
 * Handles on-demand single-frame screen capture with client-side compression
 * and DOM/selection metadata extraction.
 */

const MAX_IMAGE_DIMENSION = 1280; // Max width or height in pixels
const JPEG_QUALITY = 0.75; // Balanced quality & file size

class ContextService {
  /**
   * Captures a single frame from the user's screen or selected window.
   * Compresses the frame to optimized JPEG base64 and immediately stops all video tracks.
   * 
   * @returns {Promise<{ screenshot: string, width: number, height: number } | null>}
   */
  async captureScreen() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen capture is not supported in this browser environment.');
    }

    let stream = null;

    try {
      // Request screen media stream
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always'
        },
        audio: false
      });

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track available from screen capture.');
      }

      // Create temporary video element to grab the frame
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play().then(resolve).catch(reject);
        };
        video.onerror = () => reject(new Error('Failed to load video stream for screen frame.'));
        // Timeout safeguard
        setTimeout(() => resolve(), 2500);
      });

      // Compute scaled dimensions (capped at MAX_IMAGE_DIMENSION)
      let srcWidth = video.videoWidth || 1280;
      let srcHeight = video.videoHeight || 720;

      let targetWidth = srcWidth;
      let targetHeight = srcHeight;

      if (targetWidth > MAX_IMAGE_DIMENSION || targetHeight > MAX_IMAGE_DIMENSION) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * MAX_IMAGE_DIMENSION) / targetWidth);
          targetWidth = MAX_IMAGE_DIMENSION;
        } else {
          targetWidth = Math.round((targetWidth * MAX_IMAGE_DIMENSION) / targetHeight);
          targetHeight = MAX_IMAGE_DIMENSION;
        }
      }

      // Draw onto offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

      // Compress to JPEG base64 data URL
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

      // Clean up video element
      video.srcObject = null;

      return {
        screenshot: dataUrl,
        width: targetWidth,
        height: targetHeight
      };
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
        console.log('[ContextService] Screen capture permission was cancelled by user.');
        return null;
      }
      console.error('[ContextService] Screen capture error:', err);
      throw err;
    } finally {
      // PRIVACY SAFEGUARD: Immediately stop all tracks
      if (stream) {
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
      }
    }
  }

  /**
   * Retrieves generic page context from the active DOM.
   * Extracts page title, URL, active text selection, and safe visible text excerpt.
   * 
   * @returns {{ title: string, url: string, selectedText: string, visibleText: string }}
   */
  getPageContext() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { title: '', url: '', selectedText: '', visibleText: '' };
    }

    const title = document.title || 'Code Companion';
    const url = window.location.href || '';

    // 1. User selected text
    let selectedText = '';
    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selectedText = selection.toString().trim();
      }
    } catch {
      // ignore
    }

    // 2. Safe visible text snippet (from <main> or <body>, ignoring scripts and styles)
    let visibleText = '';
    try {
      const mainEl = document.querySelector('main') || document.body;
      if (mainEl) {
        // Clone briefly to strip scripts, styles, and hidden elements
        const clone = mainEl.cloneNode(true);
        const toRemove = clone.querySelectorAll('script, style, noscript, svg, [aria-hidden="true"], .assistant-floating-container');
        toRemove.forEach(el => el.remove());

        const rawText = clone.textContent || '';
        visibleText = rawText
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 1500);
      }
    } catch {
      // ignore
    }

    return {
      title,
      url,
      selectedText,
      visibleText
    };
  }
}

export const contextService = new ContextService();
export default contextService;
