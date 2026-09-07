const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAssistant', {
  isDesktop: true,
  captureScreen: () => ipcRenderer.invoke('desktop-assistant:capture-screen'),
  hide: () => ipcRenderer.send('desktop-assistant:hide'),
  onActivate: (callback) => {
    const handler = () => callback?.();
    ipcRenderer.on('desktop-assistant:activate', handler);
    return () => ipcRenderer.removeListener('desktop-assistant:activate', handler);
  }
});
