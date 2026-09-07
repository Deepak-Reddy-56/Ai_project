const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAssistant', {
  isDesktop: true,
  captureScreen: () => ipcRenderer.invoke('desktop-assistant:capture-screen'),
  show: () => ipcRenderer.send('desktop-assistant:show'),
  hide: () => ipcRenderer.send('desktop-assistant:hide'),
  startVoice: () => ipcRenderer.invoke('desktop-assistant:start-voice'),
  stopVoice: () => ipcRenderer.send('desktop-assistant:stop-voice'),
  onActivate: (callback) => {
    const handler = () => callback?.();
    ipcRenderer.on('desktop-assistant:activate', handler);
    return () => ipcRenderer.removeListener('desktop-assistant:activate', handler);
  },
  onVoiceEvent: (callback) => {
    const handler = (_event, payload) => callback?.(payload);
    ipcRenderer.on('desktop-assistant:speech-event', handler);
    ipcRenderer.send('desktop-assistant:voice-subscribe');
    return () => ipcRenderer.removeListener('desktop-assistant:speech-event', handler);
  }
});
