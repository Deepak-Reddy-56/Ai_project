const { app, BrowserWindow, globalShortcut, desktopCapturer, ipcMain, screen, session } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Keep Chromium cache/session files in an app-specific local directory instead of
// sharing a generic cache location. This avoids cache collisions/lock issues.
const appDataRoot = path.join(app.getPath('appData'), 'CodeCompanion');
const sessionDataPath = path.join(appDataRoot, 'session');
const cachePath = path.join(sessionDataPath, 'cache');
const codeCachePath = path.join(sessionDataPath, 'code-cache');
fs.mkdirSync(cachePath, { recursive: true });
fs.mkdirSync(codeCachePath, { recursive: true });
fs.mkdirSync(sessionDataPath, { recursive: true });
app.setPath('userData', appDataRoot);
app.setPath('sessionData', sessionDataPath);
app.commandLine.appendSwitch('disk-cache-dir', cachePath);

let mainWindow;
let assistantWindow;
let registeredAccelerator = null;
let speechProcess = null;

const isDev = !app.isPackaged;
const rendererUrl = process.env.ASSISTANT_RENDERER_URL || 'http://localhost:5173';
const speechScript = path.join(__dirname, 'windowsSpeech.ps1');

function createWindows() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) mainWindow.loadURL(rendererUrl);
  else mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  assistantWindow = new BrowserWindow({
    width: 430,
    height: 620,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
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
    types: ['screen'],
    thumbnailSize: { width: 1920, height: 1080 },
    fetchWindowIcons: false
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
  const candidates = [
    'Control+Alt+Shift+A',
    'Control+Shift+Space',
    'Alt+Shift+A'
  ];

  for (const accelerator of candidates) {
    try {
      if (globalShortcut.register(accelerator, showAssistant)) {
        registeredAccelerator = accelerator;
        console.log(`[DesktopAssistant] Global shortcut registered: ${accelerator}`);
        return;
      }
    } catch (err) {
      console.warn(`[DesktopAssistant] Shortcut ${accelerator} failed:`, err.message);
    }
  }

  console.warn('[DesktopAssistant] No global shortcut could be registered.');
}

function sendSpeechEvent(payload) {
  if (!assistantWindow || assistantWindow.isDestroyed()) return;
  assistantWindow.webContents.send('desktop-assistant:speech-event', payload);
}

function stopNativeSpeech() {
  if (!speechProcess) return;
  try { speechProcess.kill(); } catch { /* ignore */ }
  speechProcess = null;
}

function startNativeSpeech() {
  if (process.platform !== 'win32') {
    sendSpeechEvent({ type: 'error', message: 'Native desktop speech input is currently supported on Windows only.' });
    return false;
  }

  if (!fs.existsSync(speechScript)) {
    sendSpeechEvent({ type: 'error', message: 'Windows speech helper is missing from the Electron build.' });
    return false;
  }

  stopNativeSpeech();

  speechProcess = spawn('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-File', speechScript
  ], {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdoutBuffer = '';
  speechProcess.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        sendSpeechEvent(JSON.parse(trimmed));
      } catch {
        console.warn('[DesktopAssistant] Ignoring invalid speech helper output:', trimmed);
      }
    }
  });

  speechProcess.stderr.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text) console.warn('[DesktopAssistant] Windows speech:', text);
  });

  speechProcess.on('error', (err) => {
    speechProcess = null;
    sendSpeechEvent({ type: 'error', message: `Windows speech could not start: ${err.message}` });
  });

  speechProcess.on('exit', (code) => {
    speechProcess = null;
    sendSpeechEvent({ type: 'end', code });
  });

  return true;
}

app.whenReady().then(() => {
  session.defaultSession.setCodeCachePath(codeCachePath);
  session.defaultSession.setPermissionCheckHandler(
    (webContents, permission) => permission === 'media' || permission === 'display-capture'
  );
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      callback(permission === 'media' || permission === 'display-capture');
    }
  );

  createWindows();
  registerShortcuts();

  ipcMain.handle('desktop-assistant:capture-screen', captureDesktop);
  ipcMain.on('desktop-assistant:hide', () => {
    stopNativeSpeech();
    assistantWindow?.hide();
  });
  ipcMain.handle('desktop-assistant:start-voice', () => startNativeSpeech());
  ipcMain.on('desktop-assistant:stop-voice', stopNativeSpeech);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('will-quit', () => {
  stopNativeSpeech();
  if (registeredAccelerator) globalShortcut.unregister(registeredAccelerator);
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (event) => {
  if (process.platform !== 'darwin') event.preventDefault();
});
