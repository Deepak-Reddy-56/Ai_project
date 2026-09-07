/**
 * Context Service: generic context acquisition layer.
 * Browser mode uses explicit getDisplayMedia permission.
 * Electron mode uses the secure desktop preload bridge for a one-shot display capture.
 */

const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.75;

function compressDataUrl(dataUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      let width = image.naturalWidth || 1280;
      let height = image.naturalHeight || 720;
      if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        } else {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);
      resolve({ screenshot: canvas.toDataURL('image/jpeg', JPEG_QUALITY), width, height });
    };
    image.onerror = () => resolve({ screenshot: dataUrl, width: 0, height: 0 });
    image.src = dataUrl;
  });
}

class ContextService {
  async captureScreen() {
    if (typeof window !== 'undefined' && window.desktopAssistant?.isDesktop) {
      const dataUrl = await window.desktopAssistant.captureScreen();
      if (!dataUrl) throw new Error('No desktop display is available.');
      return compressDataUrl(dataUrl);
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen capture is not supported in this browser environment.');
    }

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor', cursor: 'always' },
        audio: false
      });
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) throw new Error('No video track available from screen capture.');

      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => video.play().then(resolve).catch(reject);
        video.onerror = () => reject(new Error('Failed to load video stream for screen frame.'));
        setTimeout(resolve, 2500);
      });

      const srcWidth = video.videoWidth || 1280;
      const srcHeight = video.videoHeight || 720;
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
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, targetWidth, targetHeight);
      video.srcObject = null;
      return { screenshot: canvas.toDataURL('image/jpeg', JPEG_QUALITY), width: targetWidth, height: targetHeight };
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) return null;
      throw err;
    } finally {
      stream?.getTracks().forEach((track) => { try { track.stop(); } catch { /* ignore */ } });
    }
  }

  getPageContext() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { title: '', url: '', selectedText: '', visibleText: '' };
    }
    const title = document.title || 'Code Companion';
    const url = window.location.href || '';
    let selectedText = '';
    try {
      const selection = window.getSelection();
      if (selection?.rangeCount > 0) selectedText = selection.toString().trim();
    } catch { /* ignore */ }

    let visibleText = '';
    try {
      const mainEl = document.querySelector('main') || document.body;
      if (mainEl) {
        const clone = mainEl.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, svg, [aria-hidden="true"], .assistant-floating-container').forEach((el) => el.remove());
        visibleText = (clone.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 1500);
      }
    } catch { /* ignore */ }
    return { title, url, selectedText, visibleText };
  }
}

export const contextService = new ContextService();
export default contextService;
