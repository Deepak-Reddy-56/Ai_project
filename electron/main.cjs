const { app, BrowserWindow, globalShortcut, desktopCapturer, ipcMain, screen, session } = require('electron');
const path = require('path');

let mainWindow;
let assistantWindow;
const isDev = !app.isPackaged;
const rendererUrl = process.env.ASSISTANT_RENDERER_URL || 'http://localhost:5173';

function createWindows() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 700,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  if (isDev) mainWindow.loadURL(rendererUrl);
  else mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  assistantWindow = new BrowserWindow({
    width: 430, height: 620, show: false, frame: false, transparent: true,
    resizable: false, alwaysOnTop: true, skipTaskbar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  if (isDev) assistantWindow.loadURL(`${rendererUrl}#assistant`);
  else assistantWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'assistant' });
  assistantWindow.setAlwaysOnTop(true, 'floating');
  positionAssistant();
}

function positionAssistant() {
  if (!assistantWindow || assistantWindow.isDestroyed()) return;
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const bounds = display.workArea;
  const [width, height] = assistantWindow.getSize();
  assistantWindow.setPosition(
    Math.round(bounds.x + bounds.width - width - 24),
    Math.round(bounds.y + bounds.height - height - 24),
    false
  );
}

async function captureDesktop() {
  const sources = await desktopCapturer.getSources({
    types: ['screen'], thumbnailSize: { width: 1920, height: 1080 }, fetchWindowIcons: false
  });
  if (!sources.length) throw new Error('No desktop display is available.');
  const cursorDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const source = sources.find((item) => item.display_id === String(cursorDisplay.id)) || sources[0];
  return source.thumbnail.toDataURL();
}

function showAssistant() {
  if (!assistantWindow || assistantWindow.isDestroyed()) return;
  positionAssistant();
  assistantWindow.showInactive();
  assistantWindow.webContents.send('desktop-assistant:activate');
}

function registerShortcuts() {
  const registered = globalShortcut.register('Alt+Shift+A', showAssistant);
  if (!registered) console.warn('[DesktopAssistant] Could not register Alt+Shift+A');
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(permission === 'media' || permission === 'display-capture');
  });

  createWindows();
  registerShortcuts();
  ipcMain.handle('desktop-assistant:capture-screen', captureDesktop);
  ipcMain.on('desktop-assistant:hide', () => assistantWindow?.hide());
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', (event) => {
  if (process.platform !== 'darwin') event.preventDefault();
});
