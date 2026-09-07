const { app, BrowserWindow, globalShortcut, desktopCapturer, ipcMain, screen, session } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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
let speechReady = false;
let speechStarting = false;

const isDev = !app.isPackaged;
const rendererUrl = process.env.ASSISTANT_RENDERER_URL || 'http://localhost:5173';
const pythonExecutable = process.env.ASSISTANT_PYTHON || 'python';
const speechScript = path.join(__dirname, 'speech', 'stt.py');

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
  const candidates = ['Control+Alt+Shift+A', 'Control+Shift+Space', 'Alt+Shift+A'];
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
  console.log('[DesktopAssistant][STT]', JSON.stringify(payload));
  if (!assistantWindow || assistantWindow.isDestroyed()) return;
  assistantWindow.webContents.send('desktop-assistant:speech-event', payload);
}

function sendPythonCommand(command) {
  if (!speechProcess || speechProcess.killed || !speechProcess.stdin?.writable) {
    console.warn(`[DesktopAssistant] Cannot send Python command: ${command}; worker is not running.`);
    return false;
  }
  try {
    speechProcess.stdin.write(`${JSON.stringify({ command })}\n`);
    console.log(`[DesktopAssistant] Python command sent: ${command}`);
    return true;
  } catch (err) {
    console.warn('[DesktopAssistant] Failed to control Python STT:', err.message);
    return false;
  }
}

function stopNativeSpeech() {
  if (!speechProcess) return;
  sendPythonCommand('stop');
}

function startNativeSpeech() {
  if (process.platform !== 'win32') {
    sendSpeechEvent({ type: 'error', message: 'Python desktop speech input is currently supported on Windows only.' });
    return false;
  }

  if (!fs.existsSync(speechScript)) {
    sendSpeechEvent({ type: 'error', message: 'Python Whisper speech helper is missing from the Electron build.' });
    return false;
  }

  if (speechProcess && speechReady) return sendPythonCommand('start');
  if (speechStarting) return true;

  if (speechProcess) {
    try { speechProcess.kill(); } catch { /* ignore */ }
    speechProcess = null;
    speechReady = false;
  }

  speechStarting = true;
  console.log(`[DesktopAssistant] Starting Python STT: ${pythonExecutable} -u ${speechScript}`);

  speechProcess = spawn(pythonExecutable, ['-u', speechScript], {
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' }
  });

  let stdoutBuffer = '';
  speechProcess.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString('utf8');
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const payload = JSON.parse(trimmed);
        if (payload.type === 'ready') {
          speechReady = true;
          speechStarting = false;
          sendSpeechEvent(payload);
          sendPythonCommand('start');
        } else {
          sendSpeechEvent(payload);
        }
      } catch {
        console.warn('[DesktopAssistant] Ignoring invalid Python STT output:', trimmed);
      }
    }
  });

  speechProcess.stderr.on('data', (chunk) => {
    const text = chunk.toString('utf8').trim();
    if (text) console.warn('[DesktopAssistant] Python STT stderr:', text);
  });

  speechProcess.on('spawn', () => {
    console.log(`[DesktopAssistant] Python STT process spawned (pid ${speechProcess.pid}).`);
  });

  speechProcess.on('error', (err) => {
    speechStarting = false;
    speechProcess = null;
    speechReady = false;
    sendSpeechEvent({ type: 'error', message: `Python Whisper could not start: ${err.message}` });
  });

  speechProcess.on('exit', (code, signal) => {
    console.log(`[DesktopAssistant] Python STT exited: code=${code} signal=${signal || 'none'}`);
    speechProcess = null;
    speechReady = false;
    speechStarting = false;
    sendSpeechEvent({ type: 'end', code, signal });
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
  ipcMain.on('desktop-assistant:show', showAssistant);
  ipcMain.on('desktop-assistant:hide', () => {
    stopNativeSpeech();
    assistantWindow?.hide();
  });
  ipcMain.handle('desktop-assistant:start-voice', () => startNativeSpeech());
  ipcMain.on('desktop-assistant:stop-voice', stopNativeSpeech);

  // Keep one persistent Python worker alive so opening/listening does not race
  // against Python startup or Whisper model loading.
  startNativeSpeech();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('will-quit', () => {
  if (speechProcess) {
    try { speechProcess.kill(); } catch { /* ignore */ }
  }
  if (registeredAccelerator) globalShortcut.unregister(registeredAccelerator);
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (event) => {
  if (process.platform !== 'darwin') event.preventDefault();
});
